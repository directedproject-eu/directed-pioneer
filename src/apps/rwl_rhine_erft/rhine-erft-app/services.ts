// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";
import { WmsLegend } from "./Components/Legends/WMSLegend";

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

const description_bkg = `The layer is provided by the Federal Agency for Cartography and Geodesy (BKG) and shows simulation results of potential heavy rainfall scenarios. More information can be found online via https://gdz.bkg.bund.de/index.php/default/wms-hinweiskarte-starkregengefahren-wms-starkregen.html.`;
const description_geobasis_nrw = `The layer is provided by the District Council Cologne. More information can be found online via https://www.bezreg-koeln.nrw.de/geobasis-nrw/webdienste/geodatendienste.`;

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
    layerConfigs: WmsLayerOptions[] = [
        {
            title: "Heavy rain - flow velocity (extraordinary)",
            description: description_bkg,
            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
            layerName: "nw_geschw_agw",
            propertyTitle: "NW Geschwindigkeiten AGW",
            id: "nw_geschw_agw",
            sourceDomain: "geodatenzentrum"
        },
        {
            title: "Heavy rain - flow velocity (extreme)",
            description: description_bkg,
            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
            layerName: "nw_geschw_extrem",
            propertyTitle: "NW Geschwindigkeiten Extrem",
            id: "nw_geschw_extrem",
            sourceDomain: "geodatenzentrum"
        },
        {
            title: "Heavy rain - water depth (extreme)",
            visible: true, // Kept this as true based on your original code
            description: description_bkg,
            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
            layerName: "nw_tiefe_extrem",
            propertyTitle: "NW Tiefe Extrem",
            id: "nw_tiefe_extrem",
            sourceDomain: "geodatenzentrum"
        },
        {
            title: "Heavy rain - water depth (extraordinary)",
            description: description_bkg,
            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
            layerName: "nw_tiefe_agw",
            propertyTitle: "NW Tiefe AGW",
            id: "nw_tiefe_agw",
            sourceDomain: "geodatenzentrum"
        },
        {
            title: "Digital Terrain Model - overview",
            description: description_geobasis_nrw,
            url: "https://www.wms.nrw.de/geobasis/wms_nw_dhm-uebersicht",
            layerName: "nw_dhm-uebersicht_planung_2024-2028",
            propertyTitle: "DHM Overview",
            id: "dhm_ubersicht",
            sourceDomain: "wms.nrw"
        },
        {
            title: "Terrain Slope",
            description: description_geobasis_nrw,
            url: "https://www.wms.nrw.de/geobasis/wms_nw_gelaendeneigung",
            layerName: "nw_gelaendeneigung_10",
            propertyTitle: "Terrain Snice",
            id: "terrain_snice",
            sourceDomain: "wms.nrw"
        },
        {
            title: "Terrain Steps",
            description: description_geobasis_nrw,
            url: "https://www.wms.nrw.de/geobasis/wms_nw_gelaendestufen",
            layerName: "nw_gelaendestufen",
            propertyTitle: "Terrain Steps",
            id: "terrain_steps",
            sourceDomain: "wms.nrw"
        },
        {
            title: "Terrain Shading",
            description: description_geobasis_nrw,
            url: "https://www.wms.nrw.de/geobasis/wms_nw_dgm-schummerung",
            layerName: "nw_dgm-schummerung_col_ne",
            propertyTitle: "Terrain Shading",
            id: "terrain_shading",
            sourceDomain: "wms.nrw"
        },
        {
            title: "Digital Terrain Model - elevation layers",
            description: description_geobasis_nrw,
            url: "https://www.wms.nrw.de/geobasis/wms_nw_hoehenschichten",
            layerName: "nw_hoehenschichten_rgb",
            propertyTitle: "Height",
            id: "height",
            sourceDomain: "wms.nrw"
        }
    ];


    createWmsLayer({title,layerName,propertyTitle,id,url,description,sourceDomain,visible = false}: WmsLayerOptions): SimpleLayer 
    { 
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

                // 2. Spread the dynamically generated layers into this array
                ...this.layerConfigs.map(config => this.createWmsLayer(config))
            ]
        };
    }
}
