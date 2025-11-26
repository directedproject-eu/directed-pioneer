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
import { useService, useIntl } from "open-pioneer:react-hooks";
import { GeosphereForecastService } from "../services/GeosphereForecastService";

interface ForecastData {
    [key: string]: string; // timestamp key and value of the URL from json
}

interface References {
    mapRegistry: MapRegistry;
}

export const GeosphereForecasts = () => {
    const intl = useIntl();

    const [sliderValue, setSliderValue] = useState(0);
    const [forecastData, setForecastData] = useState<ForecastData>({});
    const [timestamps, setTimestamps] = useState<string[]>([]);
    const [totalPrecipLayerVisible, setTotalPrecipVisible] = useState(false);

    const prepSrvc = useService<GeosphereForecastService>("app.GeosphereForecastService");

    useEffect(() => {
        const fetchData = async () => {
            // AROME Total Rainfall Amount Forecasts
            const response = await fetch(
                "https://52n-directed.obs.eu-de.otc.t-systems.com/data/geosphere/forecasts/nwp-v1-1h-2500m/rain_acc/forecasts.json"
            );
            const data: ForecastData = await response.json();
            setForecastData(data);
            setTimestamps(Object.keys(data));
            if (data && Object.keys(data).length > 0) {
                const firstTimestamp = Object.keys(data)[0];
                const firstUrl = data[firstTimestamp as keyof ForecastData];
                if (firstUrl) {
                    prepSrvc.setFileUrl(firstUrl);
                }
            }
        };
        fetchData();

        const init = async () => {
            const model = await prepSrvc.getMapModel();

            const totalPrecipLayer = model?.layers.getLayerById("rain_acc_forecast") as SimpleLayer;

            setTotalPrecipVisible(totalPrecipLayer.olLayer.getVisible());
            totalPrecipLayer.olLayer.on("change:visible", () =>
                setTotalPrecipVisible(totalPrecipLayer.olLayer.getVisible())
            );
        };
        init();
    }, [prepSrvc]);

    const onChange = (val: number) => {
        setSliderValue(val);
        const selectedTimestamp = timestamps[val];
        // check selectedTimestamp is defined before using it for URL
        if (selectedTimestamp) {
            const selectedUrl = forecastData[selectedTimestamp];
            if (selectedUrl) {
                prepSrvc.setFileUrl(selectedUrl);
            } else {
                console.error("No URL found for the selected timestamp:", selectedTimestamp);
            }
        } else {
            console.error("Selected timestamp is undefined:", selectedTimestamp);
        }
    };

    // example from json 20250407T180000
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
        <div>
            {totalPrecipLayerVisible && (
                <div
                    style={{
                        width: window.innerWidth * 0.4,
                        marginLeft: window.innerWidth * 0.3,
                        marginRight: window.innerWidth * 0.3,
                        borderRadius: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                        marginTop: "5px"
                    }}
                >
                    <Box padding={4} mb={8}>
                        <Text fontWeight="semibold">
                            {intl.formatMessage({
                                id: "map.slider.geosphere_forecast.precipitation"
                            })}
                        </Text>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "4px"
                            }}
                        >
                            <span>
                                {intl.formatMessage({
                                    id: "map.slider.geosphere_forecast.start_date"
                                })}{" "}
                                {formatTimestamp(timestamps[0] ?? "")}
                            </span>
                            <span>
                                {intl.formatMessage({
                                    id: "map.slider.geosphere_forecast.end_date"
                                })}{" "}
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
                            {intl.formatMessage({
                                id: "map.slider.geosphere_forecast.selected_date"
                            })}{" "}
                            <Text as="span" fontWeight="normal" color="black">
                                {formatTimestamp(timestamps[sliderValue] ?? "")}
                            </Text>
                        </Text>
                    </Box>
                </div>
            )}
        </div>
    );
};

export default GeosphereForecasts;
