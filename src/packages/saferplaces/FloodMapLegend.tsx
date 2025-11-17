// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@open-pioneer/chakra-integration";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";

//water level colors
const l_01 = "#ffffff";
const l_02 = "#87CEFA";
const l_03 = "#00BFFF";
const l_04 = "#3282F6";
const l_05 = "#005BA1";
const l_06 = "#001E64";
const l_07 = "#4B0082";
const l_08 = "#800080";
const l_09 = "#FF0000";


const colorMapping = [
    { value: 0.00, color: l_01, label: "0" },
    { value: 0.05, color: l_02, label: "0.05" },
    { value: 0.50, color: l_03, label: "0.5" },
    { value: 1.00, color: l_04, label: "1.00" },
    { value: 3.00, color: l_05, label: "3.00" },
    { value: 6.00, color: l_06, label: "6.00" },
    { value: 10.00, color: l_07, label: "10.00" },
    { value: 15.00, color: l_08, label: "15.00" },
    { value: 15.01, color: l_09, label: "> 15.00" }
];

export function FloodMapLegend(props: LegendItemComponentProps) {
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
                {/* {intl.formatMessage({ id: "legend.units" })} m */}
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
