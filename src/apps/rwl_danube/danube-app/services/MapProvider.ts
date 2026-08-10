// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { Vector as VectorLayer } from "ol/layer.js";
import { Vector as VectorSource } from "ol/source.js";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import GeoJSON from "ol/format/GeoJSON.js";
import TileWMS from "ol/source/TileWMS";
import { ComponentType } from "react";
import { ServiceOptions } from "@open-pioneer/runtime";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { GroupLayer, MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import { BuildingDamageLegend } from "../components/legends/BuildingDamageLegend";
import { FluvialFloodLegend } from "../components/legends/FluvialFloodLegend";
import { FluvialFloodReturnPeriodShiftLegend } from "../components/legends/FluvialFloodReturnPeriodShiftLegend";
import { LidarLegend } from "../components/legends/LidarLegend";
import { WaterLevelLegend } from "../components/legends/WaterLevelLegend";

interface Config {
    pygeoapiBaseUrl: string;
}

interface WmsLayerOptions {
    /** Layer name on the geoserver; also used as the layer id. */
    name: string;
    title: string;
    description: string;
    /** Consumed by the feature info component, e.g. "WMS_tiles" or "WMS_features". */
    type: string;
    visible?: boolean;
    legend?: ComponentType<LegendItemComponentProps>;
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

/**
 * Builds the initial layer tree of the map. The runtime asks for it once at startup via
 * `map.MapConfigProvider` and hands the result to the `MapRegistry`; there is no way to
 * change it from here afterwards.
 *
 * This file is not the whole map. Four other places add layers to the same model at
 * runtime, and none of them appear below:
 * - `IsimipHandler` adds and repeatedly retitles the "isimip" raster layer
 * - `GeosphereService` and `GeosphereForecastService` add their own raster layers
 * - `MapApp.tsx` adds the protected past-event layers, but only once a user is logged in
 *
 * Two data sources feed the layers here: WMS tiles from the geoserver, whose url is still
 * hardcoded in {@link MainMapProvider.createWmsLayer}, and GeoJSON from pygeoapi, which
 * follows the configured `pygeoapiBaseUrl`.
 *
 * Two conventions worth knowing before adding a layer:
 * - `olLayer.properties.type` ("WMS_tiles", "WMS_features", "GeoJSON", ...) is what the
 *   feature info component switches on -- get it wrong and clicking the layer does nothing.
 * - `attributes.legend.Component` is picked up by `@open-pioneer/legend`. It works on
 *   groups as well as on single layers; the pluvial flooding groups use that to share one
 *   legend across all their members.
 *
 * All titles and descriptions are english literals, so they stay english in the german and
 * hungarian builds. `ServiceOptions` carries an `intl` instance -- see the rhine-erft map
 * provider for what using it looks like.
 */
export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;
    pygeoapiBaseUrl: string;

    constructor(serviceOptions: ServiceOptions) {
        const config = serviceOptions.properties.userConfig as Partial<Config> | undefined;
        if (!config?.pygeoapiBaseUrl) {
            throw new Error("MainMapProvider requires a 'pygeoapiBaseUrl' in userConfig");
        }
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

    createWmsLayer({
        name,
        title,
        description,
        type,
        visible = false,
        legend
    }: WmsLayerOptions): SimpleLayer {
        return new SimpleLayer({
            id: name,
            title: title,
            description: description,
            visible: visible,
            olLayer: new TileLayer({
                source: new TileWMS({
                    url: "https://directed.dev.52north.org/geoserver/directed/wms",
                    params: {
                        LAYERS: name
                    }
                }),
                properties: {
                    title: title,
                    id: name,
                    type: type
                }
            }),
            isBaseLayer: false,
            ...(legend && { attributes: { legend: { Component: legend } } })
        });
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

        return layerNames.map((layer) =>
            this.createWmsLayer({
                ...layer,
                type: "WMS_features",
                legend: FluvialFloodReturnPeriodShiftLegend
            })
        );
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
                    id: "danube_basin_territorial_units",
                    title: "Crop Yield Projections",
                    description:
                        "Crop yield projections per Danube basin territorial unit. Territorial units are defined according to NUTS2 regions. Click on a region to open the crop chart.",
                    visible: false,
                    olLayer: new VectorLayer({
                        source: new VectorSource({
                            url: `${this.pygeoapiBaseUrl}/collections/danube_basin_territorial_units/items?f=json&limit=65`,
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
                        properties: { title: "Nuts regions", type: "GeoJSON" }
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
                                        ...wmsPluvialFloodingLayersRef.map((layer) =>
                                            this.createWmsLayer({ ...layer, type: "WMS_tiles" })
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
                                                ...wmsPluvialFloodingLayersSSP2452050.map((layer) =>
                                                    this.createWmsLayer({
                                                        ...layer,
                                                        type: "WMS_tiles"
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
                                                ...wmsPluvialFloodingLayersSSP5852050.map((layer) =>
                                                    this.createWmsLayer({
                                                        ...layer,
                                                        type: "WMS_tiles"
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
                                                ...wmsPluvialFloodingLayersSSP2452080.map((layer) =>
                                                    this.createWmsLayer({
                                                        ...layer,
                                                        type: "WMS_tiles"
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
                                                ...wmsPluvialFloodingLayersSSP5852080.map((layer) =>
                                                    this.createWmsLayer({
                                                        ...layer,
                                                        type: "WMS_tiles"
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
                                        this.createWmsLayer({
                                            name: "Vienna_lidar_2m_ViennaCenter_32633",
                                            title: "Lidar",
                                            description: "Lidar elevation map with 2 m resolution",
                                            type: "WMS_tiles",
                                            legend: LidarLegend
                                        }),
                                        this.createWmsLayer({
                                            name: "Vienna_OpenLandMap_SOL_SOL_CLAY-WFRACTION_USDA-3A1A1A_M_v02_162021",
                                            title: "Soil Clay Content",
                                            description: "Soil clay content",
                                            type: "WMS_tiles"
                                        }),
                                        this.createWmsLayer({
                                            name: "Vienna_OpenLandMap_SOL_SOL_SAND-WFRACTION_USDA-3A1A1A_M_v02_162021",
                                            title: "Soil Sand Content",
                                            description: "Soil sand content",
                                            type: "WMS_tiles"
                                        }),
                                        this.createWmsLayer({
                                            name: "osm_buildings_162014",
                                            title: "OSM Buildings",
                                            description: "OSM Buildings",
                                            type: "WMS_tiles"
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
                                        ...wmsLayersHistoricalFlooding.map((layer) =>
                                            this.createWmsLayer({ ...layer, type: "WMS_tiles" })
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
                                        ...wmsLayersHistoricalDamage.map((layer) =>
                                            this.createWmsLayer({ ...layer, type: "WMS_tiles" })
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
                        this.createWmsLayer({
                            name: "euh_danube_bigrivers_10",
                            title: "10-Year Flood Depth",
                            description:
                                "10-year flood depth from 1974 to 2023. The attribute 'b_flddph' denotes the flood depth in m. The flood depth is measured above the water level of the river which is filled to its natural banks (bankfull).",
                            type: "WMS_features",
                            visible: true,
                            legend: FluvialFloodLegend
                        })
                    ]
                }),
                this.createWmsLayer({
                    name: "euh_danube_wsurf_gt1km2_c",
                    title: "Reservoirs And Lakes",
                    description: "Large reservoirs and lakes in the Danube region",
                    type: "WMS_features"
                })
            ]
        };
    }
}
