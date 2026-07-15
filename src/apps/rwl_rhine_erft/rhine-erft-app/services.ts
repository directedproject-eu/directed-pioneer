// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import WebGLTileLayer from "ol/layer/WebGLTile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";
import { GeoTIFF } from "ol/source";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { FunctionComponent } from "react";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { WmsLegend } from "./Components/Legends/WMSLegend";
import { WaterDepthLegend } from "./Components/Legends/WaterDepthLegend";
import { FlowVelocityLegend } from "./Components/Legends/FlowVelocityLegend";
import { ServiceOptions } from "@open-pioneer/runtime";
import { buildColorGradient, GeoTiffColorStop } from "./config/geotiffStyle";
import {
    SOURCE_PROJECTION,
    NODATA,
    waterDepthColorMap,
    buildMaxUrl as buildDepthMaxUrl
} from "./config/floodDepth";
import { flowVelocityColorMap, buildVelocityMaxUrl } from "./config/flowVelocity";

// EPSG:25832 (UTM 32N) registrieren, damit die statischen GeoTIFF-Max-Layer korrekt
// nach EPSG:3857 reprojiziert werden (idempotent; die GeoTIFF-Services tun dasselbe).
proj4.defs(
    SOURCE_PROJECTION,
    "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);
register(proj4);

// Service-Implementierungen, die in build.config.mjs registriert sind, müssen aus
// dieser zentralen services.ts (re-)exportiert werden, damit der Pioneer-Build sie findet.
export { FloodDepthServiceImpl } from "./services/FloodDepthService";
export { FlowVelocityServiceImpl } from "./services/FlowVelocityService";

export const MAP_ID = "main";


export interface WmsLayerOptions {
    title: string;
    layerName: string;
    propertyTitle: string;
    id: string;
    url: string;
    description: string;
    sourceDomain: string;
    visible?: boolean;
}

/** Konfiguration eines statischen GeoTIFF-Layers (z.B. maximale Wassertiefe/Geschwindigkeit). */
export interface GeoTiffLayerConfig {
    id: string;
    title: string;
    description: string;
    url: string;
    colorMap: GeoTiffColorStop[];
    LegendComponent: FunctionComponent<LegendItemComponentProps>;
}

///////////////////
/// WMS LAYERS ///
/////////////////

// starkregen groups
// const Fliessgeschwindigkeit_Ausser = new GroupLayer({
//     title: "Fliessgeschwindigkeit Außergewönlich",
//     visible: false,
//     id: "stark_regen1",
//     layers: [starkregen_nw_geschw_agw],
//     attributes: {
//         "legend": {
//             Component: WmsLegend
//         }
//     }
// });

// const Fliessgeschwindigkeit_Extrem = new GroupLayer({
//     title: "Fliessgeschwindigkeit extremes",
//     visible: false,
//     id: "stark_regen2",
//     layers: [starkregen_nw_geschw_extrem],
//     attributes: {
//         "legend": {
//             Component: WmsLegend
//         }
//     }
// });

// const Ueberflutungstiefe_Ausser = new GroupLayer({
//     title: "Überflutungstiefe Außergewöhnlich",
//     visible: false,
//     id: "stark_regen3",
//     layers: [starkregen_nw_tiefe_agw],
//     attributes: {
//         "legend": {
//             Component: WmsLegend
//         }
//     }
// });

// const Ueberflutungstiefe_Extrem = new GroupLayer({
//     title: "Überflutungstiefe extremes",
//     visible: true,
//     id: "stark_regen4",
//     layers: [starkregen_nw_tiefe_extrem],
//     attributes: {
//         "legend": {
//             Component: WmsLegend
//         }
//     }
// });

//district gov köln layers

///////////////
/// MAP_ID ///
/////////////

export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;
    layerConfigs: WmsLayerOptions[];
    geoTiffLayers: GeoTiffLayerConfig[];

    constructor(options: ServiceOptions) {
        const intl = options.intl;

        this.layerConfigs = [
            {
                title: intl.formatMessage({ id: "legends.flow_velocity.extraordinary" }),
                description: intl.formatMessage({ id: "legends.descriptions.bkg" }),
                url: "https://sgx.geodatenzentrum.de/wms_starkregen",
                layerName: "nw_geschw_agw",
                propertyTitle: "NW Geschwindigkeiten AGW",
                id: "nw_geschw_agw",
                sourceDomain: "geodatenzentrum"
            },
            {
                title: intl.formatMessage({ id: "legends.flow_velocity.extreme" }),
                description: intl.formatMessage({ id: "legends.descriptions.bkg" }),
                url: "https://sgx.geodatenzentrum.de/wms_starkregen",
                layerName: "nw_geschw_extrem",
                propertyTitle: "NW Geschwindigkeiten Extrem",
                id: "nw_geschw_extrem",
                sourceDomain: "geodatenzentrum"
            },
            {
                title: intl.formatMessage({ id: "legends.water_depth.extreme" }),
                visible: true, 
                description: intl.formatMessage({ id: "legends.descriptions.bkg" }),
                url: "https://sgx.geodatenzentrum.de/wms_starkregen",
                layerName: "nw_tiefe_extrem",
                propertyTitle: "NW Tiefe Extrem",
                id: "nw_tiefe_extrem",
                sourceDomain: "geodatenzentrum"
            },
            {
                title: intl.formatMessage({ id: "legends.water_depth.extraordinary" }),
                description: intl.formatMessage({ id: "legends.descriptions.bkg" }),
                url: "https://sgx.geodatenzentrum.de/wms_starkregen",
                layerName: "nw_tiefe_agw",
                propertyTitle: "NW Tiefe AGW",
                id: "nw_tiefe_agw",
                sourceDomain: "geodatenzentrum"
            },
            {
                title: intl.formatMessage({ id: "legends.terrain.model_overview" }),
                description: intl.formatMessage({ id: "legends.descriptions.geobasis_nrw" }),
                url: "https://www.wms.nrw.de/geobasis/wms_nw_dhm-uebersicht",
                layerName: "nw_dhm-uebersicht_planung_2024-2028",
                propertyTitle: "DHM Overview",
                id: "dhm_ubersicht",
                sourceDomain: "wms.nrw"
            },
            {
                title: intl.formatMessage({ id: "legends.terrain.slope" }),
                description: intl.formatMessage({ id: "legends.descriptions.geobasis_nrw" }),
                url: "https://www.wms.nrw.de/geobasis/wms_nw_gelaendeneigung",
                layerName: "nw_gelaendeneigung_10",
                propertyTitle: "Terrain Slope",
                id: "terrain_slope",
                sourceDomain: "wms.nrw"
            },
            {
                title: intl.formatMessage({ id: "legends.terrain.steps" }),
                description: intl.formatMessage({ id: "legends.descriptions.geobasis_nrw" }),
                url: "https://www.wms.nrw.de/geobasis/wms_nw_gelaendestufen",
                layerName: "nw_gelaendestufen",
                propertyTitle: "Terrain Steps",
                id: "terrain_steps",
                sourceDomain: "wms.nrw"
            },
            {
                title: intl.formatMessage({ id: "legends.terrain.shading" }),
                description: intl.formatMessage({ id: "legends.descriptions.geobasis_nrw" }),
                url: "https://www.wms.nrw.de/geobasis/wms_nw_dgm-schummerung",
                layerName: "nw_dgm-schummerung_col_ne",
                propertyTitle: "Terrain Shading",
                id: "terrain_shading",
                sourceDomain: "wms.nrw"
            },
            {
                title: intl.formatMessage({ id: "legends.terrain.model_elevation" }),
                description: intl.formatMessage({ id: "legends.descriptions.geobasis_nrw" }),
                url: "https://www.wms.nrw.de/geobasis/wms_nw_hoehenschichten",
                layerName: "nw_hoehenschichten_rgb",
                propertyTitle: "Height",
                id: "height",
                sourceDomain: "wms.nrw"
            }
        ];

        // Statische GeoTIFF-Layer: Maximum über den gesamten Simulationszeitraum
        // (unabhängig vom Timeslider). Teilen Farbskala und Legende mit der jeweiligen Zeitreihe.
        this.geoTiffLayers = [
            {
                id: "flood_depth_max",
                title: intl.formatMessage({ id: "flood_depth_max.layer_title" }),
                description: intl.formatMessage({ id: "flood_depth_max.layer_description" }),
                url: buildDepthMaxUrl(),
                colorMap: waterDepthColorMap,
                LegendComponent: WaterDepthLegend
            },
            {
                id: "flow_velocity_max",
                title: intl.formatMessage({ id: "flow_velocity_max.layer_title" }),
                description: intl.formatMessage({ id: "flow_velocity_max.layer_description" }),
                url: buildVelocityMaxUrl(),
                colorMap: flowVelocityColorMap,
                LegendComponent: FlowVelocityLegend
            }
        ];
    }

    createWmsLayer({title,layerName,propertyTitle,id,url,description,sourceDomain,visible = false}: WmsLayerOptions): SimpleLayer { 
        return new SimpleLayer({
            title: title,
            visible: visible,
            description: description,
            olLayer: new TileLayer({
                source: new TileWMS({
                    url: url,
                    params: {
                        LAYERS: layerName
                    }
                }),
                properties: {
                    title: propertyTitle,
                    id: id,
                    type: "WMS_tiles",
                    source_domain: sourceDomain
                }
            }),
            attributes: {
                "legend": {
                    Component: WmsLegend
                }
            },
            isBaseLayer: false
        });
    }

    createGeoTiffLayer({
        id,
        title,
        description,
        url,
        colorMap,
        LegendComponent
    }: GeoTiffLayerConfig): SimpleLayer {
        return new SimpleLayer({
            id: id,
            title: title,
            description: description,
            visible: false,
            isBaseLayer: false,
            olLayer: new WebGLTileLayer({
                source: new GeoTIFF({
                    projection: SOURCE_PROJECTION,
                    normalize: false,
                    sources: [{ url: url, nodata: NODATA }]
                }),
                style: {
                    color: buildColorGradient(colorMap)
                },
                properties: {
                    title: title,
                    id: id,
                    type: "GeoTIFF"
                }
            }),
            attributes: {
                "legend": {
                    Component: LegendComponent
                }
            }
        });
    }

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
                        properties: { title: "OSM", type: "OSM" }
                    }),
                    isBaseLayer: true
                }),
                ...this.layerConfigs.map(config => this.createWmsLayer(config)),
                ...this.geoTiffLayers.map(config => this.createGeoTiffLayer(config))
            ]
        };
    }
}
