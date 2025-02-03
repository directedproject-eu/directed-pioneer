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
                    title: "nw_geschw_agw",
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
                            params: {
                                LAYERS: "nw_geschw_agw",
                                FORMAT: "image/png",
                                TRANSPARENT: true,
                                CRS: "EPSG:4326"
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
