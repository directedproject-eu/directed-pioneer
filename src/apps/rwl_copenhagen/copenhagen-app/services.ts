// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import { ServiceOptions } from "@open-pioneer/runtime";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";
// import { Map } from "ol";

// import { useEffect } from "react";
// import { useMap } from "@open-pioneer/map"; //hook to access map
// import { useMapLayer } from "@open-pioneer/map"; //hook to access layers
// import { Extent } from "ol/extent";
// import { Feature } from "ol";
// import { Layer } from "ol/layer";
// import View from "ol/View.js";
import { Vector as VectorLayer } from "ol/layer.js";
import { Vector as VectorSource } from "ol/source.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { Stroke, Style } from "ol/style";

export const MAP_ID1 = "main";
// export const MAP_ID2 = "second";
export { LayerZoomImpl } from "./services/LayerZoom";

//initialize view for shared views
// export const view = new View({
//     center: [1373573, 7503364],
//     //extent: [615841, 6492318, 1077967, 6904205],
//     zoom: 10,
//     minZoom: 7,
//     maxZoom: 20,
//     constrainResolution: true,
//     constrainOnlyCenter: true,
//     projection: "EPSG:3857"
// });

const Basemap = new SimpleLayer({
    id: "osm",
    title: "OpenStreetMap",
    olLayer: new TileLayer({
        source: new OSM(),
        properties: { title: "OSM" }
    }),
    isBaseLayer: true
});

// const Basemap2 = new SimpleLayer({
//     title: "OpenStreetMap",
//     olLayer: new TileLayer({
//         source: new OSM(),
//         properties: { title: "OSM" }
//     }),
//     isBaseLayer: true
// });

//////////////////////////
/// MAP_ID1 WMS LAYERS///
////////////////////////

