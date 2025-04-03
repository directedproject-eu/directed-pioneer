// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapModel } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";

export function fetchFeatureInfo(
    mapModel: MapModel,
    coordinate: number[],
    viewResolution: number,
    projection: string,
    setFeatureInfo: React.Dispatch<
        React.SetStateAction<{ layerName: string | null; data: Record<string, unknown> | null }>
    >
) {
    if (mapModel?.olMap) {
        const allLayers = mapModel.olMap.getLayers().getArray();
        console.log(
            "Available layers:",
            allLayers.map((l) => l.get("id"))
        );

        const activeLayer = allLayers.find(
            (l) =>
                l.get("id") &&
                l.get("visible") &&
                l instanceof TileLayer &&
                l.getSource instanceof Function &&
                l.getSource() instanceof TileWMS
        ) as TileLayer<TileWMS>;

        if (activeLayer) {
            const source = activeLayer.getSource() as TileWMS;
            const url = source.getFeatureInfoUrl(coordinate, viewResolution, projection, {
                "INFO_FORMAT": "application/json"
            });
            console.log("Feature Info URL:", url);

            if (url) {
                fetch(url)
                    .then((response) => response.json())
                    .then((data) => {
                        console.log(
                            "Fetched Feature Info for layer:",
                            activeLayer.get("title"),
                            data
                        );
                        setFeatureInfo({
                            layerName: activeLayer.get("title"),
                            data
                        });
                    })
                    .catch((error) => console.error("Error fetching feature info:", error));
            }
        }
    } else {
        console.warn("Map model or OpenLayers map not available");
    }
}

export function setupClickHandler(
    mapModel: MapModel,
    projection: string,
    setFeatureInfo: React.Dispatch<
        React.SetStateAction<{ layerName: string | null; data: Record<string, unknown> | null }>
    >
) {
    if (mapModel?.olMap) {
        mapModel.olMap.on("singleclick", (event) => {
            setFeatureInfo({ layerName: null, data: null });
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

///original working for one layer
// export function fetchFeatureInfo(
//     mapModel: MapModel,
//     layerId: string,
//     coordinate: number[],
//     viewResolution: number,
//     projection: string,
//     setFeatureInfo: (info: Record<string, unknown> | null) => void
// ) {
//     if (mapModel?.olMap) {
//         const allLayers = mapModel.olMap.getLayers().getArray(); //check for all layers
//         console.log("Available layers:", allLayers.map((l) => l.get("id")));
//         const layer = mapModel.olMap
//             .getLayers()
//             .getArray()
//             .find((l) => l.get("id") === layerId) as TileLayer;
//         console.log("Layer found:", layer); //check for layer

//         if (layer && layer.getSource() instanceof TileWMS) {
//             const source = layer.getSource() as TileWMS;

//             const url = source.getFeatureInfoUrl(coordinate, viewResolution, projection, {
//                 "INFO_FORMAT": "application/json"
//             });
//             console.log("Feature Info URL:", url); //check URL

//             if (url) {
//                 fetch(url)
//                     .then((response) => response.json())
//                     .then((data) => {
//                         console.log("Fetched Feature Info:", data); //check data
//                         if (data.features && data.features.length > 0) {
//                             const feature = data.features[0];
//                             const pixelValue = feature.properties?.pixel_value || "No value";
//                             console.log("Pixel Value:", pixelValue); //check for pixel value
//                         }
//                         console.log("Feature Info:", data);
//                         setFeatureInfo(data); //pass feature info back to the component state
//                         // setFeatureInfo([]); //reset for previous result, uncomment dynamic
//                     })
//                     .catch((error) => console.error("Error fetching feature info:", error));
//             }
//         }
//     } else {
//         console.warn("Layer not available");
//     }
// }

// export function setupClickHandler(
//     mapModel: MapModel,
//     layerId: string,
//     projection: string,
//     setFeatureInfo: (info: Record<string, unknown> | null) => void
// ) {
//     if (mapModel?.olMap) {
//         mapModel.olMap.on("singleclick", (event) => {
//             const coordinate = event.coordinate;
//             const viewResolution = mapModel.olMap.getView().getResolution();

//             console.log("Map clicked at:", coordinate); //check for click, works
//             console.log("View Resolution:", viewResolution); //check for resolution, works

//             if (coordinate && viewResolution) {
//                 fetchFeatureInfo(
//                     mapModel,
//                     layerId,
//                     coordinate,
//                     viewResolution,
//                     projection,
//                     setFeatureInfo
//                 );
//             }
//         });

//         console.log("Click handler set up for layer:", layerId);
//     } else {
//         console.warn("Map model or OpenLayers map not available");
//     }
// }
