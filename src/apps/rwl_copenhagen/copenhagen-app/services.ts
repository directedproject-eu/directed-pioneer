// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer, GroupLayer } from "@open-pioneer/map";
import { ServiceOptions } from "@open-pioneer/runtime";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";
import { Vector as VectorLayer } from "ol/layer.js";
import { Vector as VectorSource } from "ol/source.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { Stroke, Style } from "ol/style";
import { WaterLevelLegend } from "./Components/Legends/WaterLevelLegend";

export const MAP_ID1 = "main";
export { LayerZoomImpl } from "./services/LayerZoom";

const Basemap = new SimpleLayer({
    id: "osm",
    title: "OpenStreetMap",
    olLayer: new TileLayer({
        source: new OSM(),
        properties: { title: "OSM" }
    }),
    isBaseLayer: true
});

// [layerName, layerTitle, layerDescription]
const wmsLayers = [
    ["Coastal_100yPresent_wd_max", "Coastal Flooding Present", "This layer shows a 100 year coastal flooding event under current climate conditions"],
    ["Coastal_100ySSP2-4.5_wd_max", "Coastal Flooding SSP4.5", "This layer shows a 100 year coastal flooding event under SSP4.5 (Shared Socioeconomic Projection with 4.5°C global warming)"],
    ["Coastal_2013Storm_wd_max", "Coastal Flooding Storm Bodil 2013", "This layer shows the flooding which occurred during the 2013 Storm Bodil event"],
    ["DMG_COAST094722", "Coastal Damage 094722", "This layer shows the damages incurred by a coastal flooding event"],
    ["WD_COAST093900", "Coastal Flood 093900", "This layer shows a coastal flooding event"],
    ["WD_COAST094028", "Coastal Flood 094028", "This layer shows a coastal flooding event"],
    ["WD_COAST094226", "Coastal Flooding 094226", "This layer shows a coastal flooding event"],
    ["WD_COAST094722", "Coastal Flooding 094722", "This layer shows coastal flooding"],
    ["WD_RIVER111745", "River Flooding 111745", "This layer shows river flooding"],
    ["barrier", "Barrier", "This layer shows a barrier placed in a coastal flooding event"],
    ["pluvial_100yPresent_wd_max", "Pluvial Flooding Present", "This layer shows a pluvial flooding event under current climate conditions"],
    ["pluvial_100yRCP4-5_wd_max", "Pluvial Flooding RCP4.5", "This layer shows a 100 year pluvial flooding event under RCP4.5 (Representative Concentration Pathways with 4.5°C global warming)"]
];

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

    createWmsLayer(layerName: string, layerTitle: string, layerDescription: string) {
        const wmsLayer = new SimpleLayer({
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
            attributes: {
                "legend": {
                    Component: WaterLevelLegend
                }
            },
            isBaseLayer: false
        });
        return wmsLayer;
    }

    async getMapConfig(): Promise<MapConfig> {
        const layers = [];
        for (const x in wmsLayers) {
            layers.push(this.createWmsLayer(wmsLayers[x][0], wmsLayers[x][1], wmsLayers[x][2]));
        }
        return {
            initialView: {
                kind: "position",
                center: { x: 1373573, y: 7503364 },
                zoom: 11
            },
            projection: "EPSG:3857",
            layers: [
                new GroupLayer({
                    title: "Municipalities",
                    id: "municipal_layers",
                    layers: [
                        this.createMunicipalityLayer("frederikssund"),
                        this.createMunicipalityLayer("egedal"),
                        this.createMunicipalityLayer("halsnaes"),
                        this.createMunicipalityLayer("lejre"),
                        this.createMunicipalityLayer("roskilde")
                    ]
                }),
                // new GroupLayer({
                //     title: "Coastal Flooding",
                //     visible: false,
                //     id: "coastal_flooding_layers",
                //     layers: [
                //         Coastal_100yPresent_wd_max,
                //         Coastal_100ySSP2_4_5_wd_max,
                //         Coastal_2013Storm_wd_max,
                //         WD_COAST093900,
                //         WD_COAST094028,
                //         WD_COAST094226,
                //         WD_COAST094722,
                //     ],
                //     attributes: {
                //         "legend": {
                //             Component: WaterLevelLegend
                //         }
                //     },
                // }),
                // new GroupLayer({
                //     title: "Pluvial Flooding",
                //     visible: false,
                //     id: "pluvial_flooding_layers",
                //     layers: [
                //         pluvial_100yPresent_wd_max,
                //         pluvial_100yRCP4_5_wd_max,
                //     ],
                //     attributes: {
                //         "legend": {
                //             Component: WaterLevelLegend
                //         }
                //     },
                // }),
                Basemap,
                ...layers
            ]
        };
    }
}
