// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { useState, useEffect } from "react";
import { useIntl } from "open-pioneer:react-hooks";
import { useMapModel } from "@open-pioneer/map";
import Layer from "ol/layer/Layer";
import { EventsKey } from "ol/events";
import { Group } from "ol/layer";
import { unByKey } from "ol/Observable";
import { SimpleLayer } from "@open-pioneer/map";
import GeoTIFF from "ol/source/GeoTIFF";
import VectorSource from "ol/source/Vector";
import {
    Button,
    Select,
    Spinner,
    VStack,
    Text,
    AlertDialog,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogFooter,
    AlertDialogCloseButton,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverBody,
    IconButton,
    Spacer
} from "@open-pioneer/chakra-integration";
import { FaInfo } from "react-icons/fa";

export interface LayerDownloadProps {
    mapID: string;
    intl: ReturnType<typeof useIntl>;
    isOpen: boolean;
    onClose: () => void;
}

type LayerEntry = {
    id: string;
    title: string;
    olLayer: Layer;
    properties?: Record<string, unknown>;
};

export function LayerDownload({ mapID, intl, isOpen, onClose }: LayerDownloadProps) {
    const mapModel = useMapModel(mapID);
    const [visibleLayers, setVisibleLayers] = useState<LayerEntry[]>([]);
    const [selectedLayer, setSelectedLayer] = useState<LayerEntry | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [popoverIsOpen, setPopoverIsOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!mapModel?.map) return;

        const allLayers = mapModel.map.layers.getRecursiveLayers() as SimpleLayer[];

        const updateVisibleLayers = () => {
            const vis = allLayers
                .filter(
                    (layer) =>
                        layer.olLayer?.getVisible?.() === true && !(layer.olLayer instanceof Group)
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

    async function getWmsMaxSize(wmsUrl: string) {
        const url = `${wmsUrl}?service=WMS&request=GetCapabilities`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("GetCapabilities failed");

        const text = await res.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");

        const maxWidth = xml.querySelector("MaxImageWidth, MaxWidth")?.textContent;
        const maxHeight = xml.querySelector("MaxImageHeight, MaxHeight")?.textContent;

        return {
            maxWidth: maxWidth ? Number(maxWidth) : 4096,
            maxHeight: maxHeight ? Number(maxHeight) : 4096
        };
    }

    const handleDownload = async (layer: LayerEntry) => {
        setLoading(true);
        try {
            const properties = layer.olLayer?.getProperties();
            const type = properties?.type;
            console.log("Downloading layer:", layer.id, properties, type);

            if (type === "GeoTIFF") {
                const source = layer.olLayer?.getSource() as GeoTIFF;
                console.log("GeoTIFF source:", source);
                if (source && source["key_"]) {
                    window.open(source["key_"], "_blank");
                }
            } else if (type === "GeoJSON") {
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
            } else if (type === "WMS_features") {
                console.log("Layer to download: ", layer);
                const layerIdFromParams = properties.source?.params_?.LAYERS;
                const urlFromParams = properties.source?.urls[0];

                const params = new URLSearchParams({
                    service: "WFS",
                    version: "2.0.0",
                    request: "GetFeature",
                    typeNames: layerIdFromParams,
                    outputFormat: "shape-zip"
                });
                const url = `${urlFromParams}?${params.toString()}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error("WFS request failed");
                const blob = await response.blob();
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `${properties.id}.zip`;
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else if (type === "WMS_tiles") {
                console.log("Layer to download: ", layer);
                let layerIdFromParams = properties.source?.params_?.LAYERS;
                const urlFromParams = properties.source?.urls[0];

                if (urlFromParams === "https://directed.dev.52north.org/geoserver/directed/wms") {
                    layerIdFromParams = "directed:" + layerIdFromParams;
                }

                console.log("urlFromParams:", urlFromParams);

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
                const { maxWidth, maxHeight } = await getWmsMaxSize(urlFromParams);

                const scale = Math.min(maxWidth / widthPx, maxHeight / heightPx, 1);

                widthPx = Math.round(widthPx * scale);
                heightPx = Math.round(heightPx * scale);

                const params = new URLSearchParams({
                    service: "WMS",
                    version: "1.3.0",
                    request: "GetMap",
                    layers: `${layerIdFromParams}`,
                    styles: "",
                    crs: "EPSG:3857",
                    bbox: `${mapExtent?.xMin},${mapExtent?.yMin},${mapExtent?.xMax},${mapExtent?.yMax}`,
                    width: `${widthPx}`,
                    height: `${heightPx}`,
                    format: "image/tiff"
                });
                const url = `${urlFromParams}?${params.toString()}`;
                console.log("Forced WMS download URL:", url);

                const response = await fetch(url);
                if (!response.ok) throw new Error("WMS request failed");

                const blob = await response.blob();
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `${layerIdFromParams}_test.tif`;
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else if (type === "OSM") {
                alert("Downloading OSM layers is not supported due to licensing restrictions.");
            } else {
                alert("This layer type is not supported for download.");
            }
        } catch (error) {
            console.error("Error downloading layer:", error);
        } finally {
            setLoading(false);
        }
    };

    const btnRef = React.useRef<HTMLButtonElement>(null);
    return (
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={btnRef} isCentered>
            <AlertDialogOverlay
                bg="blackAlpha.500"
                backdropFilter="auto"
                backdropBlur="4px"
                zIndex={1400}
            >
                <AlertDialogContent
                    borderRadius="lg"
                    boxShadow="2xl"
                    maxW="lg"
                    w="90%"
                    mx="auto"
                    p={4}
                    zIndex={1500}
                >
                    <AlertDialogHeader fontWeight="bold" borderBottomWidth="1px" mb={2}>
                        <Popover
                            trigger="hover"
                            openDelay={250}
                            closeDelay={100}
                            placement="top"
                            isOpen={popoverIsOpen}
                            onOpen={() => setPopoverIsOpen(true)}
                            onClose={() => setPopoverIsOpen(false)}
                        >
                            <PopoverTrigger>
                                <IconButton
                                    marginLeft="2px"
                                    size="s"
                                    aria-label="Info"
                                    icon={<FaInfo />}
                                    variant="ghost"
                                    color="black"
                                />
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverArrow />
                                <PopoverBody overflow="auto">
                                    {intl.formatMessage({ id: "map.download.description" })}
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                        {intl.formatMessage({ id: "map.download.heading" })}
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        {visibleLayers.length === 0 ? (
                            <Text fontSize="sm" color="gray.600">
                                {intl.formatMessage({ id: "map.download.no_layers" })}
                            </Text>
                        ) : (
                            <VStack align="stretch" spacing={3} mt={1}>
                                <Select
                                    placeholder={intl.formatMessage({
                                        id: "map.download.select_layer"
                                    })}
                                    value={selectedLayer?.id || ""}
                                    onChange={(e) => {
                                        const layer =
                                            visibleLayers.find((l) => l.id === e.target.value) ||
                                            null;
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
                                        selectedLayer.olLayer?.getProperties()?.["type"] ===
                                            "OSM" ||
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
                    </AlertDialogBody>
                    <AlertDialogFooter borderTopWidth="1px" mt={2}>
                        <AlertDialogCloseButton
                            onClick={onClose}
                            ref={btnRef}
                        ></AlertDialogCloseButton>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}
