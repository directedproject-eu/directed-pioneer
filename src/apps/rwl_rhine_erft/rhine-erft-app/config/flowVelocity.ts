// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

/**
 * Configuration for the time-varying flow velocity WMS layers
 * (HRB Eicherscheid -- base breach scenario, HQ100).
 *
 * WMS url, workspace and the time axis (TIMESTEPS) are identical to water depth
 * (same simulation) and are reused from {@link ./floodDepth}. Only the layer name prefix
 * (`_vel_`) and the colour scale differ here.
 */
import { WMS_WORKSPACE } from "./floodDepth";

/**
 * Fixed file name prefix; only the time value at the end (…_vel_<t>) varies.
 * Variable: `vel` = flow velocity.
 * Example: hrb_eicherscheid_vel_2700
 */
const FILE_PREFIX = "hrb_eicherscheid_vel_";

/** Velocity layers start at 60 s; at t = 0 the water is at rest and there is no layer. */
export const FIRST_VELOCITY_TIME = 60;

/**
 * Name of the WMS layer for a time value (in seconds), e.g. `directed:hrb_eicherscheid_vel_2700`.
 * Undefined before {@link FIRST_VELOCITY_TIME}, where no velocity layer exists.
 */
export function buildVelocityLayerName(timeValue: number): string | undefined {
    if (timeValue < FIRST_VELOCITY_TIME) {
        return undefined;
    }
    return `${WMS_WORKSPACE}:${FILE_PREFIX}${timeValue}`;
}

/** Name of the static maximum WMS layer (…_vel_max): highest flow velocity over time. */
export function buildVelocityMaxLayerName(): string {
    return `${WMS_WORKSPACE}:${FILE_PREFIX}max`;
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
