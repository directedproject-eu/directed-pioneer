// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

interface JobStatusResponse {
    jobID: string;
    status: "accepted" | "running" | "successful" | "failed" | "dismissed";
    progress?: number;
    message?: string;
    outputs?: string;
    // outputs?: {
    //     [key: string]: any; //outputs from the successful job
    // };
    //can add other properties as per pygeoapi's Job JSON structure
}

// interface ProcessInputs {

// }

interface OutputOptions {
    mediaType: string;
    transmissionMode: "value" | "reference";
}

interface ProcessExecution {
    inputs: Map<string, string>;
    outputs?: Map<string, OutputOptions>;
    synchronous: boolean;
    processId: string;
    response?: "document" | "raw";
}

interface JobResult {

}


export const ClientService = () => {
    const API_BASE_URL = import.meta.env.DEV
        ? "http://localhost:5000"
        : import.meta.env.VITE_PROD_URL;

    //execution endpoint
    const API_PROCESS_EXECUTION_URL = (processID: string) =>
        `${API_BASE_URL}/processes/${processID}/execution`;

    const submitJob = (jobDescription: ProcessExecution): Promise<JobResult> => {
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
        return new Promise((resolve, reject) => {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            if (!jobDescription.synchronous){
                myHeaders.append("Prefer", "respond-async");
            }
            fetch(API_PROCESS_EXECUTION_URL(jobDescription.processId), {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(body)
            })
                .then((response) => {
                    if (!response.ok) {
                        console.error(
                            `Error submitting job: ${response.status} - ${response.statusText}`
                        );

                        // 200/204 = sync, 201 = async
                        if (response.status === 201) {
                            // if (!jobDescription.synchronous && response.headers.has("Preference-Applied")) {
                            // if (response.headers.get("Preference-Applied")?.toLowerCase() == "respond-async") {
                            if (response.headers.has("Location")) {
                                const url = response.headers.get("Location");
                                pollJobStatus(url!);
                            } else {
                                throw new Error(`Missing Location header. Cannot poll job status for process ${jobDescription}.`);
                            }
                        }

                        // FIXME: consider the response type (raw, document) and the transmission mode (value, reference, mixed)
                        return response
                            .json()
                            .then((errorData) => {
                                console.error("Error details:", errorData);
                                reject(errorData); //reject with error data
                            })
                            .catch(() => reject(new Error("Failed to parse error response.")));
                    }
                    return response.json(); //JSON response with jobID and status
                })
                .then((responseData) => {
                    if (responseData && responseData.jobID && responseData.status) {
                        resolve(responseData);
                    } else {
                        console.error(
                            "Unexpected job submission response structure:",
                            responseData
                        );
                        reject(new Error("Invalid job submission response."));
                    }
                })
                .catch((error) => {
                    console.error("Error while submitting job:", error);
                    reject(error);
                });
        });
    };

    const pollJobStatus = (
        job_url: string,
        delayMs: number = 2000
    ): Promise<JobStatusResponse> => {
        return new Promise((resolve, reject) => {
            const checkStatus = () => {
                fetch(job_url)
                    .then((response) => {
                        if (!response.ok) {
                            console.error(
                                `Error polling job status: ${response.status} - ${response.statusText}`
                            );
                            return response
                                .json()
                                .then((errorData) => {
                                    console.error("Error details:", errorData);
                                    reject(errorData);
                                })
                                .catch(() => reject(new Error("Failed to parse error response.")));
                        }
                        return response.json();
                    })
                    .then((statusResponse: JobStatusResponse) => {
                        console.log(`Job ${statusResponse.jobID} status: ${statusResponse.status}`);
                        if (statusResponse.status === "successful") {
                            resolve(statusResponse); //job completed successfully
                        } else if (
                            statusResponse.status === "failed" ||
                            statusResponse.status === "dismissed"
                        ) {
                            reject(statusResponse); //job failed or dismissed
                        } else {
                            //job is still running or accepted, poll again after delay
                            setTimeout(checkStatus, delayMs);
                        }
                    })
                    .catch((error) => {
                        console.error(
                            "An error occurred during job status polling.",
                            error
                        );
                        reject(error);
                    });
            };

            checkStatus(); //start polling
        });
    };

    return {
        submitJob,
        pollJobStatus
        // sayHello
    };
};

export default ClientService;
