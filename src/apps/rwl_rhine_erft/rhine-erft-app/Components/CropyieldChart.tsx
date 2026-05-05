// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/highcharts-more";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { useIntl } from "open-pioneer:react-hooks";

type ChartProps = {
    regionName: string;
    files: string[];
    regionCode: string;
    selectedCrops: string[]; // Note: fixed typo from selectedCrop to selectedCrops
    selectedScenario: string;
};

// We need a strict mapping because the CSV files ALWAYS use English strings,
// regardless of what language the user's UI is set to.
const CSV_CROP_NAMES: Record<string, string> = {
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
    "WWHT": "Winter wheat",
    "OATS": "Oats",
    "SUGB": "Sugar beet"
};

const LineChart: React.FC<ChartProps> = ({
    regionName,
    files,
    regionCode,
    selectedCrops,
    selectedScenario
}) => {
    const intl = useIntl();

    const modelRealizations = {
        "gfdl-esm4": 0, "ipsl-cm6a-lr": 1, "mpi-esm1-2-hr": 2,
        "mri-esm2-0": 3, "ukesm1-0-ll": 4, "canesm5": 5,
        "cnrm-cm6-1": 6, "cnrm-esm2-1": 7, "ec-earth3": 8, "miroc6": 9
    };

    const scenarioRealization: Record<string, number> = {
        "ssp585": 50,
        "ssp370": 40,
        "ssp126": 30
    };

    const [data, setData] = useState<Record<string, number[][]>>({});
    const [uniqueCrops, setUniqueCrops] = useState<string[]>([]);

    const distinctColors = [
        "#E6194B", "#3CB44B", "#FFE119", "#4363D8", "#F58231",
        "#911EB4", "#42D4F4", "#F032E6", "#BFEF45", "#469990"
    ];

    useEffect(() => {
        Promise.all(
            files.map((file) =>
                fetch(file)
                    .then((res) => res.text())
                    .then(
                        (csvText) =>
                            new Promise<Record<string, string>[]>((resolve) => {
                                Papa.parse(csvText, {
                                    header: true,
                                    skipEmptyLines: true,
                                    complete: (results) => resolve(results.data)
                                });
                            })
                    )
            )
        ).then((allCsvData) => {
            const dataGroups: Record<string, number[][]> = {};
            const crops: string[] = [];
            allCsvData.flat().forEach((row) => {
                const key = `${row.Crop} | Real ${row.Real} | ${row.Scenario} | ${row.Region}`;

                if (!crops.includes(row.Crop)) {
                    crops.push(row.Crop);
                }

                if (!dataGroups[key]) {
                    dataGroups[key] = [];
                }

                dataGroups[key].push([Number(row.Year), parseFloat(row["Proj.Yd"])]);
            });
            setUniqueCrops(crops);
            setData(dataGroups);
        });
    }, [files]);

    if (Object.keys(data).length === 0) {
        return "loading...";
    }

    const allCropsData = selectedCrops.map((cropCode) => {
        // Map the code (e.g. "POTA") to the CSV name (e.g. "Potatoes")
        const csvCropName = CSV_CROP_NAMES[cropCode] || cropCode;

        if (selectedScenario === "RCP8dot5") {
            const models = [
                "Cc", "Cd1", "Ck", "Cs", "Ec", "Ed1", "Ed2", "Ed3",
                "Ek1", "Ek2", "Ek3", "Es", "Hc", "Hd", "Hk", "Hs",
                "Is", "Mc", "Ms", "Nd", "Ns"
            ];
            const cropData = models.map((model) => {
                // Use csvCropName to match the parsed CSV data
                return data[`${csvCropName} | Real ${model} | CMIP5:RCP8.5 | ${regionCode}`];
            });
            return cropData;
        } else {
            const numbers = [...Array(10).keys()];
            const cropData = numbers.map((number) => {
                // Use csvCropName to match the parsed CSV data
                return data[
                    `${csvCropName} | Real ${number + scenarioRealization[selectedScenario]} | CMIP6:${selectedScenario.toUpperCase()} | ${regionCode}`
                ];
            });
            return cropData;
        }
    });

    const series = allCropsData.flatMap((cropData, index) => {
        if (!cropData || !Array.isArray(cropData)) return [];

        const yearlyGroups: Record<number, number[]> = {};
        cropData.forEach((realization, realizationIndex) => {
            if (Array.isArray(realization)) {
                realization.forEach(([year, value]) => {
                    if (!yearlyGroups[year]) {
                        yearlyGroups[year] = [];
                    }
                    yearlyGroups[year][realizationIndex] = value;
                });
            }
        });

        const finalArray = Object.keys(yearlyGroups).map((year) => ({
            year: parseInt(year),
            values: yearlyGroups[year as unknown as number]
        }));

        const highchartsData = finalArray
            .map((yearData) => {
                const { year, values } = yearData;
                if (!values || values.length === 0) return null;
                
                const sortedValues = [...values]
                    .filter((v) => typeof v === "number" && !isNaN(v))
                    .sort((a, b) => a - b);
                
                if (sortedValues.length === 0) return null;

                const medianIndex = Math.floor(sortedValues.length * 0.5);
                const lowerIndex = Math.floor(sortedValues.length * 0.2);
                const upperIndex = Math.floor(sortedValues.length * 0.8);
                const timestamp = new Date(year, 0, 1).getTime();

                return {
                    timestamp: timestamp,
                    median: Math.floor(sortedValues[medianIndex] * 100) / 100,
                    lower20: Math.floor(sortedValues[lowerIndex] * 100) / 100,
                    upper80: Math.floor(sortedValues[upperIndex] * 100) / 100
                };
            })
            .filter(Boolean) as {timestamp: number, median: number, lower20: number, upper80: number}[];

        const rangeData = highchartsData.map((d) => [d.timestamp, d.lower20, d.upper80]);
        const medianData = highchartsData.map((d) => [d.timestamp, d.median]);
        
        // Translate the display name for the chart legend
        const cropCode = selectedCrops[index];
        const localizedCropName = intl.formatMessage({ id: `crops.${cropCode}` });
        const color = distinctColors[index % distinctColors.length];

        return [
            {
                name: `${localizedCropName} (20-80 Percentile)`,
                data: rangeData,
                type: "arearange",
                color: color,
                fillOpacity: 0.2,
                lineWidth: 0,
                marker: { enabled: false },
                showInLegend: false,
                zIndex: 0
            },
            {
                name: `${localizedCropName} (Median)`,
                data: medianData,
                type: "line",
                color: color,
                marker: { enabled: false },
                zIndex: 1
            }
        ];
    });

    // Provide fallback translated headings
    const titleText = selectedScenario === "RCP8dot5" 
        ? `${intl.formatMessage({ id: "charts.chart_heading1", defaultMessage: "Crop Yield in" })} ${regionName} CMIP5:RCP8.5` 
        : `${intl.formatMessage({ id: "charts.chart_heading1", defaultMessage: "Crop Yield in" })} ${regionName} CMIP6:${selectedScenario.toUpperCase()}`;

    const options = {
        title: {
            text: titleText
        },
        xAxis: {
            type: "datetime",
            title: { text: "Year" }
        },
        yAxis: {
            title: { text: "Projected Yield in t/ha" }
        },
        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: " t/ha"
        },
        legend: {
            enabled: true
        },
        series: series
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default LineChart;