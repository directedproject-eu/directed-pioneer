// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
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
                    title: "WD_RAIN172645",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms",
                            params: {
                                LAYERS: "WD_RAIN172645"
                            }
                        }),
                        properties: { title: "WMS Layer" }
                    }),
                    isBaseLayer: false
                }),

                //WMS layer
                new SimpleLayer({
                    title: "WD_RAIN110828",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms",
                            params: {
                                LAYERS: "WD_RAIN110828"
                            }
                        }),
                        properties: { title: "WMS Layer" }
                    }),
                    isBaseLayer: false
                }),

                //WMS layer
                new SimpleLayer({
                    title: "WD_RAIN095830",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms",
                            params: {
                                LAYERS: "WD_RAIN110828"
                            }
                        }),
                        properties: { title: "WMS Layer" }
                    }),
                    isBaseLayer: false
                }),

                //WMS layer
                new SimpleLayer({
                    title: "DMG_RIVER111745",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms",
                            params: {
                                LAYERS: "DMG_RIVER111745"
                            }
                        }),
                        properties: { title: "WMS Layer" }
                    }),
                    isBaseLayer: false
                }),

                //WMS layer
                new SimpleLayer({
                    title: "DMG_RAIN110828",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms",
                            params: {
                                LAYERS: "DMG_RAIN110828"
                            }
                        }),
                        properties: { title: "WMS Layer" }
                    }),
                    isBaseLayer: false
                })
            ]
        };
    }
}
