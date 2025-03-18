// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { HStack, VStack } from "@open-pioneer/chakra-integration";
import { YearSlider } from "./YearSlider";
import { MonthSlider } from "./MonthSlider";
import { ScenarioSelector } from "./ScenarioSelector";

export function LayerSelector() {
    return (
        <span style={{ marginTop: "0.5em" }}>
            <HStack>
                <YearSlider></YearSlider>
                <MonthSlider></MonthSlider>
            </HStack>
        </span>
    );
}
