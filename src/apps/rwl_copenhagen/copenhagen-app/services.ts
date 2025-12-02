// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer, GroupLayer } from "@open-pioneer/map";
import { ServiceOptions } from "@open-pioneer/runtime";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import WebGLTileLayer from "ol/layer/WebGLTile";
import OSM from "ol/source/OSM";
import { Vector as VectorLayer } from "ol/layer.js";
import { Vector as VectorSource } from "ol/source.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { Stroke, Style } from "ol/style";
import { WaterLevelLegend } from "./Components/Legends/WaterLevelLegend";


export const MAP_ID1 = "main";
export { LayerZoomImpl } from "./services/LayerZoom";
export { ForecastServiceImpl } from "./services/ForecastService";
export { FloodHandlerImpl } from "./services/FloodHandler";


const Basemap = new SimpleLayer({
    id: "osm",
    title: "OpenStreetMap",
    olLayer: new TileLayer({
        source: new OSM(),
        properties: { title: "OSM", type: "OSM" }
    }),
    isBaseLayer: true
});

const wmsLayersSaferPlacesCoastal = [
    {
        "name": "DMG_COAST094722",
        "title": "Coastal Damage 094722",
        "description": "This layer shows the damages incurred by a coastal flooding event"
    },
    {
        "name": "WD_COAST093900",
        "title": "Coastal Flood 093900",
        "description": "This layer shows a coastal flooding event"
    },
    {
        "name": "WD_COAST094028",
        "title": "Coastal Flood 094028",
        "description": "This layer shows a coastal flooding event"
    },
    {
        "name": "WD_COAST094226",
        "title": "Coastal Flooding 094226",
        "description": "This layer shows a coastal flooding event"
    },
    {
        "name": "WD_COAST094722",
        "title": "Coastal Flooding 094722",
        "description": "This layer shows coastal flooding"
    },
    {
        "name": "WD_RIVER111745",
        "title": "River Flooding 111745",
        "description": "This layer shows river flooding"
    },
    {
        "name": "barrier",
        "title": "Barrier",
        "description": "This layer shows a barrier placed in a coastal flooding event"
    }
];

const wmsLayersRim2dCoastal = [
    {
        "name": "Coastal_100yPresent_wd_max",
        "title": "Coastal Flooding Present",
        "description":
            "This layer shows a 100 year coastal flooding event under current climate conditions"
    },
    {
        "name": "Coastal_100ySSP2-4.5_wd_max",
        "title": "Coastal Flooding SSP4.5",
        "description":
            "This layer shows a 100 year coastal flooding event under SSP4.5 (Shared Socioeconomic Projection with 4.5°C global warming)"
    },
    {
        "name": "Coastal_2013Storm_wd_max",
        "title": "Coastal_2013Storm_wd_max",
        "description": "Coastal_2013Storm_wd_max"
    },
    {
        "name": "Coastal_RP20_SSP2-4.5_2041-2070_5m",
        "title": "Coastal_RP20_SSP2-4.5_2041-2070_5m",
        "description": "Coastal_RP20_SSP2-4.5_2041-2070_5m"
    },
    {
        "name": "Coastal_RP50_SSP2-4.5_2041-2070_5m",
        "title": "Coastal_RP50_SSP2-4.5_2041-2070_5m",
        "description": "Coastal_RP50_SSP2-4.5_2041-2070_5m"
    },
    {
        "name": "Coastal_RP100_SSP2-4.5_2041-2070_5m",
        "title": "Coastal_RP100_SSP2-4.5_2041-2070_5m",
        "description": "Coastal_RP100_SSP2-4.5_2041-2070_5m"
    }
];

const wmsLayersRim2dPluvial = [
    {
        "name": "pluvial_100yPresent_wd_max",
        "title": "Pluvial Flooding Present",
        "description": "This layer shows a pluvial flooding event under current climate conditions"
    },
    {
        "name": "pluvial_100yRCP4-5_wd_max",
        "title": "Pluvial Flooding RCP4.5",
        "description":
            "This layer shows a 100 year pluvial flooding event under RCP4.5 (Representative Concentration Pathways with 4.5°C global warming)"
    },
    {
        "name": "pluvial_RP20_SSP2-4.5_2041-2070_1h_5m",
        "title": "pluvial_RP20_SSP2-4.5_2041-2070_1h_5m",
        "description": "pluvial_RP20_SSP2-4.5_2041-2070_1h_5m"
    },
    {
        "name": "pluvial_RP50_SSP2-4.5_2041-2070_1h_5m",
        "title": "pluvial_RP50_SSP2-4.5_2041-2070_1h_5m",
        "description": "pluvial_RP50_SSP2-4.5_2041-2070_1h_5m"
    },
    {
        "name": "pluvial_RP100_SSP2-4.5_2041-2070_1h_5m",
        "title": "pluvial_RP100_SSP2-4.5_2041-2070_1h_5m",
        "description": "pluvial_RP100_SSP2-4.5_2041-2070_1h_5m"
    }
];

