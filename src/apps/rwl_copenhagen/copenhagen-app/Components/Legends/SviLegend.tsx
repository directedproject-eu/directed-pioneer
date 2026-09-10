// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@chakra-ui/react";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";

// z-index colors
const l_01 = "#8655ef";
const l_02 = "#9f7ded";
const l_03 = "#c1ade3";
const l_04 = "#ffffff";
const l_05 = "#97f7c5";
const l_06 = "#56ec9c";
const l_07 = "#33a02c";

export function SviLegend(props: LegendItemComponentProps) {
    const intl = useIntl();

    const colorMapping = [
        { value: 2.5-100, color: l_01, label: intl.formatMessage({ id: "sviLegend.extremeHigh"})},
        { value: 1.5-2.5, color: l_02, label: intl.formatMessage({ id: "sviLegend.veryHigh"})},
        { value: 0.25-1.5, color: l_03, label: intl.formatMessage({ id: "sviLegend.relativelyHigh"})},
        { value: 0.25-(-0.25), color: l_04, label: intl.formatMessage({ id: "sviLegend.average"})},
        { value: -0.25-(-1.5), color: l_05, label: intl.formatMessage({ id: "sviLegend.relativelyLow"})},
        { value: -1.5-(-2.5), color: l_06, label: intl.formatMessage({ id: "sviLegend.veryLow"})},
        { value: -2.5-(-100), color: l_07, label: intl.formatMessage({ id: "sviLegend.extremelyLow"})},
    ];

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
            <Text fontWeight="bold" fontSize={15} mb={2}>
                {intl.formatMessage({ id: "legend.units" })} Z-Index
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
