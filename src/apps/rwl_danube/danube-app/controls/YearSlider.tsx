// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    VStack
} from "@open-pioneer/chakra-integration";
import { useState } from "react";
import { LayerHandler } from "../services/LayerHandler";
import { useService } from "open-pioneer:react-hooks";

export function YearSlider() {
    const prepSrvc = useService<LayerHandler>("app.LayerHandler");

    const [sliderValue, setSliderValue] = useState(0);
    const [displayDate, setDisplayDate] = useState(1991);

    function onChange(val: number): void {
        setSliderValue(val);
        setDisplayDate(val + 1991);
        prepSrvc.setYear(val + 1991);
    }

    return (
        <VStack width={"40%"}>
            <span style={{ width: "80%" }}>
                <Slider
                    aria-label="slider-ex-1"
                    value={sliderValue}
                    onChange={(val) => onChange(val)}
                    min={0}
                    max={109}
                    focusThumbOnChange={false}
                >
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                </Slider>
            </span>
            <span> {displayDate} </span>
        </VStack>
    );
}
