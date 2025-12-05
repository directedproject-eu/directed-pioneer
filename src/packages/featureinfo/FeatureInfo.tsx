// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from "react";
import { MapModel } from "@open-pioneer/map";
import { fetchFeatureInfo } from "./FeatureService";
import {
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverCloseButton,
    PopoverHeader,
    Portal,
    PopoverArrow,
    Table,
    Tbody,
    Text,
    Tr,
    Td,
    Th
} from "@open-pioneer/chakra-integration";
import type { MapBrowserEvent } from "ol";
import { Box, VStack } from "@open-pioneer/chakra-integration";

interface FeatureInfoProps {
    mapModel: MapModel;
    layerId: string;
    projection: string;
}

export function FeatureInfo({ mapModel, projection }: FeatureInfoProps) {
    //store wms feature info for click position
    const [featureInfo, setFeatureInfo] = useState<{
        features: Array<{ layerName: string; data: Record<string, unknown> }> | null;
    }>({ features: null });
    //track click position for popup placement
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (!mapModel?.olMap) return;
        //get coords on any mouse click
        const handleViewportClick = (event: MouseEvent) => {
            setClickPosition({ x: event.clientX, y: event.clientY });
        };
        //get coords and trigger feature info request
        const handleSingleClick = (event: MapBrowserEvent<UIEvent>) => {
            const coordinate = event.coordinate;
            const pixel = mapModel.olMap.getPixelFromCoordinate(coordinate);
            const viewResolution = mapModel.olMap.getView().getResolution();

            if (coordinate && viewResolution) {
                fetchFeatureInfo(mapModel, coordinate, viewResolution, projection, setFeatureInfo, pixel);
            }
        };

        const olMap = mapModel.olMap;
        olMap.getViewport().addEventListener("click", handleViewportClick);
        olMap.on("singleclick", handleSingleClick);

        return () => {
            olMap.getViewport().removeEventListener("click", handleViewportClick);
            olMap.un("singleclick", handleSingleClick);
        };
    }, [mapModel, projection]);

    const round = (num: number) => num.toFixed(3);

    //render properties in a table from the first feature in the feature collection
    const renderFeatureProperties = (data: Record<string, unknown>) => {    
        // Fall 1: GeoJSON FeatureCollection
        if (data.type === "FeatureCollection") {
            const features = data?.features as Array<Record<string, unknown>> | undefined;
            if (!features || features.length === 0) return <p>No features available</p>;
    
            const properties = features[0]?.properties as Record<string, unknown> | undefined;
            if (!properties) return <p>No layer properties available</p>;
    
            return (
                <Table size="sm" variant="simple">
                    <Tbody>
                        {Object.entries(properties).map(([key, value]) => (
                            <Tr key={key}>
                                <Th
                                    style={{
                                        textAlign: "left",
                                        whiteSpace: "nowrap",
                                        fontWeight: "bold",
                                        paddingRight: "10px"
                                    }}
                                >
                                    {key}
                                </Th>
                                <Td
                                    style={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: "300px"
                                    }}
                                >
                                    {typeof value === "number" ? round(value) : String(value)}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            );
        }
    
        // Fall 2: Einfaches Record (z. B. GeoTIFF-Pixelwert)
        if (Object.keys(data).length > 0) {
            return (
                <Table size="sm" variant="simple">
                    <Tbody>
                        {Object.entries(data).map(([key, value]) => (
                            <Tr key={key}>
                                <Th
                                    style={{
                                        textAlign: "left",
                                        whiteSpace: "nowrap",
                                        fontWeight: "bold",
                                        paddingRight: "10px"
                                    }}
                                >
                                    {key}
                                </Th>
                                <Td
                                    style={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: "300px"
                                    }}
                                >
                                    {typeof value === "number" ? round(value) : String(value)}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            );
        }
    
        // Keine Daten vorhanden
        return <p>No features available</p>;
    };

    //render the popup
    return featureInfo.features && clickPosition ? (
        <Popover isOpen={true}>
            <Portal>
                <div
                    style={{
                        position: "absolute",
                        top: `${clickPosition.y}px`,
                        left: `${clickPosition.x}px`,
                        zIndex: 1000
                    }}
                >
                    <PopoverContent
                        style={{
                            maxHeight: "420px",
                            overflow: "auto",
                            padding: "8px 0"
                        }}
                    >
                        <PopoverArrow style={{ top: "-20px", left: "20px" }} />
                        <PopoverCloseButton onClick={() => setFeatureInfo({ features: null })} />
    
                        <PopoverHeader
                            style={{
                                borderBottom: "1px solid #e2e8f0",
                                paddingBottom: "8px",
                                marginBottom: "8px"
                            }}
                        >
                            <VStack align="start" spacing={2}>
                                {/* Selected layers */}
                                <Box>
                                    <Text fontWeight="600" fontSize="14px" color="gray.700">
                                        Selected Layers:
                                    </Text>
                                    <Text fontSize="14px" color="gray.600">
                                        {featureInfo.features.map((f) => f.layerName).join(", ")}
                                    </Text>
                                </Box>
    
                                {/* Clicked point */}
                                <Box>
                                    <Text fontWeight="600" fontSize="14px" color="gray.700">
                                        Clicked Point:
                                    </Text>
                                    <Text fontSize="14px" color="gray.600">
                                        X: {clickPosition.x}, Y: {clickPosition.y}
                                    </Text>
                                </Box>
                            </VStack>
                        </PopoverHeader>
    
                        {/* Data section */}
                        <PopoverBody>
                            <VStack align="stretch" spacing={4}>
                                {featureInfo.features.map((f) => (
                                    <Box
                                        key={f.layerName}
                                        padding="8px 0"
                                        borderBottom="1px solid #edf2f7"
                                    >
                                        <Text
                                            fontWeight="600"
                                            fontSize="15px"
                                            marginBottom="4px"
                                            color="gray.700"
                                        >
                                            {f.layerName}
                                        </Text>
    
                                        <Box marginLeft="4px">
                                            {renderFeatureProperties(f.data)}
                                        </Box>
                                    </Box>
                                ))}
                            </VStack>
                        </PopoverBody>
                    </PopoverContent>
                </div>
            </Portal>
        </Popover>
    ) : null;  
}
