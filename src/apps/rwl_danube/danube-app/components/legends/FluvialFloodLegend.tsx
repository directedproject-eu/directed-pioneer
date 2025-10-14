// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@open-pioneer/chakra-integration";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";

// water level colors
const l_01 = "#F7E225";
const l_02 = "#FEB92C";
const l_03 = "#F89440";
const l_04 = "#E97357";
const l_05 = "#D6556C";
const l_06 = "#BE3884";
const l_07 = "#A11B9A";
const l_08 = "#7D03A8";
const l_09 = "#5601A4";
const l_10 = "#2B0593";

const colorMapping = [
    { color: l_01, label: "0 - 1 m" },
    { color: l_02, label: "1 - 2 m" },
    { color: l_03, label: "2 - 3 m" },
    { color: l_04, label: "3 - 4 m" },
    { color: l_05, label: "4 - 5 m" },
    { color: l_06, label: "5 - 6 m" },
    { color: l_07, label: "6 - 7 m" },
    { color: l_08, label: "7 - 8 m" },
    { color: l_09, label: "8 - 9 m" },
    { color: l_10, label: "> 9 m" }
];

export function FluvialFloodLegend(props: LegendItemComponentProps) {
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
            {/* <Text fontWeight="bold" fontSize={20}>
                {" "}
                Legend{" "}
            </Text> */}
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
