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

interface ProcessExecution {
    inputs: Map<string, string>;
    synchronous: boolean;
    processId: string;
}



export const ClientService = () => {
    const API_BASE_URL = import.meta.env.DEV
        ? "http://localhost:5000"
        : import.meta.env.VITE_PROD_URL;

    // const API_HELLO_WORLD_URL = `${API_BASE_URL}/processes/hello-world/execution`;

    //execution endpoint
    const API_PROCESS_EXECUTION_URL = (processID: string) =>
        `${API_BASE_URL}/processes/${processID}/execution`;

    //job status endpoint
    const API_JOB_STATUS_URL = (processID: string, jobID: string) =>
        `${API_BASE_URL}/processes/${processID}/jobs/${jobID}`;

    /**
     * submits an asynchronous job to the hello-world pygeoapi endpoint to display a greeting
     *
     * @param {string} processID the ID of the process to execute
     * @param {object} inputs the inputs for the process
     * @returns {Promise<JobStatusResponse>} a Promise that resolves with the initial job status response.
     */
    // const sayHello = (name: string): Promise<string | null> => {
    //     return new Promise((resolve, reject) => {
    //         fetch(API_HELLO_WORLD_URL, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify({
    //                 inputs: {
    //                     name: name
    //                 }
    //             })
    //         })
    //             .then((response) => {
    //                 if (!response.ok) {
    //                     console.error(
    //                         `Error calling hello-world: ${response.status} - ${response.statusText}`
    //                     );
    //                     response
    //                         .json()
    //                         .then((errorData) => {
    //                             console.error("Error details:", errorData);
    //                             reject(null); //reject with null or the error data
    //                         })
    //                         .catch(() => {
    //                             reject(null); //reject if error details cannot be parsed
    //                         });
    //                 } else {
    //                     response
    //                         .json()
    //                         .then((responseData) => {
    //                             if (
    //                                 responseData &&
    //                                 responseData.outputs &&
    //                                 responseData.outputs.message
    //                             ) {
    //                                 resolve(responseData.outputs.message);
    //                             } else if (responseData && responseData.value) {
    //                                 resolve(responseData.value); //handle "echo" response
    //                             } else {
    //                                 console.error(
    //                                     "Unexpected response structure from hello-world."
    //                                 );
    //                                 reject(null);
    //                             }
    //                         })
    //                         .catch((error) => {
    //                             console.error("Error parsing JSON response:", error);
    //                             reject(null);
    //                         });
    //                 }
    //             })
    //             .catch((error) => {
    //                 console.error("An error occurred while calling hello-world:", error);
    //                 reject(null);
    //             });
    //     });
    // };

    const submitJob = (jobDescription: ProcessExecution): Promise<JobStatusResponse> => {
        console.log(jobDescription.inputs);
        return new Promise((resolve, reject) => {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            if (!jobDescription.synchronous){
                myHeaders.append("Prefer", "respond-async");
            }
            fetch(API_PROCESS_EXECUTION_URL(jobDescription.processId), {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify({
                    inputs: Object.fromEntries(jobDescription.inputs),
                    mode: jobDescription.synchronous?"sync" : "async", //explicitly request asynchronous execution
                })
            })
                .then((response) => {
                    if (!response.ok) {
                        console.error(
                            `Error submitting job: ${response.status} - ${response.statusText}`
                        );
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
        processId: string,
        jobId: string,
        delayMs: number = 2000
    ): Promise<JobStatusResponse> => {
        return new Promise((resolve, reject) => {
            const checkStatus = () => {
                fetch(API_JOB_STATUS_URL(processId, jobId))
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
                        console.log(`Job ${jobId} status: ${statusResponse.status}`);
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
                            `An error occurred during job status polling for ${jobId}:`,
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
