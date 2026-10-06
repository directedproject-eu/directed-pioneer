// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { Box, Text } from "@chakra-ui/react";
import { AnyLayer } from "@open-pioneer/map";
import { HttpService } from "@open-pioneer/http";
import { useService } from "open-pioneer:react-hooks";
import React, { useState, useEffect } from "react";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";

interface LegendSource {
    baseUrl: string;
    layerName: string;
    /**
     * True for a `WMSLayer`: it loads its images through the http service (so the
     * TokenInterceptor can authenticate them), and the legend has to do the same.
     */
    viaHttpService: boolean;
}

/**
 * Finds url and layer name of the WMS behind the layer: a `SimpleLayer` wrapping a
 * `TileWMS` source, or a `WMSLayer` (an `ImageWMS` source, e.g. the HRB Eicherscheid layers).
 */
function getLegendSource(layer: AnyLayer): LegendSource | string {
    if (layer.type === "wms") {
        // olSource, not olLayer.getSource(): the flow velocity layer detaches its source at t = 0.
        const source = layer.olSource;
        const baseUrl = source?.getUrl();
        const layerName = source?.getParams()?.LAYERS;
        if (!baseUrl) return "No WMS URL found for this layer.";
        if (!layerName) return "Layer name not found in WMS source parameters.";
        return { baseUrl, layerName, viaHttpService: true };
    }

    const olLayer = "olLayer" in layer ? layer.olLayer : undefined;
    if (olLayer instanceof TileLayer) {
        const source = olLayer.getSource();
        if (!(source instanceof TileWMS)) return "Source is not a WMS source.";
        const baseUrl = source.getUrls()?.[0];
        const layerName = source.getParams()?.LAYERS;
        if (!baseUrl) return "No WMS URLs found for this layer.";
        if (!layerName) return "Layer name not found in WMS source parameters.";
        return { baseUrl, layerName, viaHttpService: false };
    }

    return layer.title
        ? `Could not determine legend URL for layer: ${layer.title}`
        : "Could not determine legend URL for this layer type.";
}

export const WmsLegend: React.FC<LegendItemComponentProps> = ({ layer }) => {
    const httpService = useService<HttpService>("http.HttpService");
    const [legendUrl, setLegendUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const legendSource = getLegendSource(layer as AnyLayer);
        if (typeof legendSource === "string") {
            setError(legendSource);
            setLegendUrl(null);
            return;
        }

        const { baseUrl, layerName, viaHttpService } = legendSource;
        const url = `${baseUrl}?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=${layerName}`;
        if (!viaHttpService) {
            setLegendUrl(url);
            setError(null);
            return;
        }

        // An <img src> request carries no Authorization header, so fetch the image and show
        // it from a blob url.
        let objectUrl: string | undefined;
        const abortController = new AbortController();
        setLegendUrl(null);
        setError(null);
        httpService
            .fetch(url, { signal: abortController.signal })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Legend request failed with status ${response.status}`);
                }
                return response.blob();
            })
            .then((blob) => {
                objectUrl = URL.createObjectURL(blob);
                setLegendUrl(objectUrl);
            })
            .catch((e: unknown) => {
                if (abortController.signal.aborted) return;
                console.error("Failed to load legend", e);
                setError(`Could not load legend for layer: ${layer.title}`);
            });

        return () => {
            abortController.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [layer, httpService]);

    return (
        <Box position="relative" bg="white" p={3} mt={2}>
            <Text fontWeight="bold" fontSize={16} mb={2}>
                {layer.title} Legend
            </Text>
            {error && <Text color="red">{error}</Text>}
            {legendUrl && <img src={legendUrl} alt={`${layer.title} Legend`} />}
            {!legendUrl && !error && <Text>Loading legend...</Text>}
        </Box>
    );
};
