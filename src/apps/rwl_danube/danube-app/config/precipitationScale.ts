// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

/**
 * The colour scale shared by the precipitation layers and their legends.
 *
 * It lives here because map and legend have to agree: they used to hold separate copies of
 * the same six colours, so changing one would have left the legend labelling the map wrong
 * -- with no error, just wrong numbers next to the right colours.
 */

/** One class of a precipitation colour scale. */
export interface ColorStop {
    /** Lower bound of the class, in mm. */
    value: number;
    color: string;
    label: string;
}

/** The five violet tones every precipitation layer shares, lightest first. */
const VIOLET_RAMP = ["#af7ab3", "#95649a", "#885889", "#674571", "#503752"] as const;

/**
 * The two scales below start from different transparent colours, and that is not merely
 * cosmetic: chroma interpolates in Lab space, so transparent white fades through light pink
 * (#d8bbd980 mid-class) while transparent black fades through dark purple (#543d5680).
 * Each map/legend pair is internally consistent. Whether they should agree with each other
 * is an open question -- see BACKLOG.md.
 */
const TRANSPARENT_WHITE = "rgba(255, 255, 255, 0)";
const TRANSPARENT_BLACK = "#00000000";

/** Historical daily sums. Fixed class bounds in mm, used by map and legend alike. */
export const DAILY_PRECIPITATION_STOPS: ColorStop[] = [
    { value: 0, color: TRANSPARENT_WHITE, label: "0" },
    { value: 25, color: VIOLET_RAMP[0], label: "25" },
    { value: 50, color: VIOLET_RAMP[1], label: "50" },
    { value: 100, color: VIOLET_RAMP[2], label: "100" },
    { value: 200, color: VIOLET_RAMP[3], label: "200" },
    { value: 300, color: VIOLET_RAMP[4], label: "300" }
];

/**
 * Forecast layer. Only the colours are fixed here -- the class bounds are still derived
 * from each file's own value range at runtime, in the service and again in the legend.
 */
export const FORECAST_PRECIPITATION_COLORS: readonly string[] = [TRANSPARENT_BLACK, ...VIOLET_RAMP];
