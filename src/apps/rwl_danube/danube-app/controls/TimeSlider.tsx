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
import { SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";
import { GeosphereService } from "../services/GeosphereService";

export const TimeSlider = () => {
    const [sliderValue, setSliderValue] = useState(0);
    const [totalPrecipLayerVisible, setTotalPrecipVisible] = useState(false);

    const prepSrvc = useService<GeosphereService>("app.GeosphereService");

    useEffect(() => {
        const init = async () => {
            const model = await prepSrvc.getMapModel();

            const totalPrecipLayer = model?.layers.getLayerById(
                "daily_precipitation_sum"
            ) as SimpleLayer;

            if (totalPrecipLayer) {
                setTotalPrecipVisible(totalPrecipLayer.olLayer.getVisible());
                totalPrecipLayer.olLayer.on("change:visible", () =>
                    setTotalPrecipVisible(totalPrecipLayer.olLayer.getVisible())
                );
            }
        };
        init();
    }, [prepSrvc]);

    const pad = (n: number): string => n.toString().padStart(2, "0");

    const valueToTimestamp = (val: number) => {
        if (val < 0 || val > 365) {
            throw new Error("Input should be between 0 and 365.");
        }
        const date = new Date("2024-01-01 00:00:00");
        date.setDate(date.getDate() + val);
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        return `${year}-${month}-${day}`;
    };

    const valueToUrl = (val: number) => {
        if (val < 0 || val > 365) {
            throw new Error("Input should be between 0 and 365.");
        }
        const date = new Date("2024-01-01 00:00:00");
        date.setDate(date.getDate() + val);
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        return `https://52n-directed.obs.eu-de.otc.t-systems.com/data/geosphere/historical/daily_precipitation_sum/${year}${month}${day}T${hours}${minutes}${seconds}.tif`;
    };

    const onChange = (val: number) => {
        setSliderValue(val);
        const selectedUrl = valueToUrl(val);
        prepSrvc.setFileUrl(selectedUrl);
    };

    return (
        <div style={{ padding: "20px" }}>
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
                            👆Drag the Slider to Select a Date for Daily Precipitation Sums
                        </Text>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "4px"
                            }}
                        >
                            <span>Start Date: 2024-01-01</span>
                            <span>End Date: 2024-12-31</span>
                        </div>
                        <Slider
                            aria-label="date-slider"
                            defaultValue={0}
                            min={0}
                            max={365}
                            value={sliderValue}
                            onChange={onChange}
                            step={1}
                        >
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                        <Text>
                            Selected Date:{" "}
                            <Text as="span" fontWeight="normal" color="black">
                                {valueToTimestamp(sliderValue)}
                            </Text>
                        </Text>
                    </Box>
                </div>
            )}
        </div>
    );
};

export default TimeSlider;
