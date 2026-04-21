// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style"; // Zusammengefasster Import
import { Vector as VectorLayer } from "ol/layer.js";
import { Vector as VectorSource } from "ol/source.js";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import GeoJSON from "ol/format/GeoJSON.js";
import TileWMS from "ol/source/TileWMS";
import { ServiceOptions } from "@open-pioneer/runtime";
import { GroupLayer, MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import { BuildingDamageLegend } from "../components/legends/BuildingDamageLegend";
import { FluvialFloodLegend } from "../components/legends/FluvialFloodLegend";
import { FluvialFloodReturnPeriodShiftLegend } from "../components/legends/FluvialFloodReturnPeriodShiftLegend";
import { LidarLegend } from "../components/legends/LidarLegend ";
import { WaterLevelLegend } from "../components/legends/WaterLevelLegend";

interface Config {
    pygeoapiBaseUrl: string;
}

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
        "description":
            "Damage caused by fluvial flooding. This layer is only meant for demonstration purposes!"
    },
    {
        "name": "DMG_RAIN110828",
        "title": "Damage By Pluvial Flooding (DMG_RAIN110828)",
        "description":
            "Damage caused by pluvial flooding. This layer is only meant for demonstration purposes!"
    }
];

const wmsPluvialFloodingLayersRef = [
    {
        "name": "Vienna_WD_RAIN152452_Ref_RP25",
        "title": "Reference (1989-2018) - RP25 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - Reference period (1989-2018) - 25 years return period  - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164659_Ref_RP50",
        "title": "Reference (1989-2018) - RP50 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - Reference period (1989-2018) - 50 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164612_Ref_RP100",
        "title": "Reference (1989-2018) - RP100 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - Reference period (1989-2018) - 100 years return period - Vienna - Simulated with SaferPlaces"
    }
];

const wmsPluvialFloodingLayersSSP2452050 = [
    {
        "name": "Vienna_WD_RAIN164413_SSP245_RP25_2050",
        "title": "SSP245 - 2050 - RP25 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - SSP245 - 2050 - 25 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164745_SSP245_RP50_2050",
        "title": "SSP245 - 2050 - RP50 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - SSP245 - 2050 - 50 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164825_SSP245_RP100_2050",
        "title": "SSP245 - 2050 - RP100 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - SSP245 - 2050 - 100 years return period - Vienna - Simulated with SaferPlaces"
    }
];

const wmsPluvialFloodingLayersSSP5852050 = [
    {
        "name": "Vienna_WD_RAIN164413_SSP585_RP25_2050",
        "title": "SSP585 - 2050 - RP25 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - SSP585 - 2050 - 25 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164323_SSP585_RP50_2050",
        "title": "SSP585 - 2050 - RP50 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - SSP585 - 2050 - 50 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164223_SSP585_RP100_2050",
        "title": "SSP585 - 2050 - RP100 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - SSP585 - 2050 - 100 years return period - Vienna - Simulated with SaferPlaces"
    }
];

const wmsPluvialFloodingLayersSSP2452080 = [
    {
        "name": "Vienna_WD_RAIN164413_SSP245_RP25_2080",
        "title": "SSP245 - 2080 - RP25 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - SSP245 - 2080 - 25 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164323_SSP245_RP50_2080",
        "title": "SSP245 - 2080 - RP50 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - SSP245 - 2080 - 50 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164223_SSP245_RP100_2080",
        "title": "SSP245 - 2080 - RP100 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - SSP245 - 2080 - 100 years return period - Vienna - Simulated with SaferPlaces"
    }
];

const wmsPluvialFloodingLayersSSP5852080 = [
    {
        "name": "Vienna_WD_RAIN164323_SSP585_RP25_2080",
        "title": "SSP585 - 2080 - RP25 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - SSP585 - 2080 - 25 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN164223_SSP585_RP50_2080",
        "title": "SSP585 - 2080 - RP50 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - SSP585 - 2080 - 50 years return period - Vienna - Simulated with SaferPlaces"
    },
    {
        "name": "Vienna_WD_RAIN115927_SSP585_RP100_2080",
        "title": "SSP585 - 2080 - RP100 - Vienna - SaferPlaces",
        "description":
            "Water depth caused by pluvial flooding - SSP585 - 2080 - 100 years return period - Vienna - Simulated with SaferPlaces"
    }
];

