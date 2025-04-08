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

const wmsLayersSaferPlacesCoastal = [
    {"name": "DMG_COAST094722", "title": "Coastal Damage 094722", "description": "This layer shows the damages incurred by a coastal flooding event"},
    {"name": "WD_COAST093900", "title": "Coastal Flood 093900", "description": "This layer shows a coastal flooding event"},
    {"name": "WD_COAST094028", "title": "Coastal Flood 094028", "description": "This layer shows a coastal flooding event"},
    {"name": "WD_COAST094226", "title": "Coastal Flooding 094226", "description": "This layer shows a coastal flooding event"},
    {"name": "WD_COAST094722", "title": "Coastal Flooding 094722", "description": "This layer shows coastal flooding"},
    {"name": "WD_RIVER111745", "title": "River Flooding 111745", "description": "This layer shows river flooding"},
    {"name": "barrier", "title": "Barrier", "description": "This layer shows a barrier placed in a coastal flooding event"}
];


const wmsLayersRim2dCoastal = [
    {"name": "Coastal_100yPresent_wd_max", "title": "Coastal Flooding Present", "description": "This layer shows a 100 year coastal flooding event under current climate conditions"},
    {"name": "Coastal_100ySSP2-4.5_wd_max", "title": "Coastal Flooding SSP4.5", "description": "This layer shows a 100 year coastal flooding event under SSP4.5 (Shared Socioeconomic Projection with 4.5°C global warming)"},
    {"name": "Coastal_2013Storm_wd_max", "title": "Coastal_2013Storm_wd_max", "description": "Coastal_2013Storm_wd_max"},
    {"name": "Coastal_RP20_SSP2-4.5_2041-2070_5m","title": "Coastal_RP20_SSP2-4.5_2041-2070_5m","description": "Coastal_RP20_SSP2-4.5_2041-2070_5m"},
    {"name": "Coastal_RP50_SSP2-4.5_2041-2070_5m", "title": "Coastal_RP50_SSP2-4.5_2041-2070_5m","description": "Coastal_RP50_SSP2-4.5_2041-2070_5m"},
    {"name": "Coastal_RP100_SSP2-4.5_2041-2070_5m", "title": "Coastal_RP100_SSP2-4.5_2041-2070_5m","description": "Coastal_RP100_SSP2-4.5_2041-2070_5m"}
];

const wmsLayersRim2dPluvial = [
    {"name": "pluvial_100yPresent_wd_max", "title": "Pluvial Flooding Present", "description": "This layer shows a pluvial flooding event under current climate conditions"},
    {"name": "pluvial_100yRCP4-5_wd_max", "title": "Pluvial Flooding RCP4.5", "description": "This layer shows a 100 year pluvial flooding event under RCP4.5 (Representative Concentration Pathways with 4.5°C global warming)"},
    {"name": "pluvial_RP20_SSP2-4.5_2041-2070_1h_5m", "title": "pluvial_RP20_SSP2-4.5_2041-2070_1h_5m", "description": "pluvial_RP20_SSP2-4.5_2041-2070_1h_5m"},
    {"name": "pluvial_RP50_SSP2-4.5_2041-2070_1h_5m", "title": "pluvial_RP50_SSP2-4.5_2041-2070_1h_5m", "description": "pluvial_RP50_SSP2-4.5_2041-2070_1h_5m"},
    {"name": "pluvial_RP100_SSP2-4.5_2041-2070_1h_5m", "title": "pluvial_RP100_SSP2-4.5_2041-2070_1h_5m", "description": "pluvial_RP100_SSP2-4.5_2041-2070_1h_5m"}
];

const wmsLayersFrederiksvaerkScalgoStorm = [
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_06_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_46_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_15_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_01_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=1_68_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_31_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_53_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_30_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_13_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=1_90_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=1_94_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_22_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_38_m"},
    {"name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_09_m"}
];

const wmsLayersFrederiksvaerkScalgoPluvial = [
    {"name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=72_mm"},
    {"name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=61_mm"},
    {"name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=50_mm"},
    {"name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=82_mm"},
    {"name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=56_mm"},
    {"name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=59_mm"},
    {"name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=51_mm"},
    {"name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=42_mm"}
];

const wmsLayersFrederikssundScalgoPluvial = [
    {"name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=71_mm"},
    {"name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=61_mm"},
    {"name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=51_mm"},
    {"name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=82_mm"},
    {"name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=55_mm"},
    {"name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=59_mm"},
    {"name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=70_mm"},
    {"name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=42_mm"}
];

