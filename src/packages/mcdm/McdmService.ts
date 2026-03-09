// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { ServiceOptions, DeclaredService } from "@open-pioneer/runtime";
import { ApiService, JobStatusResponse } from "processclient"; 


interface FinalProcessOutcome {
    status: "successful" | "failed" | "dismissed"; // Final status
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

interface Config {
    apiBaseUrl: string;
}

interface McdmServiceReferences {
    apiService: ApiService;
}

type JobResult = FinalProcessOutcome;

export interface ProcessExecution {
    inputs: Map<string, unknown>; // Updated to allow objects for MCDM
    outputs?: Map<string, OutputOptions>;
    synchronous: boolean;
    processId: string;
    response?: "document" | "raw";
}

export interface McdmService extends DeclaredService<"app.McdmService"> {
    submitJob(jobDescription: ProcessExecution): Promise<JobResult>;
    pollJobStatus(job_url: string, delayMs?: number): Promise<FinalProcessOutcome>;
}


export class McdmServiceImpl implements McdmService {
    private readonly API_BASE_URL: string;
    private readonly apiService: ApiService;

    constructor(options: ServiceOptions<McdmServiceReferences>) {
        const config = options.properties.userConfig as Config;
        if (!config.apiBaseUrl) {
            throw new Error("McdmServiceImpl requires 'apiBaseUrl' in userConfig");
        }
        this.API_BASE_URL = config.apiBaseUrl;
        this.apiService = options.references.apiService as ApiService; // Inject the service
    }

    private getProcessExecutionUrl(processID: string): string {
        return `${this.API_BASE_URL}/processes/${processID}/execution`;
    }

    async submitJob(jobDescription: ProcessExecution): Promise<FinalProcessOutcome> {
        const body: Record<string, unknown> = {
            inputs: Object.fromEntries(jobDescription.inputs)
        };
        
        if (jobDescription.outputs && jobDescription.outputs.size > 0) {
            const outputs: Record<string, unknown> = {};
            for (const [key, output] of jobDescription.outputs) {
                outputs[key] = {
                    format: { mediaType: output.mediaType },
                    transmissionMode: output.transmissionMode
                };
            }
            body["outputs"] = outputs;
        }

        const url = this.getProcessExecutionUrl(jobDescription.processId);
        const response = await this.apiService.executeProcess(url, body, jobDescription.synchronous);

        if (response.status === 201 || response.status === 202) {
            const location = response.headers.get("Location");
            if (!location) throw new Error("Async job accepted but Location header missing.");
            return this.pollJobStatus(location);
        }

        if (response.ok) {
            const data = await response.json() as JobStatusResponse;
            // If there is no "status" in response but get 200 OK, assume successful sync response
            if (!data.status) {
                data.status = "successful"; 
            }
            return this.mapToFinalOutcome(data);
        }

        throw new Error(`API Error: ${response.status}`);
    }

    async pollJobStatus(job_url: string, delayMs: number = 5000): Promise<FinalProcessOutcome> {
        return new Promise((resolve, reject) => {
            this.apiService.pollJobStatus(
                job_url, 
                (statusUpdate: JobStatusResponse) => {
                    if (statusUpdate.status === "successful" || 
                        statusUpdate.status === "failed" || 
                        statusUpdate.status === "dismissed") {
                        resolve(this.mapToFinalOutcome(statusUpdate));
                    }
                }, 
                delayMs
            ).catch((err: unknown) => {
                reject(err);
            });
        });
    }

    private mapToFinalOutcome(data: JobStatusResponse): FinalProcessOutcome {
        const rawData = data as Record<string, unknown>;
        const onSuccess = 
            data.status === "successful" || 
            (!data.status && (rawData.value || data.outputs));

        const finalStatus: "successful" | "failed" | "dismissed" = onSuccess 
            ? "successful" 
            : (data.status === "dismissed" ? "dismissed" : "failed");

        return {
            status: finalStatus,
            message: data.message || (onSuccess ? "Success" : "Process failed"),
            outputs: data.outputs,
            jobID: data.jobID,
            value: rawData.value as Record<string, number> | undefined
        };
    }
}


    