export const MAP_ID = "main";
export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;
    pygeoapiBaseUrl: string;

    constructor(serviceOptions: ServiceOptions) {
        const config = serviceOptions.properties.userConfig as Config;
        this.pygeoapiBaseUrl = config.pygeoapiBaseUrl;
    }

    createForestryLayer() {
        const stationData = [
            { id: "bakonybel_2_ti5", lon: 17.7245, lat: 47.2501, name: "Bakonybél (2 TI5)" },
            {
                id: "bakonyszentlaszlo_erdeszet_hodo",
                lon: 17.8003,
                lat: 47.35,
                name: "Bakonyszentlászló (Hódo)"
            },
            { id: "csehbanya_20ep", lon: 17.6833, lat: 47.1833, name: "Csehbánya (20ÉP)" },
            { id: "devecser_59_d", lon: 17.4367, lat: 47.1064, name: "Devecser (59 D)" },
            {
                id: "devecseri_edeszet_sarosfo",
                lon: 17.3848,
                lat: 47.0554,
                name: "Sárosfő (Devecseri Erdészet)"
            },
            { id: "dorgicse_18_ey", lon: 17.7219, lat: 46.917, name: "Dörgicse (18 EY)" },
            {
                id: "keszthelyi_erdeszet_vallus",
                lon: 17.3092,
                lat: 46.8412,
                name: "Vállus (Keszthelyi Erdészet)"
            },
            { id: "kup_24_ti", lon: 17.4635, lat: 47.2477, name: "Kup (24 TI)" },
            { id: "saska_61_vf", lon: 17.4789, lat: 46.9358, name: "Sáska (61 VF)" },
            { id: "tuskevar_36_c", lon: 17.3167, lat: 47.1167, name: "Tüskevár (36 C)" },
            { id: "zalaerdod_29_a", lon: 17.1392, lat: 47.0564, name: "Zalaerdőd (29 A)" }
        ];

        const features = stationData.map((station) => {
            const feature = new Feature({
                geometry: new Point(fromLonLat([station.lon, station.lat]))
            });
            feature.set("locationId", station.id);
            feature.set("name", station.name);
            return feature;
        });

        return new SimpleLayer({
            id: "forestry_stations",
            title: "Forestry Stations",
            visible: false,
            description: "Displays the locations of regional forestry management stations.",
            olLayer: new VectorLayer({
                source: new VectorSource({
                    features: features
                }),
                style: new Style({
                    image: new CircleStyle({
                        radius: 8,
                        fill: new Fill({ color: "purple" }),
                        stroke: new Stroke({ color: "white", width: 2 })
                    })
                }),
                properties: { title: "Forestry Stations" }
            }),
            isBaseLayer: false
        });
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
                properties: { title: "GeoJSON Layer", type: "GeoJSON" }
            }),
            isBaseLayer: false
        });
        return regionLayer;
    }

    createWmsLayer(
        layerName: string,
        layerTitle: string,
        layerDescription: string,
        layerType: string,
        visible: boolean = false
    ) {
        const wmsLayerContent = {
            id: layerName,
            title: layerTitle,
            description: layerDescription,
            visible: visible,
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
                    type: layerType
                }
            }),
            isBaseLayer: false
        };
        return wmsLayerContent;
    }

    createReturnPeriodShiftLayers(ssp: string) {
        const layerNames = [
            {
                "name": `danube_flood_return_period_shifts_r010s_${ssp}`,
                "title": `Future return intervals - SSP ${ssp} - RP10`,
                "description": `Future average return intervals of 10-year flood events in the Danube River basin for the climate scenario ISIMIP SSP ${ssp} based on 10 CMIP6 realisations. Reference period: 2001-2030. Future period: 2061-2090.`
            },
            {
                "name": `danube_flood_return_period_shifts_r025s_${ssp}`,
                "title": `Future return intervals - SSP ${ssp} - RP25`,
                "description": `Future average return intervals of 25-year flood events in the Danube River basin for the climate scenario ISIMIP SSP ${ssp} based on 10 CMIP6 realisations. Reference period: 2001-2030. Future period: 2061-2090.`
            },
            {
                "name": `danube_flood_return_period_shifts_r050s_${ssp}`,
                "title": `Future return intervals - SSP ${ssp} - RP50`,
                "description": `Future average return intervals of 50-year flood events in the Danube River basin for the climate scenario ISIMIP SSP ${ssp} based on 10 CMIP6 realisations. Reference period: 2001-2030. Future period: 2061-2090.`
            },
            {
                "name": `danube_flood_return_period_shifts_r100s_${ssp}`,
                "title": `Future return intervals - SSP ${ssp} - RP100`,
                "description": `Future average return intervals of 100-year flood events in the Danube River basin for the climate scenario ISIMIP SSP ${ssp} based on 10 CMIP6 realisations. Reference period: 2001-2030. Future period: 2061-2090.`
            },
            {
                "name": `danube_flood_return_period_shifts_r250s_${ssp}`,
                "title": `Future return intervals - SSP ${ssp} - RP250`,
                "description": `Future average return intervals of 250-year flood events in the Danube River basin for the climate scenario ISIMIP SSP ${ssp} based on 10 CMIP6 realisations. Reference period: 2001-2030. Future period: 2061-2090.`
            }
        ];

        const layers = layerNames.map((layer) => {
            const l = new SimpleLayer({
                ...this.createWmsLayer(
                    layer.name,
                    layer.title,
                    layer.description,
                    "WMS_features",
                    false
                ),
                attributes: {
                    "legend": {
                        Component: FluvialFloodReturnPeriodShiftLegend
                    }
                }
            });
            return l;
        });
        return layers;
    }

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 2100000, y: 5890000 },
                zoom: 7
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

                new GroupLayer({
                    title: "Administrative boundaries",
                    visible: true,
                    id: "administrative_boundaries",
                    layers: [this.createRegionLayer("vienna"), this.createRegionLayer("zala")]
                }),
                                
                new SimpleLayer({
                    id: `nuts_layer`,
                    title: `Nuts regions`,
                    description: `test description`,
                    visible: true,
                    olLayer: new VectorLayer({
                        source: new VectorSource({
                            url: `http://localhost:5000/api/data/Nuts2/danube_basin_territorial_units.geojson`,
                        
                            format: new GeoJSON()
                        }),
                        style: new Style({
                            fill: new Fill({
                                color: "rgba(46, 158, 204, 0.5)" 
                            }),
                            stroke: new Stroke({
                                color: "black",
                                width: 3
                            })
                        }),
                        properties: { title: "Nuts_regions", type: "GeoJSON" }
                    }),
                    isBaseLayer: false
                }),


                this.createForestryLayer(),

                new GroupLayer({
                    title: "Vienna",
                    visible: false,
                    id: "vienna",
                    layers: [
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
                                        ...wmsPluvialFloodingLayersRef.map(
                                            ({ name, title, description }) =>
                                                new SimpleLayer({
                                                    ...this.createWmsLayer(
                                                        name,
                                                        title,
                                                        description,
                                                        "WMS_tiles"
                                                    )
                                                })
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
                                                ...wmsPluvialFloodingLayersSSP2452050.map(
                                                    ({ name, title, description }) =>
                                                        new SimpleLayer({
                                                            ...this.createWmsLayer(
                                                                name,
                                                                title,
                                                                description,
                                                                "WMS_tiles"
                                                            )
                                                        })
                                                )
                                            ]
                                        }),
                                        // SSP585
                                        new GroupLayer({
                                            title: "SSP585",
                                            visible: false,
                                            id: "2050_ssp585",
                                            layers: [
                                                ...wmsPluvialFloodingLayersSSP5852050.map(
                                                    ({ name, title, description }) =>
                                                        new SimpleLayer({
                                                            ...this.createWmsLayer(
                                                                name,
                                                                title,
                                                                description,
                                                                "WMS_tiles"
                                                            )
                                                        })
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
                                                ...wmsPluvialFloodingLayersSSP2452080.map(
                                                    ({ name, title, description }) =>
                                                        new SimpleLayer({
                                                            ...this.createWmsLayer(
                                                                name,
                                                                title,
                                                                description,
                                                                "WMS_tiles"
                                                            )
                                                        })
                                                )
                                            ]
                                        }),
                                        // SSP585
                                        new GroupLayer({
                                            title: "SSP585",
                                            visible: false,
                                            id: "2080_ssp585",
                                            layers: [
                                                ...wmsPluvialFloodingLayersSSP5852080.map(
                                                    ({ name, title, description }) =>
                                                        new SimpleLayer({
                                                            ...this.createWmsLayer(
                                                                name,
                                                                title,
                                                                description,
                                                                "WMS_tiles"
                                                            )
                                                        })
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
                                        new SimpleLayer({
                                            ...this.createWmsLayer(
                                                "Vienna_lidar_2m_ViennaCenter_32633",
                                                "Lidar",
                                                "Lidar elevation map with 2 m resolution",
                                                "WMS_tiles"
                                            ),
                                            attributes: {
                                                "legend": {
                                                    Component: LidarLegend
                                                }
                                            }
                                        }),
                                        new SimpleLayer({
                                            ...this.createWmsLayer(
                                                "Vienna_OpenLandMap_SOL_SOL_CLAY-WFRACTION_USDA-3A1A1A_M_v02_162021",
                                                "Soil Clay Content",
                                                "Soil clay content",
                                                "WMS_tiles"
                                            )
                                        }),
                                        new SimpleLayer({
                                            ...this.createWmsLayer(
                                                "Vienna_OpenLandMap_SOL_SOL_SAND-WFRACTION_USDA-3A1A1A_M_v02_162021",
                                                "Soil Sand Content",
                                                "Soil sand content",
                                                "WMS_tiles"
                                            )
                                        }),
                                        new SimpleLayer({
                                            ...this.createWmsLayer(
                                                "osm_buildings_162014",
                                                "OSM Buildings",
                                                "OSM Buildings",
                                                "WMS_tiles"
                                            )
                                        })
                                    ]
                                })
                            ]
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
                                        ...wmsLayersHistoricalFlooding.map(
                                            ({ name, title, description }) =>
                                                new SimpleLayer({
                                                    ...this.createWmsLayer(
                                                        name,
                                                        title,
                                                        description,
                                                        "WMS_tiles"
                                                    )
                                                })
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
                                        ...wmsLayersHistoricalDamage.map(
                                            ({ name, title, description }) =>
                                                new SimpleLayer({
                                                    ...this.createWmsLayer(
                                                        name,
                                                        title,
                                                        description,
                                                        "WMS_tiles"
                                                    )
                                                })
                                        )
                                    ],
                                    attributes: {
                                        "legend": {
                                            Component: BuildingDamageLegend
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                }),

                // Fluvial flood layers
                new GroupLayer({
                    title: "Fluvial Flooding",
                    visible: true,
                    id: "fluvial_flooding",
                    layers: [
                        new GroupLayer({
                            title: "Future average return intervals",
                            visible: false,
                            id: "fluvial_flooding_future_return_intervals",
                            layers: [
                                new GroupLayer({
                                    title: "SSP 370",
                                    visible: false,
                                    id: "fluvial_flooding_future_return_intervals_ssp370",
                                    layers: [...this.createReturnPeriodShiftLayers("370")]
                                }),
                                new GroupLayer({
                                    title: "SSP 585",
                                    visible: false,
                                    id: "fluvial_flooding_future_return_intervals_ssp585",
                                    layers: [...this.createReturnPeriodShiftLayers("585")]
                                })
                            ]
                        }),
                        new SimpleLayer({
                            ...this.createWmsLayer(
                                "euh_danube_bigrivers_10",
                                "10-Year Flood Depth",
                                "10-year flood depth from 1974 to 2023. The attribute 'b_flddph' denotes the flood depth in m. The flood depth is measured above the water level of the river which is filled to its natural banks (bankfull).",
                                "WMS_features",
                                true
                            ),
                            attributes: {
                                "legend": {
                                    Component: FluvialFloodLegend
                                }
                            }
                        })
                    ]
                }),
                new SimpleLayer({
                    ...this.createWmsLayer(
                        "euh_danube_wsurf_gt1km2_c",
                        "Reservoirs And Lakes",
                        "Large reservoirs and lakes in the Danube region",
                        "WMS_features"
                    )
                })
            ]
        };
    }
}