const wmsLayersFrederikssundScalgoStorm = [
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_09_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_30_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_22_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_13_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_53_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_38_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_06_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=1_69_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_01_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_15_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_31_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=1_94_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=1_90_m"},
    {"name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_46_m"}
];

const wmsLayersJyllingeScalgoStorm = [
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_01_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_46_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_06_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_09_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_38_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=1_90_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_13_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_31_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_53_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_30_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_15_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=1_94_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_22_m"},
    {"name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=1_69_m"}
];

const wmsLayersFrederiksvaerkSaferPlacesPluvial = [
    {"name": "frederiksvaerk_WD_Pluvial_Ref_RP20"},
    {"name": "frederiksvaerk_WD_Pluvial_Ref_RP50"},
    {"name": "frederiksvaerk_WD_Pluvial_Ref_RP100"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP1_RP20_2041_2070"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP1_RP50_2041_2070"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP1_RP100_2041_2070"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP2_RP20_2041_2070"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP2_RP20_2071_2100"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP2_RP50_2041_2070"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP2_RP50_2071_2100"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP2_RP100_2041_2070"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP2_RP100_2071_2100"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP3_RP20_2041_2070"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP3_RP20_2071_2100"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP3_RP50_2041_2070"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP3_RP50_2071_2100"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP3_RP100_2041_2070"},
    {"name": "frederiksvaerk_WD_Pluvial_SSP3_RP100_2071_2100"}
];

const wmsLayersFrederiksvaerkSaferPlacesStorm = [
    {"name": "frederiksvaerk_WD_Storm_Ref_RP20"},
    {"name": "frederiksvaerk_WD_Storm_Ref_RP50"},
    {"name": "frederiksvaerk_WD_Storm_Ref_RP100"},
    {"name": "frederiksvaerk_WD_Storm_SSP1_RP20_2041_2070"},
    {"name": "frederiksvaerk_WD_Storm_SSP1_RP20_2071_2100"},
    {"name": "frederiksvaerk_WD_Storm_SSP1_RP50_2071_2100"},
    {"name": "frederiksvaerk_WD_Storm_SSP1_RP100_2071_2100"},
    {"name": "frederiksvaerk_WD_Storm_SSP2_RP20_2041_2070"},
    {"name": "frederiksvaerk_WD_Storm_SSP2_RP20_2071_2100"},
    {"name": "frederiksvaerk_WD_Storm_SSP2_RP50_2041_2070"},
    {"name": "frederiksvaerk_WD_Storm_SSP2_RP50_2071_2100"},
    {"name": "frederiksvaerk_WD_Storm_SSP2_RP100_2041_2070"},
    {"name": "frederiksvaerk_WD_Storm_SSP2_RP100_2071_2100"},
    {"name": "frederiksvaerk_WD_Storm_SSP3_RP100_2071_2100"}
];

const wmsLayersFrederikssundSaferPlacesPluvial = [
    {"name": "frederikssund_WD_Pluvial_Ref_RP20"},
    {"name": "frederikssund_WD_Pluvial_Ref_RP50"},
    {"name": "frederikssund_WD_Pluvial_Ref_RP100"},
    {"name": "frederikssund_WD_Pluvial_SSP1_RP20_2041_2070"},
    {"name": "frederikssund_WD_Pluvial_SSP1_RP50_2041_2070"},
    {"name": "frederikssund_WD_Pluvial_SSP1_RP100_2041_2070"},
    {"name": "frederikssund_WD_Pluvial_SSP2_RP20_2041_2070"},
    {"name": "frederikssund_WD_Pluvial_SSP2_RP20_2071_2100"},
    {"name": "frederikssund_WD_Pluvial_SSP2_RP50_2041_2070"},
    {"name": "frederikssund_WD_Pluvial_SSP2_RP50_2071_2100"},
    {"name": "frederikssund_WD_Pluvial_SSP2_RP100_2041_2070"},
    {"name": "frederikssund_WD_Pluvial_SSP2_RP100_2071_2100"},
    {"name": "frederikssund_WD_Pluvial_SSP3_RP20_2041_2070"},
    {"name": "frederikssund_WD_Pluvial_SSP3_RP20_2071_2100"},
    {"name": "frederikssund_WD_Pluvial_SSP3_RP50_2041_2070"},
    {"name": "frederikssund_WD_Pluvial_SSP3_RP50_2071_2100"},
    {"name": "frederikssund_WD_Pluvial_SSP3_RP100_2041_2070"},
    {"name": "frederikssund_WD_Pluvial_SSP3_RP100_2071_2100"}
];

