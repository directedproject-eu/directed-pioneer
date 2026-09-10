// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@chakra-ui/react";
import { LegendItemComponentProps } from "@open-pioneer/legend";

export function CertaintyLegend(props: LegendItemComponentProps) {
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
                {props.layer.title}
            </Text>
            <Box display="flex" alignItems="center" mb={1}>
                <Box
                    width="16px"
                    height="16px"
                    mr={2}
                    border="1px solid black"
                    // -45deg creates diagonal lines 
                    background="repeating-linear-gradient(-45deg, #000 0px, #000 1.5px, transparent 1.5px, transparent 5px)"
                />
                <Text fontSize="14px">High Damage Certainty</Text>
            </Box>
        </Box>
    );
}