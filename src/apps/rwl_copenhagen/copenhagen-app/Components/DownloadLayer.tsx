// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { useMapModel } from "@open-pioneer/map";
import { Button, VStack, Text, Select, Spinner } from "@open-pioneer/chakra-integration";
import ExpandableBox from "./ExpandableBox";
import Layer from "ol/layer/Layer";
import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import { SimpleLayer } from "@open-pioneer/map";
import { useIntl } from "open-pioneer:react-hooks";
import { GeoTIFF } from "ol/source";
import { Vector as VectorSource } from "ol/source.js";
import { Group } from "ol/layer";
import { URLSearchParams } from "url";

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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!mapModel?.map) return;

        const allLayers = mapModel.map.layers.getRecursiveLayers() as SimpleLayer[];

        const updateVisibleLayers = () => {
            const vis = allLayers
                .filter(
                    (layer) =>
                        layer.olLayer?.getVisible?.() === true &&
                        !(layer.olLayer instanceof Group)
                )
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

    async function getLayerInfo(id: string) {
        const url =
            "https://directed.dev.52north.org/geoserver/wms?service=WMS&version=1.3.0&request=GetCapabilities";
        const response = await fetch(url);
        const xmlText = await response.text();
        console.log(xmlText);

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        const layers = Array.from(xmlDoc.getElementsByTagName("Layer"));

        const targetLayer = layers.find((layer) => {
            const nameNode = layer.getElementsByTagName("Name")[0];
            return nameNode && nameNode.textContent === id;
        });

        if (!targetLayer) {
            console.warn("Layer nicht gefunden:", id);
            return;
        }

        const keywordNodes = targetLayer.getElementsByTagName("Keyword");
        const keywords = Array.from(keywordNodes).map((node) => node.textContent?.trim() || "");

        // console.log("Keywords:", keywords);

        if (keywords.includes("features")) {
            return "features";
        } else if (keywords.includes("WCS")) {
            return "WCS";
        } else {
            return null;
        }
    }

    const handleDownload = async (layer: LayerEntry) => {
        setLoading(true);
        try {
            const properties = layer.olLayer?.getProperties();
            console.log("Downloading layer:", layer.id, "with properties:", properties, "and type :", properties?.["type"]);

            if (properties?.["type"] === "GeoTIFF") {
                const source = layer.olLayer?.getSource() as GeoTIFF;
                console.log("GeoTIFF source:", source);
                if (source && source["key_"]) {
                    window.open(source["key_"], "_blank");
                }
            } else if (properties?.["type"] === "GeoJSON") {
                const source = layer.olLayer?.getSource() as VectorSource;
                if (source && source["url_"]) {
                    const response = await fetch(source["url_"]);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${layer.id || "data"}.geojson`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }
            } else if (properties?.["type"] === "OSM") {
                alert(
                    "Direct download of OSM layers is not supported. Please visit https://www.openstreetmap.org to download data."
                );
            } else if (properties?.["type"] === "WMS") {
                const layerIdFromParams = "directed:" + properties.source?.params_?.LAYERS;
                const id = layerIdFromParams;
                const type = await getLayerInfo(id);

                if (type === "features") {
                    const baseUrl = "https://directed.dev.52north.org/geoserver/wfs";
                    const params = new URLSearchParams({
                        service: "WFS",
                        version: "2.0.0",
                        request: "GetFeature",
                        typeNames: id,
                        outputFormat: "shape-zip"
                    });
                    const url = `${baseUrl}?${params.toString()}`;
                    const response = await fetch(url);
                    if (!response.ok) throw new Error("WFS request failed");
                    const blob = await response.blob();
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `${properties.id}.zip`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } else if (type === "WCS") {
                    const mapExtent = mapModel?.map?.initialExtent;
                    const resolution = mapModel?.map?.resolution;
                    
                    if (!mapExtent || !resolution) {
                        throw new Error("Map extent or resolution not available");
                    }
                    
                    // Calculate width and height in pixels based on resolution
                    const widthMeters = mapExtent.xMax - mapExtent.xMin;
                    const heightMeters = mapExtent.yMax - mapExtent.yMin;
                    
                    let widthPx = Math.round(widthMeters / resolution);
                    let heightPx = Math.round(heightMeters / resolution);
                    
                    // Clamp to server max
                    const MAX_SIZE = 4096;
                    const scale = Math.min(MAX_SIZE / widthPx, MAX_SIZE / heightPx, 1);
                    widthPx = Math.round(widthPx * scale);
                    heightPx = Math.round(heightPx * scale);

                    const baseUrl = "https://directed.dev.52north.org/geoserver/wms";
                    const params = new URLSearchParams({
                        service: "WMS",
                        version: "1.3.0",
                        request: "GetMap",
                        layers: id,
                        styles: "",
                        crs: "EPSG:3857",
                        bbox: `${mapExtent?.xMin},${mapExtent?.yMin},${mapExtent?.xMax},${mapExtent?.yMax}`,
                        width: "",
                        height: "",
                        format: "image/geotiff"
                    });
                    const url = `${baseUrl}?${params.toString()}`;
                    console.log("Forced WMS download URL:", url);
                  
                    const response = await fetch(url);
                    if (!response.ok) throw new Error("WMS request failed");
                  
                    const blob = await response.blob();
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `${id}.tif`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } else {
                    alert("Download not supported for this WMS layer.");
                }
            } else {
                alert("Download not supported for this layer type.");
            }
        } catch (err) {
            console.error("Download failed:", err);
            alert("Download failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ExpandableBox title={intl.formatMessage({ id: "map.download.heading" })} marginTop="5px">
            {visibleLayers.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                    {intl.formatMessage({ id: "map.download.no_layers" })}
                </Text>
            ) : (
                <VStack align="stretch" spacing={2} mt={2}>
                    <Select
                        placeholder={intl.formatMessage({ id: "map.download.select_layer" })}
                        value={selectedLayer?.id || ""}
                        onChange={(e) => {
                            const layer =
                                visibleLayers.find((l) => l.id === e.target.value) || null;
                            setSelectedLayer(layer);
                        }}
                    >
                        {visibleLayers.map(
                            (layer) =>
                                layer.olLayer?.getProperties()?.type !== "OSM" && (
                                    <option key={layer.id} value={layer.id}>
                                        {layer.title || layer.id}
                                    </option>
                                )
                        )}
                    </Select>

                    <Button
                        colorScheme="blue"
                        isDisabled={
                            !selectedLayer ||
                            selectedLayer.olLayer?.getProperties()?.["type"] === "OSM" ||
                            loading
                        }
                        onClick={() => selectedLayer && handleDownload(selectedLayer)}
                    >
                        {loading
                            ? intl.formatMessage({ id: "map.download.loading" })
                            : intl.formatMessage({ id: "map.download.button" })}
                        {loading && <Spinner size="sm" ml={2} />}
                    </Button>
                </VStack>
            )}
        </ExpandableBox>
    );
};

export default DownloadLayer;
