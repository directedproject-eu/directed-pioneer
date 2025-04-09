// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import {
    Box,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Text
} from "@open-pioneer/chakra-integration";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";
import { ForecastService } from "../services/ForecastService";

interface ForecastData {
    [key: string]: string; //timestamp key and value of the URL from json
}

interface References {
    mapRegistry: MapRegistry;
}

export const Forecasts = () => {
    const [sliderValue, setSliderValue] = useState(0);
    const [sliderValue2, setSliderValue2] = useState(0);
    const [sliderValue3, setSliderValue3] = useState(0);

    const [forecastData, setForecastData] = useState<ForecastData>({});
    const [forecastData2, setForecastData2] = useState<ForecastData>({});
    const [forecastData3, setForecastData3] = useState<ForecastData>({});

    const [timestamps, setTimestamps] = useState<string[]>([]);
    const [timestamps2, setTimestamps2] = useState<string[]>([]);
    const [timestamps3, setTimestamps3] = useState<string[]>([]);

    const [seaLayerVisible, setSeaLayerVisible] = useState(false);
    const [totalPrecipLayerVisible, setTotalPrecipVisible] = useState(false);
    const [precipRateVisible, setPrecipRateVisible] = useState(false);

    const prepSrvc = useService<ForecastService>("app.ForecastService");

    useEffect(() => {
        const fetchData = async () => {
            //DKSS Sea Level Mean Deviation Forecasts
            const response = await fetch(
                "https://52n-directed.obs.eu-de.otc.t-systems.com/data/dmi/forecasts/dkss_if/sea-mean-deviation/forecasts.json"
            );
            const data: ForecastData = await response.json(); //type the response data
            setForecastData(data);
            setTimestamps(Object.keys(data)); //set timestamps after fetching data
            if (data && Object.keys(data).length > 0) {
                const firstTimestamp = Object.keys(data)[0]; //get the first timestamp on fetching the json
                const firstUrl = data[firstTimestamp as keyof ForecastData]; //access value using keyof for indexing
                if (firstUrl) {
                    prepSrvc.setFileUrl(firstUrl); //set initial url
                }
            }

            //Harmonie Total Precipitation Forecasts
            const response2 = await fetch(
                "https://52n-directed.obs.eu-de.otc.t-systems.com/data/dmi/forecasts/harmonie_dini_sf/total-precipitation/forecasts.json"
            );
            const data2: ForecastData = await response2.json();
            setForecastData2(data2);
            setTimestamps2(Object.keys(data2));
            if (data2 && Object.keys(data2).length > 0) {
                const firstTimestamp2 = Object.keys(data2)[0];
                const firstUrl2 = data2[firstTimestamp2 as keyof ForecastData];
                if (firstUrl2) {
                    prepSrvc.setFileUrl2(firstUrl2);
                } else {
                    console.error("No URL found for the first timestamp in forecastData2");
                }
            }

            //Harmonie Precipitation Rate Forecasts
            const response3 = await fetch(
                "https://52n-directed.obs.eu-de.otc.t-systems.com/data/dmi/forecasts/harmonie_dini_sf/rain-precipitation-rate/forecasts.json"
            );
            const data3: ForecastData = await response3.json();
            setForecastData3(data3);
            setTimestamps3(Object.keys(data3));
            if (data3 && Object.keys(data3).length > 0) {
                const firstTimestamp3 = Object.keys(data3)[0];
                const firstUrl3 = data3[firstTimestamp3 as keyof ForecastData];
                if (firstUrl3) {
                    prepSrvc.setFileUrl3(firstUrl3);
                } else {
                    console.error("No URL found for the first timestamp in forecastData3");
                }
            }
        };
        fetchData();

        const init = async () => {
            const model = await prepSrvc.getMapModel();

            const sealayer = model?.layers.getLayerById(
                "sea_forecast_mean_deviation"
            ) as SimpleLayer;
            const totalPrecipLayer = model?.layers.getLayerById(
                "total_precipitation_forecast"
            ) as SimpleLayer;
            const precipRateLayer = model?.layers.getLayerById(
                "precipitation_rate_forecast"
            ) as SimpleLayer;

            if (sealayer) {
                setSeaLayerVisible(sealayer.olLayer.getVisible());
                sealayer.olLayer.on("change:visible", () =>
                    setSeaLayerVisible(sealayer.olLayer.getVisible())
                );
            }

            if (totalPrecipLayer) {
                setTotalPrecipVisible(totalPrecipLayer.olLayer.getVisible());
                totalPrecipLayer.olLayer.on("change:visible", () =>
                    setTotalPrecipVisible(totalPrecipLayer.olLayer.getVisible())
                );
            }

            if (precipRateLayer) {
                setPrecipRateVisible(precipRateLayer.olLayer.getVisible());
                precipRateLayer.olLayer.on("change:visible", () =>
                    setPrecipRateVisible(precipRateLayer.olLayer.getVisible())
                );
            }
        };
        init();
    }, [prepSrvc]);

    const onChange = (val: number) => {
        setSliderValue(val);
        const selectedTimestamp = timestamps[val];
        //check selectedTimestamp is defined before using it for URL
        if (selectedTimestamp) {
            const selectedUrl = forecastData[selectedTimestamp]; //get associated URL from forecastData
            if (selectedUrl) {
                prepSrvc.setFileUrl(selectedUrl); //pass the URL to the service
            } else {
                console.error("No URL found for the selected timestamp:", selectedTimestamp);
            }
        } else {
            console.error("Selected timestamp is undefined:", selectedTimestamp);
        }
    };

    const onChange2 = (val: number) => {
        setSliderValue2(val);
        const selectedTimestamp2 = timestamps2[val];
        if (selectedTimestamp2) {
            const selectedUrl2 = forecastData2[selectedTimestamp2];
            if (selectedUrl2) {
                prepSrvc.setFileUrl2(selectedUrl2);
            } else {
                console.error("No URL found for the selected timestamp:", selectedTimestamp2);
            }
        } else {
            console.error("Selected timestamp is undefined:", selectedTimestamp2);
        }
    };

    const onChange3 = (val: number) => {
        setSliderValue3(val);
        const selectedTimestamp3 = timestamps3[val];
        if (selectedTimestamp3) {
            const selectedUrl3 = forecastData3[selectedTimestamp3];
            if (selectedUrl3) {
                prepSrvc.setFileUrl3(selectedUrl3);
            } else {
                console.error("No URL found for the selected timestamp:", selectedTimestamp3);
            }
        } else {
            console.error("Selected timestamp is undefined:", selectedTimestamp3);
        }
    };

    //example from json 20250407T180000
    const formatTimestamp = (ts: string) => {
        const year = ts.slice(0, 4);
        const month = ts.slice(4, 6);
        const day = ts.slice(6, 8);
        const hour = ts.slice(9, 11);
        const min = ts.slice(11, 13);
        const sec = ts.slice(13, 15);

        return `${year}-${month}-${day} Time: ${hour}-${min}-${sec}`;
    };

    return (
        <div style={{ padding: "20px" }}>
            {seaLayerVisible && (
                <Box mb={8}>
                    <Text fontWeight="semibold">
                        👆Drag the Slider to Select a Date and Time for Sea Level Mean Deviation
                        Forecast Data
                    </Text>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px"
                        }}
                    >
                        <span>Forecast Start Date: {formatTimestamp(timestamps[0] ?? "")}</span>
                        <span>
                            Forecast End Date:{" "}
                            {formatTimestamp(timestamps[timestamps.length - 1] ?? "")}
                        </span>
                    </div>
                    <Slider
                        aria-label="date-slider"
                        defaultValue={0}
                        min={0}
                        max={timestamps.length - 1}
                        value={sliderValue}
                        onChange={onChange}
                        step={1}
                    >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                    {/* <h3>Selected TimeStamp: {timestamps[sliderValue]}</h3> */}
                    <Text>
                        Selected Date:{" "}
                        <Text as="span" fontWeight="normal" color="black">
                            {formatTimestamp(timestamps[sliderValue] ?? "")}
                        </Text>
                    </Text>
                </Box>
            )}
            {totalPrecipLayerVisible && (
                <Box mb={8}>
                    <Text fontWeight="semibold">
                        👆Drag the Slider to Select a Date and Time for Total Precipitation
                        Forecasts
                    </Text>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px"
                        }}
                    >
                        <span>Forecast Start Date: {formatTimestamp(timestamps2[0] ?? "")}</span>
                        <span>
                            Forecast End Date:{" "}
                            {formatTimestamp(timestamps2[timestamps2.length - 1] ?? "")}
                        </span>
                    </div>
                    <Slider
                        aria-label="date-slider-2"
                        defaultValue={0}
                        min={0}
                        max={timestamps2.length - 1}
                        value={sliderValue2}
                        onChange={onChange2}
                        step={1}
                    >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                    {/* <h3>Selected TimeStamp: {timestamps[sliderValue]}</h3> */}
                    <Text>
                        Selected Date:{" "}
                        <Text as="span" fontWeight="normal" color="black">
                            {formatTimestamp(timestamps2[sliderValue2] ?? "")}
                        </Text>
                    </Text>
                </Box>
            )}
            {precipRateVisible && (
                <Box mb={8}>
                    <Text fontWeight="semibold">
                        👆Drag the Slider to Select a Date and Time for Precipitation Rate Forecasts
                    </Text>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px"
                        }}
                    >
                        <span>Forecast Start Date: {formatTimestamp(timestamps3[0] ?? "")}</span>
                        <span>
                            Forecast End Date:{" "}
                            {formatTimestamp(timestamps3[timestamps3.length - 1] ?? "")}
                        </span>
                    </div>
                    <Slider
                        aria-label="date-slider-3"
                        defaultValue={0}
                        min={0}
                        max={timestamps3.length - 1}
                        value={sliderValue3}
                        onChange={onChange3}
                        step={1}
                    >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                    {/* <h3>Selected TimeStamp: {timestamps[sliderValue]}</h3> */}
                    <Text>
                        Selected Date:{" "}
                        <Text as="span" fontWeight="normal" color="black">
                            {formatTimestamp(timestamps3[sliderValue3] ?? "")}
                        </Text>
                    </Text>
                </Box>
            )}
        </div>
    );
};

export default Forecasts;
