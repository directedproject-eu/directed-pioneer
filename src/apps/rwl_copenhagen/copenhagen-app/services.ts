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
import { SviLegend } from "./Components/Legends/SviLegend";
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
                properties: { title: "Municipality Layer", type: "GeoJSON" }
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

        // Groundwater Layers
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
                    visible: true,
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

        const skades_test = layerFactory.create({
            type: SimpleLayer,
            id: "rwl1_skadesokonomi_mean_170cm",
            title: "Mean Flood Damage", 
            description: "Mean Flood Damage",
            visible: false,
            olLayer: new TileLayer({
                source: new TileWMS({
                    url: "https://directed.dev.52north.org/geoserver/directed/wms", 
                    params: {
                        "LAYERS": "rwl1_skadesokonomi_mean_170cm"
                    }
                }),
                properties: {
                    // title: intl.formatMessage({ id: "layers.maxNearSurfaceToday_title" }),
                    title: "Mean Flood Damage", 
                    id: "rwl1_skadesokonomi_mean_170cm",
                    type: "WMS_tiles"
                },
            }),
            attributes: {
                "legend": {
                    Component: WmsLegend
                }
            },
            isBaseLayer: false
        });

        // Social Vulnerability Index
        const svi_group = layerFactory.create({
            type: GroupLayer,
            id: "svi",
            title: "Social Vulnerability Index",
            description: "The Social Vulnerability Index (SVI) analyzes the socio-economic vulnerability of a given community to climate change. The tool does so by compiling census data for indicators such as housing quality, unemployment rate, and average education levels (amongst others) to conduct the analysis, and provides an index, or score, of socio-economic vulnerability for each census-defined area within a region of interest. See more at https://reachout-cities.eu/post_type_toolkit/social-vulnerability-tool/",
            visible: false,
            isBaseLayer: false,
            layers: [
                layerFactory.create({
                    type: SimpleLayer,
                    id: "frederiksssundSVI",
                    title: "SVI Frederikssund Municipality", 
                    description: "Social Vulnerability Index for Frederikssund Municipality",
                    visible: false,
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms", 
                            params: {
                                "LAYERS": "frederikssundSVI"
                            }
                        }),
                        properties: {
                            title: "SVI Frederikssund Municipality",
                            id: "frederiksssundSVI",
                            description: "Social Vulnerability Index for Frederikssund Municipality",
                            type: "WMS_tiles"
                        },
                    }),
                    attributes: {
                        "legend": {
                            Component: SviLegend
                        }
                    },
                    isBaseLayer: false
                }),
                layerFactory.create({
                    type: SimpleLayer,
                    id: "roskildeSVI",
                    title: "SVI Roskilde Fjord", 
                    description: "Social Vulnerability Index Roskilde Fjord",
                    visible: true,
                    olLayer: new TileLayer({
                        source: new TileWMS({
                            url: "https://directed.dev.52north.org/geoserver/directed/wms", 
                            params: {
                                "LAYERS": "roskildeSVI"
                            }
                        }),
                        properties: {
                            title: "SVI Roskilde Fjord",
                            id: "roskildeSVI", 
                            description: "Social Vulnerability Index Roskilde Fjord",
                            type: "WMS_tiles"
                        },
                    }),
                    attributes: {
                        "legend": {
                            Component: SviLegend
                        }
                    },
                    isBaseLayer: false
                })
            ]
        });

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
                skades_test, 
                svi_group
                // skadesokonomi
            ]
        };
    }
}

