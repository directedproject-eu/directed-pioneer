// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService } from "@open-pioneer/runtime";


export interface GeosphereRainData {
    [key: string]: string;
}

export interface GeosphereDataService extends DeclaredService<"app.GeosphereDataService"> {
    fetchForecastData(): Promise<{ timestamps: string[]; rawData: GeosphereRainData}>;
    getUrlbyIsoString(isoString: string, rawData: GeosphereRainData, timestamps: string[]): string | null;
}

export class GeosphereDataServiceImpl implements GeosphereDataService {
    private endpoint = "https://52n-directed.obs.eu-de.otc.t-systems.com/data/geosphere/forecasts/nwp-v1-1h-2500m/rain_acc/forecasts.json";

    async fetchForecastData(): Promise<{ timestamps: string[]; rawData: GeosphereRainData }> {
        try {
            const response = await fetch(this.endpoint);
            if (!response.ok) throw new Error("Failed to load forecast registry.");
            
            const rawData: GeosphereRainData = await response.json();
            // Ensure strings are sorted sequentially chronologically
            const timestamps = Object.keys(rawData).sort();

            return { timestamps, rawData };
        } catch (error) {
            console.error("Error loading Geosphere forecasts JSON:", error);
            throw error;
        }
    }

    getUrlbyIsoString(isoString: string, rawData: GeosphereRainData, timestamps: string[]): string | null {
        if (!isoString) return null;

        // Convert UI input format "2026-06-18T14:00" -> "20260618T1400"
        const cleanIso = isoString.replace(/[-:]/g, ""); 
        
        // Add fallback empty string to ensure split[0] always evaluates to a string
        const basePart = cleanIso.split(".")[0] || "";
        const targetPattern = basePart.slice(0, 11) + "0000"; // "20260618T140000"

        // Search for a matching key that begins with target pattern
        const matchedKey = timestamps.find(key => key.startsWith(targetPattern));
        
        // Use fallback operator (?? null) to make an undefined dictionary index to null
        return matchedKey ? (rawData[matchedKey] ?? null) : null;
    }        
}