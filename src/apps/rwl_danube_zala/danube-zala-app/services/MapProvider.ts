// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Vector as VectorLayer } from "ol/layer.js";
import { Vector as VectorSource } from "ol/source.js";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import GeoJSON from "ol/format/GeoJSON.js";
import { Stroke, Style } from "ol/style";
import TileWMS from "ol/source/TileWMS";
import { ServiceOptions } from "@open-pioneer/runtime";
import { GroupLayer, MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import { FluvialFloodLegend } from "../components/legends/FluvialFloodLegend";

interface Config {
    pygeoapiBaseUrl: string;
}

export const MAP_ID = "main";
export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;
    pygeoapiBaseUrl: string;

    constructor(serviceOptions: ServiceOptions) {
        const config = serviceOptions.properties.userConfig as Config;
        this.pygeoapiBaseUrl = config.pygeoapiBaseUrl;
    }

    capitalizeFirstLetter(word: string) {
        return String(word).charAt(0).toUpperCase() + String(word).slice(1);
    }

    createRegionLayer(regionID: string) {
        const regionLayer = new SimpleLayer({
            id: `${regionID}_region`,
            title: `${this.capitalizeFirstLetter(regionID)} region`,
            description: `This layer shows the boundaries of the ${this.capitalizeFirstLetter(regionID)} region`,
            visible: true,
            olLayer: new VectorLayer({
                source: new VectorSource({
                    url: `${this.pygeoapiBaseUrl}/collections/danube_administrative_boundaries/items/${regionID}?f=json`,
                    format: new GeoJSON()
                }),
                style: new Style({
                    stroke: new Stroke({
                        color: "#2e9ecc",
                        width: 3
                    })
                }),
                properties: {
                    title: "GeoJSON Layer",
                    type: "GeoJSON"
                }
            }),
            isBaseLayer: false
        });
        return regionLayer;
    }

    createWmsLayer(layerName: string, layerTitle: string, layerDescription: string) {
        const wmsLayerContent = {
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
                    id: layerName,
                    type: "WMS"
                }
            }),
            isBaseLayer: false
        };
        return wmsLayerContent;
    }

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 1900000, y: 5890000 },
                zoom: 10
            },
            projection: "EPSG:3857",
            layers: [
                new SimpleLayer({
                    title: "OpenStreetMap",
                    olLayer: new TileLayer({
                        source: new OSM(),
                        properties: { title: "OSM", type: "OSM" }
                    }),
                    isBaseLayer: true
                }),
                this.createRegionLayer("zala"),
                // Fluvial flood layers
                new GroupLayer({
                    title: "Fluvial Flooding",
                    visible: false,
                    id: "fluvial_flooding",
                    layers: [
                        new SimpleLayer({
                            ...this.createWmsLayer(
                                "euh_danube_bigrivers_10",
                                "10-Year Flood Depth",
                                "10-year flood depth from 1974 to 2023. The attribute 'b_flddph' denotes the flood depth in m. The flood depth is measured above the water level of the river which is filled to its natural banks (bankfull)."
                            )
                        })
                    ],
                    attributes: {
                        "legend": {
                            Component: FluvialFloodLegend
                        }
                    }
                })
            ]
        };
    }
}
