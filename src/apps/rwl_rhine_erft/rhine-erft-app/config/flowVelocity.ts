// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

/**
 * Configuration for the time-varying flow velocity geotiffs
 * (HRB Eicherscheid -- base breach scenario, HQ100).
 *
 * Server url, CRS, nodata and the time axis (TIMESTEPS) are identical to water depth
 * (same simulation) and are reused from {@link ./floodDepth}. Only the file name prefix
 * (`_vel_`) and the colour scale differ here.
 */
import { GEOTIFF_BASE_URL } from "./floodDepth";

/**
 * Fixed file name prefix; only the time value at the end (…_vel_<t>.tif) varies.
 * Variable: `vel` = flow velocity.
 * Example: HRB_Eicherscheid_..._vel_2700.tif
 */
const FILE_PREFIX =
    "HRB_Eicherscheid_base_breach_scenario_IWD339m_HQ100_flowcorrected_roughinterp_alpha0.4_theta0.85_vel_";

/** Builds the full geotiff url for a time value (in seconds). */
export function buildVelocityUrl(timeValue: number): string {
    return `${GEOTIFF_BASE_URL}${FILE_PREFIX}${timeValue}.tif`;
}

/** URL of the static maximum raster (…_vel_max.tif): highest flow velocity over time. */
export function buildVelocityMaxUrl(): string {
    return `${GEOTIFF_BASE_URL}${FILE_PREFIX}max.tif`;
}

/** One colour stop of the flow velocity scale. */
export interface FlowVelocityColorStop {
    value: number; // flow velocity in m/s
    color: string;
    label: string;
}

/**
 * Fixed colour scale for flow velocity in m/s (warm yellow-to-red ramp).
 * Deliberately different from the blue water depth scale so the two layers stay clearly
 * distinguishable on the map. Shared by the service (style) and the legend.
 */
export const flowVelocityColorMap: FlowVelocityColorStop[] = [
    { value: 0, color: "rgba(255,255,255,0)", label: "0" },
    { value: 0.25, color: "#fed976", label: "0.25" },
    { value: 0.5, color: "#feb24c", label: "0.5" },
    { value: 1.0, color: "#fd8d3c", label: "1.0" },
    { value: 2.0, color: "#f03b20", label: "2.0" },
    { value: 4.0, color: "#bd0026", label: "≥ 4.0" }
];
