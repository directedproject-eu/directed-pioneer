// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { MapModel } from "@open-pioneer/map";
import { fetchTilePixelInfo } from "./TileFeatureService";
import {
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverCloseButton,
    PopoverHeader,
    Portal,
    PopoverArrow,
    Text
} from "@open-pioneer/chakra-integration";
import type { MapBrowserEvent } from "ol";

interface TileFeatureInfoProps {
    mapModel: MapModel;
    layerId: string;
}

export function TileFeatureInfo({ mapModel, layerId }: TileFeatureInfoProps) {
    const [pixelInfo, setPixelInfo] = useState<PixelInfoResult | null>(null);
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (!mapModel?.olMap) return;

        const handleViewportClick = (event: MouseEvent) => {
            setClickPosition({ x: event.clientX, y: event.clientY });
        };

        const handleSingleClick = async (event: MapBrowserEvent<UIEvent>) => {
            const coordinate = event.coordinate;
            const info = await fetchTilePixelInfo(mapModel, coordinate, layerId);
            setPixelInfo(info);
        };

        const olMap = mapModel.olMap;
        olMap.getViewport().addEventListener("click", handleViewportClick);
        olMap.on("singleclick", handleSingleClick);

        return () => {
            olMap.getViewport().removeEventListener("click", handleViewportClick);
            olMap.un("singleclick", handleSingleClick);
        };
    }, [mapModel, layerId]);

    return pixelInfo && clickPosition ? (
        <Popover isOpen={true} onClose={() => setPixelInfo(null)}>
            <Portal>
                <div
                    style={{
                        position: "absolute",
                        top: `${clickPosition.y}px`,
                        left: `${clickPosition.x}px`,
                        zIndex: 1000
                    }}
                >
                    <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>{pixelInfo.layerName} Pixel Info</PopoverHeader>
                        <PopoverBody>
                            <Text>
                                Coordinate:{" "}
                                {pixelInfo.coordinate.map((c) => c.toFixed(2)).join(", ")}
                            </Text>
                            {pixelInfo.value !== undefined && (
                                <Text>Value: {pixelInfo.value.toFixed(2)}</Text>
                            )}
                            {pixelInfo.value === undefined && (
                                <Text>No value found at this location.</Text>
                            )}
                        </PopoverBody>
                    </PopoverContent>
                </div>
            </Portal>
        </Popover>
    ) : null;
}
