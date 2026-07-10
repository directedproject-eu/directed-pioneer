// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Slider,
    VStack
} from "@chakra-ui/react";
import { useState } from "react";
import { IsimipHandler } from "../services/IsimipHandler";
import { useService } from "open-pioneer:react-hooks";
import { useIntl } from "open-pioneer:react-hooks";

export function MonthSlider() {
    const intl = useIntl();
    const prepSrvc = useService<IsimipHandler>("app.IsimipHandler");

    const [sliderValue, setSliderValue] = useState(0);
    const [displayDate, setDisplayDate] = useState(intl.formatMessage({ id: "global.months.jan" }));

    const months = [
        intl.formatMessage({ id: "global.months.jan" }),
        intl.formatMessage({ id: "global.months.feb" }),
        intl.formatMessage({ id: "global.months.mar" }),
        intl.formatMessage({ id: "global.months.apr" }),
        intl.formatMessage({ id: "global.months.may" }),
        intl.formatMessage({ id: "global.months.jun" }),
        intl.formatMessage({ id: "global.months.jul" }),
        intl.formatMessage({ id: "global.months.aug" }),
        intl.formatMessage({ id: "global.months.sep" }),
        intl.formatMessage({ id: "global.months.oct" }),
        intl.formatMessage({ id: "global.months.nov" }),
        intl.formatMessage({ id: "global.months.dec" })
    ];

    function onChange(details: { value: number[] }): void {
        const val = details.value[0];
        if (val === undefined || months[val] === undefined) return;
        setSliderValue(val);
        if (months[val] === undefined) return;
        prepSrvc.setMonth(val + 1);
    }

    return (
        <VStack width={"50%"}>
            <span style={{ width: "80%" }}>
                <Slider.Root
                    aria-label={["slider-ex-1"]}
                    value={[sliderValue]}
                    onValueChange={(val) => onChange(val)}
                    min={0}
                    max={11}
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
