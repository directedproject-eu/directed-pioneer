// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import Papa from "papaparse";
import type { PackageIntl } from "@open-pioneer/runtime";
import { SeriesData } from "./CropyieldChart";

export const NUTS_REGIONS: Record<string, string> = {
    "AT11": "Burgenland",
    "AT12": "Niederösterreich",
    "AT13": "Wien",
    "AT21": "Kärnten",
    "AT22": "Steiermark",
    "AT31": "Oberösterreich",
    "AT32": "Salzburg",
    "AT33": "Tirol",
    "AT34": "Vorarlberg",
    "BA__": "Bosnia and Herzegovina",
    "BG31": "Severozapaden",
    "BG32": "Severen tsentralen",
    "BG33": "Severoiztochen",
    "BG34": "Yugoiztochen",
    "BG41": "Yugozapaden",
    "CH05": "Ostschweiz",
    "CZ03": "Jihozápad",
    "CZ05": "Severovýchod",
    "CZ06": "Jihovýchod",
    "CZ07": "Střední Morava",
    "CZ08": "Moravskoslezsko",
    "DE11": "Stuttgart",
    "DE13": "Freiburg",
    "DE14": "Tübingen",
    "DE21": "Oberbayern",
    "DE22": "Niederbayern",
    "DE23": "Oberpfalz",
    "DE24": "Oberfranken",
    "DE25": "Mittelfranken",
    "DE27": "Schwaben",
    "HR02": "Panonska Hrvatska",
    "HR03": "Jadranska Hrvatska",
    "HR05": "Grad Zagreb",
    "HR06": "Sjeverna Hrvatska",
    "HU11": "Budapest",
    "HU12": "Pest",
    "HU21": "Közép-Dunántúl",
    "HU22": "Nyugat-Dunántúl",
    "HU23": "Dél-Dunántúl",
    "HU31": "Észak-Magyarország",
    "HU32": "Észak-Alföld",
    "HU33": "Dél-Alföld",
    "ITC4": "Lombardia",
    "ITH1": "Provincia Autonoma di Bolzano/Bozen",
    "ITH4": "Friuli-Venezia Giulia",
    "ME00": "Crna Gora",
    "MK00": "Severna Makedonija",
    "PL21": "Małopolskie",
    "RO11": "Nord-Vest",
    "RO12": "Centru",
    "RO21": "Nord-Est",
    "RO22": "Sud-Est",
    "RO31": "Sud-Muntenia",
    "RO32": "București-Ilfov",
    "RO41": "Sud-Vest Oltenia",
    "RO42": "Vest",
    "RS11": "City of Belgrade",
    "RS12": "Autonomous Province of Vojvodina",
    "RS21": "Region Šumadije i Zapadne Srbije",
    "RS22": "Region Južne i Istočne Srbije",
    "SI03": "Vzhodna Slovenija",
    "SI04": "Zahodna Slovenija",
    "SK01": "Bratislavský kraj",
    "SK02": "Západné Slovensko",
    "SK03": "Stredné Slovensko",
    "SK04": "Východné Slovensko",
    "XK__": "Kosovo"
};

export const locations = Object.keys(NUTS_REGIONS);

/**
 * Label for a NUTS id, as "Burgenland (AT11)".
 *
 * Falls back to the bare id, and that is reachable: the map hands over whatever `NUTS_ID`
 * the pygeoapi collection carries, which need not be one of the regions listed above.
 */
export function nutsRegionLabel(nutsId: string): string {
    const name = NUTS_REGIONS[nutsId];
    return name ? `${name} (${nutsId})` : nutsId;
}

/**
 * Every crop the dataset may contain. Not every region has all of them -- see
 * {@link checkCropAvailability}. Display names come from i18n under `crops.<code>`.
 */
export const ALL_CROP_CODES = [
    "ALFA",
    "CORN",
    "GMAI",
    "POTA",
    "SBAR",
    "SOYB",
    "SUNF",
    "TRIT",
    "WBAR",
    "WRAP",
    "WRYE",
    "WWHT"
];

const FALLBACK_SERIES_COLOR = "#000000";

const distinctColors = [
    "#E6194B",
    "#3CB44B",
    "#FFE119",
    "#4363D8",
    "#F58231",
    "#911EB4",
    "#42D4F4",
    "#F032E6",
    "#BFEF45",
    "#469990"
];

/**
 * Colour for the n-th series, cycling through the palette.
 *
 * The modulo keeps the index in range; the fallback exists only because TypeScript cannot
 * see that and would otherwise call the result possibly undefined.
 */
export function seriesColor(index: number): string {
    return distinctColors[index % distinctColors.length] ?? FALLBACK_SERIES_COLOR;
}

