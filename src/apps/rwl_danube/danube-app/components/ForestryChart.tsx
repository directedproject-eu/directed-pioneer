// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { useEffect, useState, useRef } from "react";

type ForestryProps = {
    leftVariable: string;
    rightVariable: string;
    selectedLocation: string;
    locationName: string;
};

type SeriesData = {
    id: string;
    name: string;
    data: number[][];
    type: string;
    color: string;
    yAxis: number;
    marker: { enabled: boolean };
    tooltip: { valueSuffix: string };
    dataGrouping: { enabled: boolean; approximation: string };
};

const formatLabel = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
};

const getUnit = (variable: string) => {
    if (variable === "temperature") return "°C";
    if (variable === "wind_speed") return "m/s";
    if (variable.includes("soil_moisture")) return "%";
    return "";
};

const ForestryChart: React.FC<ForestryProps> = ({
    leftVariable,
    rightVariable,
    selectedLocation,
    locationName
}) => {
    const [seriesData, setSeriesData] = useState<SeriesData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!selectedLocation) return;

        setIsLoading(true);

        setSeriesData([]);

        const fetchVariable = async (
            variable: string,
            axisIndex: number,
            color: string
        ): Promise<SeriesData | null> => {
            if (variable === "none") return null;

            const isValidDataPoint = (varName: string, value: number | null) => {
                if (value === null || isNaN(value)) return false;

                if (varName.includes("soil_moisture")) {
                    return value >= 0 && value <= 100;
                }

                return true;
            };

            try {
                const res = await fetch(
                    `https://52n-directed.obs.eu-de.otc.t-systems.com/data/forestry/${selectedLocation}/${variable}.json`
                );
                if (!res.ok) throw new Error(`Failed to fetch ${variable}`);

                const data = await res.json();

                if (!Array.isArray(data)) throw new Error("Data is not an array");

                const formattedData = data
                    .map((item: { time: string; val: number }) => [
                        new Date(item.time).getTime(),
                        item.val
                    ])
                    .filter(
                        (point: number[]) =>
                            !isNaN(point[0]) && isValidDataPoint(variable, point[1])
                    )
                    .sort((a: number[], b: number[]) => a[0] - b[0]);

                return {
                    id: `series-${axisIndex}`,
                    name: formatLabel(variable),
                    data: formattedData,
                    type: "line",
                    color: color,
                    yAxis: axisIndex,
                    marker: { enabled: false },
                    tooltip: { valueSuffix: ` ${getUnit(variable)}` },
                    dataGrouping: {
                        enabled: true,
                        approximation: "average"
                    }
                };
            } catch (err) {
                console.warn(err);
                return null;
            }
        };

        Promise.all([
            fetchVariable(leftVariable, 0, "#E6194B"),
            fetchVariable(rightVariable, 1, "#4363D8")
        ])
            .then((results) => {
                const validSeries = results.filter((res) => res !== null) as SeriesData[];
                setSeriesData(validSeries);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [leftVariable, rightVariable, selectedLocation]);

    useEffect(() => {
        if (seriesData.length > 0) {
            isFirstRender.current = false;
        }
    }, [seriesData]);

    const options = {
        title: {
            text: `Forestry Data - ${locationName}`
        },
        rangeSelector: {
            enabled: true,
            inputEnabled: true,
            selected: 2,
            buttons: [
                { type: "da", count: 1, text: "1d" },
                { type: "week", count: 1, text: "1w" },
                { type: "month", count: 1, text: "1m" },
                { type: "month", count: 3, text: "3m" },
                { type: "month", count: 6, text: "6m" },
                { type: "year", count: 1, text: "1y" },
                { type: "all", text: "All" }
            ]
        },
        xAxis: {
            type: "datetime",
            title: { text: "Time" },
            ordinal: false
        },
        navigator: {
            enabled: false
        },
        scrollbar: {
            enabled: false
        },
        yAxis: [
            {
                title: {
                    text:
                        leftVariable !== "none"
                            ? `${formatLabel(leftVariable)} (${getUnit(leftVariable)})`
                            : ""
                },
                labels: { format: `{value} ${getUnit(leftVariable)}` },
                opposite: false,
                visible: leftVariable !== "none"
            },
            {
                title: {
                    text:
                        rightVariable !== "none"
                            ? `${formatLabel(rightVariable)} (${getUnit(rightVariable)})`
                            : ""
                },
                labels: { format: `{value} ${getUnit(rightVariable)}` },
                opposite: true,
                visible: rightVariable !== "none"
            }
        ],
        tooltip: {
            crosshairs: true,
            shared: true,
            xDateFormat: "%Y-%m-%d %H:%M",
            valueDecimals: 2
        },
        legend: {
            enabled: true
        },
        series: seriesData
    };

    return (
        <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "400px" }}>
            {isLoading && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        zIndex: 10,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            border: "4px solid #f3f3f3",
                            borderTop: "4px solid #4363D8",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite"
                        }}
                    />
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}

            {seriesData.length > 0 && !isLoading && (
                <HighchartsReact
                    key={selectedLocation}
                    highcharts={Highcharts}
                    constructorType={"stockChart"}
                    options={options}
                />
            )}
        </div>
    );
};

export default ForestryChart;
