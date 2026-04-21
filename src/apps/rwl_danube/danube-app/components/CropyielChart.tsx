// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import "highcharts/highcharts-more"; // Required for 'arearange' type
import { useEffect, useState } from "react";
import Papa from "papaparse";

type EnsembleProps = {
    regionName: string;
    regionCode: string;
    selectedCrops: string[];
    selectedScenario: string;
};

type SeriesData = {
    name: string;
    data: number[][];
    type: string;
    color: string;
    fillOpacity?: number;
    lineWidth?: number;
    showInLegend?: boolean;
    zIndex?: number;
    marker?: { enabled: boolean; radius?: number };
    tooltip: { valueSuffix: string };
};



const distinctColors = [
    "#E6194B", "#3CB44B", "#FFE119", "#4363D8", "#F58231",
    "#911EB4", "#42D4F4", "#F032E6", "#BFEF45", "#469990"
];

const LineChart: React.FC<EnsembleProps> = ({
    regionName,
    regionCode,
    selectedCrops,
    selectedScenario
}) => {
    const [seriesData, setSeriesData] = useState<SeriesData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!selectedCrops || selectedCrops.length === 0) {
            setSeriesData([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const fetchCropData = async (
            cropName: string,
            color: string
        ): Promise<SeriesData[] | null> => {
            const url = `http://localhost:5000/api/data/danube_crop_yields_${selectedScenario}/absolut_${cropName}_yield_scenario_${selectedScenario.toUpperCase()}.csv`;

            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to fetch data for ${cropName}`);

                const csvText = await res.text();

                return new Promise((resolve) => {
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            // Group yields by timestamp
                            const yearlyGroups: Record<number, number[]> = {};

                            results.data.forEach((row: Record<string, string>) => {
                                if (row.NUTS === regionCode) {
                                    const year = Number(row.Year);
                                    const yieldPredn = parseFloat(row["Yield.Predn"]);
                                    
                                    if (!isNaN(year) && !isNaN(yieldPredn)) {
                                        const timestamp = new Date(year, 0, 1).getTime();
                                        if (!yearlyGroups[timestamp]) {
                                            yearlyGroups[timestamp] = [];
                                        }
                                        yearlyGroups[timestamp].push(yieldPredn);
                                    }
                                }
                            });

                            const medianData: number[][] = [];
                            const rangeData: number[][] = [];

                            // Process the groups chronologically
                            const timestamps = Object.keys(yearlyGroups).map(Number).sort((a, b) => a - b);

                            timestamps.forEach((timestamp) => {
                                const values = yearlyGroups[timestamp];
                                if (values.length > 0) {
                                    // Sort values to find percentiles
                                    const sortedValues = values.sort((a, b) => a - b);
                                    
                                    const medianIndex = Math.floor(sortedValues.length * 0.5);
                                    const lowerIndex = Math.floor(sortedValues.length * 0.2);
                                    const upperIndex = Math.floor(sortedValues.length * 0.8);
                                    
                                    // Make sure indices don't go out of bounds just in case
                                    const safeLower = Math.min(lowerIndex, sortedValues.length - 1);
                                    const safeUpper = Math.min(upperIndex, sortedValues.length - 1);

                                    const median = Math.floor(sortedValues[medianIndex] * 100) / 100;
                                    const lower20 = Math.floor(sortedValues[safeLower] * 100) / 100;
                                    const upper80 = Math.floor(sortedValues[safeUpper] * 100) / 100;

                                    medianData.push([timestamp, median]);
                                    rangeData.push([timestamp, lower20, upper80]); // arearange requires [x, low, high]
                                }
                            });

                            if (medianData.length === 0) {
                                resolve(null);
                                return;
                            }

                            // Return TWO series for each crop (the shaded range and the solid median line)
                            resolve([
                                {
                                    name: `${cropName} (20-80 Percentile)`,
                                    data: rangeData,
                                    type: "arearange",
                                    color: color,
                                    fillOpacity: 0.2,
                                    lineWidth: 0,
                                    marker: { enabled: false },
                                    showInLegend: false,
                                    zIndex: 0,
                                    tooltip: { valueSuffix: " t/ha" }
                                },
                                {
                                    name: `${cropName} (Median)`,
                                    data: medianData,
                                    type: "line",
                                    color: color,
                                    marker: { enabled: false }, // Disable markers on median line for clean look
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

        Promise.all(
            selectedCrops.map((crop, index) => 
                fetchCropData(crop, distinctColors[index % distinctColors.length])
            )
        )
            .then((results) => {
                // Remove nulls and flatten the array so the range and median series are top-level
                const validSeries = results.filter((res) => res !== null).flat() as SeriesData[];
                setSeriesData(validSeries);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [selectedCrops, selectedScenario, regionCode]);

    const options = {
        title: {
            text: `Projected Crop Yields in ${regionName || regionCode} (${selectedScenario.toUpperCase()})`
        },
        plotOptions: {
            series: {
                dataGrouping: { enabled: false }
            }
        },
        rangeSelector: { enabled: false },
        navigator: { enabled: false },
        scrollbar: { enabled: false },
        xAxis: {
            type: "datetime",
            title: { text: "Year" },
            ordinal: false,
            tickInterval: Date.UTC(1971, 0, 1) - Date.UTC(1970, 0, 1), 
        },
        yAxis: {
            title: { text: "Projected Yield (t/ha)" },
            opposite: false
        },
        tooltip: {
            crosshairs: true,
            shared: true,
            xDateFormat: "%Y",
            valueDecimals: 2
        },
        legend: {
            enabled: true
        },
        series: seriesData
    };

    return (
        <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "500px" }}>
            {isLoading && (
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255, 255, 255, 0.7)", zIndex: 10, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #4363D8", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {!isLoading && seriesData.length > 0 && (
                <HighchartsReact highcharts={Highcharts} constructorType={"stockChart"} options={options} />
            )}
            
            {!isLoading && seriesData.length === 0 && selectedCrops.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <p>No data available for the selected regions and crops.</p>
                </div>
            )}
        </div>
    );
};

export default LineChart;