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
                center: { x: 750611, y: 6606146 },
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
                    title: "hb_fr_extreme",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3Ahb_fr_extrem&bbox=465435.0%2C5873585.0%2C499355.0%2C5940185.0&width=391&height=768&srs=EPSG%3A25832&styles=&format=application/openlayers",
                            params: {
                                LAYERS: "hb_fr_extreme",
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
