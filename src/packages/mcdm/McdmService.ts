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
        const url = this.getProcessExecutionUrl(jobDescription.processId);
        const body: Record<string, unknown> = {
            inputs: Object.fromEntries(jobDescription.inputs)
        };
        const job = await this.apiService.executeProcess(url, body, jobDescription.synchronous);
        try {
            const result = await job.wait(); 
            return this.mapToFinalOutcome(result);
        } catch (err: unknown) {
            return this.mapToFinalOutcome(err as JobStatusResponse); 
        }
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


    

