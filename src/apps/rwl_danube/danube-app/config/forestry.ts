// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

/**
 * The forestry stations and what they measure, shared by the map and the chart.
 *
 * Both lists used to exist twice and had already drifted apart: three stations were named
 * differently on the map than in the chart's dropdown, and the variable labels differed in
 * capitalisation between the dropdown and the chart legend shown right next to it.
 *
 * Still hardcoded hungarian and english -- but now in one place, so introducing i18n keys
 * is a change to this file rather than to three.
 */

/** One forestry station in the Zala region. */
export interface ForestryStation {
    id: string;
    /** Display name; also the feature label on the map. */
    name: string;
    lon: number;
    lat: number;
}

export const FORESTRY_STATIONS: ForestryStation[] = [
    { id: "bakonybel_2_ti5", name: "Bakonybél (2 TI5)", lon: 17.7245, lat: 47.2501 },
    {
        id: "bakonyszentlaszlo_erdeszet_hodo",
        name: "Bakonyszentlászló (Hódo)",
        lon: 17.8003,
        lat: 47.35
    },
    { id: "csehbanya_20ep", name: "Csehbánya (20ÉP)", lon: 17.6833, lat: 47.1833 },
    { id: "devecser_59_d", name: "Devecser (59 D)", lon: 17.4367, lat: 47.1064 },
    {
        id: "devecseri_edeszet_sarosfo",
        name: "Sárosfő (Devecseri Erdészet)",
        lon: 17.3848,
        lat: 47.0554
    },
    { id: "dorgicse_18_ey", name: "Dörgicse (18 EY)", lon: 17.7219, lat: 46.917 },
    {
        id: "keszthelyi_erdeszet_vallus",
        name: "Vállus (Keszthelyi Erdészet)",
        lon: 17.3092,
        lat: 46.8412
    },
    { id: "kup_24_ti", name: "Kup (24 TI)", lon: 17.4635, lat: 47.2477 },
    { id: "saska_61_vf", name: "Sáska (61 VF)", lon: 17.4789, lat: 46.9358 },
    { id: "tuskevar_36_c", name: "Tüskevár (36 C)", lon: 17.3167, lat: 47.1167 },
    { id: "zalaerdod_29_a", name: "Zalaerdőd (29 A)", lon: 17.1392, lat: 47.0564 }
];

/** A measured variable. Each is one json file per station. */
export interface ForestryVariable {
    id: string;
    name: string;
    unit: string;
}

export const FORESTRY_VARIABLES: ForestryVariable[] = [
    { id: "temperature", name: "Temperature", unit: "°C" },
    { id: "wind_speed", name: "Wind Speed", unit: "m/s" },
    { id: "soil_moisture_10cm", name: "Soil Moisture 10cm", unit: "%" },
    { id: "soil_moisture_25cm", name: "Soil Moisture 25cm", unit: "%" },
    { id: "soil_moisture_50cm", name: "Soil Moisture 50cm", unit: "%" },
    { id: "soil_moisture_70cm", name: "Soil Moisture 70cm", unit: "%" }
];

/**
 * Value the axis dropdowns use to switch an axis off. Not a variable, which is why it is
 * not part of {@link FORESTRY_VARIABLES}.
 */
export const NO_VARIABLE = "none";

export function forestryVariable(id: string): ForestryVariable | undefined {
    return FORESTRY_VARIABLES.find((variable) => variable.id === id);
}
