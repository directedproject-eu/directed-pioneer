// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { reactive, Reactive } from "@conterra/reactivity-core";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, SimpleLayer, GroupLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import { WaterLevelLegend } from "../Components/Legends/WaterLevelLegend";

const layer_info = {
    "saferplaces": {
        "title": "SaferPlaces Model",
        "description": 
            "SaferPlaces is an advanced flood risk model which can be used to assess pluvial, fluvial and coastal flood hazards and risk in consideration of both historical, current and future climate scenarios to provide information about urban flood risks."
    },
    "rim2d": {
        "title": "RIM2D Model",
        "description": 
            "The RIM2D is an advanced hydraulic simulation tool, designed primarily for urban pluvial, fluvial and coastal flood risk assessments and forecasting."
    }, 
    "scalgo": {
        "title": "SCALGO Model",
        "description": 
            "The Scalgo model is a high-resolution 3-dimensional flood model capable of global coverage. The Scalgo model is used in the Copenhagen RWL for data pertaining to flooding within the municipalities along the Roskilde Fjord. "
    }
};

const modelLocationMap: Record<string, Record<string, string[]>> = {
    "saferplaces": {
        "pluvial": ["frederiksvaerk", "halsnaes", "frederikssund", "jyllinge", "roskilde"], 
        "coastal": ["frederiksvaerk", "halsnaes", "frederikssund", "jyllinge", "roskilde"], 
    }, 
    "rim2d": {
        "pluvial": ["roskilde_fjord"], 
        "coastal": ["roskilde_fjord"], 
    }, 
    "scalgo": {
        "pluvial": ["frederiksvaerk", "halsnaes", "frederikssund", "jyllinge", "roskilde"], 
        "coastal": ["roskilde_fjord"], 
    }, 
};

const SLIDER_CONFIG: Record<string, { min: number, max: number, unit: string, step: number }> = {
    "pluvial": {
        min: 30, 
        max: 150, // Rainfall in mm (30-150)
        unit: "mm",
        step: 10 
    },
    "coastal": {
        min: 170, 
        max: 300, // Storm surge in cm (170-300)
        unit: "cm",
        step: 10 
    }
};

const LAYER_IDS = Object.keys(layer_info);
const WMS_URL = "https://directed.dev.52north.org/geoserver/directed/wms";

interface References {
    mapRegistry: MapRegistry;
}

interface legendMetadata {
    range: number[];
    variable: string;
}

export interface FloodHandler extends DeclaredService<"app.FloodHandler"> {
    setFloodType(newFloodType: string): void;
    setFloodLevel(newFloodLevel: number): void;
    setModel(newModel: string): void;

    getFloodType(): string; 
    getFloodLevel(): number; 
    getModel(): string; 

    legendMetadata: legendMetadata;

    selectedFloodType: Reactive<string>; 
    selectedFloodLevel: Reactive<number>;
    selectedModel: Reactive<string>;
}

const DEFAULT_MODEL_ID = LAYER_IDS[0] as string; 


export class FloodHandlerImpl implements FloodHandler {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;
    private modelLayers: Record<string, Record<string, TileLayer>> = {}; 
    
    // Reactive state vars
    #selectedFloodType: Reactive<string> = reactive("pluvial");
    #selectedFloodLevel: Reactive<number> = reactive(30);
    #selectedModel: Reactive<string> = reactive(DEFAULT_MODEL_ID); 
    #legendMetadata: Reactive<legendMetadata> = reactive({ range: [0, 100], variable: "water_depth" });

    private getModelAllLocations(modelId: string): string[] {
        const modelKey = modelId as keyof typeof modelLocationMap;
        const pluvial = modelLocationMap[modelKey]?.["pluvial"] || [];
        const coastal = modelLocationMap[modelKey]?.["coastal"] || [];
        // Use Set to get unique locations from both pluvial and coastal lists
        return Array.from(new Set([...pluvial, ...coastal]));
    }

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            if (!model){
                console.error(`Map model '${this.MAP_ID}' not found.`);
                return;
            }

            LAYER_IDS.forEach((modelId) => {
                const modelKey = modelId as keyof typeof layer_info; 
                const locationLayers: Record<string, TileLayer> = (this.modelLayers[modelId] = {} as Record<string, TileLayer>);
                const locations = modelLocationMap[modelKey]!["pluvial"];
                if (!locations) { return; }

                // Get every unique location fro both pluvial and coastal
                const allLocations = this.getModelAllLocations(modelId); 
                if (allLocations.length === 0) { return; }
                
                // Array to collect the SimpleLayer instances
                const simpleLayers: SimpleLayer[] = []; 
                
                // Create sublayer for each location, loop through all possible locations 
                // So they exist in the map registry
                allLocations.forEach((locationId) => {
                    const subLayerId = `${modelKey}-${locationId}`;
                    const layer = new TileLayer({
                        properties: { 
                            title: `${layer_info[modelKey]["title"]} (${locationId})`, 
                            type: "WMS_tiles",
                            // type: "WMS", 
                            id: subLayerId
                        },
                        extent: [-2782996, 4000985, 4254277, 11753013],
                        visible: true, 
                    });
                    
                    locationLayers[locationId] = layer;

                    // Push the new SimpleLayer instance into the array
                    simpleLayers.push(
                        new SimpleLayer({
                            id: subLayerId,
                            title: locationId,
                            isBaseLayer: false,
                            olLayer: layer,
                            visible: true, 
                        })
                    );
                });

                // Create grouplayer using the collected layers array
                const modelGroup = new GroupLayer({
                    id: modelKey,
                    description: layer_info[modelKey]["description"],
                    title: layer_info[modelKey]["title"],
                    isBaseLayer: false,
                    attributes: {
                        "legend": {
                            Component: WaterLevelLegend
                        }
                    },
                    visible: modelKey === this.#selectedModel.value,
                    layers: simpleLayers, 
                });

                model.layers.addLayer(modelGroup);
                
                if (modelGroup.olLayer) {
                    modelGroup.olLayer.setZIndex(0); 
                }
            });

