// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapModel } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";

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
    >
) {
    if (!mapModel?.olMap) return;

    //get all layers in map model
    const allLayers = mapModel.olMap.getAllLayers();

    //filter for visible layers
    const visibleWMSTileLayers = allLayers.filter(
        (l) =>
            l.get("visible") &&
            l.get("id") &&
            l instanceof TileLayer &&
            l.getSource instanceof Function &&
            l.getSource() instanceof TileWMS
    ) as TileLayer<TileWMS>[];

    //request each layer's getFeatureInfo (from OLayers), loop over each visible layer using .map
    const fetches = visibleWMSTileLayers.map((layer) => {
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
            .catch(() => null); //handle failed requests
    });
    //wait for all requests to complete & update state
    Promise.all(fetches).then((results) => {
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
