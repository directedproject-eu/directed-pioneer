// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import "highcharts/highcharts-more";
export type SeriesData = {
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

type ChartProps = {
    regionName: string;
    selectedCrops: string[];
    selectedScenario: string;
    seriesData: SeriesData[];
    isLoading: boolean;
};

const LineChart: React.FC<ChartProps> = ({
    regionName,
    selectedCrops,
    selectedScenario,
    seriesData,
    isLoading   
}) => {
    const options = {
        title: {
            text: `Projected Crop Yields in ${regionName} (${selectedScenario.toUpperCase()})`
        },
        plotOptions: {
            series: {
                dataGrouping: { enabled: false },
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
            shared: true,          
            crosshairs: true,    
            headerFormat: "",      
            valueDecimals: 2       
        },
        legend: {
            enabled: true,
            itemStyle: {
                pointerEvents: "none",
                cursor: "default",
                color: "#333333"
            }
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