// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { ServiceOptions } from "@open-pioneer/runtime";
import { DeclaredService } from "@open-pioneer/runtime";

interface Config {
    taxonomyBaseUrl: string;
}

export interface KeywordInfo {
    name: string;
    description: string;
    disambiguatingDescription?: string;
    related_terms?: string[];
    url?: string;
    headline?: string;
    sources?: string[];
    [key: string]: string | string[] | undefined;
}

export interface TaxonomyService extends DeclaredService<"app.TaxonomyService"> {
    fetchDescription(name: string): Promise<KeywordInfo | null>;
    getKeywordInfo(name: string): Promise<KeywordInfo | null>;
}

export class TaxonomyServiceImpl implements TaxonomyService {
    taxonomyBaseUrl: string;

    constructor(serviceOptions: ServiceOptions) {
        const config = serviceOptions.properties.userConfig as Config;
        if (!config?.taxonomyBaseUrl) {
            console.log("ServiceOptions:", serviceOptions);
            throw new Error("TaxonomyServiceImpl requires a 'taxonomyBaseUrl' in userConfig");
        }
        this.taxonomyBaseUrl = config.taxonomyBaseUrl;
    }

    async getKeywordInfo(name: string): Promise<KeywordInfo | null> {
        try {
            const encodedName = encodeURIComponent(name);
            const response = await fetch(`${this.taxonomyBaseUrl}/keyword?name=${encodedName}`);

            if (!response.ok) {
                console.error(`Failed to fetch keyword: ${response.statusText}`);
                return null;
            }

            const data = await response.json();
            // const graph = data["@graph"];
            // return Array.isArray(graph) && graph.length > 0 ? graph[0] : null;
            const graph = data?.["@graph"];

            if (Array.isArray(graph) && graph.length > 0) {
                const keyword = graph[0] as KeywordInfo;
                return keyword;
            } else {
                console.warn("No keyword data found in @graph");
                return null;
            }
        } catch (error) {
            console.error("Error fetching keyword info:", error);
            return null;
        }
    }

    async fetchDescription(name: string): Promise<KeywordInfo | null> {
        return this.getKeywordInfo(name);
    }
    
}
