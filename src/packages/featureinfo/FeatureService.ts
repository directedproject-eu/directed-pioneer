// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapModel } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import VectorLayer from "ol/layer/Vector"; // Added import for Vector Layers


interface WmsFeature {
    type: "Feature";
    id?: string | number;
    geometry?: Record<string, unknown> | null;
    properties?: Record<string, unknown>;
}

interface WmsFeatureCollection {
    type: "FeatureCollection"; 
    features?: WmsFeature[]; 
    totalFeatures?: string | number; 
    numberReturned?: number; 
    timeStamp?: string; 
    crs?: Record<string, unknown> | null;
}


//fetch feature info for all visible WMS layers at clicked map coord
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
        if (!source) return Promise.resolve(null);
    
        // Check if the layer endpoint needs text/plain format
        const sourceUrls = source.getUrls ? source.getUrls() : [];
        const textFormatEndpoints = ["https://api.dataforsyningen.dk/wms"];
        const requiresPlainText = sourceUrls?.some(url =>
            url && textFormatEndpoints.some(endpoint => url.includes(endpoint))
        );
    
        const infoFormat = requiresPlainText ? "text/plain" : "application/json";
    
        // Clear out any properties by providing explicit overrides to getFeatureInfoUrl
        const url = source.getFeatureInfoUrl(
            coordinate, 
            viewResolution, 
            projection, 
            {
                INFO_FORMAT: infoFormat // force OL to build the exact format string for text/plain 
            }
        );
    
        if (!url) return Promise.resolve(null);
    
        return fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return infoFormat === "text/plain" ? res.text() : res.json();
            })
            .then((rawData) => {
                let finalizedData: Record<string, unknown> = {};
            
                if (infoFormat === "text/plain" && typeof rawData === "string") {
                    // --- Plain text for groundwater layers in Copenhagen ---
                    const match = rawData.match(/value_0\s*=\s*['"]?(-?\d+(\.\d+)?)['"]?/);
                    if (match && match[1]) {
                        finalizedData = { 
                            type: "single_value", 
                            value: parseFloat(match[1]),
                            label: "Groundwater Level", 
                            unit: "m"
                        };
                    } else {
                        const lines = rawData.split(/\r?\n/).filter(line => line.trim() !== "");
                        finalizedData = { type: "text", lines: lines };
                    }
                } else {
                    // --- JSON (Saferplaces, Scalgo, RIM2D) ---
                    // const json = rawData as Record<string, unknown>;
                    const json = rawData as unknown as WmsFeatureCollection;

                    if (!json?.features || json.features.length === 0){
                        finalizedData = {}; 
                    } else {
                         // Extract the first feature's properties
                            const features = json?.features;
                            const properties = features?.[0]?.properties; 
                    
                            if (properties) {
                                // Saferplaces / SCALGO Copenhagen
                                if (properties.GRAY_INDEX !== undefined) {
                                    finalizedData = {
                                        type: "single_value",
                                        value: properties.GRAY_INDEX as number,
                                        label: "Water Depth", 
                                        unit: "m"
                                    };
                                } 
                                // RIM2D Copenhagen 
                                else if (properties.GDAL_Band_Number_1 !== undefined) {
                                    finalizedData = {
                                        type: "single_value",
                                        value: properties.GDAL_Band_Number_1 as number,
                                        label: "Water Depth", 
                                        unit: "m"
                                    };
                                }
                                // 10 year flood-depth Danube 
                                else if (properties.b_flddph !== undefined) {
                                    const riverName = properties.a_nameText ? String(properties.a_nameText).trim() : "";
                                    const depthLabel = riverName ? `Flood Depth in River ${riverName}` : "Flood Depth";
                                
                                    finalizedData = {
                                        type: "single_value",
                                        value: properties.b_flddph as number,
                                        label: depthLabel,
                                        unit: "m"
                                    };
                                }
                                // Fallback if layer has properties, but are not specific model indexes
                                else {
                                    finalizedData = json as unknown as Record<string, unknown>;
                                }
                            } else {
                                // Fallback if response has no standard properties dictionary
                                finalizedData = json as unknown as Record<string, unknown>;
                            }
                        }
                    }
                    
                   
            
                return {
                    layerName: layer.get("title") || layer.get("id"),
                    data: finalizedData
                };
            });
        });

    // 2. GeoTIFF pixel value Promises
    const visibleGeoTIFFLayers = allLayers.filter(
        (l) => l.get("visible") && l.get("id") && l instanceof WebGLTileLayer
    );

    const geoTIFFFetches = visibleGeoTIFFLayers.map(async (layer) => {
        layer.changed(); //ensure latest data
        try {
            const valueAtPixel = currentPixel ? layer.getData(currentPixel) : null;
            // let parsedValue: number | null = null;
            let valueAsString: number | string | null = null;

            if (
                valueAtPixel instanceof Float32Array ||
                valueAtPixel instanceof Uint8Array ||
                valueAtPixel instanceof Uint8ClampedArray
            ) {
                valueAsString = valueAtPixel[0]?.toFixed(2);
                // parsedValue = parsedFloat(valueAtPixel[0]?.toFixed(2))
            }

            return {
                layerName: layer.get("title") || layer.get("id"),
                // data: {
                //     type: "single_value",
                //     value: parsedValue,
                //     label: "Value", 
                //     unit: "m"           
                // }
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

        console.log("Click handler set up for visible layers");
    } else {
        console.warn("Map model or OpenLayers map not available");
    }
}
