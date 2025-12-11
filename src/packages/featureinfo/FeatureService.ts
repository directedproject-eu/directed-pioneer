// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapModel } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";

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

    // all layers in the map model
    const allLayers = mapModel.olMap.getAllLayers();

    // filter for visible WMS tile layers
    const visibleWMSTileLayers = allLayers.filter(
        (l) =>
            l.get("visible") &&
            l.get("id") &&
            l instanceof TileLayer &&
            l.getSource instanceof Function &&
            l.getSource() instanceof TileWMS
    ) as TileLayer<TileWMS>[];

    // filter for visible GeoTIFF layers
    const visibleGeoTIFFLayers = allLayers.filter(
        (l) => l.get("visible") && l.get("id") && l.constructor.name === "WebGLTileLayer"
    );

    // WMS-FeatureInfo Promises
    const wmsFetches = visibleWMSTileLayers.map((layer) => {
        const source = layer.getSource();
        const url = source?.getFeatureInfoUrl(coordinate, viewResolution, projection, {
            INFO_FORMAT: "application/json"
        });

        if (!url) return Promise.resolve(null);

        return fetch(url)
            .then((res) => res.json())
            .then((data) => ({
                layerName: layer.get("title"),
                data
            }))
            .catch(() => null);
    });

    // GeoTIFF pixel value Promises
    const geoTIFFFetches = visibleGeoTIFFLayers.map(async (layer) => {
        layer.changed(); //ensure latest data
        try {
            // console.log("Clicked coordinate:", coordinate);
            // console.log("Pixel on canvas:", pixel);
            // console.log("title:", layer.get("title"));
    
            const valueAtPixel = layer.getData(pixel);
            let valueAsString: number | null = null;

            if (
                valueAtPixel instanceof Float32Array ||
                valueAtPixel instanceof Uint8Array ||
                valueAtPixel instanceof Uint8ClampedArray
            ) {
                valueAsString = valueAtPixel[0]?.toFixed(2);
            }
                
            return {
                layerName: layer.get("title"),
                data: { value: valueAsString}
            };
        } catch (err) {
            console.error("Error reading GeoTIFF value:", err);
            return null;
        }
    });

    // WMS + GeoTIFF Promises combined
    Promise.all([...wmsFetches, ...geoTIFFFetches]).then((results) => {
        const filtered = results.filter((r): r is NonNullable<typeof r> => !!r);
        setFeatureInfo({ features: filtered });
    });
}


//OL click handler for feature info
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
            setFeatureInfo({ features: null }); //clear current feature info
            const coordinate = event.coordinate;
            const viewResolution = mapModel.olMap.getView().getResolution();

            console.log("Map clicked at:", coordinate);
            console.log("View Resolution:", viewResolution);

            if (coordinate && viewResolution) {
                fetchFeatureInfo(mapModel, coordinate, viewResolution, projection, setFeatureInfo);
            }
        });

        console.log("Click handler set up for visible layers");
    } else {
        console.warn("Map model or OpenLayers map not available");
    }
}
