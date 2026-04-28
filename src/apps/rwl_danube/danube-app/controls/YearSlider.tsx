// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Slider,
    VStack
} from "@chakra-ui/react";
import { useState } from "react";
import { IsimipHandler } from "../services/IsimipHandler";
import { useService } from "open-pioneer:react-hooks";

export function YearSlider() {
    const prepSrvc = useService<IsimipHandler>("app.IsimipHandler");

    const [sliderValue, setSliderValue] = useState(0);
    const [displayDate, setDisplayDate] = useState(1991);

    function onChange(details: { value: number[] }): void {
        const val = details.value[0];
        if (val === undefined) return;
        setSliderValue(val);
        setDisplayDate(val + 1991);
        prepSrvc.setYear(val + 1991);
    }

    return (
        <VStack width={"50%"}>
            <span style={{ width: "80%" }}>
                <Slider.Root
                    aria-label={["slider-ex-1"]}
                    value={[sliderValue]}
                    onValueChange={(val) => onChange(val)}
                    min={0}
                    max={109}
                >
                    <Slider.Control>
                        <Slider.Track>
                            <Slider.Range />
                        </Slider.Track>
                        <Slider.Thumb index={0} />
                    </Slider.Control>
                </Slider.Root>
            </span>
            <span> {displayDate} </span>
        </VStack>
    );
}
