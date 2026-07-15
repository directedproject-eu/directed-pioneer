// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { 
    MapConfig, 
    MapConfigProvider, 
    MapConfigProviderOptions, 
    SimpleLayer, 
    GroupLayer, 
    LayerFactory
} from "@open-pioneer/map";
import { ServiceOptions } from "@open-pioneer/runtime";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";
import WebGLTileLayer from "ol/layer/WebGLTile";
import GeoTIFF from "ol/source/GeoTIFF";
import { Vector as VectorLayer } from "ol/layer.js";
import { Vector as VectorSource } from "ol/source.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { Stroke, Style } from "ol/style";
import { WmsLegend } from "./Components/Legends/WmsLegend";
import { Tile } from "ol";


export const MAP_ID = "main";
export { LayerZoomImpl } from "./services/LayerZoom";
export { ForecastServiceImpl } from "./services/ForecastService";
export { FloodHandlerImpl } from "./services/FloodHandler";

interface Config {
    pygeoapiBaseUrl: string;
}

interface LayerGroupDefinition {
    [key: string]: string[] | LayerGroupDefinition;
}


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

    createMunicipalityLayer(layerFactory: LayerFactory, municipalityID: string) {
        return layerFactory.create({
            type: SimpleLayer,
            id: `${municipalityID}_municipality`,
            title: `${this.capitalizeFirstLetter(municipalityID)} municipality`,
            description: `This layer shows the boundaries of ${this.capitalizeFirstLetter(municipalityID)} municipality in the Copenhagen Capital Region of Denmark`,
            visible: true,
            olLayer: new VectorLayer({
                source: new VectorSource({
                    url: `${this.pygeoapiBaseUrl}/collections/denmark_municipalities/items/${municipalityID}?f=json`,
                    format: new GeoJSON()
                }),
                style: new Style({
                    stroke: new Stroke({
                        color: "#2e9ecc",
                        width: 3
                    })
                }),
                properties: { title: "GeoJSON Layer", type: "GeoJSON" }
            }),
            isBaseLayer: false
        });
    }

    
    async getMapConfig({layerFactory}: MapConfigProviderOptions): Promise<MapConfig> {

        const osm = layerFactory.create({
            type: SimpleLayer, 
            id: "osm", 
            title: "OpenStreetMap", 
            olLayer: new TileLayer({
                source: new OSM(),
                properties: { title: "OSM", type: "OSM" }
            }),
            isBaseLayer: true
        }); 

    
        const municipalities = ["frederikssund", "egedal", "halsnaes", "lejre", "roskilde"];

        const municipalityGroup = layerFactory.create({
            type: GroupLayer,
            id: "municipalities",
            title: "Municipalities",
            description: "Municipality boundaries in Roskilde Fjord",
            visible: true,
            layers: municipalities.map(id => this.createMunicipalityLayer(layerFactory, id))
        });


        const groundWaterGroup = layerFactory.create({
            type: GroupLayer,
            id: "groundwater",
            title: "Groundwater",
            description: "Groundwater layers via Dataforsyningen.",
            visible: false,
            isBaseLayer: false,
            layers: [
                layerFactory.create({
                    type: SimpleLayer,
                    id: "100m_rcp85_ff_median_phreatic_all_mean",
                    title: "Mean Change Near-Surface Groundwater 2071-2100",
                    description: "Mean change in near-surface groundwater in the future for the period 2071-2100. Data via Dataforsyningen",
                    // title: intl.formatMessage({ id: "layers.meanChangeNearSurface2071-2100_title" }),
                    // description: intl.formatMessage({ id: "layers.meanChangeNearSurface2071-2100_desc" }),
                    visible: false,
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://api.dataforsyningen.dk/wms/hip_dtg_10m_100m", 
                            params: {
                                "LAYERS": "100m_rcp85_ff_median_phreatic_all_mean", 
                                "token": "838abd17c582cd65b5c7e46e0f9bb582"
                            }
                        }),
                        properties: {
                            // title: intl.formatMessage({ id: "layers.meanChangeNearSurface2071-2100_title" }), 
                            title: "Mean Change Near-Surface Groundwater 2071-2100",
                            id: "100m_rcp85_ff_median_phreatic_all_mean",
                            type: "WMS_tiles"
                        },
                    }),
                    attributes: {
                        "legend": {
                            Component: WmsLegend
                        }
                    },
                    isBaseLayer: false
                }),
                layerFactory.create({
                    type: SimpleLayer,
                    id: "100m_rcp85_nf_median_phreatic_all_mean",
                    title: "Mean Change Near-Surface Groundwater 2041-2070",
                    description: "Mean change in near-surface groundwater in the future for the period 2041-2070. Data via Dataforsyningen",
                    // title: intl.formatMessage({ id: "layers.meanChangeNearSurface2041-2070_title" }),
                    // description: intl.formatMessage({ id: "layers.meanChangeNearSurface2041-2070_desc" }),
                    visible: false,
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://api.dataforsyningen.dk/wms/hip_dtg_10m_100m", 
                            params: {
                                "LAYERS": "100m_rcp85_nf_median_phreatic_all_mean", 
                                "token": "838abd17c582cd65b5c7e46e0f9bb582"
                            }
                        }),
                        properties: {
                            // title: intl.formatMessage({ id: "layers.meanChangeNearSurface2041-2070_title" }),
                            title: "Mean Change Near-Surface Groundwater 2041-2070",
                            id: "100m_rcp85_nf_median_phreatic_all_mean",
                            type: "WMS_tiles"
                        },
                    }),
                    attributes: {
                        "legend": {
                            Component: WmsLegend
                        }
                    },
                    isBaseLayer: false
                }),
                layerFactory.create({
                    type: SimpleLayer,
                    id: "10m_phreatic_summer",
                    title: "Maximum Near-Surface Groundwater Today", 
                    description: "Maximum near-surface groundwater today. Data via Dataforsyningen.",
                    // title: intl.formatMessage({ id: "layers.maxNearSurfaceToday_title" }),
                    // description: intl.formatMessage({ id: "layers.maxNearSurfaceToday_desc" }),
                    visible: false,
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://api.dataforsyningen.dk/wms/hip_dtg_10m_100m", 
                            params: {
                                "LAYERS": "10m_phreatic_summer", 
                                "token": "838abd17c582cd65b5c7e46e0f9bb582"
                            }
                        }),
                        properties: {
                            // title: intl.formatMessage({ id: "layers.maxNearSurfaceToday_title" }),
                            title: "Maximum Near-Surface Groundwater Today", 
                            id: "10m_phreatic_summer",
                            type: "WMS_tiles"
                        },
                    }),
                    attributes: {
                        "legend": {
                            Component: WmsLegend
                        }
                    },
                    isBaseLayer: false
                }),
                layerFactory.create({
                    type: SimpleLayer,
                    id: "10m_phreatic_winter",
                    title: "Minimum Near-Surface Groundwater Today", 
                    description: "Minimum near-surface groundwater today. Data via Dataforsyningen.",
                    // title: intl.formatMessage({ id: "layers.minNearSurfaceToday_title" }),
                    // description: intl.formatMessage({ id: "layers.minNearSurfaceToday_desc" }),
                    visible: false,
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://api.dataforsyningen.dk/wms/hip_dtg_10m_100m", 
                            params: {
                                "LAYERS": "10m_phreatic_winter", 
                                "token": "838abd17c582cd65b5c7e46e0f9bb582"
                            }
                        }),
                        properties: {
                            // title: intl.formatMessage({ id: "layers.minNearSurfaceToday_title" }),
                            title: "Minimum Near-Surface Groundwater Today",  
                            id: "10m_phreatic_winter",
                            type: "WMS_tiles"
                        },
                    }),
                    attributes: {
                        "legend": {
                            Component: WmsLegend
                        }
                    },
                    isBaseLayer: false
                })
            ]
        });

        // const skadesokonomi = layerFactory.create({
        //     type: SimpleLayer,
        //     id: "damage cost",
        //     title: "damage cost test",
        //     description: "damage cost layer",
        //     visible: false,
        //     isBaseLayer: false,
        //     olLayer: new WebGLTileLayer({
        //         source: new GeoTIFF({
        //             sources: [
        //                 {
        //                     url: "/cells_mean_170.tif"
        //                 }
        //             ]
        //         })
        //     })
        // });

        return {
            initialView: {
                kind: "position",
                center: { x: 1373573, y: 7503364 },
                zoom: 11
            },
            projection: "EPSG:3857",
            layers: [
                osm,
                municipalityGroup, 
                groundWaterGroup,
                skadesokonomi
            ]
        };
    }
}

