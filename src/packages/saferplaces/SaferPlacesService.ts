// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { ServiceOptions, DeclaredService } from "@open-pioneer/runtime";

interface JobStatusResponse {
    jobID?: string;
    id?: string;
    status: "accepted" | "running" | "successful" | "failed" | "dismissed";
    progress?: number;
    message?: string;
    presigned_url?: string; 
    outputs?:
        | {
              // Object structure
              [key: string]: {
                  href: string;
                  title?: string;
                  type?: string;
              };
          }
        | Array<{
              // Array structure
              id?: string;
              presigned_url?: string; // presigned_url *inside* the array item
              water_depth_file?: string;
              href?: string;
              title?: string;
              type?: string;
          }>;
}



// Interface for what submitJob ultimately resolves with (after polling for async)
// Make sure submitJob's promise resolves with a final outcome
interface FinalProcessOutcome {
    status: "successful" | "failed" | "dismissed"; // Final status
    message?: string;
    presigned_url?: string; 
    outputs?:
        | {
              [key: string]: {
                  href: string;
                  title?: string;
                  type?: string;
              };
          }
        | Array<{
              id?: string;
              presigned_url?: string;
              water_depth_file?: string;
              href?: string;
              title?: string;
              type?: string;
          }>;
    jobID?: string;
}

interface OutputOptions {
    mediaType: string;
    transmissionMode: "value" | "reference";
}

interface ProcessExecution {
    inputs: Map<string, string | number | boolean | null>; // Saferplaces, boolean for presigned, number for rain, null barrier
    outputs?: Map<string, OutputOptions>;
    synchronous: boolean;
    processId: string;
    response?: "document" | "raw";
}


// Update JobResult to be specific as it is outcome of submitJob
type JobResult = FinalProcessOutcome;

// Service interface
export interface SaferPlacesService extends DeclaredService<"app.SaferPlacesService"> {
    submitJob(jobDescription: ProcessExecution): Promise<JobResult>;
    pollJobStatus(job_url: string, delayMs?: number): Promise<FinalProcessOutcome>;
}

interface Config {
    apiBaseUrl: string;
}

export class SaferPlacesServiceImpl implements SaferPlacesService {
    private readonly API_BASE_URL: string;

    constructor(options: ServiceOptions) {
        const config = options.properties.userConfig as Config;
        if (!config.apiBaseUrl) {
            throw new Error("SaferPlacesServiceImpl requires 'apiBaseUrl' in userConfig");
        }
        this.API_BASE_URL = config.apiBaseUrl;
    }

    private getProcessExecutionUrl(processID: string): string {
        return `${this.API_BASE_URL}/processes/${processID}/execution`;
    }

