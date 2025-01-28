// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";
import View from "ol/View.js";
import { Map } from "ol";

export const MAP_ID1 = "main";
export const MAP_ID2 = "second";

const Basemap = new SimpleLayer({
    title: "OpenStreetMap",
    olLayer: new TileLayer({
        source: new OSM(),
        properties: { title: "OSM" }
    }),
    isBaseLayer: true
});

const Coastal_100yPresent_wd_max = new SimpleLayer({
    title: "Coastal_100yPresent_wd_max",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3ACoastal_100yPresent_wd_max&bbox=12.016743084733621%2C55.71812457936267%2C12.285471276223541%2C55.88158289836538&width=768&height=467&srs=EPSG%3A4326&styles=&format=application/openlayers",
            params: {
                LAYERS: "Coastal_100yPresent_wd_max",
                FORMAT: "image/png",
                TRANSPARENT: true
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const Coastal_100ySSP2_4_5_wd_max = new SimpleLayer({
    title: "Coastal_100ySSP2-4.5_wd_max",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3ACoastal_100ySSP2-4.5_wd_max&bbox=12.016743084733621%2C55.71812457936267%2C12.285471276223541%2C55.88158289836538&width=768&height=467&srs=EPSG%3A4326&styles=&format=application/openlayers",
            params: {
                LAYERS: "Coastal_100ySSP2-4.5_wd_max",
                FORMAT: "image/png",
                TRANSPARENT: true
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID1;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 1373573, y: 7503364 },
                zoom: 11
            },
            projection: "EPSG:3857",
            layers: [Basemap, Coastal_100yPresent_wd_max, Coastal_100ySSP2_4_5_wd_max]
        };
    }
}

export class SecondMapProvider implements MapConfigProvider {
    mapId = MAP_ID2;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 1373573, y: 7503364 },
                zoom: 11
            },
            projection: "EPSG:3857",
            layers: [Basemap, Coastal_100yPresent_wd_max]
        };
    }
}

//WORKING CODE
// export class MainMapProvider implements MapConfigProvider {
//     mapId = MAP_ID1;

//     async getMapConfig(): Promise<MapConfig> {
//         return {
//             initialView: {
//                 kind: "position",
//                 center: { x: 1373573, y: 7503364 },
//                 zoom: 11
//             },
//             projection: "EPSG:3857",
//             layers: [
//                 new SimpleLayer({
//                     title: "OpenStreetMap",
//                     olLayer: new TileLayer({
//                         source: new OSM(),
//                         properties: { title: "OSM" }
//                     }),
//                     isBaseLayer: true
//                 }),

//                 //WMS layer
//                 new SimpleLayer({
//                     title: "Coastal_100yPresent_wd_max",
//                     olLayer: new TileLayer({
//                         source: new TileWMS({
//                             url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3ACoastal_100yPresent_wd_max&bbox=12.016743084733621%2C55.71812457936267%2C12.285471276223541%2C55.88158289836538&width=768&height=467&srs=EPSG%3A4326&styles=&format=application/openlayers",
//                             params: {
//                                 LAYERS: "Coastal_100yPresent_wd_max",
//                                 FORMAT: "image/png",
//                                 TRANSPARENT: true
//                             }
//                         }),
//                         properties: { title: "WMS Layer" }
//                     }),
//                     isBaseLayer: false //WMS overlay
//                 }),

//                 //WMS layer
//                 new SimpleLayer({
//                     title: "Coastal_100ySSP2-4.5_wd_max",
//                     olLayer: new TileLayer({
//                         source: new TileWMS({
//                             url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3ACoastal_100ySSP2-4.5_wd_max&bbox=12.016743084733621%2C55.71812457936267%2C12.285471276223541%2C55.88158289836538&width=768&height=467&srs=EPSG%3A4326&styles=&format=application/openlayers",
//                             params: {
//                                 LAYERS: "Coastal_100ySSP2-4.5_wd_max",
//                                 FORMAT: "image/png",
//                                 TRANSPARENT: true
//                             }
//                         }),
//                         properties: { title: "WMS Layer" }
//                     }),
//                     isBaseLayer: false
//                 }),

//                 //WMS layer
//                 new SimpleLayer({
//                     title: "Coastal_2013Storm_wd_max",
//                     olLayer: new TileLayer({
//                         source: new TileWMS({
//                             url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3ACoastal_2013Storm_wd_max&bbox=12.016743084733621%2C55.71812457936267%2C12.285471276223541%2C55.88158289836538&width=768&height=467&srs=EPSG%3A4326&styles=&format=application/openlayers",
//                             params: {
//                                 LAYERS: "Coastal_2013Storm_wd_max",
//                                 FORMAT: "image/png",
//                                 TRANSPARENT: true
//                             }
//                         }),
//                         properties: { title: "WMS Layer" }
//                     }),
//                     isBaseLayer: false
//                 }),

//                 //WMS layer
//                 new SimpleLayer({
//                     title: "DMG_COAST094722",
//                     olLayer: new TileLayer({
//                         source: new TileWMS({
//                             url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3ADMG_COAST094722&bbox=1287693.1857324303%2C7479737.704753859%2C1362907.190430374%2C7553919.004624073&width=768&height=757&srs=EPSG%3A3857&styles=&format=application/openlayers",
//                             params: {
//                                 LAYERS: "DMG_COAST094722",
//                                 FORMAT: "image/png",
//                                 TRANSPARENT: true
//                             }
//                         }),
//                         properties: { title: "WMS Layer" }
//                     }),
//                     isBaseLayer: false
//                 }),

