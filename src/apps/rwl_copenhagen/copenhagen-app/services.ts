// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";
import View from "ol/View.js";
// import { Map } from "ol";

// import { useEffect } from "react";
// import { useMap } from "@open-pioneer/map"; //hook to access map
// import { useMapLayer } from "@open-pioneer/map"; //hook to access layers
// import { Extent } from "ol/extent";
// import { Feature } from "ol";
// import { Layer } from "ol/layer";

export const MAP_ID1 = "main";
export const MAP_ID2 = "second";

//initialize view for shared views
export const view = new View({
    center: [1373573, 7503364],
    //extent: [615841, 6492318, 1077967, 6904205],
    zoom: 10,
    minZoom: 7,
    maxZoom: 20,
    constrainResolution: true,
    constrainOnlyCenter: true,
    projection: "EPSG:3857"
});

const Basemap = new SimpleLayer({
    title: "OpenStreetMap",
    olLayer: new TileLayer({
        source: new OSM(),
        properties: { title: "OSM" }
    }),
    isBaseLayer: true
});

const Basemap2 = new SimpleLayer({
    title: "OpenStreetMap",
    olLayer: new TileLayer({
        source: new OSM(),
        properties: { title: "OSM" }
    }),
    isBaseLayer: true
});

//////////////////////////
/// MAP_ID1 WMS LAYERS///
////////////////////////

const Coastal_100yPresent_wd_max = new SimpleLayer({
    title: "Coastal_100yPresent_wd_max",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "Coastal_100yPresent_wd_max"
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
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "Coastal_100ySSP2-4.5_wd_max"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const Coastal_2013Storm_wd_max = new SimpleLayer({
    title: "Coastal_2013Storm_wd_max",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "Coastal_2013Storm_wd_max"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const DMG_COAST094722 = new SimpleLayer({
    title: "DMG_COAST094722",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "DMG_COAST094722"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const WD_COAST093900 = new SimpleLayer({
    title: "WD_COAST093900",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "WD_COAST093900"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const WD_COAST094028 = new SimpleLayer({
    title: "WD_COAST094028",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "WD_COAST094028"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const WD_COAST094226 = new SimpleLayer({
    title: "WD_COAST094226",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "WD_COAST094226"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const WD_COAST094722 = new SimpleLayer({
    title: "WD_COAST094722",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "WD_COAST094722"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const WD_RIVER111745 = new SimpleLayer({
    title: "WD_RIVER111745",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "WD_RIVER111745"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const Barrier = new SimpleLayer({
    title: "Barrier",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "barrier"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const pluvial_100yPresent_wd_max = new SimpleLayer({
    title: "pluvial_100yPresent_wd_max",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "pluvial_100yPresent_wd_max"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const pluvial_100yRCP4_5_wd_max = new SimpleLayer({
    title: "pluvial_100yRCP4-5_wd_max",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "pluvial_100yRCP4-5_wd_max"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

//////////////////////////
/// MAP_ID2 WMS LAYERS///
////////////////////////

const Coastal_100yPresent_wd_max2 = new SimpleLayer({
    title: "Coastal_100yPresent_wd_max",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "Coastal_100yPresent_wd_max"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const Coastal_100ySSP2_4_5_wd_max2 = new SimpleLayer({
    title: "Coastal_100ySSP2-4.5_wd_max",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "Coastal_100ySSP2-4.5_wd_max"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const Coastal_2013Storm_wd_max2 = new SimpleLayer({
    title: "Coastal_2013Storm_wd_max",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "Coastal_2013Storm_wd_max"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const DMG_COAST094722_2 = new SimpleLayer({
    title: "DMG_COAST094722",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "DMG_COAST094722"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const WD_COAST093900_2 = new SimpleLayer({
    title: "WD_COAST093900",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "WD_COAST093900"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const WD_COAST094028_2 = new SimpleLayer({
    title: "WD_COAST094028",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "WD_COAST094028"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const WD_COAST094226_2 = new SimpleLayer({
    title: "WD_COAST094226",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "WD_COAST094226"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const WD_COAST094722_2 = new SimpleLayer({
    title: "WD_COAST094722",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "WD_COAST094722"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const WD_RIVER111745_2 = new SimpleLayer({
    title: "WD_RIVER111745",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "WD_RIVER111745"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const Barrier2 = new SimpleLayer({
    title: "Barrier",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "barrier"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const pluvial_100yPresent_wd_max2 = new SimpleLayer({
    title: "pluvial_100yPresent_wd_max",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "pluvial_100yPresent_wd_max"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const pluvial_100yRCP4_5_wd_max2 = new SimpleLayer({
    title: "pluvial_100yRCP4-5_wd_max",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://directed.dev.52north.org/geoserver/directed/wms",
            params: {
                LAYERS: "pluvial_100yRCP4-5_wd_max"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

// export const zoomToLayer = (map: MainMapProvider, layer: Layer) => {
//     const layerExtent = layer.getSource().getExtent();  // get extent of layer's source
//     map.getView().fit(layerExtent, { padding: [50, 50, 50, 50] });  // Zoom to layer extent with padding
// };

//////////////////////
/// MAPS FROM .tsx ///
/////////////////////

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
            layers: [
                Basemap,
                Coastal_100yPresent_wd_max,
                Coastal_100ySSP2_4_5_wd_max,
                Coastal_2013Storm_wd_max,
                DMG_COAST094722,
                WD_COAST093900,
                WD_COAST094028,
                WD_COAST094226,
                WD_COAST094722,
                WD_RIVER111745,
                Barrier,
                pluvial_100yPresent_wd_max,
                pluvial_100yRCP4_5_wd_max
            ],

            advanced: {
                view: view //add shared view
            }
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
            layers: [
                Basemap2,
                Coastal_100yPresent_wd_max2,
                Coastal_100ySSP2_4_5_wd_max2,
                Coastal_2013Storm_wd_max2,
                DMG_COAST094722_2,
                WD_COAST093900_2,
                WD_COAST094028_2,
                WD_COAST094226_2,
                WD_COAST094722_2,
                WD_RIVER111745_2,
                Barrier2,
                pluvial_100yPresent_wd_max2,
                pluvial_100yRCP4_5_wd_max2
            ],
            advanced: {
                view: view
            }
        };
    }
}
