// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { Box, Text } from "@open-pioneer/chakra-integration";
import { SimpleLayer } from "@open-pioneer/map";
import React, { useState, useEffect } from "react";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";


export const WmsLegend: React.FC<LegendItemComponentProps> = ({ layer }) => {
    const [legendUrl, setLegendUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const optlayer = layer as SimpleLayer;
        const olLayer = optlayer.olLayer;

        if (olLayer instanceof TileLayer) {
            const source = olLayer.getSource();
            if (source instanceof TileWMS) {
                const wmsUrls = source.getUrls();
                if (wmsUrls && wmsUrls.length > 0) {
                    const baseUrl = wmsUrls[0];
                    const layerName = source.getParams()?.LAYERS;

                    if (layerName) {
                        const url = `${baseUrl}?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=${layerName}`;
                        setLegendUrl(url);
                        setError(null);
                    } else {
                        setError("Layer name not found in WMS source parameters.");
                        setLegendUrl(null);
                    }
                } else {
                    setError("No WMS URLs found for this layer.");
                    setLegendUrl(null);
                }
            } else {
                setError("Source is not a TileWMS source.");
                setLegendUrl(null);
            }
        } else if (layer.title) {
            setError(`Could not determine legend URL for layer: ${layer.title}`);
            setLegendUrl(null);
        } else {
            setError("Could not determine legend URL for this layer type.");
            setLegendUrl(null);
        }
    }, [layer]);

    return (
        <Box
            position="relative"
            bg="white"
            p={3}
            mt={2}
        >
            <Text fontWeight="bold" fontSize={16} mb={2}>
                {layer.title} Legend
            </Text>
            {error && <Text color="red">{error}</Text>}
            {legendUrl && <img src={legendUrl} alt={`${layer.title} Legend`} />}
            {!legendUrl && !error && <Text>Loading legend...</Text>}
        </Box>
    );
};
