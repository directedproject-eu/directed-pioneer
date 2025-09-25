// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/highcharts-more"; // Note: no "highchartsMore from"

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { useService } from "open-pioneer:react-hooks";
import { IsimipHandler } from "../services/IsimipHandler";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";

type EnsembleProps = {
    regionName: string;
    files: string[];
    regionCode: string;
    selectedCrop: string[];
    selectedScenario: string;
};

const LineChart: React.FC<EnsembleProps> = ({
    regionName,
    files,
    regionCode,
    selectedCrops,
    selectedScenario
}) => {
    const modelRealizations = {
        "gfdl-esm4": 0,
        "ipsl-cm6a-lr": 1,
        "mpi-esm1-2-hr": 2,
        "mri-esm2-0": 3,
        "ukesm1-0-ll": 4,
        "canesm5": 5,
        "cnrm-cm6-1": 6,
        "cnrm-esm2-1": 7,
        "ec-earth3": 8,
        "miroc6": 9
    };

    const scenarioRealization = {
        "ssp585": 50,
        "ssp370": 40,
        "ssp126": 30
    };

    const [data, setData] = useState({});
    const [uniqueCrops, setUniqueCrops] = useState([]);
    const grouped = {};

    const distinctColors = [
        "#E6194B", // Red
        "#3CB44B", // Green
        "#FFE119", // Yellow
        "#4363D8", // Blue
        "#F58231", // Orange
        "#911EB4", // Purple
        "#42D4F4", // Cyan
        "#F032E6", // Magenta
        "#BFEF45", // Lime
        "#469990" // Teal
    ];

    useEffect(() => {
        Promise.all(
            files.map((file) =>
                fetch(file)
                    .then((res) => res.text())
                    .then(
                        (csvText) =>
                            new Promise((resolve) => {
                                Papa.parse(csvText, {
                                    header: true,
                                    skipEmptyLines: true,
                                    complete: (results) => resolve(results.data)
                                });
                            })
                    )
            )

            // Changed region codes for lucerne and spring barley from AT11/AT22 to HU22.
        ).then((allCsvData) => {
            const dataGroups = {};
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
    }, []);

    if (Object.keys(data).length === 0) {
        return "loading...";
    }
    const numbers = [...Array(10).keys()];

    const allCropsData = selectedCrops.map((crop) => {
        const numbers = [...Array(10).keys()];

        // For each crop, create an array of its data points
        const cropData = numbers.map((number) => {
            return data[
                `${crop} | Real ${number + scenarioRealization[selectedScenario]} | CMIP6:${selectedScenario.toUpperCase()} | ${regionCode}`
            ];
        });

        return cropData;
    });
    const series = allCropsData.flatMap((cropData, index) => {
        if (!cropData || !Array.isArray(cropData)) return [];

        const yearlyGroups = {};
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
            values: yearlyGroups[year]
        }));

        const highchartsData = finalArray
            .map((yearData) => {
                const { year, values } = yearData;
                if (!values || values.length === 0) {
                    return null;
                }
                const sortedValues = [...values]
                    .filter((v) => typeof v === "number" && !isNaN(v))
                    .sort((a, b) => a - b);
                if (sortedValues.length === 0) return null;

                const medianIndex = Math.floor(sortedValues.length * 0.5);
                const lowerIndex = Math.floor(sortedValues.length * 0.2);
                const upperIndex = Math.floor(sortedValues.length * 0.8);
                const timestamp = new Date(year, 0, 1).getTime();

                return {
                    "timestamp": timestamp,
                    "median": Math.floor(sortedValues[medianIndex] * 100) / 100,
                    "lower20": Math.floor(sortedValues[lowerIndex] * 100) / 100,
                    "upper80": Math.floor(sortedValues[upperIndex] * 100) / 100
                };
            })
            .filter(Boolean);

        const rangeData = highchartsData.map((d) => [d.timestamp, d.lower20, d.upper80]);
        const medianData = highchartsData.map((d) => [d.timestamp, d.median]);
        const cropName = selectedCrops[index];
        const color = distinctColors[index % distinctColors.length];

        return [
            {
                "name": `${cropName} (20-80 Percentile Range)`,
                "data": rangeData,
                "type": "arearange",
                "color": color,
                "fillOpacity": 0.2,
                "lineWidth": 0,
                "marker": { "enabled": false },
                "showInLegend": false,
                "zIndex": 0
            },
            {
                "name": `${cropName} (Median)`,
                "data": medianData,
                "type": "line",
                "color": color,
                "marker": { "enabled": false },
                "zIndex": 1
            }
        ];
    });

    const options = {
        title: {
            text: `Crop Yields in ${regionName} for CMIP6:${selectedScenario.toUpperCase()}`
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
            valueSuffix: "t/ha"
        },
        legend: {
            enabled: true
        },
        series: series
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default LineChart;
