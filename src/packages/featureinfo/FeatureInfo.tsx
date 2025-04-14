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
            const viewResolution = mapModel.olMap.getView().getResolution();

            if (coordinate && viewResolution) {
                fetchFeatureInfo(mapModel, coordinate, viewResolution, projection, setFeatureInfo);
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
    const renderFeatureProperties = (featureCollection: Record<string, unknown>) => {
        const features = featureCollection?.features as Array<Record<string, unknown>> | undefined;
        if (!features || features.length === 0) return <p>No features available</p>;

        const properties = features[0]?.properties as Record<string, unknown> | undefined;
        if (!properties) return <p>No layer properties available</p>;

        return (
            <Table size="sm" variant="simple">
                <Tbody>
                    {Object.entries(properties).map(([key, value]) => (
                        <Tr key={key}>
                            <Th style={{ textAlign: "left", whiteSpace: "nowrap", fontWeight: "bold", paddingRight: "10px" }}>
                                {key}
                            </Th>
                            <Td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "300px" }}>
                                {typeof value === "number" ? round(value) : String(value)}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        );
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
                    <PopoverContent style={{ maxHeight: "400px", overflow: "auto" }}>
                        <PopoverArrow style={{ top: "-20px", left: "20px" }} />
                        <PopoverCloseButton onClick={() => setFeatureInfo({ features: null })} />
                        <PopoverHeader>
                            <div>
                                <Text fontWeight={600} fontSize={14}>Selected Layers: </Text>
                                <Text fontSize={14}> {featureInfo.features.map((f) => f.layerName).join(", ")} </Text>
                            </div>
                            <div>
                                <Text fontWeight={600} fontSize={14}>Clicked Point: </Text> 
                                <Text fontSize={14}> X: {clickPosition.x}, Y: {clickPosition.y} </Text>
                            </div>
                        </PopoverHeader>
                        {/* put table in popup, map over wms layer response  */}
                        <PopoverBody>
                            {featureInfo.features.map((f) => (
                                <div key={f.layerName} style={{ marginBottom: "10px" }}>
                                    <Text fontWeight={600} fontSize={14}>{f.layerName}</Text>
                                    {renderFeatureProperties(f.data)} 
                                </div>
                            ))}
                        </PopoverBody>
                    </PopoverContent>
                </div>
            </Portal>
        </Popover>
    ) : null;
}
