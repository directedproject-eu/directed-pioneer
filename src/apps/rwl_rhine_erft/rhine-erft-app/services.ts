// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { GroupLayer, MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";

export const MAP_ID = "main";

const Basemap = new SimpleLayer({
    title: "OpenStreetMap",
    olLayer: new TileLayer({
        source: new OSM(),
        properties: { title: "OSM" }
    }),
    isBaseLayer: true
});

///////////////////
/// WMS LAYERS ///
/////////////////

//starkregen layers
const starkregen_nw_geschw_agw = new SimpleLayer({
    title: "nw_geschw_agw",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
            params: {
                LAYERS: "nw_geschw_agw"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const starkregen_nw_geschw_extrem = new SimpleLayer({
    title: "nw_geschw_extrem",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
            params: {
                LAYERS: "nw_geschw_extrem"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const starkregen_nw_tiefe_agw = new SimpleLayer({
    title: "nw_tiefe_agw",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
            params: {
                LAYERS: "nw_tiefe_agw"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const starkregen_nw_tiefe_extrem = new SimpleLayer({
    title: "nw_tiefe_extrem",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://sgx.geodatenzentrum.de/wms_starkregen",
            params: {
                LAYERS: "nw_tiefe_extrem"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

//starkregen groups
const Fliessgeschwindigkeit_Ausser = new GroupLayer({
    title: "Fliessgeschwindigkeit Außergewönlich",
    id: "stark_regen1",
    layers: [starkregen_nw_geschw_agw]
});

const Fliessgeschwindigkeit_Extrem = new GroupLayer({
    title: "Fliessgeschwindigkeit extremes",
    id: "stark_regen2",
    layers: [starkregen_nw_geschw_extrem]
});

const Ueberflutungstiefe_Ausser = new GroupLayer({
    title: "Überflutungstiefe Außergewöhnlich",
    id: "stark_regen3",
    layers: [starkregen_nw_tiefe_agw]
});

const Ueberflutungstiefe_Extrem = new GroupLayer({
    title: "Überflutungstiefe extremes",
    id: "stark_regen4",
    layers: [starkregen_nw_tiefe_extrem]
});

//district gov köln layers
const wms_nw_dhm_ubersicht = new SimpleLayer({
    title: "DHM Overview",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://www.wms.nrw.de/geobasis",
            params: {
                LAYERS: "wms_nw_dhm-ubersicht"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const wms_nw_gelaendeneigung = new SimpleLayer({
    title: "Terrain Snice",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://www.wms.nrw.de/geobasis",
            params: {
                LAYERS: "wms_nw_gelaendeneigung"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const wms_nw_gelaendestufen = new SimpleLayer({
    title: "Terrain Steps",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://www.wms.nrw.de/geobasis",
            params: {
                LAYERS: "wms_nw_gelaendestufen"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const wms_nw_dgm_schummerung = new SimpleLayer({
    title: "Terrain Shading",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://www.wms.nrw.de/geobasis",
            params: {
                LAYERS: "wms_nw_dgm-schummerung"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
    isBaseLayer: false
});

const wms_nw_hoehenschichten = new SimpleLayer({
    title: "Height",
    olLayer: new TileLayer({
        source: new TileWMS({
            url: "https://www.wms.nrw.de/geobasis",
            params: {
                LAYERS: "wms_nw_hoehenschichten"
            }
        }),
        properties: { title: "WMS Layer" }
    }),
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
                Fliessgeschwindigkeit_Ausser,
                Fliessgeschwindigkeit_Extrem,
                Ueberflutungstiefe_Ausser,
                Ueberflutungstiefe_Extrem,
                wms_nw_dhm_ubersicht,
                wms_nw_gelaendeneigung,
                wms_nw_gelaendestufen,
                wms_nw_dgm_schummerung,
                wms_nw_hoehenschichten
            ]
        };
    }
}
