// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { useMapModel } from "@open-pioneer/map";
import { Box, Button, VStack, Text, Select } from "@open-pioneer/chakra-integration";
import ExpandableBox from "./ExpandableBox";
import Layer from "ol/layer/Layer";
import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import { SimpleLayer } from "@open-pioneer/map";
import { useIntl } from "open-pioneer:react-hooks";
import { GeoTIFF } from "ol/source";
import { Vector as VectorSource } from "ol/source.js";
import { TileWMS } from "ol/source.js";
import { set } from "ol/transform";


type DownloadLayerProps = {
    mapID: string;
};

type LayerEntry = {
    id: string;
    title: string;
    olLayer: Layer;
};

const DownloadLayer = ({ mapID }: DownloadLayerProps) => {
    const intl = useIntl();
    const mapModel = useMapModel(mapID);
    const [visibleLayers, setVisibleLayers] = useState<LayerEntry[]>([]);
    const [selectedLayer, setSelectedLayer] = useState<LayerEntry | null>(null);

    useEffect(() => {
        if (!mapModel?.map) return;

        const allLayers = mapModel.map.layers.getRecursiveLayers() as SimpleLayer[];

        const updateVisibleLayers = () => {
            const vis = allLayers
                .filter((layer) => layer.olLayer?.getVisible?.() === true)
                .map((layer) => ({
                    id: layer.id,
                    title: layer.title ?? layer.id ?? "Unnamed Layer",
                    olLayer: layer.olLayer,
                    properties: layer.olLayer?.getProperties()
                }));
            setVisibleLayers(vis);
            console.log("Visible layers updated:", vis);
        };

        updateVisibleLayers();

        const eventKeys: EventsKey[] = allLayers
            .map((layer) => {
                const olLayer = layer.olLayer;
                if (!olLayer || typeof olLayer.on !== "function") return null;
                return olLayer.on("change:visible", updateVisibleLayers);
            })
            .filter((k): k is EventsKey => !!k);

        return () => {
            eventKeys.forEach(unByKey);
        };
    }, [mapModel]);

    const handleDownload = (layer: LayerEntry) => {
        const properties = layer.olLayer?.getProperties();
        console.log("Layer properties:", properties);

        if (properties?.["type"] === "GeoTIFF") {
            const source = layer.olLayer?.getSource() as GeoTIFF;
            console.log("Layer source:", source);
            if (source && source["key_"]) {
                const donwloadUrl = source["key_"];
                console.log("Downloading GeoTIFF from URL:", donwloadUrl);
                window.open(source["key_"], "_blank");
            }
        }
        else if (properties?.["type"] === "GeoJSON") {
            const source = layer.olLayer?.getSource() as VectorSource;
            if (source && source["url_"]) {
                const downloadUrl = source["url_"];
                console.log("Downloading GeoJSON from URL:", downloadUrl);
                const response = fetch(downloadUrl);
                response.then((res) => res.blob().then((blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${layer.id || "data"}.geojson`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }));
            }
        }
        else if (properties?.["type"] === "OSM") {
            alert("Direct download of OSM layers is not supported. Please visit https://www.openstreetmap.org to download data.");        
        }
        else if (properties?.["type"] === "WMS") {
            alert("Direct download of WMS layers is not supported yet. Please contact the data provider for access.");
        }

    };

    return (
        <ExpandableBox title={intl.formatMessage({ id: "map.download.heading" })}>
            {visibleLayers.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                    {intl.formatMessage({ id: "map.download.no_layers" })}
                </Text>
            ) : (
                <VStack align="stretch" spacing={2} mt={2}>
                    <Select
                        placeholder="Select a layer to download"
                        value={selectedLayer?.id || ""}
                        onChange={(e) => {
                            const layer = visibleLayers.find((l) => l.id === e.target.value) || null;
                            setSelectedLayer(layer);
                        }}
                    >
                        {visibleLayers.map((layer) =>
                            layer.olLayer?.getProperties()?.type !== "OSM" && (
                                <option key={layer.id} value={layer.id}>
                                    {layer.title || layer.id}
                                </option>
                            )
                        )}
                    </Select>

                    <Button
                        colorScheme="blue"
                        isDisabled={!selectedLayer || selectedLayer.olLayer?.getProperties()?.["type"] === "OSM"}
                        onClick={() => selectedLayer && handleDownload(selectedLayer)}
                    >
                        {intl.formatMessage({ id: "map.download.button", defaultMessage: "Download Layer" })}
                    </Button>
                </VStack>
            )}
        </ExpandableBox>
    );
};

export default DownloadLayer;
