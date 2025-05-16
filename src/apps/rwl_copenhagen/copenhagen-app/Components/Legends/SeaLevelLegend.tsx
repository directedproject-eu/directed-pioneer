// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@open-pioneer/chakra-integration";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";

//sea level colors
const transparentWhite = "rgba(255, 255, 255, 0)";
const l_01 = "#ff958c"; //rgb (255,149,140)
const l_02 = "#ee85b5"; //rgb (238,133,181)
const l_03 = "#ca61c3"; //rgb (202,97,195)
const l_04 = "#883677"; //rgb (136,54,119)
const l_05 = "#441151"; //rgb (68,17,81)

const colorMapping = [
    { value: 0, color: transparentWhite, label: "0" },
    { value: 0.05, color: l_01, label: "0.05" },
    { value: 0.3, color: l_02, label: "0.30" },
    { value: 0.55, color: l_03, label: "0.55" },
    { value: 0.7, color: l_04, label: "0.70" },
    { value: 0.95, color: l_05, label: "0.95" }
];

export function SeaLevelLegend(props: LegendItemComponentProps) {
    const intl = useIntl();

    return (
        <Box
            position="relative"
            top="10px"
            right="10px"
            bg="white"
            p={4}
            borderRadius="md"
            borderWidth={1}
        >
            <Text fontWeight="bold" fontSize={20}>
                {" "}
                Legend{" "}
            </Text>
            <Text fontWeight="bold" mb={2}>
                {" "}
                {props.layer.title}{" "}
            </Text>
            <Text fontWeight="bold" fontSize={15} mb={2}>
                Units m
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