const wmsLayersFrederikssundSaferPlacesStorm = [
    {"name": "frederikssund_WD_Storm_Reference_RP20"},
    {"name": "frederikssund_WD_Storm_Reference_RP50"},
    {"name": "frederikssund_WD_Storm_Reference_RP100"},
    {"name": "frederikssund_WD_Storm_SSP1_RP50_2041_2070"},
    {"name": "frederikssund_WD_Storm_SSP1_RP20_2071_2100"},
    {"name": "frederikssund_WD_Storm_SSP1_RP50_2071_2100"},
    {"name": "frederikssund_WD_Storm_SSP1_RP100_2071_2100"},
    {"name": "frederikssund_WD_Storm_SSP2_RP20_2041_2070"},
    {"name": "frederikssund_WD_Storm_SSP2_RP20_2071_2100"},
    {"name": "frederikssund_WD_Storm_SSP2_RP50_2041_2070"},
    {"name": "frederikssund_WD_Storm_SSP2_RP50_2071_2100"},
    {"name": "frederikssund_WD_Storm_SSP2_RP100_2041_2070"},
    {"name": "frederikssund_WD_Storm_SSP2_RP100_2071_2100"},
    {"name": "frederikssund_WD_Storm_SSP3_RP100_2071_2100"}
];

const wmsLayersJyllingeSaferPlacesStorm = [
    {"name": "jyllinge_WD_Storm_Ref_RP20"},
    {"name": "jyllinge_WD_Storm_Ref_SP50"},
    {"name": "jyllinge_WD_Storm_Ref_RP100"},
    {"name": "jyllinge_WD_Storm_SSP1_RP20_2071_2100"},
    {"name": "jyllinge_WD_Storm_SSP1_RP50_2041_2070"},
    {"name": "jyllinge_WD_Storm_SSP1_RP50_2071_2100"},
    {"name": "jyllinge_WD_Storm_SSP1_RP100_2071_2100"},
    {"name": "jyllinge_WD_Storm_SSP2_RP20_2041_2070"},
    {"name": "jyllinge_WD_Storm_SSP2_RP20_2071_2100"},
    {"name": "jyllinge_WD_Storm_SSP2_RP50_2041_2070"},
    {"name": "jyllinge_WD_Storm_SSP2_RP50_2071_2100"},
    {"name": "jyllinge_WD_Storm_SSP2_RP100_2041_2070"},
    {"name": "jyllinge_WD_Storm_SSP2_RP100_2071_2100"},
    {"name": "jyllinge_WD_Storm_SSP3_RP100_2071_2100"}
];