const Coastal_100yPresent_wd_max = new SimpleLayer({
    id: "coastal_100ypresent_wd_max",
    title: "Coastal Flooding Present",
    description:
        "This layer shows a 100 year coastal flooding event under current climate conditions",
    visible: false,
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
    id: "coastal_100yssp2-4_5_wd_max",
    title: "Coastal Flooding SSP4.5",
    description:
        "This layer shows a 100 year coastal flooding event under SSP4.5 (Shared Socioeconomic Projection with 4.5°C global warming) ",
    visible: false,
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
    id: "coastal_2013storm_wd_max",
    title: "Coastal Flooding Storm Bodil 2013",
    description: "This layer shows the flooding which occurred during the 2013 Storm Bodil event",
    visible: false,
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
    id: "dmg_coast094722",
    title: "Coastal Damage 094722",
    description: "This layer shows the damages incurred by a coastal flooding event",
    visible: false,
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
    id: "wd_coast093900",
    title: "Coastal Flood 093900",
    description: "This layer shows a coastal flooding event",
    visible: false,
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
    id: "wd_coast094028",
    title: "Coastal Flood 094028",
    description: "This layer shows a coastal flooding event",
    visible: false,
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
    id: "wd_coast094226",
    title: "Coastal Flooding 094226",
    description: "This layer shows a coastal flooding event",
    visible: false,
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
    id: "wd_coast094722",
    title: "Coastal Flooding 094722 ",
    description: "This layer shows coastal flooding",
    visible: false,
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
    id: "wd_river111745",
    title: "River Flooding 111745",
    description: "This layer shows river flooding",
    visible: false,
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
    id: "barrier",
    title: "Barrier",
    description: "This layer shows a barrier placed in a coastal flooding event",
    visible: false,
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
    id: "pluvial_100ypresent_wd_max",
    title: "Pluvial Flooding Present",
    description: "This layer shows a pluvial flooding event under current climate conditions",
    visible: false,
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
    id: "pluvial_100yrcp4-5_wd_max",
    title: "Pluvial Flooding RCP4.5",
    description:
        "This layer shows a 100 year pluvial flooding event under RCP4.5 (Representative Concentration Pathways with 4.5°C global warming)",
    visible: false,
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

// const Coastal_100yPresent_wd_max2 = new SimpleLayer({
//     title: "Coastal_100yPresent_wd_max",
//     olLayer: new TileLayer({
//         source: new TileWMS({
//             url: "https://directed.dev.52north.org/geoserver/directed/wms",
//             params: {
//                 LAYERS: "Coastal_100yPresent_wd_max"
//             }
//         }),
//         properties: { title: "WMS Layer" }
//     }),
//     isBaseLayer: false
// });

// const Coastal_100ySSP2_4_5_wd_max2 = new SimpleLayer({
//     title: "Coastal_100ySSP2-4.5_wd_max",
//     olLayer: new TileLayer({
//         source: new TileWMS({
//             url: "https://directed.dev.52north.org/geoserver/directed/wms",
//             params: {
//                 LAYERS: "Coastal_100ySSP2-4.5_wd_max"
//             }
//         }),
//         properties: { title: "WMS Layer" }
//     }),
//     isBaseLayer: false
// });

// const Coastal_2013Storm_wd_max2 = new SimpleLayer({
//     title: "Coastal_2013Storm_wd_max",
//     olLayer: new TileLayer({
//         source: new TileWMS({
//             url: "https://directed.dev.52north.org/geoserver/directed/wms",
//             params: {
//                 LAYERS: "Coastal_2013Storm_wd_max"
//             }
//         }),
//         properties: { title: "WMS Layer" }
//     }),
//     isBaseLayer: false
// });

// const DMG_COAST094722_2 = new SimpleLayer({
//     title: "DMG_COAST094722",
//     olLayer: new TileLayer({
//         source: new TileWMS({
//             url: "https://directed.dev.52north.org/geoserver/directed/wms",
//             params: {
//                 LAYERS: "DMG_COAST094722"
//             }
//         }),
//         properties: { title: "WMS Layer" }
//     }),
//     isBaseLayer: false
// });

// const WD_COAST093900_2 = new SimpleLayer({
//     title: "WD_COAST093900",
//     olLayer: new TileLayer({
//         source: new TileWMS({
//             url: "https://directed.dev.52north.org/geoserver/directed/wms",
//             params: {
//                 LAYERS: "WD_COAST093900"
//             }
//         }),
//         properties: { title: "WMS Layer" }
//     }),
//     isBaseLayer: false
// });

// const WD_COAST094028_2 = new SimpleLayer({
//     title: "WD_COAST094028",
//     olLayer: new TileLayer({
//         source: new TileWMS({
//             url: "https://directed.dev.52north.org/geoserver/directed/wms",
//             params: {
//                 LAYERS: "WD_COAST094028"
//             }
//         }),
//         properties: { title: "WMS Layer" }
//     }),
//     isBaseLayer: false
// });

// const WD_COAST094226_2 = new SimpleLayer({
//     title: "WD_COAST094226",
//     olLayer: new TileLayer({
//         source: new TileWMS({
//             url: "https://directed.dev.52north.org/geoserver/directed/wms",
//             params: {
//                 LAYERS: "WD_COAST094226"
//             }
//         }),
//         properties: { title: "WMS Layer" }
//     }),
//     isBaseLayer: false
// });

// const WD_COAST094722_2 = new SimpleLayer({
//     title: "WD_COAST094722",
//     olLayer: new TileLayer({
//         source: new TileWMS({
//             url: "https://directed.dev.52north.org/geoserver/directed/wms",
//             params: {
//                 LAYERS: "WD_COAST094722"
//             }
//         }),
//         properties: { title: "WMS Layer" }
//     }),
//     isBaseLayer: false
// });

// const WD_RIVER111745_2 = new SimpleLayer({
//     title: "WD_RIVER111745",
//     olLayer: new TileLayer({
//         source: new TileWMS({
//             url: "https://directed.dev.52north.org/geoserver/directed/wms",
//             params: {
//                 LAYERS: "WD_RIVER111745"
//             }
//         }),
//         properties: { title: "WMS Layer" }
//     }),
//     isBaseLayer: false
// });

// const Barrier2 = new SimpleLayer({
//     title: "Barrier",
//     olLayer: new TileLayer({
//         source: new TileWMS({
//             url: "https://directed.dev.52north.org/geoserver/directed/wms",
//             params: {
//                 LAYERS: "barrier"
//             }
//         }),
//         properties: { title: "WMS Layer" }
//     }),
//     isBaseLayer: false
// });

// const pluvial_100yPresent_wd_max2 = new SimpleLayer({
//     title: "pluvial_100yPresent_wd_max",
//     olLayer: new TileLayer({
//         source: new TileWMS({
//             url: "https://directed.dev.52north.org/geoserver/directed/wms",
//             params: {
//                 LAYERS: "pluvial_100yPresent_wd_max"
//             }
//         }),
//         properties: { title: "WMS Layer" }
//     }),
//     isBaseLayer: false
// });

// const pluvial_100yRCP4_5_wd_max2 = new SimpleLayer({
//     title: "pluvial_100yRCP4-5_wd_max",
//     olLayer: new TileLayer({
//         source: new TileWMS({
//             url: "https://directed.dev.52north.org/geoserver/directed/wms",
//             params: {
//                 LAYERS: "pluvial_100yRCP4-5_wd_max"
//             }
//         }),
//         properties: { title: "WMS Layer" }
//     }),
//     isBaseLayer: false
// });

// export const zoomToLayer = (map: MainMapProvider, layer: Layer) => {
//     const layerExtent = layer.getSource().getExtent();  // get extent of layer's source
//     map.getView().fit(layerExtent, { padding: [50, 50, 50, 50] });  // Zoom to layer extent with padding
// };

//////////////////////
/// MAPS FROM .tsx ///
/////////////////////

interface Config {
    pygeoapiBaseUrl: string;
}

export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID1;
    pygeoapiBaseUrl: string;

    constructor(serviceOptions: ServiceOptions) {
        const config = serviceOptions.properties.userConfig as Config;
        this.pygeoapiBaseUrl = config.pygeoapiBaseUrl;
    }

    capitalizeFirstLetter(word: string) {
        return String(word).charAt(0).toUpperCase() + String(word).slice(1);
    }

    createMunicipalityLayer(municipalityID: string) {
        const municipalityLayer = new SimpleLayer({
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
                properties: { title: "GeoJSON Layer" }
            }),
            isBaseLayer: false
        });
        return municipalityLayer;
    }

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
                pluvial_100yRCP4_5_wd_max,
                this.createMunicipalityLayer("frederikssund"),
                this.createMunicipalityLayer("egedal"),
                this.createMunicipalityLayer("halsnaes"),
                this.createMunicipalityLayer("lejre"),
                this.createMunicipalityLayer("roskilde")
            ]

            // advanced: {
            //     view: view //add shared view
            // }
        };
    }
}

// export class SecondMapProvider implements MapConfigProvider {
//     mapId = MAP_ID2;

//     async getMapConfig(): Promise<MapConfig> {
//         return {
//             initialView: {
//                 kind: "position",
//                 center: { x: 1373573, y: 7503364 },
//                 zoom: 11
//             },
//             projection: "EPSG:3857",
//             layers: [
//                 Basemap2,
//                 Coastal_100yPresent_wd_max2,
//                 Coastal_100ySSP2_4_5_wd_max2,
//                 Coastal_2013Storm_wd_max2,
//                 DMG_COAST094722_2,
//                 WD_COAST093900_2,
//                 WD_COAST094028_2,
//                 WD_COAST094226_2,
//                 WD_COAST094722_2,
//                 WD_RIVER111745_2,
//                 Barrier2,
//                 pluvial_100yPresent_wd_max2,
//                 pluvial_100yRCP4_5_wd_max2
//             ],
//             advanced: {
//                 view: view
//             }
//         };
//     }
// }
