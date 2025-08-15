// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { ServiceOptions, DeclaredService } from "@open-pioneer/runtime";

interface JobStatusResponse {
    jobID?: string;
    id?: string;
    status: "accepted" | "running" | "successful" | "failed" | "dismissed";
    progress?: number;
    message?: string;
    outputs?:
        | {
              // Object structure (for general processes)
              [key: string]: {
                  href: string;
                  title?: string;
                  type?: string;
              };
          }
        | Array<{
              id?: string;
              href?: string;
              title?: string;
              type?: string;
          }>;
}

interface FinalProcessOutcome {
    status: "successful" | "failed" | "dismissed"; //final status
    message?: string;
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
              href?: string;
              title?: string;
              type?: string;
          }>;
    jobID?: string;
    value?: Record<string, number>; // Output for MCDM rankings in the value field
}

interface OutputOptions {
    mediaType: string;
    transmissionMode: "value" | "reference";
}

export interface ProcessExecution {
    inputs: Map<string, unknown>; // Updated to allow objects for MCDM
    outputs?: Map<string, OutputOptions>;
    synchronous: boolean;
    processId: string;
    response?: "document" | "raw";
}

type JobResult = FinalProcessOutcome;

export interface McdmService extends DeclaredService<"app.McdmService"> {
    submitJob(jobDescription: ProcessExecution): Promise<JobResult>;
    pollJobStatus(job_url: string, delayMs?: number): Promise<FinalProcessOutcome>;
}

interface Config {
    apiBaseUrl: string;
}

interface ProcessRequestBody {
    inputs: Record<string, unknown>;
    outputs?: Record<string, unknown>;
    response?: "document" | "raw";
    mode?: "sync" | "async";
}

export class McdmServiceImpl implements McdmService {
    private readonly API_BASE_URL: string;

    constructor(options: ServiceOptions) {
        const config = options.properties.userConfig as Config;
        if (!config.apiBaseUrl) {
            throw new Error("ClientServiceImpl requires 'apiBaseUrl' in userConfig");
        }
        this.API_BASE_URL = config.apiBaseUrl;
    }

    private getProcessExecutionUrl(processID: string): string {
        return `${this.API_BASE_URL}/processes/${processID}/execution`;
    }

    submitJob = (jobDescription: ProcessExecution): Promise<JobResult> => {
        console.log(jobDescription.inputs);
        const body: ProcessRequestBody = {
            inputs: Object.fromEntries(jobDescription.inputs)
        };
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
        body["mode"] = jobDescription.synchronous ? "sync" : "async";

        return new Promise((resolve, reject) => {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            if (!jobDescription.synchronous) {
                myHeaders.append("Prefer", "respond-async");
            } else {
                myHeaders.append("Prefer", "respond-sync");
            }
            fetch(this.getProcessExecutionUrl(jobDescription.processId), {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(body)
            })
                .then(async (response) => {
                    if (response.status === 201) {
                        console.log(
                            `Async job for '${jobDescription.processId}' accepted (HTTP 201)`
                        );
                        const locationHeader = response.headers.get("Location");
                        if (!locationHeader) {
                            throw new Error(
                                `Async job accepted (201), but missing "Location" header for job status. Cannot poll.`
                            );
                        }
                        let initialJobBody: unknown;
                        const contentType = response.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                            try {
                                const textBody = await response.text();
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
                        const jobID =
                            (initialJobBody as JobStatusResponse)?.id ||
                            (initialJobBody as JobStatusResponse)?.jobID ||
                            locationHeader.split("/").pop();
                        if (!jobID) {
                            throw new Error(
                                "Could not determine job ID from 201 response or Location Header"
                            );
                        }
                        console.log(`Polling for async job '${jobID}' at: ${locationHeader}`);
                        try {
                            const finalResult = await this.pollJobStatus(locationHeader);
                            resolve(finalResult);
                        } catch (pollingError) {
                            reject(pollingError);
                        }
                        return;
                    } else if (response.ok) {
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
                                const responseData = await response.json();
                                resolve({
                                    status: "successful",
                                    message: responseData.message,
                                    outputs: responseData.outputs,
                                    value: responseData.value // MCDM specific
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
                    } else {
                        let errorData: unknown;
                        try {
                            errorData = await response.json();
                        } catch (e) {
                            errorData = await response.text();
                        }
                        console.error(
                            `API Error for process '${jobDescription.processId}': ${response.status} - ${response.statusText} `,
                            errorData
                        );
                        reject(errorData);
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
            let intervalId = 0;
            const checkStatus = async () => {
                console.log(`Polling attempt for job at URL: ${job_url}`);
                fetch(job_url)
                    .then(async (response) => {
                        if (!response.ok) {
                            console.error(
                                `Error polling job status: ${response.status} - ${response.statusText}`
                            );
                            let errorData: unknown;
                            try {
                                errorData = await response.json();
                            } catch (e) {
                                errorData = await response.text();
                            }
                            window.clearInterval(intervalId);
                            reject(
                                new Error(
                                    `Polling failed: ${response.status} - ${typeof errorData === "object" && errorData && "message" in errorData ? (errorData as Record<string, unknown>).message : "Unknown error"}`
                                )
                            );
                            return;
                        }
                        return response.json();
                    })
                    .then((statusResponse: unknown) => {
                        // Changed this to unknown
                        const typedResponse = statusResponse as JobStatusResponse; // Cast it here
                        console.log(
                            `Job ${typedResponse.jobID || typedResponse.id || "unknown"} status: ${typedResponse.status}`
                        );
                        if (typedResponse.status === "successful") {
                            window.clearInterval(intervalId);
                            // This successful response from the poll will have the final outcome.
                            // The response from the polling endpoint for a successful job will be a FinalProcessOutcome
                            resolve(statusResponse as FinalProcessOutcome);
                        } else if (
                            typedResponse.status === "failed" ||
                            typedResponse.status === "dismissed"
                        ) {
                            window.clearInterval(intervalId);
                            reject({
                                status: typedResponse.status,
                                jobID: typedResponse.jobID || typedResponse.id,
                                message: typedResponse.message,
                                outputs: typedResponse.outputs
                            });
                        } else {
                            setTimeout(checkStatus, delayMs);
                        }
                    })
                    .catch((error) => {
                        console.error("An error occurred during job status polling.", error);
                        window.clearInterval(intervalId);
                        reject(error);
                    });
            };
            intervalId = window.setInterval(() => {}, 1);
            checkStatus();
        });
    };
}