    submitJob = (jobDescription: ProcessExecution): Promise<JobResult> => {
        console.log(jobDescription.inputs);
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const body = {
            inputs: Object.fromEntries(jobDescription.inputs)
        } as any;
        if (jobDescription.outputs && jobDescription.outputs.size > 0) {
            body["outputs"] = {};
            for (const [key, output] of jobDescription.outputs) {
                body["outputs"][key] = {
                    format: {
                        mediaType: output.mediaType
                    },
                    transmissionMode: output.transmissionMode
                };
            }
        }
        if (jobDescription.response) {
            body["response"] = jobDescription.response;
        }
        //mode for sync/async control
        body["mode"] = jobDescription.synchronous ? "sync" : "async";

        return new Promise((resolve, reject) => {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            if (!jobDescription.synchronous) {
                myHeaders.append("Prefer", "respond-async");
            } else {
                myHeaders.append("Prefer", "respond-sync"); //explicity request sync
            }
            fetch(this.getProcessExecutionUrl(jobDescription.processId), {
                // use private helper function
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(body)
            })
                .then(async (response) => {
                    // HANDLE ASYNC RESPONSE //
                    if (response.status === 201) {
                        console.log(
                            `Async job for '${jobDescription.processId}' accepted (HTTP 201)`
                        );
                        const locationHeader = response.headers.get("Location");

                        //if 201 but no location header, error
                        if (!locationHeader) {
                            throw new Error(
                                `Async job accepted (201), but missing "Location" header for job status. Cannot poll.`
                            );
                        }

                        let initialJobBody: JobStatusResponse | null = null;
                        const contentType = response.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                            try {
                                const textBody = await response.text();
                                // Parse body only if it's not empty or "null" literal
                                if (textBody.trim() !== "" && textBody.trim() !== "null") {
                                    initialJobBody = JSON.parse(textBody);
                                }
                            } catch (jsonParseError) {
                                console.warn(
                                    `201 response body was not valid JSON for process '${jobDescription.processId}'. Proceeding with Location header`,
                                    jsonParseError
                                );
                            }
                        }
                        // Determine the job ID. prefer body 'id' and then 'jobID' then parse from Location Header
                        const jobID =
                            initialJobBody?.id ||
                            initialJobBody?.jobID ||
                            locationHeader.split("/").pop();
                        if (!jobID) {
                            throw new Error(
                                "Could not determine job ID from 201 response or Location Header"
                            );
                        }

                        console.log(`Polling for async job '${jobID}' at: ${locationHeader}`);
                        // Await the pollJobStatus; submitJob promise resolves with final polling outcome
                        try {
                            const finalResult = await this.pollJobStatus(locationHeader);
                            resolve(finalResult); // Resolve submitJob's promise with final outcome
                        } catch (pollingError) {
                            reject(pollingError); // If polling rejects, reject the submitJob promise
                        }
                        return;
                    }

                    // SYNCHRONOUS SUCCESS (HTTP 200 OK / 204 No content) //
                    else if (response.ok) {
                        console.log(
                            `Process '${jobDescription.processId}' executed synchronously (HTTP ${response.status})`
                        );
                        const contentType = response.headers.get("content-type");

                        if (response.status === 204) {
                            resolve({
                                status: "successful",
                                message: "Process completeted successfully with no direct outputs"
                            });
                            return;
                        }

                        if (contentType && contentType.includes("application/json")) {
                            try {
                                const responseData: JobStatusResponse = await response.json();
                                resolve({
                                    status: "successful",
                                    message: responseData.message,
                                    outputs: responseData.outputs,
                                    presigned_url: responseData.presigned_url // Saferplaces
                                });
                            } catch (jsonError) {
                                console.error(
                                    `Failed to parse JSON for synchronous OK response for '${jobDescription.processId}' :`,
                                    jsonError
                                );
                                reject(
                                    new Error(
                                        `API returned OK status but invalid JSON response for synchronous process`
                                    )
                                );
                            }
                        } else {
                            // If 200 OK but not a JSON file, i.e. raw, handle response
                            // Treat raw response, non JSON files, as error for now..
                            const rawText = await response.text();
                            console.warn(
                                `Synchronous OK response for '${jobDescription.processId}' is not JSON. Raw body:`,
                                rawText.substring(0, 500)
                            );
                            reject(
                                new Error(
                                    `Synchronous process returned non-JSON response (status ${response.status})`
                                )
                            );
                        }
                        return;
                    }
                    // FOR OTHER NON-OK, NON-201 Status Codes & Errors, i.e. 4xx, 5xx //
                    else {
                        let errorData: any;
                        try {
                            errorData = await response.json(); //attempt to parse JSON error body
                        } catch (e) {
                            errorData = await response.text(); //fallback to raw text
                        }
                        console.error(
                            `API Error for process '${jobDescription.processId}': ${response.status} - ${response.statusText} `,
                            errorData
                        );
                        reject(errorData); // Reject promise with parsed error data or text
                    }
                })
                .catch((error) => {
                    console.error("Error while submitting job:", error);
                    reject(error);
                });
        });
    };

    pollJobStatus = (job_url: string, delayMs: number = 2000): Promise<FinalProcessOutcome> => {
        return new Promise((resolve, reject) => {
            const checkStatus = async () => {
                console.log(`Polling attempt for job at URL: ${job_url}`); // Log the job url where polling is occurring
                fetch(job_url)
                    .then(async (response) => {
                        if (!response.ok) {
                            console.error(
                                `Error polling job status: ${response.status} - ${response.statusText}`
                            );
                            let errorData: any;
                            try {
                                errorData = await response.json();
                            } catch (e) {
                                errorData = await response.text();
                            }
                            clearInterval(intervalId);
                            reject(
                                new Error(
                                    `Polling failed: ${response.status} - ${errorData?.message || response.statusText}`
                                )
                            );
                            return;
                        }
                        return response.json();
                    })
                    .then((statusResponse: JobStatusResponse) => {
                        console.log(
                            `Job ${statusResponse.jobID || statusResponse.id || "unknown"} status: ${statusResponse.status}`
                        );
                        if (statusResponse.status === "successful") {
                            clearInterval(intervalId); // Clear interval on sucess
                            resolve({
                                status: "successful",
                                jobID: statusResponse.jobID || statusResponse.jobID,
                                message: statusResponse.message,
                                outputs: statusResponse.outputs,
                                presigned_url: statusResponse.presigned_url // Saferplaces
                            });
                        } else if (
                            statusResponse.status === "failed" ||
                            statusResponse.status === "dismissed"
                        ) {
                            clearInterval(intervalId); //clear interval on failure
                            reject({
                                status: statusResponse.status,
                                jobID: statusResponse.jobID || statusResponse.jobID,
                                message: statusResponse.message,
                                outputs: statusResponse.outputs,
                                presigned_url: statusResponse.presigned_url // saferplaces
                            });
                        } else {
                            // Job is still running or accepted, poll again after delay
                            setTimeout(checkStatus, delayMs);
                        }
                    })
                    .catch((error) => {
                        console.error("An error occurred during job status polling.", error);
                        clearInterval(intervalId); // Clear on unhandled error
                        reject(error);
                    });
            };
            const intervalId = window.setInterval(() => {}, 1); // Initialize intervalId to avoid TS error

            checkStatus(); // Start polling
        });
    };
}