//                 //WMS layer
//                 new SimpleLayer({
//                     title: "WD_COAST093900",
//                     olLayer: new TileLayer({
//                         source: new TileWMS({
//                             url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3AWD_COAST093900&bbox=1287800.972736812%2C7479836.640522264%2C1362650.972736812%2C7553811.640522264&width=768&height=759&srs=EPSG%3A3857&styles=&format=application/openlayers",
//                             params: {
//                                 LAYERS: "WD_COAST093900",
//                                 FORMAT: "image/png",
//                                 TRANSPARENT: true
//                             }
//                         }),
//                         properties: { title: "WMS Layer" }
//                     }),
//                     isBaseLayer: false
//                 }),

//                 //WMS layer
//                 new SimpleLayer({
//                     title: "WD_COAST094028",
//                     olLayer: new TileLayer({
//                         source: new TileWMS({
//                             url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3AWD_COAST094028&bbox=1287800.972736812%2C7479836.640522264%2C1362650.972736812%2C7553811.640522264&width=768&height=759&srs=EPSG%3A3857&styles=&format=application/openlayers",
//                             params: {
//                                 LAYERS: "WD_COAST094028",
//                                 FORMAT: "image/png",
//                                 TRANSPARENT: true
//                             }
//                         }),
//                         properties: { title: "WMS Layer" }
//                     }),
//                     isBaseLayer: false
//                 }),

//                 //WMS layer
//                 new SimpleLayer({
//                     title: "WD_COAST094226",
//                     olLayer: new TileLayer({
//                         source: new TileWMS({
//                             url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3AWD_COAST094226&bbox=1287800.972736812%2C7479836.640522264%2C1362650.972736812%2C7553811.640522264&width=768&height=759&srs=EPSG%3A3857&styles=&format=application/openlayers",
//                             params: {
//                                 LAYERS: "WD_COAST094226",
//                                 FORMAT: "image/png",
//                                 TRANSPARENT: true
//                             }
//                         }),
//                         properties: { title: "WMS Layer" }
//                     }),
//                     isBaseLayer: false
//                 }),

//                 //WMS layer
//                 new SimpleLayer({
//                     title: "WD_COAST094722",
//                     olLayer: new TileLayer({
//                         source: new TileWMS({
//                             url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3AWD_COAST094722&bbox=1287800.972736812%2C7479836.640522264%2C1362650.972736812%2C7553811.640522264&width=768&height=759&srs=EPSG%3A3857&styles=&format=application/openlayers",
//                             params: {
//                                 LAYERS: "WD_COAST094722",
//                                 FORMAT: "image/png",
//                                 TRANSPARENT: true
//                             }
//                         }),
//                         properties: { title: "WMS Layer" }
//                     }),
//                     isBaseLayer: false
//                 }),

//                 //WMS layer
//                 new SimpleLayer({
//                     title: "WD_RIVER111745",
//                     olLayer: new TileLayer({
//                         source: new TileWMS({
//                             url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3AWD_RIVER111745&bbox=587472.0747955414%2C5329969.957611352%2C617495.1646648524%2C5353444.990786337&width=768&height=600&srs=EPSG%3A32633&styles=&format=application/openlayers",
//                             params: {
//                                 LAYERS: "WD_RIVER111745",
//                                 FORMAT: "image/png",
//                                 TRANSPARENT: true
//                             }
//                         }),
//                         properties: { title: "WMS Layer" }
//                     }),
//                     isBaseLayer: false
//                 }),

//                 //WMS layer
//                 new SimpleLayer({
//                     title: "Barrier",
//                     olLayer: new TileLayer({
//                         source: new TileWMS({
//                             url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3Abarrier&bbox=1341401.019713837%2C7524175.935643707%2C1343421.0929548196%2C7535184.378688389&width=330&height=768&srs=EPSG%3A3857&styles=&format=application/openlayers",
//                             params: {
//                                 LAYERS: "Barrier",
//                                 FORMAT: "image/png",
//                                 TRANSPARENT: true
//                             }
//                         }),
//                         properties: { title: "WMS Layer" }
//                     }),
//                     isBaseLayer: false
//                 }),

//                 //WMS layer
//                 new SimpleLayer({
//                     title: "pluvial_100yPresent_wd_max",
//                     olLayer: new TileLayer({
//                         source: new TileWMS({
//                             url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3Apluvial_100yPresent_wd_max&bbox=12.01681871253435%2C55.718121495920975%2C12.285483319382186%2C55.88157867174549&width=768&height=467&srs=EPSG%3A4326&styles=&format=application/openlayers",
//                             params: {
//                                 LAYERS: "pluvial_100yPresent_wd_max",
//                                 FORMAT: "image/png",
//                                 TRANSPARENT: true
//                             }
//                         }),
//                         properties: { title: "WMS Layer" }
//                     }),
//                     isBaseLayer: false
//                 }),

//                 //WMS layer
//                 new SimpleLayer({
//                     title: "pluvial_100yRCP4-5_wd_max",
//                     olLayer: new TileLayer({
//                         source: new TileWMS({
//                             url: "https://directed.dev.52north.org/geoserver/directed/wms?service=WMS&version=1.1.0&request=GetMap&layers=directed%3Apluvial_100yRCP4-5_wd_max&bbox=12.01681871253435%2C55.718121495920975%2C12.285483319382186%2C55.88157867174549&width=768&height=467&srs=EPSG%3A4326&styles=&format=application/openlayers",
//                             params: {
//                                 LAYERS: "pluvial_100yRCP4-5_wd_max",
//                                 FORMAT: "image/png",
//                                 TRANSPARENT: true
//                             }
//                         }),
//                         properties: { title: "WMS Layer" }
//                     }),
//                     isBaseLayer: false
//                 })
//             ]
//         };
//     }
// }
//END WORKING CODE
