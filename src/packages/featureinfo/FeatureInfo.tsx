// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from "react";
import { MapModel } from "@open-pioneer/map";
import { fetchFeatureInfo } from "./FeatureService";
import type { MapBrowserEvent } from "ol";
import Map from "ol/Map";
import { transform } from "ol/proj";
import {
    Popover,
    Portal,
    Table,
    Text,
    Box,
    VStack,
    CloseButton,
    Badge,
    Flex
} from "@chakra-ui/react";

interface FeatureInfoProps {
    mapModel: MapModel;
    layerId: string;
    projection: string;
}

export function FeatureInfo({ mapModel, projection }: FeatureInfoProps) {
    const [featureInfo, setFeatureInfo] = useState<{
        features: Array<{ layerName: string; data: Record<string, unknown> }> | null;
    }>({ features: null });
    
    // Screen pixels for popover placement
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
    // Geographic coordinates for Lat/Lon display
    const [mapCoordinate, setMapCoordinate] = useState<{ lon: number; lat: number } | null>(null);

    useEffect(() => {
        if (!mapModel?.olMap) return;

        const handleViewportClick = (event: MouseEvent) => {
            setClickPosition({ x: event.clientX, y: event.clientY });
        };

        const handleSingleClick = (event: MapBrowserEvent<PointerEvent>) => {
            const coordinate = event.coordinate;
            const pixel = mapModel.olMap.getPixelFromCoordinate(coordinate);
            const viewResolution = mapModel.olMap.getView().getResolution();

            if (coordinate) {
                // Transform from the maps current projection to standard Lat/Lon (EPSG:4326)
                const latLonCoordinate = transform(coordinate, projection, "EPSG:4326");
                
                setMapCoordinate({ 
                    lon: latLonCoordinate[0], 
                    lat: latLonCoordinate[1] 
                });
            }

            if (coordinate && viewResolution) {
                fetchFeatureInfo(mapModel, coordinate, viewResolution, projection, setFeatureInfo, pixel);
            }
        };

        const olMap = mapModel.olMap as Map;
        olMap.getViewport().addEventListener("click", handleViewportClick);
        olMap.on("singleclick", handleSingleClick);

        return () => {
            olMap.getViewport().removeEventListener("click", handleViewportClick);
            olMap.un("singleclick", handleSingleClick);
        };
    }, [mapModel, projection]);

    // NEW: Formats coordinates to 4 decimal places with N/S/E/W directions
    const formatCoordinate = (val: number, isLat: boolean) => {
        const absVal = Math.abs(val).toFixed(4);
        if (isLat) {
            return `${absVal}° ${val >= 0 ? "N" : "S"}`;
        }
        return `${absVal}° ${val >= 0 ? "E" : "W"}`;
    };

    const round = (num: number) => num.toFixed(3);

    const RenderTableData = ({ properties }: { properties: Record<string, unknown> }) => (
        <Box overflowX="auto" maxW="100%">
            <Table.Root size="sm" variant="line">
                <Table.Body>
                    {Object.entries(properties).map(([key, value]) => (
                        <Table.Row key={key}>
                            <Table.ColumnHeader
                                textAlign="left"
                                whiteSpace="nowrap"
                                fontWeight="semibold"
                                color="gray.600"
                                pr={4}
                                py={2}
                            >
                                {key}
                            </Table.ColumnHeader>
                            <Table.Cell
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                maxW="250px"
                                py={2}
                            >
                                {typeof value === "number" ? round(value) : String(value)}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );

    const renderFeatureProperties = (data: Record<string, unknown>) => {
        // 1. Handle custom WMS layer values (Saferplaces, Scalgo, RIM2D, 10yr flood depth)
        if (data.type === "single_value" && (typeof data.value === "number" || typeof data.value === "string")) {
            const displayValue = typeof data.value === "number" ? round(data.value) : data.value;
            const label = (data.label as string) || "Value";
            const unit = (data.unit as string) || "m";

            return (
                <VStack align="start" gap={1}>
                    <Text fontSize="xs" color="gray.600" fontFamily="monospace" bg="gray.50" px={2} py={1} borderRadius="md" border="1px solid" borderColor="gray.200">
                        {label}:{" "}
                        <Text as="span" fontWeight="bold" color="blue.600">
                            {displayValue} {unit}
                        </Text>
                    </Text>
                </VStack>
            );
        }
       
        // 2. Handle text/plain info format as fallback
        if (data.type === "text" && Array.isArray(data.lines)) {
            return (
                <VStack align="start" gap={1} bg="gray.50" p={2} borderRadius="md" border="1px solid" borderColor="gray.100">
                    {(data.lines as string[]).map((line, i) => (
                        <Text key={i} fontSize="xs" fontFamily="monospace" color="gray.700" whiteSpace="pre-wrap">
                            {line}
                        </Text>
                    ))}
                </VStack>
            );
        }
    
        // 3. Handle GeoJSON response
        if (data.type === "FeatureCollection") {
            const features = data?.features as Array<Record<string, unknown>> | undefined;
            if (!features || features.length === 0) {
                return <Text fontSize="sm" color="gray.500" fontStyle="italic">No features available</Text>;
            }
    
            const properties = features[0]?.properties as Record<string, unknown> | undefined;
            if (!properties) {
                return <Text fontSize="sm" color="gray.500" fontStyle="italic">No layer properties available</Text>;
            }
    
            return <RenderTableData properties={properties} />;
        }
        // 4. Handle GeoTIFF response, keep "value" & no units as this is usually diverse  i.e. DMI, geosphere, etc. 
        if (Object.keys(data).length === 1 && "value" in data && data.value !== null) {
            return (
                <Box mt={1}>
                    <Text
                        display="inline-block"
                        fontSize="xs"
                        color="gray.600"
                        fontFamily="monospace"
                        bg="gray.50"
                        px={2}
                        py={1}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.200"
                    >
                        Value: {""}
                        <Text as="span" fontWeight="bold" color="blue.600">
                            {String(data.value)}
                        </Text>
                    </Text>
                </Box>
            );
        }
    
        // 5. Handle key-value objects (raster values or vector properties)
        if (Object.keys(data).length > 0) {
            return <RenderTableData properties={data} />;
        }
    
        return <Text fontSize="sm" color="gray.500" fontStyle="italic">No features available</Text>;
    };

    return featureInfo.features && clickPosition ? (
        <Popover.Root open={true}>
            <Portal>
                <Box
                    position="absolute"
                    top={`${clickPosition.y}px`}
                    left={`${clickPosition.x}px`}
                    zIndex={1000}
                >
                    <Popover.Positioner>
                        <Popover.Content 
                            maxH="450px" 
                            w="350px" 
                            overflowY="auto" 
                            boxShadow="lg" 
                            borderRadius="md"
                            bg="white"
                        >
                            <Popover.CloseTrigger onClick={() => setFeatureInfo({ features: null })}>
                                <CloseButton
                                    position="absolute"
                                    top={2}
                                    right={2}
                                    size="sm"
                                    aria-label="Close feature info"
                                />
                            </Popover.CloseTrigger>

                            <Popover.Title p={4} pb={2}>
                                <VStack align="start" gap={3}>
                                    <Box>
                                        <Text fontWeight="bold" fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="gray.500" mb={1}>
                                            Coordinates
                                        </Text>
                                        {/* Notice the updated formatCoordinate usage here */}
                                        <Text fontSize="xs" color="gray.600" fontFamily="monospace" bg="gray.50" px={2} py={1} borderRadius="md" border="1px solid" borderColor="gray.200">
                                            {mapCoordinate 
                                                ? `Lat: ${formatCoordinate(mapCoordinate.lat, true)} | Lon: ${formatCoordinate(mapCoordinate.lon, false)}` 
                                                : "Loading..."}
                                        </Text>
                                    </Box>
                                    <Box pr={6}>
                                        <Text fontWeight="bold" fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="gray.500" mb={2}>
                                            Selected Layers
                                        </Text>
                                        <Flex wrap="wrap" gap={2}>
                                            {featureInfo.features.map((f) => (
                                                <Badge key={f.layerName} colorScheme="blue" variant="subtle" px={2} py={0.5} borderRadius="full">
                                                    {f.layerName}
                                                </Badge>
                                            ))}
                                        </Flex>
                                    </Box>
                                </VStack>
                            </Popover.Title>

                            <Popover.Body p={0}>
                                <VStack align="stretch" gap={0}>
                                    <Text 
                                        fontWeight="bold" 
                                        fontSize="xs" 
                                        textTransform="uppercase" 
                                        letterSpacing="wide" 
                                        color="gray.500" 
                                        mt={2}
                                        ml={4}
                                    >
                                            Layer Information
                                    </Text>
                                    {featureInfo.features.map((f) => (
                                        <Box
                                            key={f.layerName}
                                            p={4}
                                            _hover={{ bg: "gray.50" }}
                                            transition="background 0.2s"
                                        >
                                            <Text
                                                fontWeight="bold"
                                                fontSize="sm"
                                                mb={3}
                                                color="blue.700"
                                            >
                                                {f.layerName}
                                            </Text>

                                            <Box>
                                                {renderFeatureProperties(f.data)}
                                            </Box>
                                        </Box>
                                    ))}
                                </VStack>
                            </Popover.Body>
                        </Popover.Content>
                    </Popover.Positioner>
                </Box>
            </Portal>
        </Popover.Root>
    ) : null;
}