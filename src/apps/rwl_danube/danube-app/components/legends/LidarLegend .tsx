// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@open-pioneer/chakra-integration";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";

// water level colors
const l_01 = "#440154";
const l_02 = "#482878";
const l_03 = "#3e4989";
const l_04 = "#31688e";
const l_05 = "#26828e";
const l_06 = "#1f9e89";
const l_07 = "#35b779";
const l_08 = "#6ece58";
const l_09 = "#b5de2b";
const l_10 = "#fde725";

const colorMapping = [
    { color: l_01, label: "-10 m" },
    { color: l_02, label: "30 m" },
    { color: l_03, label: "60 m" },
    { color: l_04, label: "90 m" },
    { color: l_05, label: "120 m" },
    { color: l_06, label: "150 m" },
    { color: l_07, label: "180 m" },
    { color: l_08, label: "210 m" },
    { color: l_09, label: "240 m" },
    { color: l_10, label: "270 m" }
];

export function LidarLegend(props: LegendItemComponentProps) {
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
