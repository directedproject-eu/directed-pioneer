// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

/**
 * Konfiguration für die zeitvariablen Fließgeschwindigkeit-GeoTIFFs
 * (HRB Eicherscheid – base breach scenario, HQ100).
 *
 * Server-URL, CRS, NoData und die Zeitachse (TIMESTEPS) sind mit der Wassertiefe
 * identisch (gleiche Simulation) und werden aus {@link ./floodDepth} wiederverwendet.
 * Hier unterscheiden sich nur der Dateinamen-Präfix (`_vel_`) und die Farbskala.
 */
import { GEOTIFF_BASE_URL } from "./floodDepth";

/**
 * Fixer Dateinamen-Präfix; nur die Zeitzahl am Ende (…_vel_<t>.tif) variiert.
 * Variable: `vel` = flow_velocity (Fließgeschwindigkeit).
 * Beispiel: HRB_Eicherscheid_..._vel_2700.tif
 */
const FILE_PREFIX =
    "HRB_Eicherscheid_base_breach_scenario_IWD339m_HQ100_flowcorrected_roughinterp_alpha0.4_theta0.85_vel_";

/** Baut die vollständige GeoTIFF-URL für einen Zeitwert (in Sekunden). */
export function buildVelocityUrl(timeValue: number): string {
    return `${GEOTIFF_BASE_URL}${FILE_PREFIX}${timeValue}.tif`;
}

/** URL des statischen Maximum-Rasters (…_vel_max.tif): maximale Fließgeschwindigkeit über die Zeit. */
export function buildVelocityMaxUrl(): string {
    return `${GEOTIFF_BASE_URL}${FILE_PREFIX}max.tif`;
}

/** Eine Farbstufe der Fließgeschwindigkeit-Skala. */
export interface FlowVelocityColorStop {
    value: number; // Fließgeschwindigkeit in m/s
    color: string;
    label: string;
}

/**
 * Feste Farbskala für die Fließgeschwindigkeit in m/s (warme Gelb-Rot-Rampe).
 * Bewusst anders als die blaue Wassertiefe-Skala, damit beide Layer auf der
 * Karte klar unterscheidbar sind. Wird von Service (Style) und Legende geteilt.
 */
export const flowVelocityColorMap: FlowVelocityColorStop[] = [
    { value: 0, color: "rgba(255,255,255,0)", label: "0" },
    { value: 0.25, color: "#fed976", label: "0.25" },
    { value: 0.5, color: "#feb24c", label: "0.5" },
    { value: 1.0, color: "#fd8d3c", label: "1.0" },
    { value: 2.0, color: "#f03b20", label: "2.0" },
    { value: 4.0, color: "#bd0026", label: "≥ 4.0" }
];
