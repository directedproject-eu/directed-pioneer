// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@chakra-ui/react";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";

//water level colors
// const l_01 = "#ffffff";
// const l_02 = "#1a68ae";
// const l_03 = "#08306b";
// const l_04 = "#301934";

const colorMapping = [
    { value: 0.0,  color: "#f7fbff", label: "0" },
    { value: 0.1,  color: "#c6dbef", label: "0.01 – 0.1 m" },
    { value: 0.25, color: "#6baed6", label: "0.10 – 0.25 m" },
    { value: 0.5,  color: "#2171b5", label: "0.25 – 0.50 m" },
    { value: 1.0,  color: "#08306b", label: "0.50 – 1.00 m" },
    { value: 2.0,  color: "#4a148c", label: "1.00 – 2.00 m" },
    { value: 11.0, color: "#1a0033", label: "> 2.00 m" }
];

export function WaterLevelLegend(props: LegendItemComponentProps) {
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
                {intl.formatMessage({ id: "legend.title" })}{" "}
            </Text> */}
            <Text fontWeight="bold" mb={2}>
                {" "}
                {props.layer.title}{" "}
            </Text>
            <Text fontWeight="bold" fontSize={15} mb={2}>
                {intl.formatMessage({ id: "legend.units" })} m
            </Text>
            {colorMapping.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Box
                        width="12px"
                        height="12px"
                        bg={item.color}
                        mr={2}
                        border="1px solid black"
                    />
                    <Box>{item.label}</Box>
                </Box>
            ))}
        </Box>
    );
}
