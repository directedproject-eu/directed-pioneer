// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@chakra-ui/react";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";

//water level colors
const l_01 = "#B2241E";
const l_02 = "#DE2D26";
const l_03 = "#E55751";
const l_04 = "#EB817D";
const l_05 = "#F2ABA8";
const l_06 = "#F8D5D4";
const l_07 = "#FAFAFA";

const colorMapping = [
    { value: 200, color: l_01, label: ">200M" },
    { value: 20-200, color: l_02, label: "20M-200M" },
    { value: 10-20, color: l_03, label: "10M-20M" },
    { value: 1-10, color: l_04, label: "1M-10M" },
    { value: 500-1, color: l_05, label: "500k-1M" },
    { value: 100-500, color: l_06, label: "100k-500k" },
    { value: 100, color: l_07, label: "<100k" }
];

export function DamageLegend(props: LegendItemComponentProps) {
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
                {intl.formatMessage({ id: "legend.units" })} DKK
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
