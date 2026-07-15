// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@chakra-ui/react";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";
import { waterDepthColorMap } from "../../config/floodDepth";

/**
 * Statische Legende für den Wassertiefe-GeoTIFF-Layer.
 * Liest die Farbstufen aus der geteilten Config (`waterDepthColorMap`), damit
 * Legende und Layer-Farbskala nicht auseinanderdriften.
 */
export function WaterDepthLegend(props: LegendItemComponentProps) {
    const intl = useIntl();

    return (
        <Box
            position="relative"
            top="10px"
            bg="white"
            p={4}
            borderRadius="5px"
            borderWidth={1}
            width="300px"
        >
            <Text fontWeight="bold" mb={2}>
                {props.layer.title}
            </Text>
            <Text fontWeight="bold" fontSize={15} mb={2}>
                {intl.formatMessage({ id: "legends.water_depth.unit" })}
            </Text>
            {waterDepthColorMap.map((item, index) => (
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
