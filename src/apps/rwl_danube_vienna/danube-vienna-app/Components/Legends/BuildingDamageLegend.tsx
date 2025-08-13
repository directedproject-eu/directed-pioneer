// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@open-pioneer/chakra-integration";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";

const l_01 = "#44ce1b";
const l_02 = "#bbdb44";
const l_03 = "#f7e379";
const l_04 = "#f2a134";
const l_05 = "#e51f1f";

const colorMapping = [
    { color: l_01, label: "0 - 10,000 Euro" },
    { color: l_02, label: "10,000 - 100,000 Euro" },
    { color: l_03, label: "100,000 - 500,000 Euro" },
    { color: l_04, label: "500,000 - 1,000,000 Euro" },
    { color: l_05, label: "> 1,000,000 Euro" }
];

export function BuildingDamageLegend(props: LegendItemComponentProps) {
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