/** Where the crop yield projections live, one csv per region, scenario and crop. */
const CROP_YIELD_BASE_URL = "https://52n-directed.obs.eu-de.otc.t-systems.com/data/crop_yield";

function cropDataUrl(location: string, scenario: string, cropCode: string): string {
    return `${CROP_YIELD_BASE_URL}/${location}/${scenario}/${cropCode}.csv`;
}

/**
 * The crops that actually have data for `location`, probed with twelve parallel HEAD
 * requests.
 *
 * A crop that cannot be reached is reported as unavailable, so a network failure and a
 * genuinely missing dataset look the same to the caller -- the user simply sees a shorter
 * list. The warning below is the only trace. Telling the two apart would mean changing what
 * this function promises; see BACKLOG.md.
 */
export const checkCropAvailability = async (location: string): Promise<string[]> => {
    // Availability is assumed to be the same across scenarios, so one is enough to probe.
    const checkScenario = "SSP585";

    const availabilityChecks = ALL_CROP_CODES.map(async (cropCode) => {
        try {
            const response = await fetch(cropDataUrl(location, checkScenario, cropCode), {
                method: "HEAD"
            });
            return response.ok ? cropCode : null;
        } catch (error) {
            console.warn(`Could not check whether ${cropCode} exists for ${location}:`, error);
            return null;
        }
    });

    const results = await Promise.all(availabilityChecks);
    return results.filter((crop): crop is string => crop !== null);
};

/**
 * Value at `fraction` through the sorted array, rounded down to two decimals.
 *
 * The index is clamped to the last element, so a short series yields its highest value
 * rather than running off the end -- with a single realisation all three percentiles
 * collapse onto the same number, which is correct.
 */
function percentile(sortedValues: number[], fraction: number): number {
    const index = Math.min(Math.floor(sortedValues.length * fraction), sortedValues.length - 1);
    return Math.floor((sortedValues[index] ?? NaN) * 100) / 100;
}

export const fetchAndProcessCropData = async (
    location: string,
    scenario: string,
    cropCode: string,
    color: string,
    intl: PackageIntl
): Promise<SeriesData[] | null> => {
    const url = cropDataUrl(location, scenario, cropCode);

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch data for ${cropCode}`);

        const csvText = await res.text();

        return new Promise((resolve) => {
            Papa.parse<Record<string, string>>(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const yearlyGroups: Record<number, number[]> = {};

                    results.data.forEach((row) => {
                        const year = Number(row.Year);
                        const yieldPredn = parseFloat(row["Yield.Predn"] ?? "");

                        if (!isNaN(year) && !isNaN(yieldPredn)) {
                            const timestamp = new Date(year, 0, 1).getTime();
                            if (!yearlyGroups[timestamp]) {
                                yearlyGroups[timestamp] = [];
                            }
                            yearlyGroups[timestamp].push(yieldPredn);
                        }
                    });

                    const medianData: number[][] = [];
                    const rangeData: number[][] = [];
                    const timestamps = Object.keys(yearlyGroups)
                        .map(Number)
                        .sort((a, b) => a - b);

                    timestamps.forEach((timestamp) => {
                        const values = yearlyGroups[timestamp];
                        if (!values || values.length === 0) {
                            return;
                        }
                        // Copy before sorting: sort works in place, and `values` is the
                        // array still held by yearlyGroups.
                        const sortedValues = [...values].sort((a, b) => a - b);

                        medianData.push([timestamp, percentile(sortedValues, 0.5)]);
                        rangeData.push([
                            timestamp,
                            percentile(sortedValues, 0.2),
                            percentile(sortedValues, 0.8)
                        ]);
                    });

                    if (medianData.length === 0) {
                        resolve(null);
                        return;
                    }

                    // Translated while the series is built, not when it is drawn -- which is
                    // why the hook lists intl as a dependency and refetches on a language
                    // switch. A missing key surfaces as the key itself in the legend; there
                    // is no fallback.
                    const cropName = intl.formatMessage({ id: `crops.${cropCode}` });
                    const percentileText = intl.formatMessage({ id: "charts.percentile" });
                    const medianText = intl.formatMessage({ id: "charts.median" });

                    resolve([
                        {
                            name: `${cropName} (${percentileText})`,
                            data: rangeData,
                            type: "arearange",
                            color: color,
                            fillOpacity: 0.2,
                            lineWidth: 0,
                            marker: { enabled: false },
                            zIndex: 0,
                            tooltip: { valueSuffix: " t/ha" },
                            showInLegend: true
                        },
                        {
                            name: `${cropName} (${medianText})`,
                            data: medianData,
                            type: "line",
                            color: color,
                            marker: { enabled: false },
                            zIndex: 1,
                            tooltip: { valueSuffix: " t/ha" }
                        }
                    ]);
                }
            });
        });
    } catch (err) {
        console.warn(err);
        return null;
    }
};
