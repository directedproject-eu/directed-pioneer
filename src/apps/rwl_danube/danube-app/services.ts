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
                center: { x: 1836934, y: 6113739 },
                zoom: 8
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
                            url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3AWD_RAIN172645&bbox=587472.0747955414%2C5329969.957611352%2C617495.1646648524%2C5353444.990786337&width=768&height=600&srs=EPSG%3A32633&styles=&format=application/openlayers",
                            params: {
                                LAYERS: "WD_RAIN172645",
                                FORMAT: "image/png",
                                TRANSPARENT: true
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
                            url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3AWD_RAIN110828&bbox=587472.0747955414%2C5329969.957611352%2C617495.1646648524%2C5353444.990786337&width=768&height=600&srs=EPSG%3A32633&styles=&format=application/openlayers",
                            params: {
                                LAYERS: "WD_RAIN110828",
                                FORMAT: "image/png",
                                TRANSPARENT: true
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
                            url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3AWD_RAIN095830&bbox=587472.0747955414%2C5329969.957611352%2C617495.1646648524%2C5353444.990786337&width=768&height=600&srs=EPSG%3A32633&styles=&format=application/openlayers",
                            params: {
                                LAYERS: "WD_RAIN095830",
                                FORMAT: "image/png",
                                TRANSPARENT: true
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
                            url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3ADMG_RIVER111745&bbox=587094.9699572448%2C5329002.112651004%2C617893.0022954743%2C5353860.581781258&width=768&height=619&srs=EPSG%3A32633&styles=&format=application/openlayers",
                            params: {
                                LAYERS: "DMG_RIVER111745",
                                FORMAT: "image/png",
                                TRANSPARENT: true
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
                            url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3ADMG_RAIN110828&bbox=587094.9699572448%2C5329002.112651004%2C617893.0022954743%2C5353860.581781258&width=768&height=619&srs=EPSG%3A32633&styles=&format=application/openlayers",
                            params: {
                                LAYERS: "DMG_RAIN110828",
                                FORMAT: "image/png",
                                TRANSPARENT: true
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
