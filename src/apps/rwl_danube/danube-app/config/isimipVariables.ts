// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

/**
 * The climate variables of the ISIMIP dataset and how they are named.
 *
 * These names used to exist three times over: as layer titles in IsimipHandler, as legend
 * headings in Legend.tsx, and as shorter labels in the variable picker -- so the user could
 * pick "Air Temperature", read "Near-Surface Air Temperature in K" in the legend and find
 * "Near-Surface Air Temperature" in the layer tree, all at once.
 */

/** One climate variable of the ISIMIP dataset. */
export interface IsimipVariableInfo {
    /** Full name, used as the layer title in the toc. */
    title: string;
    /** Shorter name for the variable picker, where the box is narrow. */
    shortName: string;
    /**
     * Unit as currently labelled -- not as measured. tas, tasmax and tasmin say "K" while
     * the files hold °C, and pr says kg·m⁻²·s⁻¹ while the values look like millimetres.
     * Left as it was; see BACKLOG.md.
     */
    unit: string;
}

export const ISIMIP_VARIABLES = {
    hurs: { title: "Near-Surface Relative Humidity", shortName: "Relative Humidity", unit: "%" },
    pr: { title: "Precipitation", shortName: "Precipitation", unit: "kg·m⁻²·s⁻¹" },
    rsds: {
        title: "Surface Downwelling Shortwave Radiation",
        shortName: "Shortwave Radiation",
        unit: "W/m²"
    },
    sfcwind: { title: "Near-Surface Wind Speed", shortName: "Wind Speed", unit: "m/s" },
    spei12: { title: "SPEI drought index", shortName: "SPEI drought index", unit: "" },
    tas: { title: "Near-Surface Air Temperature", shortName: "Air Temperature", unit: "K" },
    tasmax: {
        title: "Daily Maximum Near-Surface Air Temperature",
        shortName: "Daily Maximum Air Temperature",
        unit: "K"
    },
    tasmin: {
        title: "Daily Minimum Near-Surface Air Temperature",
        shortName: "Daily Minimum Air Temperature",
        unit: "K"
    }
} satisfies Record<string, IsimipVariableInfo>;

/** The variables that exist, and therefore the only ones that can be shown. */
export type IsimipVariable = keyof typeof ISIMIP_VARIABLES;

export function isIsimipVariable(value: string): value is IsimipVariable {
    return value in ISIMIP_VARIABLES;
}

/**
 * Title with the unit appended, as used for the layer description and the legend heading.
 * `spei12` carries no unit and is therefore returned unchanged.
 */
export function isimipVariableLabel(id: IsimipVariable): string {
    const { title, unit } = ISIMIP_VARIABLES[id];
    return unit ? `${title} in ${unit}` : title;
}
