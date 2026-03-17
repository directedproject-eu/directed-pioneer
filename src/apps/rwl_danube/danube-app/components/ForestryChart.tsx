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

const ForestryChart: React.FC<ForestryProps> = ({ leftVariable, rightVariable, selectedLocation, locationName }) => {
    const [seriesData, setSeriesData] = useState<SeriesData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // 1. Add a ref to track if this is the chart's initial mount
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!selectedLocation) return;

        setIsLoading(true);

        const fetchVariable = async (variable: string, axisIndex: number, color: string): Promise<SeriesData | null> => {
            if (variable === "none") return null;

            try {
                const res = await fetch(`https://52n-directed.obs.eu-de.otc.t-systems.com/data/forestry/${selectedLocation}/${variable}.json`);
                if (!res.ok) throw new Error(`Failed to fetch ${variable}`);
                
                const data = await res.json();
                
                if (!Array.isArray(data)) throw new Error("Data is not an array");
                
                const formattedData = data
                    .map((item: { time: string, val: number }) => [
                        new Date(item.time).getTime(),
                        item.val
                    ])
                    .filter((point: number[]) => !isNaN(point[0]) && point[1] !== null)
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
        ]).then((results) => {
            const validSeries = results.filter((res) => res !== null) as SeriesData[];
            setSeriesData(validSeries);
        }).finally(() => {
            setIsLoading(false);
        });

    }, [leftVariable, rightVariable, selectedLocation]);

    // 2. Once we successfully load data for the first time, mark initial render as complete
    useEffect(() => {
        if (seriesData.length > 0) {
            isFirstRender.current = false;
        }
    }, [seriesData]);

    if (isLoading && seriesData.length === 0) {
        return <div>loading...</div>;
    }

    const options = {
        title: {
            text: `Forestry Data - ${locationName}`
        },
        rangeSelector: {
            enabled: true,
            // 3. Conditionally apply the selected index so it doesn't force a reset on every re-render
            selected: isFirstRender.current ? 1 : undefined, 
            buttons: [
                { type: "week", count: 1, text: "1w" },
                { type: "month", count: 1, text: "1m" }, 
                { type: "month", count: 6, text: "6m" },
                { type: "year", count: 1, text: "1y" },
                { type: "all", text: "All" }
            ]
        },
        xAxis: {
            type: "datetime",
            title: { text: "Time" },
            // 4. Added ordinal: false. This is a best practice for Highstock datetime axes
            // so it doesn't artificially compress time gaps and mess up auto-scaling on series updates.
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
                title: { text: leftVariable !== "none" ? `${formatLabel(leftVariable)} (${getUnit(leftVariable)})` : "" },
                labels: { format: `{value} ${getUnit(leftVariable)}` },
                opposite: false,
                visible: leftVariable !== "none"
            },
            {
                title: { text: rightVariable !== "none" ? `${formatLabel(rightVariable)} (${getUnit(rightVariable)})` : "" },
                labels: { format: `{value} ${getUnit(rightVariable)}` },
                opposite: true,
                visible: rightVariable !== "none"
            }
        ],
        tooltip: {
            crosshairs: true,
            shared: true,
            xDateFormat: "%Y-%m-%d %H:%M"
        },
        legend: {
            enabled: true
        },
        series: seriesData
    };

    return (
        <HighchartsReact 
            highcharts={Highcharts} 
            constructorType={"stockChart"} 
            options={options} 
        />
    );
};

export default ForestryChart;