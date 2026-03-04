// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService } from "@open-pioneer/runtime";


export interface JobStatusResponse {
    jobID?: string;
    status?: "accepted" | "running" | "successful" | "failed" | "dismissed"; // Status is optional for synchronous responses
    message?: string;
    presigned_url?: string;
    outputs?: {
        [key: string]: {
            href: string; //the URL to the output
            title?: string;
            type?: string;
        };
    };
}

export interface ApiService extends DeclaredService<"app.ApiService"> {
    executeProcess(url: string, payload: Record<string, unknown>, sync?: boolean): Promise<Response>;
    pollJobStatus(
        jobStatusUrl: string, 
        onUpdate: (status: JobStatusResponse) => void, 
        intervalMs?: number
    ): Promise<void>;
}

export class ApiServiceImpl implements ApiService {
    // Executes a process and returns either result (sync) or a job URL (async)
    async executeProcess(url: string, payload: Record<string, unknown>, sync: boolean = true): Promise<Response> {
        const headers: HeadersInit = { "Content-Type": "application/json" };
        headers["Prefer"] = sync ? "respond-sync" : "respond-async";

        return fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });
    }

    // Poller which takes the status URL and a callback 
    async pollJobStatus(
        jobStatusUrl: string, 
        onUpdate: (status: JobStatusResponse) => void,
        intervalMs = 5000
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const response = await fetch(jobStatusUrl);
                    const status: JobStatusResponse = await response.json();
                    
                    onUpdate(status);

                    if (status.status === "successful") {
                        clearInterval(interval);
                        resolve();
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