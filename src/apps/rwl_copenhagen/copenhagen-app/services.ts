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
                center: { x: 1373573, y: 7503364 },
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
                    title: "GeoServer WMS Layer",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3ACoastal_100yPresent_wd_max&bbox=12.016743084733621%2C55.71812457936267%2C12.285471276223541%2C55.88158289836538&width=768&height=467&srs=EPSG%3A4326&styles=&format=application/openlayers", // Replace with your GeoServer URL
                            params: {
                                LAYERS: "Coastal_100yPresent_wd_max",
                                FORMAT: "image/png",
                                TRANSPARENT: true
                            }
                        }),
                        properties: { title: "WMS Layer" }
                    }),
                    isBaseLayer: false //WMS overlay
                })
            ]
        };
    }
}
