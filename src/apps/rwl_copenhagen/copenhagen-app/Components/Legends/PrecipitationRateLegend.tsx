// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@open-pioneer/chakra-integration";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";

//precipitation level colors
const transparentWhite = "rgba(255, 255, 255, 0)";
const l_01 = "#af7ab3"; //rgb (175,122,179)
const l_02 = "#95649a"; //rgb (149,100,154)
const l_03 = "#885889"; //rgb (136,88,137)
const l_04 = "#674571"; //rgb (103,69,113)
const l_05 = "#503752"; //rgb (80,55,82)

const colorMapping = [
    { value: 0, color: transparentWhite, label: "0" },
    { value: 0.015, color: l_01, label: "0.015" },
    { value: 0.03, color: l_02, label: "0.030" },
    { value: 0.045, color: l_03, label: "0.045" },
    { value: 0.06, color: l_04, label: "0.06" },
    { value: 0.075, color: l_05, label: "0.075" }
];

export function PrecipitationRateLegend(props: LegendItemComponentProps) {
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
                Units mm/s
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
