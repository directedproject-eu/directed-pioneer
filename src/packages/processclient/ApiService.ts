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
        this._resultPromise = this.startInternalPolling();
    }

    private async startInternalPolling(): Promise<JobStatusResponse> {
        const finalStates = ["successful", "failed", "dismissed"];
        
        // If sync (already successful), don't poll the server
        if (this.currentStatus.status && finalStates.includes(this.currentStatus.status)) {
            return this.currentStatus;
        }

        // If async, poll until done
        const finalStatus = await this.service.pollJobStatus(this.url);
        this.currentStatus = finalStatus; 
        return finalStatus;
    }

    async wait(): Promise<JobStatusResponse> {
        return this._resultPromise;
    }
}


export class ApiServiceImpl implements ApiService {
    // Executes a process and returns either result (sync) or a job URL (async)
    async executeProcess(url: string, payload: Record<string, unknown>, sync: boolean = true): Promise<OgcJob> {
        const headers: HeadersInit = { 
            "Content-Type": "application/json", 
            "Prefer": sync ? "respond-sync" : "respond-async", 
            "Accept": "application/json"
        };

        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });
        // Handle Async Execution (201 Created or 202 Accepted)
        if (response.status === 201 || response.status === 202) {
            let location = response.headers.get("Location");
            // If Location header blocked by CORS or missing, reconstruct from response body
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
            if (!location) {
                throw new Error("Async job accepted, but 'Location' header is blocked by CORS and no ID found in body.");
            }
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
        }

        // Handle Errors
        const errorText = await response.text();
        throw new Error(`Process execution failed (HTTP ${response.status}): ${errorText}`);
    }
    async pollJobStatus(jobStatusUrl: string, intervalMs = 5000): Promise<JobStatusResponse> {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const response = await fetch(jobStatusUrl);
                    if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
                    const jobStatus: JobStatusResponse = await response.json();
    
                    if (jobStatus.status === "successful") {
                        clearInterval(interval);
                        try {
                            // Fetch the actual result data (Async only)
                            const resultsUrl = `${jobStatusUrl}/results`;
                            const resultsRes = await fetch(resultsUrl, { headers: { "Accept": "application/json" } });
                            const contentType = resultsRes.headers.get("content-type") || "";
    
                            if (resultsRes.ok && resultsRes.status !== 204 && contentType.includes("json")) {
                                const resultsData = await resultsRes.json() as Record<string, unknown>;
                                resolve({ ...jobStatus, ...resultsData });
                            } else {
                                resolve(jobStatus);
                            }
                        } catch (e) {
                            resolve(jobStatus);
                        }
                    } else if (jobStatus.status === "failed" || jobStatus.status === "dismissed") {
                        clearInterval(interval);
                        reject(new Error(jobStatus.message || "Job failed"));
                    }
                } catch (err) {
                    clearInterval(interval);
                    reject(err);
                }
            }, intervalMs);
        });
    }
}