const wmsLayersJyllingeSaferPlacesPluvial = [
    {"name": "jyllinge_WD_Pluvial_Ref_RP20"},
    {"name": "jyllinge_WD_Pluvial_Ref_RP50"},
    {"name": "jyllinge_WD_Pluvial_Ref_RP100"},
    {"name": "jyllinge_WD_Pluvial_SSP1_RP20_2041_2070"},
    {"name": "jyllinge_WD_Pluvial_SSP1_RP20_2071_2100"},
    {"name": "jyllinge_WD_Pluvial_SSP1_RP50_2041_2070"},
    {"name": "jyllinge_WD_Pluvial_SSP1_RP50_2071_2100"},
    {"name": "jyllinge_WD_Pluvial_SSP1_RP100_2041_2070"},
    {"name": "jyllinge_WD_Pluvial_SSP1_RP100_2071_2100"},
    {"name": "jyllinge_WD_Pluvial_SSP2_RP20_2041_2070"},
    {"name": "jyllinge_WD_Pluvial_SSP2_RP20_2071_2100"},
    {"name": "jyllinge_WD_Pluvial_SSP2_RP50_2041_2070"},
    {"name": "jyllinge_WD_Pluvial_SSP2_RP50_2071_2100"},
    {"name": "jyllinge_WD_Pluvial_SSP2_RP100_2041_2070"},
    {"name": "jyllinge_WD_Pluvial_SSP2_RP100_2071_2100"},
    {"name": "jyllinge_WD_Pluvial_SSP3_RP20_2041_2070"},
    {"name": "jyllinge_WD_Pluvial_SSP3_RP20_2071_2100"},
    {"name": "jyllinge_WD_Pluvial_SSP3_RP50_2041_2070"},
    {"name": "jyllinge_WD_Pluvial_SSP3_RP50_2071_2100"},
    {"name": "jyllinge_WD_Pluvial_SSP3_RP100_2041_2070"},
    {"name": "jyllinge_WD_Pluvial_SSP3_RP100_2071_2100"}
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
        return {
            initialView: {
                kind: "position",
                center: { x: 1373573, y: 7503364 },
                zoom: 11
            },
            projection: "EPSG:3857",
            layers: [
                Basemap,
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
                // ...wmsLayersRim2dCoastal.map(({name, title, description}) => this.createWmsLayer(name, title, description)),
                // ...wmsLayersRim2dPluvial.map(({name, title, description}) => this.createWmsLayer(name, title, description)),
                // ...wmsLayersSaferPlacesCoastal.map(({name, title, description}) => this.createWmsLayer(name, title, description)),
                // ...wmsLayersFrederikssundScalgoPluvial.map(({name}) => this.createWmsLayer(name, name, name)),
                // ...wmsLayersFrederikssundScalgoStorm.map(({name}) => this.createWmsLayer(name, name, name)),
                // ...wmsLayersFrederikssundSaferPlacesPluvial.map(({name}) => this.createWmsLayer(name, name, name)),
                // ...wmsLayersFrederikssundSaferPlacesStorm.map(({name}) => this.createWmsLayer(name, name, name)),
                // ...wmsLayersFrederiksvaerkScalgoPluvial.map(({name}) => this.createWmsLayer(name, name, name)),
                // ...wmsLayersFrederiksvaerkScalgoStorm.map(({name}) => this.createWmsLayer(name, name, name)),
                // ...wmsLayersFrederiksvaerkSaferPlacesPluvial.map(({name}) => this.createWmsLayer(name, name, name)),
                // ...wmsLayersFrederiksvaerkSaferPlacesStorm.map(({name}) => this.createWmsLayer(name, name, name)),
                // ...wmsLayersJyllingeScalgoStorm.map(({name}) => this.createWmsLayer(name, name, name)),
                // ...wmsLayersJyllingeSaferPlacesPluvial.map(({name}) => this.createWmsLayer(name, name, name)),
                // ...wmsLayersJyllingeSaferPlacesStorm.map(({name}) => this.createWmsLayer(name, name, name)),
                new GroupLayer({
                    title: "Coastal Flooding",
                    visible: false,
                    id: "coastal_flooding_layers",
                    layers: [
                        new GroupLayer({
                            title: "SaferPlaces model",
                            visible: false,
                            id: "coastal_flooding_saferplaces",
                            layers: [...wmsLayersSaferPlacesCoastal.map(({name, title, description}) => this.createWmsLayer(name, title, description)),],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            },
                        }),
                        new GroupLayer({
                            title: "RIM2D model",
                            visible: false,
                            id: "coastal_flooding_rim2d",
                            layers: [...wmsLayersRim2dCoastal.map(({name, title, description}) => this.createWmsLayer(name, title, description)),],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            },
                        })
                    ],
                    attributes: {
                        "legend": {
                            Component: WaterLevelLegend
                        }
                    },
                }),
                new GroupLayer({
                    title: "Pluvial flooding",
                    visible: false,
                    id: "pluvial_flooding",
                    layers: [
                        new GroupLayer({
                            title: "Frederikssund",
                            visible: false,
                            id: "pluvial_flooding_frederikssund",
                            layers: [
                                new GroupLayer({
                                    title: "Scalgo model",
                                    visible: false,
                                    id: "pluvial_flooding_frederikssund_scalgo",
                                    layers: [...wmsLayersFrederikssundScalgoPluvial.map(({name}) => this.createWmsLayer(name, name, name))],
                                    attributes: {
                                        "legend": {
                                            Component: WaterLevelLegend
                                        }
                                    }
                                }),
                                new GroupLayer({
                                    title: "SaferPlaces model",
                                    visible: false,
                                    id: "pluvial_flooding_frederikssund_saferplaces",
                                    layers: [...wmsLayersFrederikssundSaferPlacesPluvial.map(({name}) => this.createWmsLayer(name, name, name))],
                                    attributes: {
                                        "legend": {
                                            Component: WaterLevelLegend
                                        }
                                    }
                                })
                            ],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            }
                        }),
                        new GroupLayer({
                            title: "Frederiksvaerk",
                            visible: false,
                            id: "pluvial_flooding_frederiksvaerk",
                            layers: [
                                new GroupLayer({
                                    title: "Scalgo model",
                                    visible: false,
                                    id: "pluvial_flooding_frederiksvaerk_scalgo",
                                    layers: [...wmsLayersFrederiksvaerkScalgoPluvial.map(({name}) => this.createWmsLayer(name, name, name))],
                                    attributes: {
                                        "legend": {
                                            Component: WaterLevelLegend
                                        }
                                    }
                                }),
                                new GroupLayer({
                                    title: "SaferPlaces model",
                                    visible: false,
                                    id: "pluvial_flooding_frederiksvaerk_saferplaces",
                                    layers: [...wmsLayersFrederiksvaerkSaferPlacesPluvial.map(({name}) => this.createWmsLayer(name, name, name))],
                                    attributes: {
                                        "legend": {
                                            Component: WaterLevelLegend
                                        }
                                    }
                                })
                            ],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            }
                        }),
                        new GroupLayer({
                            title: "Jyllinge",
                            visible: false,
                            id: "pluvial_flooding_jyllinge",
                            layers: [
                                new GroupLayer({
                                    title: "SaferPlaces model",
                                    visible: false,
                                    id: "pluvial_flooding_jyllinge_saferplaces",
                                    layers: [...wmsLayersJyllingeSaferPlacesPluvial.map(({name}) => this.createWmsLayer(name, name, name))],
                                    attributes: {
                                        "legend": {
                                            Component: WaterLevelLegend
                                        }
                                    },
                                })
                            ],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            },
                        }),
                        new GroupLayer({
                            title: "RIM2D model",
                            visible: false,
                            id: "pluvial_flooding_rim2d",
                            layers: [...wmsLayersRim2dPluvial.map(({name, title, description}) => this.createWmsLayer(name, title, description))],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            },
                        })
                    ]
                }),
                new GroupLayer({
                    title: "Storm",
                    visible: false,
                    id: "storm",
                    layers: [
                        new GroupLayer({
                            title: "Frederikssund",
                            visible: false,
                            id: "storm_frederikssund",
                            layers: [
                                new GroupLayer({
                                    title: "Scalgo model",
                                    visible: false,
                                    id: "storm_frederikssund_scalgo",
                                    layers: [...wmsLayersFrederikssundScalgoStorm.map(({name}) => this.createWmsLayer(name, name, name))],
                                    attributes: {
                                        "legend": {
                                            Component: WaterLevelLegend
                                        }
                                    },
                                }),
                                new GroupLayer({
                                    title: "SaferPlaces model",
                                    visible: false,
                                    id: "storm_frederikssund_saferplaces",
                                    layers: [...wmsLayersFrederikssundSaferPlacesStorm.map(({name}) => this.createWmsLayer(name, name, name))],
                                    attributes: {
                                        "legend": {
                                            Component: WaterLevelLegend
                                        }
                                    },
                                })
                            ],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            },
                        }),
                        new GroupLayer({
                            title: "Frederiksvaerk",
                            visible: false,
                            id: "storm_frederiksvaerk",
                            layers: [
                                new GroupLayer({
                                    title: "Scalgo model",
                                    visible: false,
                                    id: "storm_frederiksvaerk_scalgo",
                                    layers: [...wmsLayersFrederiksvaerkScalgoStorm.map(({name}) => this.createWmsLayer(name, name, name))],
                                    attributes: {
                                        "legend": {
                                            Component: WaterLevelLegend
                                        }
                                    },
                                }),
                                new GroupLayer({
                                    title: "SaferPlaces model",
                                    visible: false,
                                    id: "storm_frederiksvaerk_saferplaces",
                                    layers: [...wmsLayersFrederiksvaerkSaferPlacesStorm.map(({name}) => this.createWmsLayer(name, name, name))],
                                    attributes: {
                                        "legend": {
                                            Component: WaterLevelLegend
                                        }
                                    },
                                })
                            ],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            },
                        }),
                        new GroupLayer({
                            title: "Jyllinge",
                            visible: false,
                            id: "storm_jyllinge",
                            layers: [
                                new GroupLayer({
                                    title: "Scalgo model",
                                    visible: false,
                                    id: "storm_jyllinge_scalgo",
                                    layers: [...wmsLayersJyllingeScalgoStorm.map(({name}) => this.createWmsLayer(name, name, name))],
                                    attributes: {
                                        "legend": {
                                            Component: WaterLevelLegend
                                        }
                                    },
                                }),
                                new GroupLayer({
                                    title: "SaferPlaces model",
                                    visible: false,
                                    id: "storm_jyllinge_saferplaces",
                                    layers: [...wmsLayersJyllingeSaferPlacesStorm.map(({name}) => this.createWmsLayer(name, name, name))],
                                    attributes: {
                                        "legend": {
                                            Component: WaterLevelLegend
                                        }
                                    },
                                })
                            ],
                            attributes: {
                                "legend": {
                                    Component: WaterLevelLegend
                                }
                            },
                        })
                    ],
                    attributes: {
                        "legend": {
                            Component: WaterLevelLegend
                        }
                    },
                })
            ]
        };
    }
}