            this.updateSourceandVisibility(); // Initial load
        });
    }

    async getMapModel() {
        return await this.mapRegistry.getMapModel(this.MAP_ID);
    }

    setFloodType(newFloodType: string): void {
        const config = (SLIDER_CONFIG[newFloodType] || SLIDER_CONFIG["pluvial"])!;
        this.#selectedFloodType.value = newFloodType;
        this.#selectedFloodLevel.value = config.min;
        // Update sublayer visibility for all models based on the new flood type
        LAYER_IDS.forEach(modelId => {
            this.updateSublayerVisibility(modelId, newFloodType);
        });
        this.updateSourceandVisibility();
    }

    setFloodLevel(newFloodLevel: number): void {
        this.#selectedFloodLevel.value = newFloodLevel;
        this.updateSourceandVisibility();
    }

    setModel(newModel: string): void {
        this.#selectedModel.value = newModel;
        this.updateModelVisibility(newModel);
        this.updateSource(); // Update source data for all models
        this.updateVisibility(); // Update titles/descriptions for all models
        // this.updateSourceandVisibility();
    }

    get legendMetadata(): legendMetadata {
        return this.#legendMetadata.value;
    }

    getFloodType(): string {
        return this.#selectedFloodType.value;
    }

    getFloodLevel(): number {
        return this.#selectedFloodLevel.value;
    }

    getModel(): string {
        return this.#selectedModel.value;
    }

    get selectedFloodType(): Reactive<string> {
        return this.#selectedFloodType;
    }

    get selectedFloodLevel(): Reactive<number> {
        return this.#selectedFloodLevel;
    }

    get selectedModel(): Reactive<string> {
        return this.#selectedModel;
    }

    private buildLayerName(location: string, model: string): string {
        const level = this.#selectedFloodLevel.value;
        const floodType = this.#selectedFloodType.value;
        
        const suffix = floodType === "pluvial" ? "mm" : "cm";
        const levelString = `${level}${suffix}`;
        
        // Layer name format: rwl1_[model]_[floodtype]_[location]_[level]
        const fileLocation = location.toLowerCase(); 
        return `rwl1_${model}_${floodType}_${fileLocation}_${levelString}`; 
    }


    private updateSource(): void {
        const floodType = this.#selectedFloodType.value;
        
        // Loop over ALL LAYER_IDS (models) to update their source data.
        LAYER_IDS.forEach(modelId => {
            const modelLayerMap = this.modelLayers[modelId];
            if (!modelLayerMap) return;
            
            const modelKey = modelId as keyof typeof modelLocationMap;
            const typeKey = floodType as keyof typeof modelLocationMap[typeof modelKey];
            
            const activeLocations = modelLocationMap[modelKey]?.[typeKey] || [];

            // Locations for the currently selected flood type 
            activeLocations.forEach(locationId => {
                const layer = modelLayerMap[locationId];
                if (!layer) return; 

                // Pass the current modelId to buildLayerName
                const layerName = this.buildLayerName(locationId, modelId); 

                const newSource = new TileWMS({
                    url: WMS_URL, 
                    params: {
                        LAYERS: layerName, 
                        TILED: true, 
                    },
                    projection: "EPSG:4326" 
                });
                layer.setSource(newSource); 
            });
        });
    }

    private updateVisibility(): void {
        const levelUnit = this.#selectedFloodType.value === "pluvial" ? "mm" : "cm";
        
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            LAYER_IDS.forEach(id => {
                const groupLayer = model?.layers.getLayerById(id);
                if (groupLayer) {
                    const infoKey = id as keyof typeof layer_info;
                    // Update the description/title for all layers regardless of selection state
                    groupLayer.setTitle(layer_info[infoKey]["title"]);
                    groupLayer.setDescription(`Flood Type: ${this.#selectedFloodType.value.toUpperCase()}. Level: ${this.#selectedFloodLevel.value}${levelUnit}. ${layer_info[infoKey]["description"]}`);
                }
            });
        });
    }

    private updateSublayerVisibility(modelId: string, floodType: string): void {
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            const groupLayer = model?.layers.getLayerById(modelId) as GroupLayer | undefined ;
            if (!groupLayer) return;

            const modelKey = modelId as keyof typeof modelLocationMap;
            const typeKey = floodType as keyof typeof modelLocationMap[typeof modelKey];
            // Get list of locations for the new floodType
            const requiredLocations = modelLocationMap[modelKey]?.[typeKey] || [];
            // Iterate through all sub-layers in the group
            groupLayer.layers.getLayers().forEach((subLayer) => {
                if (subLayer instanceof SimpleLayer) {
                    // Extract locations part of the ID
                    const locationId = subLayer.id.replace(`${modelId}-`, "");
                    const isRequired = requiredLocations.includes(locationId);
                    // Update the TOC 
                    subLayer.setVisible(isRequired); 
                    // Update OL instance 
                    if(subLayer.olLayer) {
                        subLayer.olLayer.setVisible(isRequired);
                    }
                }
            });
        });
    }

    private updateModelVisibility(newModelId: string): void {
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            LAYER_IDS.forEach(id => {
                const groupLayer = model?.layers.getLayerById(id);
                if (groupLayer) {
                    groupLayer.setVisible(id === newModelId);
                }
            });
        });
    }
    
    private updateSourceandVisibility(): void {
        this.updateSource();
        this.updateVisibility();
    }
}