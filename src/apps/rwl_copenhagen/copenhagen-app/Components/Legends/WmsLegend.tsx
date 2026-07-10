// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { Box, Text } from "@chakra-ui/react";
import { SimpleLayer } from "@open-pioneer/map";
import React, { useState, useEffect } from "react";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";

export const WmsLegend: React.FC<LegendItemComponentProps> = ({ layer }) => {
    const [legendUrl, setLegendUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const optlayer = layer as SimpleLayer;
        const olLayer = optlayer?.olLayer;
    
        if (!(olLayer instanceof TileLayer)) {
            setError(layer.title ? `Could not determine legend URL for layer: ${layer.title}` : "Could not determine legend URL.");
            setLegendUrl(null);
            return;
        }
    
        const source = olLayer.getSource();
        if (!(source instanceof TileWMS)) {
            setError("Source is not a TileWMS source.");
            setLegendUrl(null);
            return;
        }
    
        // Get wms params 
        const sourceParams = source.getParams() || {};
    
        // Pass params
        const url = source.getLegendUrl(undefined, {
            ...sourceParams, 
            SERVICE: "WMS",
            VERSION: "1.3.0",
            SLD_VERSION: "1.1.0",
            FORMAT: "image/png",
            STYLE: "default"
        });
    
        if (url) {
            setLegendUrl(url);
            setError(null);
        } else {
            setError("Failed to generate WMS legend URL.");
            setLegendUrl(null);
        }
    }, [layer]);

    return (
        <Box position="relative" bg="white" p={3} mt={1}>
            <Text fontWeight="bold" fontSize={14} mb={1}>
                {layer.title}
            </Text>
            <Text fontWeight="bold" fontSize={14} mb={1}>
                Legend
            </Text>
            {error && <Text color="red.500">{error}</Text>}
            {legendUrl && (
                <Box overflow="auto">
                    <img src={legendUrl} alt={`${layer.title} Legend`} />
                </Box>
            )}
            {!legendUrl && !error && <Text color="gray.500">Loading legend...</Text>}
        </Box>
    );
};