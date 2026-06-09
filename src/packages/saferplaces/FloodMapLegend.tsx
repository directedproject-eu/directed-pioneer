// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@chakra-ui/react";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";

const l_01 = "#ffffff";
const l_02 = "#440154";
const l_03 = "#482878";
const l_04 = "#31688e";
const l_05 = "#26828e";
const l_05_half = "#1f9e89"; 
const l_06 = "#35b779";
const l_07 = "#6ece58";
const l_08 = "#fde725";
const l_09 = "#FF0000";
const l_null =  "rgba(0, 0, 0, 0)"; // Fully transparent 


const colorMapping = [
    { value: null,  color: l_null,   label: "No Data" },
    { value: 0.0,  color: l_01,      label: "0" },
    { value: 0.02, color: l_02,      label: "0.02" },
    { value: 0.05, color: l_03,      label: "0.05" },
    { value: 0.10, color: l_04,      label: "0.10" },
    { value: 0.20, color: l_05,      label: "0.20" },
    { value: 0.35, color: l_05_half, label: "0.35" },
    { value: 0.50, color: l_06,      label: "0.50" },
    { value: 0.75, color: l_07,      label: "0.75" }, 
    { value: 1.00, color: l_08,      label: "1.00" },
    { value: 1.01, color: l_09,      label: "> 1.00" }
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
