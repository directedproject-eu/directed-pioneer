
// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

export const GEOTIFF_BASE_URL: string =
    import.meta.env.VITE_FLOOD_GEOTIFF_BASE_URL ?? "http://localhost:8000/";

export const SOURCE_PROJECTION = "EPSG:25832";

export const NODATA = -9999;


const FILE_PREFIX =
    "HRB_Eicherscheid_base_breach_scenario_IWD339m_HQ100_flowcorrected_roughinterp_alpha0.4_theta0.85_wd_";

export function buildUrl(timeValue: number): string {
    return `${GEOTIFF_BASE_URL}${FILE_PREFIX}${timeValue}.tif`;
}

/** URL des statischen Maximum-Rasters (…_wd_max.tif): maximale Wassertiefe über die Zeit. */
export function buildMaxUrl(): string {
    return `${GEOTIFF_BASE_URL}${FILE_PREFIX}max.tif`;
}


export const TIMESTEPS: number[] = [
    60, 120, 300, 600, 900, 1800, 2700, 3600, 4500, 5400, 6300, 7200, 8100, 9000, 9900,
    10800, 11700, 12600, 13500, 14400, 15300, 16200, 17100, 18000, 18900, 19800, 20700,
    21600, 22500, 23400, 24300, 25200, 26100, 27000, 27900, 28800, 29700, 30600, 31500,
    32400, 33300, 34200, 35100, 36000, 36900, 37800, 38700, 39600, 40500, 41400, 42300,
    43200, 44100, 45000, 45900, 46800, 47700, 48600, 49500, 50400, 51300, 52200, 53100,
    54000, 54900, 55800, 56700, 57600, 58500, 59400, 60300, 61200, 62100, 63000, 63900,
    64800, 65700, 66600, 67500, 68400, 69300, 70200, 71100, 72000, 72900, 73800, 74700,
    75600, 76500, 77400, 78300, 79200, 80100, 81000, 81900, 82800, 83700, 84600, 85500,
    86400, 87300, 88200, 89100, 90000, 90900, 91800, 92700, 93600, 94500, 95400, 96300,
    97200, 98100, 99000, 99900, 100800, 101700, 102600, 103500, 104400, 105300, 106200,
    107100, 108000
];

export const FIRST_TIME: number = TIMESTEPS[0] ?? 60;
export const LAST_TIME: number = TIMESTEPS[TIMESTEPS.length - 1] ?? 108000;

/** Sekunden → "H:MM h" (z.B. 2700 → "0:45 h", 108000 → "30:00 h"). */
export function formatSeconds(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, "0")} h`;
}

export interface WaterDepthColorStop {
    value: number; // Wassertiefe in Metern
    color: string;
    label: string;
}


export const waterDepthColorMap: WaterDepthColorStop[] = [
    { value: 0, color: "rgba(255,255,255,0)", label: "0" },
    { value: 0.1, color: "#c6dbef", label: "0.1" },
    { value: 0.5, color: "#6baed6", label: "0.5" },
    { value: 1.0, color: "#3182bd", label: "1.0" },
    { value: 2.0, color: "#08519c", label: "2.0" },
    { value: 4.0, color: "#08306b", label: "≥ 4.0" }
];
