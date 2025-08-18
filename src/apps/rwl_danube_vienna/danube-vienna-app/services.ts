// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { GroupLayer, MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";
import { BuildingDamageLegend } from "./Components/Legends/BuildingDamageLegend";
import { FluvialFloodLegend } from "./Components/Legends/FluvialFloodLegend";
import { LidarLegend } from "./Components/Legends/LidarLegend ";
import { WaterLevelLegend } from "./Components/Legends/WaterLevelLegend";
export { GeosphereServiceImpl } from "./services/GeosphereService";


const wmsLayersHistoricalFlooding = [
    {
        "name": "WD_RAIN172645",
        "title": "Pluvial Flooding (WD_RAIN172645)",
        "description": "Water depth caused by pluvial flooding"
    },
    {
        "name": "WD_RAIN110828",
        "title": "Pluvial Flooding (WD_RAIN110828)",
        "description": "Water depth caused by pluvial flooding"
    },
    {
        "name": "WD_RAIN095830",
        "title": "Pluvial Flooding (WD_RAIN095830)",
        "description": "Water depth caused by pluvial flooding"
    }
];

const wmsLayersHistoricalDamage = [
    {
        "name": "DMG_RIVER111745",
        "title": "Damage By Fluvial Flooding (DMG_RIVER111745)",
        "description": "Damage caused by fluvial flooding. This layer is only meant for demonstration purposes!"
    },
    {
        "name": "DMG_RAIN110828",
        "title": "Damage By Pluvial Flooding (DMG_RAIN110828)",
        "description": "Damage caused by pluvial flooding. This layer is only meant for demonstration purposes!"
    }
];

const wmsPluvialFloodingLayersRef = [
    {
        "name": "Vienna_WD_RAIN152452_Ref_RP25",
        "title": "Reference (1989-2018) - RP25 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - Reference period (1989-2018) - 25 years return period  - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164659_Ref_RP50",
        "title": "Reference (1989-2018) - RP50 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - Reference period (1989-2018) - 50 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164612_Ref_RP100",
        "title": "Reference (1989-2018) - RP100 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - Reference period (1989-2018) - 100 years return period - Vienna - Simulated with SaferPlaces"
    }
];

const wmsPluvialFloodingLayersSSP2452050 = [
    {
        "name": "Vienna_WD_RAIN164413_SSP245_RP25_2050",
        "title": "SSP245 - 2050 - RP25 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - SSP245 - 2050 - 25 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164745_SSP245_RP50_2050",
        "title": "SSP245 - 2050 - RP50 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - SSP245 - 2050 - 50 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164825_SSP245_RP100_2050",
        "title": "SSP245 - 2050 - RP100 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - SSP245 - 2050 - 100 years return period - Vienna - Simulated with SaferPlaces"
    }
];

const wmsPluvialFloodingLayersSSP5852050 = [
    {
        "name": "Vienna_WD_RAIN164413_SSP585_RP25_2050",
        "title": "SSP585 - 2050 - RP25 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - SSP585 - 2050 - 25 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164323_SSP585_RP50_2050",
        "title": "SSP585 - 2050 - RP50 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - SSP585 - 2050 - 50 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164223_SSP585_RP100_2050",
        "title": "SSP585 - 2050 - RP100 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - SSP585 - 2050 - 100 years return period - Vienna - Simulated with SaferPlaces"
    }
];

const wmsPluvialFloodingLayersSSP2452080 = [
    {
        "name": "Vienna_WD_RAIN164413_SSP245_RP25_2080",
        "title": "SSP245 - 2080 - RP25 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - SSP245 - 2080 - 25 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164323_SSP245_RP50_2080",
        "title": "SSP245 - 2080 - RP50 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - SSP245 - 2080 - 50 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164223_SSP245_RP100_2080",
        "title": "SSP245 - 2080 - RP100 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - SSP245 - 2080 - 100 years return period - Vienna - Simulated with SaferPlaces"
    }
];

const wmsPluvialFloodingLayersSSP5852080 = [
    {
        "name": "Vienna_WD_RAIN164323_SSP585_RP25_2080",
        "title": "SSP585 - 2080 - RP25 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - SSP585 - 2080 - 25 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164223_SSP585_RP50_2080",
        "title": "SSP585 - 2080 - RP50 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - SSP585 - 2080 - 50 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN115927_SSP585_RP100_2080",
        "title": "SSP585 - 2080 - RP100 - Vienna - SaferPlaces",
        "description": "Water depth caused by pluvial flooding - SSP585 - 2080 - 100 years return period - Vienna - Simulated with SaferPlaces"
    }
];


