// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapModel } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import WebGLTileLayer from "ol/layer/WebGLTile";
import VectorLayer from "ol/layer/Vector"; // Added import for Vector Layers

// fetch feature info for all visible WMS, GeoTIFF, and Vector layers at clicked map coord
export function fetchFeatureInfo(
    mapModel: MapModel,
    coordinate: number[],
    viewResolution: number,
    projection: string,
    setFeatureInfo: React.Dispatch<
        React.SetStateAction<{
            features: Array<{ layerName: string; data: Record<string, unknown> }> | null;
        }>
    >,
    pixel?: number[]
) {
    if (!mapModel?.olMap) return;

    // Ensure we have the pixel, calculating it if it wasn't passed directly
    const currentPixel = pixel || mapModel.olMap.getPixelFromCoordinate(coordinate);
    const allLayers = mapModel.olMap.getAllLayers();

    // 1. WMS-FeatureInfo Promises
    const visibleWMSTileLayers = allLayers.filter(
        (l) =>
            l.get("visible") &&
            l.get("id") &&
            l instanceof TileLayer &&
            l.getSource instanceof Function &&
            l.getSource() instanceof TileWMS
    ) as TileLayer<TileWMS>[];

    const wmsFetches = visibleWMSTileLayers.map((layer) => {
        const source = layer.getSource();
        const url = source?.getFeatureInfoUrl(coordinate, viewResolution, projection, {
            INFO_FORMAT: "application/json"
        });

        if (!url) return Promise.resolve(null);

        return fetch(url)
            .then((res) => res.json())
            .then((data) => ({
                layerName: layer.get("title") || layer.get("id"),
                data
            }))
            .catch(() => null);
    });

    // 2. GeoTIFF pixel value Promises
    const visibleGeoTIFFLayers = allLayers.filter(
        (l) => l.get("visible") && l.get("id") && l instanceof WebGLTileLayer
    );

    const geoTIFFFetches = visibleGeoTIFFLayers.map(async (layer) => {
        layer.changed(); //ensure latest data
        try {
            const valueAtPixel = currentPixel ? layer.getData(currentPixel) : null;
            let valueAsString: number | string | null = null;

            if (
                valueAtPixel instanceof Float32Array ||
                valueAtPixel instanceof Uint8Array ||
                valueAtPixel instanceof Uint8ClampedArray
            ) {
                valueAsString = valueAtPixel[0]?.toFixed(2);
            }

            return {
                layerName: layer.get("title") || layer.get("id"),
                data: { value: valueAsString }
            };
        } catch (err) {
            console.error("Error reading GeoTIFF value:", err);
            return null;
        }
    });

    // 3. Vector/GeoJSON Feature Promises
    const vectorFetches: Promise<{ layerName: string; data: Record<string, unknown> } | null>[] = [];

    if (currentPixel) {
        mapModel.olMap.forEachFeatureAtPixel(
            currentPixel,
            (feature, layer) => {
                // Ensure the clicked feature belongs to a VectorLayer that is visible
                if (layer && layer instanceof VectorLayer && layer.get("visible")) {
                    const properties = feature.getProperties();
                    
                    // Identify the geometry column name so we can filter it out
                    const geometryName = typeof feature.getGeometryName === "function" ? feature.getGeometryName() : "geometry";
                    
                    // Exclude the bulky geometry object from the data payload so the UI table stays clean
                    const { [geometryName]: _, ...cleanProperties } = properties;

                    vectorFetches.push(
                        Promise.resolve({
                            layerName: layer.get("title") || layer.get("id") || "Vector Data",
                            data: cleanProperties
                        })
                    );
                }
            },
            {
                hitTolerance: 5 // Gives a 5px buffer, making it much easier for users to click small points/lines
            }
        );
    }

    // 4. Combine WMS, GeoTIFF, and Vector Promises
    Promise.all([...wmsFetches, ...geoTIFFFetches, ...vectorFetches]).then((results) => {
        const filtered = results.filter((r): r is NonNullable<typeof r> => !!r);
        setFeatureInfo({ features: filtered });
    });
}

// OL click handler for feature info
export function setupClickHandler(
    mapModel: MapModel,
    projection: string,
    setFeatureInfo: React.Dispatch<
        React.SetStateAction<{
            features: Array<{ layerName: string; data: Record<string, unknown> }> | null;
        }>
    >
) {
    if (mapModel?.olMap) {
        mapModel.olMap.on("singleclick", (event) => {
            setFeatureInfo({ features: null }); // clear current feature info
            const coordinate = event.coordinate;
            const viewResolution = mapModel.olMap.getView().getResolution();
            const pixel = mapModel.olMap.getPixelFromCoordinate(coordinate); // Make sure pixel is calculated

            if (coordinate && viewResolution) {
                fetchFeatureInfo(mapModel, coordinate, viewResolution, projection, setFeatureInfo, pixel);
            }
        });
    } else {
        console.warn("Map model or OpenLayers map not available");
    }
}