const wmsLayersFrederiksvaerkScalgoStorm = [
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_06_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_46_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_15_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_01_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=1_68_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_31_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_53_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_30_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_13_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=1_90_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=1_94_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_22_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_38_m" },
    { "name": "Terræn_Hav_Frederiksværk_Vanddybde_Havvandstand=2_09_m" }
];

const wmsLayersFrederiksvaerkScalgoPluvial = [
    { "name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=72_mm" },
    { "name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=61_mm" },
    { "name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=50_mm" },
    { "name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=82_mm" },
    { "name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=56_mm" },
    { "name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=59_mm" },
    { "name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=51_mm" },
    { "name": "Terræn_Bygninger_Frederiksværk_Vanddybde_Nedbørsmængde=42_mm" }
];

const wmsLayersFrederikssundScalgoPluvial = [
    { "name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=71_mm" },
    { "name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=61_mm" },
    { "name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=51_mm" },
    { "name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=82_mm" },
    { "name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=55_mm" },
    { "name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=59_mm" },
    { "name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=70_mm" },
    { "name": "Terræn_Bygninger_Frederikssund_Vanddybde_Nedbørsmængde=42_mm" }
];

const wmsLayersFrederikssundScalgoStorm = [
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_09_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_30_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_22_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_13_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_53_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_38_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_06_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=1_69_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_01_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_15_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_31_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=1_94_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=1_90_m" },
    { "name": "Terræn_Hav_Frederikssund_Vanddybde_Havvandstand=2_46_m" }
];

