// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useEffect, useState } from "react";

type ForestryProps = {
    selectedVariables: string[];
};

type DataPoint = {
    time: string;
    val: number;
};

type SeriesData = {
    name: string;
    data: number[][];
    type: string;
    color: string;
    marker: { enabled: boolean };
};

const distinctColors = [
    "#E6194B", 
    "#3CB44B", 
    "#4363D8", 
    "#F58231", 
    "#911EB4", 
    "#42D4F4"  
];

const ForestryChart: React.FC<ForestryProps> = ({ selectedVariables }) => {
    const [seriesData, setSeriesData] = useState<SeriesData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (selectedVariables.length === 0) {
            setSeriesData([]);
            return;
        }

        setIsLoading(true);

        const fetchPromises = selectedVariables.map((variable) =>
            fetch(`https://52n-directed.obs.eu-de.otc.t-systems.com/data/forestry/keszthelyi_erdeszet_vallus/${variable}.json`)
                .then((res) => {
                    if (!res.ok) throw new Error(`Failed to fetch ${variable}`);
                    return res.json();
                })
                .then((data: DataPoint[]) => {
                    const formattedData = data.map((item) => [
                        new Date(item.time).getTime(),
                        item.val
                    ]);
                    
                    return {
                        name: variable.charAt(0).toUpperCase() + variable.slice(1).replace(/_/g, " "),
                        data: formattedData,
                        variable: variable
                    };
                })
        );

        Promise.all(fetchPromises)
            .then((results) => {
                const highchartsSeries: SeriesData[] = results.map((result, index) => ({
                    name: result.name,
                    data: result.data,
                    type: "line",
                    color: distinctColors[index % distinctColors.length],
                    marker: { enabled: false }
                }));
                
                setSeriesData(highchartsSeries);
            })
            .catch((error) => console.error("Error fetching forestry data:", error))
            .finally(() => setIsLoading(false));

    }, [selectedVariables]);

    if (isLoading && seriesData.length === 0) {
        return <div>loading...</div>;
    }

    const options = {
        title: {
            text: "Forestry Data - Keszthelyi Erdészet Vállus"
        },
        xAxis: {
            type: "datetime",
            title: { text: "Time" }
        },
        yAxis: {
            title: { text: "Value" }
        },
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

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default ForestryChart;