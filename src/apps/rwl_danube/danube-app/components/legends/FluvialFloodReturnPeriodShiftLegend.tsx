// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@open-pioneer/chakra-integration";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";

// year level colors
const l_01 = "#81e7ff";
const l_02 = "#71bae4";
const l_03 = "#6291c9";
const l_04 = "#546dab";
const l_05 = "#4c4a85";
const l_06 = "#502f59";
const l_07 = "#632a3e";
const l_08 = "#863c39";
const l_09 = "#a95a40";
const l_10 = "#c77c4b";
const l_11 = "#e3a358";
const l_12 = "#ffcf67";

const colorMapping = [
    { color: l_01, label: "0 - 10 y" },
    { color: l_02, label: "10 - 20 y" },
    { color: l_03, label: "20 - 30 y" },
    { color: l_04, label: "30 - 40 y" },
    { color: l_05, label: "40 - 50 y" },
    { color: l_06, label: "50 - 75 y" },
    { color: l_07, label: "75 - 100 y" },
    { color: l_08, label: "100 - 125 y" },
    { color: l_09, label: "125 - 150 y" },
    { color: l_10, label: "150 - 250 y" },
    { color: l_11, label: "250 - 500 y" },
    { color: l_12, label: "> 500 y" }
];

export function FluvialFloodReturnPeriodShiftLegend(props: LegendItemComponentProps) {
    const intl = useIntl();

    return (
        <Box
            position="relative"
            top="10px"
            right="0px"
            bg="white"
            p={4}
            borderRadius="5px"
            borderWidth={1}
            width="300px"
        >
            <Text fontWeight="bold" mb={2}>
                {" "}
                {props.layer.title}{" "}
            </Text>
            {colorMapping.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Box
                        width="12px"
                        height="12px"
                        bg={item.color}
                        mr={2}
                        border="2px"
                        borderColor="black"
                    />
                    <Box>{item.label}</Box>
                </Box>
            ))}
        </Box>
    );
}