const wmsLayersFrederikssundDamagecostStorm = [
    { "name": "SP_Frederikssund_Storm_Ref_RP100_RP100__Agricultural_areas" },
    { "name": "SP_Frederikssund_Storm_Ref_RP100_RP100__Biodiversity" },
    { "name": "SP_Frederikssund_Storm_Ref_RP100_RP100__Buildings" },
    { "name": "SP_Frederikssund_Storm_Ref_RP100_RP100__Human" },
    { "name": "SP_Frederikssund_Storm_Ref_RP100_RP100__Industry_staff" },
    { "name": "SP_Frederikssund_Storm_Ref_RP100_RP100__Public_service" },
    { "name": "SP_Frederikssund_Storm_Ref_RP100_RP100__Recreative_areas" },
    { "name": "SP_Frederikssund_Storm_Ref_RP100_RP100__Road_traffic" },
    { "name": "SP_Frederikssund_Storm_Ref_RP100_RP100__Tourism" },
    { "name": "SP_Frederikssund_Storm_Ref_RP20_RP50__Agricultural_areas" },
    { "name": "SP_Frederikssund_Storm_Ref_RP20_RP50__Biodiversity" },
    { "name": "SP_Frederikssund_Storm_Ref_RP20_RP50__Buildings" },
    { "name": "SP_Frederikssund_Storm_Ref_RP20_RP50__Human" },
    { "name": "SP_Frederikssund_Storm_Ref_RP20_RP50__Industry_staff" },
    { "name": "SP_Frederikssund_Storm_Ref_RP20_RP50__Public_service" },
    { "name": "SP_Frederikssund_Storm_Ref_RP20_RP50__Recreative_areas" },
    { "name": "SP_Frederikssund_Storm_Ref_RP20_RP50__Road_traffic" },
    { "name": "SP_Frederikssund_Storm_Ref_RP20_RP50__Tourism" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Agricultural_areas" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Biodiversity" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Buildings" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Human" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Industry_staff" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Public_service" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Recreative_areas" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Road_traffic" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Tourism" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Agricultural_areas" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Biodiversity" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Buildings" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Human" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Industry_staff" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Public_service" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Recreative_areas" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Road_traffic" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Tourism" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Agricultural_areas" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Biodiversity" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Buildings" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Human" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Industry_staff" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Public_service" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Recreative_areas" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Road_traffic" },
    { "name": "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Tourism" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Agricultural_areas" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Biodiversity" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Buildings" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Human" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Industry_staff" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Public_service" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Recreative_areas" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Road_traffic" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Tourism" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Agricultural_areas" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Biodiversity" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Buildings" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Human" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Industry_staff" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Public_service" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Recreative_areas" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Road_traffic" },
    { "name": "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Tourism" }
];

const wmsLayersJyllingeScalgoStorm = [
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_01_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_46_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_06_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_09_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_38_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=1_90_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_13_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_31_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_53_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_30_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_15_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=1_94_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=2_22_m" },
    { "name": "Terræn_Hav_Jyllinge_Vanddybde_Havvandstand=1_69_m" }
];

const wmsLayersFrederiksvaerkSaferPlacesPluvial = [
    { "name": "frederiksvaerk_WD_Pluvial_Ref_RP20" },
    { "name": "frederiksvaerk_WD_Pluvial_Ref_RP50" },
    { "name": "frederiksvaerk_WD_Pluvial_Ref_RP100" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP1_RP20_2041_2070" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP1_RP50_2041_2070" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP1_RP100_2041_2070" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP2_RP20_2041_2070" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP2_RP20_2071_2100" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP2_RP50_2041_2070" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP2_RP50_2071_2100" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP2_RP100_2041_2070" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP2_RP100_2071_2100" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP3_RP20_2041_2070" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP3_RP20_2071_2100" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP3_RP50_2041_2070" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP3_RP50_2071_2100" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP3_RP100_2041_2070" },
    { "name": "frederiksvaerk_WD_Pluvial_SSP3_RP100_2071_2100" }
];

const wmsLayersFrederiksvaerkSaferPlacesStorm = [
    { "name": "frederiksvaerk_WD_Storm_Ref_RP20" },
    { "name": "frederiksvaerk_WD_Storm_Ref_RP50" },
    { "name": "frederiksvaerk_WD_Storm_Ref_RP100" },
    { "name": "frederiksvaerk_WD_Storm_SSP1_RP20_2041_2070" },
    { "name": "frederiksvaerk_WD_Storm_SSP1_RP20_2071_2100" },
    { "name": "frederiksvaerk_WD_Storm_SSP1_RP50_2071_2100" },
    { "name": "frederiksvaerk_WD_Storm_SSP1_RP100_2071_2100" },
    { "name": "frederiksvaerk_WD_Storm_SSP2_RP20_2041_2070" },
    { "name": "frederiksvaerk_WD_Storm_SSP2_RP20_2071_2100" },
    { "name": "frederiksvaerk_WD_Storm_SSP2_RP50_2041_2070" },
    { "name": "frederiksvaerk_WD_Storm_SSP2_RP50_2071_2100" },
    { "name": "frederiksvaerk_WD_Storm_SSP2_RP100_2041_2070" },
    { "name": "frederiksvaerk_WD_Storm_SSP2_RP100_2071_2100" },
    { "name": "frederiksvaerk_WD_Storm_SSP3_RP100_2071_2100" }
];

const wmsLayersFrederikssundSaferPlacesPluvial = [
    { "name": "frederikssund_WD_Pluvial_Ref_RP20" },
    { "name": "frederikssund_WD_Pluvial_Ref_RP50" },
    { "name": "frederikssund_WD_Pluvial_Ref_RP100" },
    { "name": "frederikssund_WD_Pluvial_SSP1_RP20_2041_2070" },
    { "name": "frederikssund_WD_Pluvial_SSP1_RP50_2041_2070" },
    { "name": "frederikssund_WD_Pluvial_SSP1_RP100_2041_2070" },
    { "name": "frederikssund_WD_Pluvial_SSP2_RP20_2041_2070" },
    { "name": "frederikssund_WD_Pluvial_SSP2_RP20_2071_2100" },
    { "name": "frederikssund_WD_Pluvial_SSP2_RP50_2041_2070" },
    { "name": "frederikssund_WD_Pluvial_SSP2_RP50_2071_2100" },
    { "name": "frederikssund_WD_Pluvial_SSP2_RP100_2041_2070" },
    { "name": "frederikssund_WD_Pluvial_SSP2_RP100_2071_2100" },
    { "name": "frederikssund_WD_Pluvial_SSP3_RP20_2041_2070" },
    { "name": "frederikssund_WD_Pluvial_SSP3_RP20_2071_2100" },
    { "name": "frederikssund_WD_Pluvial_SSP3_RP50_2041_2070" },
    { "name": "frederikssund_WD_Pluvial_SSP3_RP50_2071_2100" },
    { "name": "frederikssund_WD_Pluvial_SSP3_RP100_2041_2070" },
    { "name": "frederikssund_WD_Pluvial_SSP3_RP100_2071_2100" }
];

const wmsLayersFrederikssundSaferPlacesStorm = [
    { "name": "frederikssund_WD_Storm_Reference_RP20" },
    { "name": "frederikssund_WD_Storm_Reference_RP50" },
    { "name": "frederikssund_WD_Storm_Reference_RP100" },
    { "name": "frederikssund_WD_Storm_SSP1_RP50_2041_2070" },
    { "name": "frederikssund_WD_Storm_SSP1_RP20_2071_2100" },
    { "name": "frederikssund_WD_Storm_SSP1_RP50_2071_2100" },
    { "name": "frederikssund_WD_Storm_SSP1_RP100_2071_2100" },
    { "name": "frederikssund_WD_Storm_SSP2_RP20_2041_2070" },
    { "name": "frederikssund_WD_Storm_SSP2_RP20_2071_2100" },
    { "name": "frederikssund_WD_Storm_SSP2_RP50_2041_2070" },
    { "name": "frederikssund_WD_Storm_SSP2_RP50_2071_2100" },
    { "name": "frederikssund_WD_Storm_SSP2_RP100_2041_2070" },
    { "name": "frederikssund_WD_Storm_SSP2_RP100_2071_2100" },
    { "name": "frederikssund_WD_Storm_SSP3_RP100_2071_2100" }
];

const wmsLayersJyllingeSaferPlacesStorm = [
    { "name": "jyllinge_WD_Storm_Ref_RP20" },
    { "name": "jyllinge_WD_Storm_Ref_SP50" },
    { "name": "jyllinge_WD_Storm_Ref_RP100" },
    { "name": "jyllinge_WD_Storm_SSP1_RP20_2071_2100" },
    { "name": "jyllinge_WD_Storm_SSP1_RP50_2041_2070" },
    { "name": "jyllinge_WD_Storm_SSP1_RP50_2071_2100" },
    { "name": "jyllinge_WD_Storm_SSP1_RP100_2071_2100" },
    { "name": "jyllinge_WD_Storm_SSP2_RP20_2041_2070" },
    { "name": "jyllinge_WD_Storm_SSP2_RP20_2071_2100" },
    { "name": "jyllinge_WD_Storm_SSP2_RP50_2041_2070" },
    { "name": "jyllinge_WD_Storm_SSP2_RP50_2071_2100" },
    { "name": "jyllinge_WD_Storm_SSP2_RP100_2041_2070" },
    { "name": "jyllinge_WD_Storm_SSP2_RP100_2071_2100" },
    { "name": "jyllinge_WD_Storm_SSP3_RP100_2071_2100" }
];

const wmsLayersJyllingeSaferPlacesPluvial = [
    { "name": "jyllinge_WD_Pluvial_Ref_RP20" },
    { "name": "jyllinge_WD_Pluvial_Ref_RP50" },
    { "name": "jyllinge_WD_Pluvial_Ref_RP100" },
    { "name": "jyllinge_WD_Pluvial_SSP1_RP20_2041_2070" },
    { "name": "jyllinge_WD_Pluvial_SSP1_RP20_2071_2100" },
    { "name": "jyllinge_WD_Pluvial_SSP1_RP50_2041_2070" },
    { "name": "jyllinge_WD_Pluvial_SSP1_RP50_2071_2100" },
    { "name": "jyllinge_WD_Pluvial_SSP1_RP100_2041_2070" },
    { "name": "jyllinge_WD_Pluvial_SSP1_RP100_2071_2100" },
    { "name": "jyllinge_WD_Pluvial_SSP2_RP20_2041_2070" },
    { "name": "jyllinge_WD_Pluvial_SSP2_RP20_2071_2100" },
    { "name": "jyllinge_WD_Pluvial_SSP2_RP50_2041_2070" },
    { "name": "jyllinge_WD_Pluvial_SSP2_RP50_2071_2100" },
    { "name": "jyllinge_WD_Pluvial_SSP2_RP100_2041_2070" },
    { "name": "jyllinge_WD_Pluvial_SSP2_RP100_2071_2100" },
    { "name": "jyllinge_WD_Pluvial_SSP3_RP20_2041_2070" },
    { "name": "jyllinge_WD_Pluvial_SSP3_RP20_2071_2100" },
    { "name": "jyllinge_WD_Pluvial_SSP3_RP50_2041_2070" },
    { "name": "jyllinge_WD_Pluvial_SSP3_RP50_2071_2100" },
    { "name": "jyllinge_WD_Pluvial_SSP3_RP100_2041_2070" },
    { "name": "jyllinge_WD_Pluvial_SSP3_RP100_2071_2100" }
];

interface Config {
    pygeoapiBaseUrl: string;
}

interface LayerGroupDefinition {
    [key: string]: string[] | LayerGroupDefinition;
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
                properties: { title: "GeoJSON Layer", type: "GeoJSON" }
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
                    id: layerName,
                    type: "WMS"
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
        // Consolidated list of all WMS layers to be categorized
        const allWmsLayers = [
            ...wmsLayersFrederikssundScalgoPluvial,
            ...wmsLayersFrederikssundScalgoStorm,
            ...wmsLayersFrederikssundSaferPlacesPluvial,
            ...wmsLayersFrederikssundSaferPlacesStorm,
            ...wmsLayersFrederiksvaerkScalgoPluvial,
            ...wmsLayersFrederiksvaerkScalgoStorm,
            ...wmsLayersFrederiksvaerkSaferPlacesPluvial,
            ...wmsLayersFrederiksvaerkSaferPlacesStorm,
            ...wmsLayersJyllingeScalgoStorm,
            ...wmsLayersJyllingeSaferPlacesPluvial,
            ...wmsLayersJyllingeSaferPlacesStorm,
            ...wmsLayersFrederikssundDamagecostStorm
        ];

        // A function to create a new GroupLayer with default properties
        const createGroup = (title: string, id: string, layers: (SimpleLayer | GroupLayer)[] = []) => {
            return new GroupLayer({
                title: title,
                id: id,
                visible: false,
                layers: layers.filter(layer => layer != null), // Filter out null layers
                attributes: {
                    "legend": {
                        Component: WaterLevelLegend
                    }
                }
            });
        };

        // Helper function to find a layer by its name
        const getLayer = (name: string) => {
            const layer = allWmsLayers.find(l => l.name === name);
            return layer ? this.createWmsLayer(layer.name, layer.name, layer.name) : null;
        };

        const createNestedGroups = (groupStructure: LayerGroupDefinition, parentId = ""): GroupLayer[] => {
            const groups: GroupLayer[] = [];
            for (const [title, content] of Object.entries(groupStructure)) {
                const id = parentId ? `${parentId}-${title.toLowerCase().replace(/ /g, "_")}` : title.toLowerCase().replace(/ /g, "_");
                if (Array.isArray(content)) {
                    const layers = content.map(layerName => getLayer(layerName)).filter(Boolean) as SimpleLayer[];
                    if (layers.length > 0) {
                        groups.push(createGroup(title, id, layers));
                    }
                } else if (typeof content === "object") {
                    const subgroup = createNestedGroups(content, id);
                    if (subgroup.length > 0) {
                        groups.push(createGroup(title, id, subgroup));
                    }
                }
            }
            return groups;
        };
        

        // Define the layer organization as an object 
        // Change here for any additional layers/subgroups
        const layerDefinition = {
            "Coastal Flooding": {
                "Reference Period": {
                    "RP20": [
                        "jyllinge_WD_Storm_Ref_RP20",
                        "frederiksvaerk_WD_Storm_Ref_RP20",
                        "frederikssund_WD_Storm_Reference_RP20",
                        "SP_Frederikssund_Storm_Ref_RP20_RP50__Agricultural_areas",
                        "SP_Frederikssund_Storm_Ref_RP20_RP50__Biodiversity",
                        "SP_Frederikssund_Storm_Ref_RP20_RP50__Buildings",
                        "SP_Frederikssund_Storm_Ref_RP20_RP50__Human",
                        "SP_Frederikssund_Storm_Ref_RP20_RP50__Industry_staff",
                        "SP_Frederikssund_Storm_Ref_RP20_RP50__Public_service",
                        "SP_Frederikssund_Storm_Ref_RP20_RP50__Recreative_areas",
                        "SP_Frederikssund_Storm_Ref_RP20_RP50__Road_traffic",
                        "SP_Frederikssund_Storm_Ref_RP20_RP50__Tourism"
                    ],
                    "RP50": [
                        "jyllinge_WD_Storm_Ref_SP50",
                        "frederiksvaerk_WD_Storm_Ref_RP50",
                        "frederikssund_WD_Storm_Reference_RP50"
                    ],
                    "RP100": [
                        "jyllinge_WD_Storm_Ref_RP100",
                        "frederiksvaerk_WD_Storm_Ref_RP100",
                        "frederikssund_WD_Storm_Reference_RP100",
                        "SP_Frederikssund_Storm_Ref_RP100_RP100__Agricultural_areas",
                        "SP_Frederikssund_Storm_Ref_RP100_RP100__Biodiversity",
                        "SP_Frederikssund_Storm_Ref_RP100_RP100__Buildings",
                        "SP_Frederikssund_Storm_Ref_RP100_RP100__Human",
                        "SP_Frederikssund_Storm_Ref_RP100_RP100__Industry_staff",
                        "SP_Frederikssund_Storm_Ref_RP100_RP100__Public_service",
                        "SP_Frederikssund_Storm_Ref_RP100_RP100__Recreative_areas",
                        "SP_Frederikssund_Storm_Ref_RP100_RP100__Road_traffic",
                        "SP_Frederikssund_Storm_Ref_RP100_RP100__Tourism"
                    ]
                },
                "Low Emissions (SSP1)": {
                    "Mid Century (2041-2070)": {
                        "RP20": [],
                        "RP50": [
                            "jyllinge_WD_Storm_SSP1_RP50_2041_2070",
                            "frederikssund_WD_Storm_SSP1_RP50_2041_2070",
                            "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Agricultural_areas",
                            "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Biodiversity",
                            "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Buildings",
                            "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Human",
                            "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Industry_staff",
                            "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Public_service",
                            "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Recreative_areas",
                            "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Road_traffic",
                            "SP_Frederikssund_Storm_SSP1_RP50_RP50_2041_2070__Tourism"
                        ],
                        "RP100": []
                    },
                    "Long Term (2071-2100)": {
                        "RP20": [
                            "jyllinge_WD_Storm_SSP1_RP20_2071_2100",
                            "frederiksvaerk_WD_Storm_SSP1_RP20_2071_2100",
                            "frederikssund_WD_Storm_SSP1_RP20_2071_2100",
                            "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Agricultural_areas",
                            "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Biodiversity",
                            "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Buildings",
                            "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Human",
                            "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Industry_staff",
                            "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Public_service",
                            "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Recreative_areas",
                            "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Road_traffic",
                            "SP_Frederikssund_Storm_SSP1_RP20_RP50_2071_2100__Tourism"
                        ],
                        "RP50": [
                            "jyllinge_WD_Storm_SSP1_RP50_2071_2100",
                            "frederiksvaerk_WD_Storm_SSP1_RP50_2071_2100",
                            "frederikssund_WD_Storm_SSP1_RP50_2071_2100"
                        ],
                        "RP100": [
                            "jyllinge_WD_Storm_SSP1_RP100_2071_2100",
                            "frederiksvaerk_WD_Storm_SSP1_RP100_2071_2100",
                            "frederikssund_WD_Storm_SSP1_RP100_2071_2100",
                            "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Agricultural_areas",
                            "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Biodiversity",
                            "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Buildings",
                            "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Human",
                            "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Industry_staff",
                            "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Public_service",
                            "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Recreative_areas",
                            "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Road_traffic",
                            "SP_Frederikssund_Storm_SSP1_RP100_RP100_2071_2100__Tourism"
                        ]
                    }
                },
                "Moderate Emissions (SSP2)": {
                    "Mid Century (2041-2070)": {
                        "RP20": [
                            "jyllinge_WD_Storm_SSP2_RP20_2041_2070",
                            "frederiksvaerk_WD_Storm_SSP2_RP20_2041_2070",
                            "frederikssund_WD_Storm_SSP2_RP20_2041_2070",
                            "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Agricultural_areas",
                            "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Biodiversity",
                            "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Buildings",
                            "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Human",
                            "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Industry_staff",
                            "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Public_service",
                            "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Recreative_areas",
                            "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Road_traffic",
                            "SP_Frederikssund_Storm_SSP2_RP20_RP50_2041_2070__Tourism"
                        ],
                        "RP50": [
                            "jyllinge_WD_Storm_SSP2_RP50_2041_2070",
                            "frederiksvaerk_WD_Storm_SSP2_RP50_2041_2070",
                            "frederikssund_WD_Storm_SSP2_RP50_2041_2070"
                        ],
                        "RP100": [
                            "jyllinge_WD_Storm_SSP2_RP100_2041_2070",
                            "frederiksvaerk_WD_Storm_SSP2_RP100_2041_2070",
                            "frederikssund_WD_Storm_SSP2_RP100_2041_2070",
                            "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Agricultural_areas",
                            "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Biodiversity",
                            "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Buildings",
                            "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Human",
                            "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Industry_staff",
                            "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Public_service",
                            "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Recreative_areas",
                            "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Road_traffic",
                            "SP_Frederikssund_Storm_SSP2_RP100_RP100_2041_2070__Tourism"
                        ]
                    },
                    "Long Term (2071-2100)": {
                        "RP20": [
                            "jyllinge_WD_Storm_SSP2_RP20_2071_2100",
                            "frederiksvaerk_WD_Storm_SSP2_RP20_2071_2100",
                            "frederikssund_WD_Storm_SSP2_RP20_2071_2100"
                        ],
                        "RP50": [
                            "jyllinge_WD_Storm_SSP2_RP50_2071_2100",
                            "frederiksvaerk_WD_Storm_SSP2_RP50_2071_2100",
                            "frederikssund_WD_Storm_SSP2_RP50_2071_2100"
                        ],
                        "RP100": [
                            "jyllinge_WD_Storm_SSP2_RP100_2071_2100",
                            "frederiksvaerk_WD_Storm_SSP2_RP100_2071_2100",
                            "frederikssund_WD_Storm_SSP2_RP100_2071_2100"
                        ]
                    }
                },
                "High Emissions (SSP3)": {
                    "Mid Century (2041-2070)": {
                        "RP20": [],
                        "RP50": [],
                        "RP100": []
                    },
                    "Long Term (2071-2100)": {
                        "RP20": [],
                        "RP50": [],
                        "RP100": [
                            "jyllinge_WD_Storm_SSP3_RP100_2071_2100",
                            "frederiksvaerk_WD_Storm_SSP3_RP100_2071_2100",
                            "frederikssund_WD_Storm_SSP3_RP100_2071_2100"
                        ]
                    }
                }
            },
            "Pluvial Flooding": {
                "Reference Period": {
                    "RP20": [
                        "jyllinge_WD_Pluvial_Ref_RP20",
                        "frederiksvaerk_WD_Pluvial_Ref_RP20",
                        "frederikssund_WD_Pluvial_Ref_RP20"
                    ],
                    "RP50": [
                        "jyllinge_WD_Pluvial_Ref_RP50",
                        "frederiksvaerk_WD_Pluvial_Ref_RP50",
                        "frederikssund_WD_Pluvial_Ref_RP50"
                    ],
                    "RP100": [
                        "jyllinge_WD_Pluvial_Ref_RP100",
                        "frederiksvaerk_WD_Pluvial_Ref_RP100",
                        "frederikssund_WD_Pluvial_Ref_RP100"
                    ]
                },
                "Low Emissions (SSP1)": {
                    "Mid Century (2041-2070)": {
                        "RP20": [
                            "jyllinge_WD_Pluvial_SSP1_RP20_2041_2070",
                            "frederiksvaerk_WD_Pluvial_SSP1_RP20_2041_2070",
                            "frederikssund_WD_Pluvial_SSP1_RP20_2041_2070"
                        ],
                        "RP50": [
                            "jyllinge_WD_Pluvial_SSP1_RP50_2041_2070",
                            "frederiksvaerk_WD_Pluvial_SSP1_RP50_2041_2070",
                            "frederikssund_WD_Pluvial_SSP1_RP50_2041_2070"
                        ],
                        "RP100": [
                            "jyllinge_WD_Pluvial_SSP1_RP100_2041_2070",
                            "frederiksvaerk_WD_Pluvial_SSP1_RP100_2041_2070",
                            "frederikssund_WD_Pluvial_SSP1_RP100_2041_2070"
                        ]
                    },
                    "Long Term (2071-2100)": {
                        "RP20": ["jyllinge_WD_Pluvial_SSP1_RP20_2071_2100"],
                        "RP50": ["jyllinge_WD_Pluvial_SSP1_RP50_2071_2100"],
                        "RP100": ["jyllinge_WD_Pluvial_SSP1_RP100_2071_2100"]
                    }
                },
                "Moderate Emissions (SSP2)": {
                    "Mid Century (2041-2070)": {
                        "RP20": [
                            "jyllinge_WD_Pluvial_SSP2_RP20_2041_2070",
                            "frederiksvaerk_WD_Pluvial_SSP2_RP20_2041_2070",
                            "frederikssund_WD_Pluvial_SSP2_RP20_2041_2070"
                        ],
                        "RP50": [
                            "jyllinge_WD_Pluvial_SSP2_RP50_2041_2070",
                            "frederiksvaerk_WD_Pluvial_SSP2_RP50_2041_2070",
                            "frederikssund_WD_Pluvial_SSP2_RP50_2041_2070"
                        ],
                        "RP100": [
                            "jyllinge_WD_Pluvial_SSP2_RP100_2041_2070",
                            "frederiksvaerk_WD_Pluvial_SSP2_RP100_2041_2070",
                            "frederikssund_WD_Pluvial_SSP2_RP100_2041_2070"
                        ]
                    },
                    "Long Term (2071-2100)": {
                        "RP20": [
                            "jyllinge_WD_Pluvial_SSP2_RP20_2071_2100",
                            "frederiksvaerk_WD_Pluvial_SSP2_RP20_2071_2100",
                            "frederikssund_WD_Pluvial_SSP2_RP20_2071_2100"
                        ],
                        "RP50": [
                            "jyllinge_WD_Pluvial_SSP2_RP50_2071_2100",
                            "frederiksvaerk_WD_Pluvial_SSP2_RP50_2071_2100",
                            "frederikssund_WD_Pluvial_SSP2_RP50_2071_2100"
                        ],
                        "RP100": [
                            "jyllinge_WD_Pluvial_SSP2_RP100_2071_2100",
                            "frederiksvaerk_WD_Pluvial_SSP2_RP100_2071_2100",
                            "frederikssund_WD_Pluvial_SSP2_RP100_2071_2100"
                        ]
                    }
                },
                "High Emissions (SSP3)": {
                    "Mid Century (2041-2070)": {
                        "RP20": [
                            "jyllinge_WD_Pluvial_SSP3_RP20_2041_2070",
                            "frederiksvaerk_WD_Pluvial_SSP3_RP20_2041_2070",
                            "frederikssund_WD_Pluvial_SSP3_RP20_2041_2070"
                        ],
                        "RP50": [
                            "jyllinge_WD_Pluvial_SSP3_RP50_2041_2070",
                            "frederiksvaerk_WD_Pluvial_SSP3_RP50_2041_2070",
                            "frederikssund_WD_Pluvial_SSP3_RP50_2041_2070"
                        ],
                        "RP100": [
                            "jyllinge_WD_Pluvial_SSP3_RP100_2041_2070",
                            "frederiksvaerk_WD_Pluvial_SSP3_RP100_2041_2070",
                            "frederikssund_WD_Pluvial_SSP3_RP100_2041_2070"
                        ]
                    },
                    "Long Term (2071-2100)": {
                        "RP20": [
                            "jyllinge_WD_Pluvial_SSP3_RP20_2071_2100",
                            "frederiksvaerk_WD_Pluvial_SSP3_RP20_2071_2100",
                            "frederikssund_WD_Pluvial_SSP3_RP20_2071_2100"
                        ],
                        "RP50": [
                            "jyllinge_WD_Pluvial_SSP3_RP50_2071_2100",
                            "frederiksvaerk_WD_Pluvial_SSP3_RP50_2071_2100",
                            "frederikssund_WD_Pluvial_SSP3_RP50_2071_2100"
                        ],
                        "RP100": [
                            "jyllinge_WD_Pluvial_SSP3_RP100_2071_2100",
                            "frederiksvaerk_WD_Pluvial_SSP3_RP100_2071_2100",
                            "frederikssund_WD_Pluvial_SSP3_RP100_2071_2100"
                        ]
                    }
                }
            }
        };

        const coastalFloodingGroup = new GroupLayer({
            title: "Coastal Flooding",
            id: "coastal_flooding",
            visible: false,
            attributes: {
                "legend": {
                    Component: WaterLevelLegend
                }
            },
            layers: createNestedGroups(layerDefinition["Coastal Flooding"], "coastal_flooding")
        });
        
        const pluvialFloodingGroup = new GroupLayer({
            title: "Pluvial Flooding",
            id: "pluvial_flooding",
            visible: false,
            attributes: {
                "legend": {
                    Component: WaterLevelLegend
                }
            },
            layers: createNestedGroups(layerDefinition["Pluvial Flooding"], "pluvial_flooding")
        });

        // Combine all Scalgo layers into a single group, no known groupings yet 
        const scalgoLayers = [
            ...wmsLayersFrederikssundScalgoPluvial,
            ...wmsLayersFrederikssundScalgoStorm,
            ...wmsLayersFrederiksvaerkScalgoPluvial,
            ...wmsLayersFrederiksvaerkScalgoStorm,
            ...wmsLayersJyllingeScalgoStorm
        ];

        const scalgoGroup = new GroupLayer({
            title: "SCALGO model",
            id: "scalgo_model",
            visible: false,
            attributes: {
                "legend": {
                    Component: WaterLevelLegend
                }
            },
            layers: scalgoLayers.map(({ name }) => this.createWmsLayer(name, name, name))
        });

        // const test = new SimpleLayer({
        //     id: "saferplaces90",
        //     title: "saferplaces 90mm ",
        //     description: "testing saferplaces 90mm pluvial",
        //     visible: true,
        //     olLayer: new TileLayer({
        //         source: new TileWMS({
        //             url: "https://directed.dev.52north.org/geoserver/directed/wms", 
        //             params: {
        //                 LAYERS: "rwl1_saferplaces_pluvial_roskilde_90mm"
        //             }, 
        //             properties: {
        //                 title: "Layer Title",
        //                 type: "GeoTIFF"
        //             },
        //         }),
        //     }),
        //     isBaseLayer: false
        // });

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
                // coastalFloodingGroup,
                // pluvialFloodingGroup,
                // scalgoGroup
            ]
        };
    }
}