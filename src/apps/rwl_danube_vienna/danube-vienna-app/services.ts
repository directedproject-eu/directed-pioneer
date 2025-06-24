// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";

export const MAP_ID = "main";
export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 1836934, y: 6145000 },
                zoom: 11
            },
            projection: "EPSG:3857",
            layers: [
                new SimpleLayer({
                    title: "OpenStreetMap",
                    olLayer: new TileLayer({
                        source: new OSM(),
                        properties: { title: "OSM" }
                    }),
                    isBaseLayer: true
                }),

                //WMS layer
                new SimpleLayer({
                    id: "WD_RAIN172645",
                    title: "WD_RAIN172645",
                    description: "WD_RAIN172645",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms",
                            params: {
                                LAYERS: "WD_RAIN172645"
                            }
                        }),
                        properties: {
                            title: "WD_RAIN172645",
                            id: "WD_RAIN172645"
                        }
                    }),
                    isBaseLayer: false,
                    visible: true
                }),

                //WMS layer
                new SimpleLayer({
                    id: "WD_RAIN110828",
                    title: "WD_RAIN110828",
                    description: "WD_RAIN110828",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms",
                            params: {
                                LAYERS: "WD_RAIN110828"
                            }
                        }),
                        properties: {
                            title: "WD_RAIN110828",
                            id: "WD_RAIN110828"
                        }
                    }),
                    isBaseLayer: false,
                    visible: false
                }),

                //WMS layer
                new SimpleLayer({
                    id: "WD_RAIN095830",
                    title: "WD_RAIN095830",
                    description: "WD_RAIN095830",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms",
                            params: {
                                LAYERS: "WD_RAIN095830"
                            }
                        }),
                        properties: {
                            title: "WD_RAIN095830",
                            id: "WD_RAIN095830"
                        }
                    }),
                    isBaseLayer: false,
                    visible: false
                }),

                //WMS layer
                new SimpleLayer({
                    id: "DMG_RIVER111745",
                    title: "DMG_RIVER111745",
                    description: "DMG_RIVER111745",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms",
                            params: {
                                LAYERS: "DMG_RIVER111745"
                            }
                        }),
                        properties: {
                            title: "DMG_RIVER111745",
                            id: "DMG_RIVER111745"
                        }
                    }),
                    isBaseLayer: false,
                    visible: false
                }),

                //WMS layer
                new SimpleLayer({
                    id: "DMG_RAIN110828",
                    title: "DMG_RAIN110828",
                    description: "DMG_RAIN110828",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms",
                            params: {
                                LAYERS: "DMG_RAIN110828"
                            }
                        }),
                        properties: {
                            title: "DMG_RAIN110828",
                            id: "DMG_RAIN110828",
                        }
                    }),
                    isBaseLayer: false,
                    visible: false
                })
            ]
        };
    }
}
