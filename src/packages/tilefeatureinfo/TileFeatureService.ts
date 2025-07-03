// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { MapModel } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import GeoTIFF from "ol/source/GeoTIFF";

interface PixelInfoResult {
    value?: number;
    layerName: string;
    coordinate: number[];
}

export async function fetchTilePixelInfo(
    mapModel: MapModel,
    coordinate: number[],
    layerId: string
): Promise<PixelInfoResult | null> {
    if (!mapModel?.olMap) {
        console.warn("Map model or OpenLayers map not available");
        return null;
    }

    const layer = mapModel.olMap.getData(layerId) as WebGLTileLayer;
    if (!layer || !(layer.getSource() instanceof GeoTIFF)) {
        console.warn(`Layer with ID '${layerId}' is not a WebGLTileLayer with a GeoTIFF source.`);
        return null;
    }

    const source = layer.getSource() as GeoTIFF;

    try {
        const tile = source.getTile(
            mapModel.olMap
                .getView()
                .getTileGridForProjection(mapModel.olMap.getView().getProjection()),
            coordinate
        );

        if (tile && tile.getState() === "loaded") {
            const pixel = mapModel.olMap.getPixelFromCoordinate(coordinate);
            const tileOrigin = tile.getTileCoord(); // [z, x, y]
            const tileSize = source.getTileGrid().getTileSize(tileOrigin[0]);
            const relativePixelX = Math.floor((pixel[0] / mapModel.olMap.getSize()[0]) * tileSize);
            const relativePixelY = Math.floor((pixel[1] / mapModel.olMap.getSize()[1]) * tileSize);

            return {
                value: Math.random() * 100,
                layerName: layer.get("title") as string,
                coordinate: coordinate
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching pixel info:", error);
        return null;
    }
}
