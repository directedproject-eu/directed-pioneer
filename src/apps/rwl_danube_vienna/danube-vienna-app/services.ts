// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { GroupLayer, MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";


const wmsLayersHistorical = [
    {
        "name": "WD_RAIN172645",
        "title": "WD_RAIN172645",
        "description": "Water depth caused by pluvial flooding"
    },
    {
        "name": "WD_RAIN110828",
        "title": "WD_RAIN110828",
        "description": "Water depth caused by pluvial flooding"
    },
    {
        "name": "WD_RAIN095830",
        "title": "WD_RAIN095830",
        "description": "Water depth caused by pluvial flooding"
    },
    {
        "name": "DMG_RIVER111745",
        "title": "DMG_RIVER111745",
        "description": "Damage caused by fluvial flooding"
    },
    {
        "name": "DMG_RAIN110828",
        "title": "DMG_RAIN110828",
        "description": "Damage caused by pluvial flooding"
    }
];

export const MAP_ID = "main";
export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    createWmsLayer(layerName: string, layerTitle: string, layerDescription: string) {
        const wmsLayer = new SimpleLayer({
            id: layerName,
            title: layerTitle,
            description: layerDescription,
            visible: false,
            olLayer: new TileLayer({
                source: new TileWMS({
                    url: "https://directed.dev.52north.org/geoserver/directed/wms",
                    params: {
                        LAYERS: layerName
                    }
                }),
                properties: {
                    title: layerTitle,
                    id: layerName
                }
            }),
            // attributes: {
            //     "legend": {
            //         Component: WaterLevelLegend
            //     }
            // },
            isBaseLayer: false
        });
        return wmsLayer;
    }

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 1836934, y: 6145000 },
                zoom: 11
            },
            projection: "EPSG:3857",
            layers: [
                // GROUP HISTORICAL LAYERS
                new GroupLayer({
                    title: "Historical Layers",
                    visible: false,
                    id: "historical",
                    layers: [
                        ...wmsLayersHistorical.map(({ name, title, description }) =>
                            this.createWmsLayer(name, title, description)
                        )
                    ]
                }),
                new SimpleLayer({
                    title: "OpenStreetMap",
                    olLayer: new TileLayer({
                        source: new OSM(),
                        properties: { title: "OSM" }
                    }),
                    isBaseLayer: true
                })
            ]
        };
    }
}
