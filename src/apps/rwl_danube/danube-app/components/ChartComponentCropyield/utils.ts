// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import Papa from "papaparse";
import { SeriesData } from "./CropyieldChart";
        


export const NUTS_REGIONS: Record<string, string> = {
    "AT11": "Burgenland","AT12": "Niederösterreich","AT13": "Wien","AT21": "Kärnten","AT22": "Steiermark","AT31": "Oberösterreich","AT32": "Salzburg",
    "AT33": "Tirol","AT34": "Vorarlberg","BA__": "Bosnia and Herzegovina","BG31": "Severozapaden","BG32": "Severen tsentralen","BG33": "Severoiztochen","BG34": "Yugoiztochen",
    "BG41": "Yugozapaden","CH05": "Ostschweiz","CZ03": "Jihozápad","CZ05": "Severovýchod","CZ06": "Jihovýchod","CZ07": "Střední Morava","CZ08": "Moravskoslezsko","DE11": "Stuttgart","DE13": "Freiburg",
    "DE14": "Tübingen","DE21": "Oberbayern","DE22": "Niederbayern","DE23": "Oberpfalz","DE24": "Oberfranken","DE25": "Mittelfranken","DE27": "Schwaben",
    "HR02": "Panonska Hrvatska","HR03": "Jadranska Hrvatska","HR05": "Grad Zagreb","HR06": "Sjeverna Hrvatska","HU11": "Budapest","HU12": "Pest","HU21": "Közép-Dunántúl","HU22": "Nyugat-Dunántúl",
    "HU23": "Dél-Dunántúl","HU31": "Észak-Magyarország","HU32": "Észak-Alföld","HU33": "Dél-Alföld","ITC4": "Lombardia","ITH1": "Provincia Autonoma di Bolzano/Bozen","ITH4": "Friuli-Venezia Giulia","ME00": "Crna Gora","MK00": "Severna Makedonija",
    "PL21": "Małopolskie","RO11": "Nord-Vest","RO12": "Centru","RO21": "Nord-Est","RO22": "Sud-Est","RO31": "Sud-Muntenia","RO32": "București-Ilfov","RO41": "Sud-Vest Oltenia","RO42": "Vest",
    "RS11": "City of Belgrade","RS12": "Autonomous Province of Vojvodina","RS21": "Region Šumadije i Zapadne Srbije","RS22": "Region Južne i Istočne Srbije","SI03": "Vzhodna Slovenija","SI04": "Zahodna Slovenija","SK01": "Bratislavský kraj","SK02": "Západné Slovensko",
    "SK03": "Stredné Slovensko","SK04": "Východné Slovensko","XK__": "Kosovo"
};

export const locations = Object.keys(NUTS_REGIONS);


export const CODE_TO_DISPLAY_NAME: Record<string, string> = {
    "ALFA": "Lucerne",
    "CORN": "Corn maize",
    "GMAI": "Green maize",
    "POTA": "Potatoes",
    "SBAR": "Spring barley",
    "SOYB": "Soya beans",
    "SUNF": "Sunflowers",
    "TRIT": "Triticale",
    "WBAR": "Winter barley",
    "WRAP": "Winter rape",
    "WRYE": "Rye and maslin",
    "WWHT": "Winter wheat"
};

export const ALL_CROP_CODES = Object.keys(CODE_TO_DISPLAY_NAME);

export const distinctColors = [
    "#E6194B", "#3CB44B", "#FFE119", "#4363D8", "#F58231",
    "#911EB4", "#42D4F4", "#F032E6", "#BFEF45", "#469990"   
];

export const checkCropAvailability = async (location: string): Promise<string[]> => {
    const checkScenario = "SSP585";
    const baseUrl = `http://localhost:5000/api/data/crop_yield/restructured_data/${location}/${checkScenario}`;

    const availabilityChecks = ALL_CROP_CODES.map(async (cropCode) => {
        try {
            const response = await fetch(`${baseUrl}/${cropCode}.csv`, { method: "HEAD" });
            return response.ok ? cropCode : null;
        } catch (error) {
            return null; 
        }
    });

    const results = await Promise.all(availabilityChecks);
    return results.filter((crop): crop is string => crop !== null);
};

export const fetchAndProcessCropData = async (
    location: string, 
    scenario: string, 
    cropCode: string, 
    color: string
): Promise<SeriesData[] | null> => {
    const url = `http://localhost:5000/api/data/crop_yield/restructured_data/${location}/${scenario}/${cropCode}.csv`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch data for ${cropCode}`);

        const csvText = await res.text();

        return new Promise((resolve) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const yearlyGroups: Record<number, number[]> = {};

                    results.data.forEach((row: Record<string, string>) => {
                        const year = Number(row.Year);
                        const yieldPredn = parseFloat(row["Yield.Predn"]);
                        
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
                    const timestamps = Object.keys(yearlyGroups).map(Number).sort((a, b) => a - b);

                    timestamps.forEach((timestamp) => {
                        const values = yearlyGroups[timestamp];
                        if (values.length > 0) {
                            const sortedValues = values.sort((a, b) => a - b);
                            
                            const medianIndex = Math.floor(sortedValues.length * 0.5);
                            const lowerIndex = Math.floor(sortedValues.length * 0.2);
                            const upperIndex = Math.floor(sortedValues.length * 0.8);
                            
                            const safeLower = Math.min(lowerIndex, sortedValues.length - 1);
                            const safeUpper = Math.min(upperIndex, sortedValues.length - 1);

                            const median = Math.floor(sortedValues[medianIndex] * 100) / 100;
                            const lower20 = Math.floor(sortedValues[safeLower] * 100) / 100;
                            const upper80 = Math.floor(sortedValues[safeUpper] * 100) / 100;

                            medianData.push([timestamp, median]);
                            rangeData.push([timestamp, lower20, upper80]);
                        }
                    });

                    if (medianData.length === 0) {
                        resolve(null);
                        return;
                    }

                    resolve([
                        {
                            name: `${CODE_TO_DISPLAY_NAME[cropCode]} (20-80 Percentile)`,
                            data: rangeData,
                            type: "arearange",
                            color: color,
                            fillOpacity: 0.2,
                            lineWidth: 0,
                            marker: { enabled: false },
                            zIndex: 0,
                            tooltip: { valueSuffix: " t/ha" },
                            showInLegend: true,
                        },
                        {
                            name: `${CODE_TO_DISPLAY_NAME[cropCode]} (Median)`,
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