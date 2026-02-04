// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";
import { WmsLegend } from "./Components/Legends/WMSLegend";

export const MAP_ID = "main";

const Basemap = new SimpleLayer({
    title: "OpenStreetMap",
    olLayer: new TileLayer({
        source: new OSM(),
        properties: { title: "OSM", type: "OSM" }
    }),
    isBaseLayer: true
});

///////////////////
/// WMS LAYERS ///
/////////////////

//starkregen layers
const starkregen_nw_geschw_agw = new SimpleLayer({
    title: "NW Geschwindigkeiten AGW",
    visible: false,
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
            params: {
                LAYERS: "nw_geschw_agw"
            }
        }),
        properties: {
            title: "NW Geschwindigkeiten AGW",
            id: "nw_geschw_agw",
            type: "WMS_tiles",
            source_domain: "geodatenzentrum"
        }
    }),
    attributes: {
        "legend": {
            Component: WmsLegend
        }
    },
    isBaseLayer: false
});

const starkregen_nw_geschw_extrem = new SimpleLayer({
    title: "NW Geschwindigkeiten Extrem",
    visible: false,
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
            params: {
                LAYERS: "nw_geschw_extrem"
            }
        }),
        properties: {
            title: "NW Geschwindigkeiten Extrem",
            id: "nw_geschw_extrem",
            type: "WMS_tiles",
            source_domain: "geodatenzentrum"
        }
    }),
    attributes: {
        "legend": {
            Component: WmsLegend
        }
    },
    isBaseLayer: false
});

const starkregen_nw_tiefe_agw = new SimpleLayer({
    title: "NW Tiefe AGW",
    visible: false,
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
            params: {
                LAYERS: "nw_tiefe_agw"
            }
        }),
        properties: {
            title: "NW Tiefe AGW",
            id: "nw_tiefe_agw",
            type: "WMS_tiles",
            source_domain: "geodatenzentrum"
        }
    }),
    attributes: {
        "legend": {
            Component: WmsLegend
        }
    },
    isBaseLayer: false
});

const starkregen_nw_tiefe_extrem = new SimpleLayer({
    title: "NW Tiefe Extrem",
    visible: true,
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
            params: {
                LAYERS: "nw_tiefe_extrem"
            }
        }),
        properties: {
            title: "NW Tiefe Extrem",
            id: "nw_tiefe_extrem",
            type: "WMS_tiles",
            source_domain: "geodatenzentrum"
        }
    }),
    attributes: {
        "legend": {
            Component: WmsLegend
        }
    },
    isBaseLayer: false
});

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
const wms_nw_dhm_ubersicht = new SimpleLayer({
    title: "DHM Overview",
    visible: false,
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://www.wms.nrw.de/geobasis/wms_nw_dhm-uebersicht",
            params: {
                LAYERS: "nw_dhm-uebersicht_planung_2024-2028"
            }
        }),
        properties: {
            title: "DHM Overview",
            id: "dhm_ubersicht",
            type: "WMS_tiles",
            source_domain: "wms.nrw"
        }
    }),
    attributes: {
        "legend": {
            Component: WmsLegend
        }
    },
    isBaseLayer: false
});

const wms_nw_gelaendeneigung = new SimpleLayer({
    title: "Terrain Snice",
    visible: false,
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://www.wms.nrw.de/geobasis/wms_nw_gelaendeneigung",
            params: {
                LAYERS: "nw_gelaendeneigung_10"
            }
        }),
        properties: {
            title: "Terrain Snice",
            id: "terrain_snice",
            type: "WMS_tiles",
            source_domain: "wms.nrw"
        }
    }),
    attributes: {
        "legend": {
            Component: WmsLegend
        }
    },
    isBaseLayer: false
});

const wms_nw_gelaendestufen = new SimpleLayer({
    title: "Terrain Steps",
    visible: false,
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://www.wms.nrw.de/geobasis/wms_nw_gelaendestufen",
            params: {
                LAYERS: "nw_gelaendestufen"
            }
        }),
        properties: {
            title: "Terrain Steps",
            id: "terrain_steps",
            type: "WMS_tiles",
            source_domain: "wms.nrw"
        }
    }),
    attributes: {
        "legend": {
            Component: WmsLegend
        }
    },
    isBaseLayer: false
});

const wms_nw_dgm_schummerung = new SimpleLayer({
    title: "Terrain Shading",
    visible: false,
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://www.wms.nrw.de/geobasis/wms_nw_dgm-schummerung",
            params: {
                LAYERS: "nw_dgm-schummerung_col_ne"
            }
        }),
        properties: {
            title: "Terrain Shading",
            id: "terrain_shading",
            type: "WMS_tiles",
            source_domain: "wms.nrw"
        }
    }),
    attributes: {
        "legend": {
            Component: WmsLegend
        }
    },
    isBaseLayer: false
});

const wms_nw_hoehenschichten = new SimpleLayer({
    title: "Height",
    visible: false,
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://www.wms.nrw.de/geobasis/wms_nw_hoehenschichten",
            params: {
                LAYERS: "nw_hoehenschichten_rgb"
            }
        }),
        properties: {
            title: "Height",
            id: "height",
            type: "WMS_tiles",
            source_domain: "wms.nrw"
        }
    }),
    attributes: {
        "legend": {
            Component: WmsLegend
        }
    },
    isBaseLayer: false
});

///////////////
/// MAP_ID ///
/////////////

export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 750611, y: 6606146 },
                zoom: 11
            },
            projection: "EPSG:3857",
            layers: [
                Basemap,
                // Fliessgeschwindigkeit_Ausser,
                // Fliessgeschwindigkeit_Extrem,
                // Ueberflutungstiefe_Ausser,
                // Ueberflutungstiefe_Extrem,
                starkregen_nw_geschw_agw,
                starkregen_nw_geschw_extrem,
                starkregen_nw_tiefe_extrem,
                starkregen_nw_tiefe_agw,
                wms_nw_dhm_ubersicht,
                wms_nw_gelaendeneigung,
                wms_nw_gelaendestufen,
                wms_nw_dgm_schummerung,
                wms_nw_hoehenschichten
            ]
        };
    }
}
