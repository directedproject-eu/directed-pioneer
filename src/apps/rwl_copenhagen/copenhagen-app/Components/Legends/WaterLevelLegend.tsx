// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@open-pioneer/chakra-integration";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";

//water level colors
const l_01 = "#ffffff";
const l_02 = "#1a68ae";
const l_03 = "#08306b";
const l_04 = "#301934";

const colorMapping = [
    { value: 0, color: l_01, label: "0" },
    { value: 0.5, color: l_02, label: "0.5" },
    { value: 1.0, color: l_03, label: "1.0" },
    { value: 11.0, color: l_04, label: "11.0" }
];

export function WaterLevelLegend(props: LegendItemComponentProps) {
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