export const MAP_ID = "main";
export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

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
                    id: layerName
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
                center: { x: 1836934, y: 6145000 },
                zoom: 11
            },
            projection: "EPSG:3857",
            layers: [
                // Pluvial flood layers
                new GroupLayer({
                    title: "Pluvial Flooding",
                    visible: false,
                    id: "pluvial_flooding",
                    layers: [
                        // Reference
                        new GroupLayer({
                            title: "Reference (1989-2018)",
                            visible: false,
                            id: "pluvial_flooding_historical",
                            layers: [
                                ...wmsPluvialFloodingLayersRef.map(({ name, title, description }) =>
                                    new SimpleLayer({...this.createWmsLayer(name, title, description)})
                                )
                            ],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            }
                        }),
                        // 2050
                        new GroupLayer({
                            title: "2050",
                            visible: false,
                            id: "2050",
                            layers: [
                                // SSP245
                                new GroupLayer({
                                    title: "SSP245",
                                    visible: false,
                                    id: "2050_ssp245",
                                    layers: [
                                        ...wmsPluvialFloodingLayersSSP2452050.map(({ name, title, description }) =>
                                            new SimpleLayer({...this.createWmsLayer(name, title, description)})
                                        )
                                    ]
                                }),
                                // SSP585
                                new GroupLayer({
                                    title: "SSP585",
                                    visible: false,
                                    id: "2050_ssp585",
                                    layers: [
                                        ...wmsPluvialFloodingLayersSSP5852050.map(({ name, title, description }) =>
                                            new SimpleLayer({...this.createWmsLayer(name, title, description)})
                                        )
                                    ]
                                })
                            ],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            }
                        }),
                        // 2080
                        new GroupLayer({
                            title: "2080",
                            visible: false,
                            id: "2080",
                            layers: [
                                // SSP245
                                new GroupLayer({
                                    title: "SSP245",
                                    visible: false,
                                    id: "2080_ssp245",
                                    layers: [
                                        ...wmsPluvialFloodingLayersSSP2452080.map(({ name, title, description }) =>
                                            new SimpleLayer({...this.createWmsLayer(name, title, description)})
                                        )
                                    ]
                                }),
                                // SSP585
                                new GroupLayer({
                                    title: "SSP585",
                                    visible: false,
                                    id: "2080_ssp585",
                                    layers: [
                                        ...wmsPluvialFloodingLayersSSP5852080.map(({ name, title, description }) =>
                                            new SimpleLayer({...this.createWmsLayer(name, title, description)})
                                        )
                                    ]
                                })
                            ],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            }
                        }),
                        // Base data
                        new GroupLayer({
                            title: "Base Data",
                            visible: false,
                            id: "pluvial_flooding_base_data",
                            layers: [
                                new SimpleLayer(
                                    {
                                        ...this.createWmsLayer("Vienna_lidar_2m_ViennaCenter_32633", "Lidar", "Lidar elevation map with 2 m resolution"),
                                        attributes: {
                                            "legend": {
                                                Component: LidarLegend
                                            }
                                        },
                                    }
                                ),
                                new SimpleLayer({...this.createWmsLayer("Vienna_OpenLandMap_SOL_SOL_CLAY-WFRACTION_USDA-3A1A1A_M_v02_162021", "Soil Clay Content", "Soil clay content")}),
                                new SimpleLayer({...this.createWmsLayer("Vienna_OpenLandMap_SOL_SOL_SAND-WFRACTION_USDA-3A1A1A_M_v02_162021", "Soil Sand Content", "Soil sand content")}),
                                new SimpleLayer({...this.createWmsLayer("osm_buildings_162014", "OSM Buildings", "OSM Buildings")})
                            ]
                        })
                    ]
                }),
                // Fluvial flood layers
                new GroupLayer({
                    title: "Fluvial Flooding",
                    visible: false,
                    id: "fluvial_flooding",
                    layers: [
                        new SimpleLayer({...this.createWmsLayer(
                            "euh_danube_bigrivers_10",
                            "10-Year Flood Depth",
                            "10-year flood depth from 1974 to 2023. The attribute 'b_flddph' denotes the flood depth in m. The flood depth is measured above the water level of the river which is filled to its natural banks (bankfull)."
                        )})
                    ],
                    attributes: {
                        "legend": {
                            Component: FluvialFloodLegend
                        }
                    }
                }),
                // Historical layers
                new GroupLayer({
                    title: "Historical Layers",
                    visible: false,
                    id: "historical",
                    layers: [
                        new GroupLayer({
                            title: "Flooding",
                            visible: false,
                            id: "historical_flooding",
                            layers: [
                                ...wmsLayersHistoricalFlooding.map(({ name, title, description }) =>
                                    new SimpleLayer({...this.createWmsLayer(name, title, description)})
                                )
                            ],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            }
                        }),
                        new GroupLayer({
                            title: "Damage",
                            visible: false,
                            id: "historical_damage",
                            layers: [
                                ...wmsLayersHistoricalDamage.map(({ name, title, description }) =>
                                    new SimpleLayer({...this.createWmsLayer(name, title, description)})
                                )
                            ],
                            attributes: {
                                "legend": {
                                    Component: BuildingDamageLegend
                                }
                            }
                        })
                    ]
                }),
                new SimpleLayer({...this.createWmsLayer("euh_danube_wsurf_gt1km2_c", "Reservoirs And Lakes", "Large reservoirs and lakes in the Danube region")}),
                // OSM basemap
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