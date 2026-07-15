// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@chakra-ui/react";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl } from "open-pioneer:react-hooks";
import { flowVelocityColorMap } from "../../config/flowVelocity";

/**
 * Statische Legende für den Fließgeschwindigkeit-GeoTIFF-Layer.
 * Liest die Farbstufen aus der geteilten Config (`flowVelocityColorMap`), damit
 * Legende und Layer-Farbskala nicht auseinanderdriften.
 */
export function FlowVelocityLegend(props: LegendItemComponentProps) {
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
                {intl.formatMessage({ id: "legends.flow_velocity.unit" })}
            </Text>
            {flowVelocityColorMap.map((item, index) => (
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
