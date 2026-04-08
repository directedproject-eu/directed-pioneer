// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService } from "@open-pioneer/runtime";


export interface JobStatusResponse {
    jobID?: string;
    status?: "accepted" | "running" | "successful" | "failed" | "dismissed"; // Status is optional for synchronous responses
    message?: string;
    presigned_url?: string; // SaferPlaces specific
    outputs?: {
        [key: string]: {
            href: string; 
            title?: string;
            type?: string;
        };
    };
}

export interface ApiService extends DeclaredService<"app.ApiService"> {
    executeProcess(url: string, payload: Record<string, unknown>, sync?: boolean): Promise<OgcJob>;
    pollJobStatus(url: string, intervalMs?: number): Promise<JobStatusResponse>; 
}

export class OgcJob {
    private _resultPromise: Promise<JobStatusResponse>;
    public currentStatus: JobStatusResponse;

    constructor(
        public readonly url: string, 
        initialStatus: JobStatusResponse, 
        private service: ApiService
    ) {
        this.currentStatus = initialStatus;
        
        // Auto-trigger, start polling immediately and store the promise
        this._resultPromise = this.startInternalPolling();
    }

    private async startInternalPolling(): Promise<JobStatusResponse> {
        // If already finished (sync), return the status
        const finalStates = ["successful", "failed", "dismissed"];
        if (this.currentStatus.status && finalStates.includes(this.currentStatus.status)) {
            return this.currentStatus;
        }

        // Otherwise, use the service to poll
        const finalStatus = await this.service.pollJobStatus(this.url);
        this.currentStatus = finalStatus;
        return finalStatus;
    }

    // UI awaits job completion
    async wait(): Promise<JobStatusResponse> {
        return this._resultPromise;
    }
}

export class ApiServiceImpl implements ApiService {
    // Executes a process and returns either result (sync) or a job URL (async)
    async executeProcess(url: string, payload: Record<string, unknown>, sync: boolean = true): Promise<OgcJob> {
        const headers: HeadersInit = { 
            "Content-Type": "application/json", 
            "Prefer": sync ? "respond-sync" : "respond-async"
        };

        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });
        // Handle Async Execution (201 Created or 202 Accepted)
        if (response.status === 201 || response.status === 202) {
            // const location = response.headers.get("Location");
            // debug 
            let location = response.headers.get("Location");

            if (!location) {
                const body = await response.json();
                const jobId = body.id || body.jobID || body.jobId;
                
                if (jobId) {
                    // Take execution URL and navigate back to the /jobs/ endpoint
                    const executionUrl = new URL(url);
                    const pathParts = executionUrl.pathname.split("/");
                    // Remove 'processes', '{id}', 'execution' to get the base
                    const baseParts = pathParts.slice(0, pathParts.indexOf("processes"));
                    location = `${executionUrl.origin}${baseParts.join("/")}/jobs/${jobId}`;
                }
            }
            // end debug 
            if (!location) {
                throw new Error("Async job accepted, but 'Location' header is blocked by CORS and no ID found in body.");
            }
            // return this.pollJobStatus(location);
            return new OgcJob(location, { status: "accepted" }, this);
        }

        // Handle Synchronous Execution (200 OK)
        if (response.ok) {
            const data = await response.json();
            // Check status is "successful" for sync results
            if (!data.status) {
                data.status = "successful";
            }
            return new OgcJob(url, data, this);
            // return data;
        }

        // Handle Errors
        const errorText = await response.text();
        throw new Error(`Process execution failed (HTTP ${response.status}): ${errorText}`);
    }

    async pollJobStatus(
        jobStatusUrl: string, 
        intervalMs = 5000
    ): Promise<JobStatusResponse> {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const response = await fetch(jobStatusUrl);
                    const status: JobStatusResponse = await response.json();
                    if (status.status === "successful") {
                        clearInterval(interval);
                        resolve(status);
                    } else if (status.status === "failed" || status.status === "dismissed") {
                        clearInterval(interval);
                        reject(new Error(status.message || "Job failed"));
                    }
                } catch (err) {
                    clearInterval(interval);
                    reject(err);
                }
            }, intervalMs);
        });
    }
}