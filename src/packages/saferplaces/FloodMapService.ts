// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import chroma from "chroma-js";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { get as getProjection } from "ol/proj";
import { FloodMapLegend } from "./FloodMapLegend";


interface References {
    mapRegistry: MapRegistry;
}

interface ColorStop {
    value: number;
    color: string;
    label: string;
    opacity?: number;
}

export interface FloodMapService extends DeclaredService<"app.FloodMapService"> {
    addFloodMapLayer(url: string, title: string): void;
    // Function to remove previous flood map layers
    // clearFloodMapLayers(): void;
}

export class FloodMapServiceImpl implements FloodMapService {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;
    private addedLayerIds: string[] = []; // List of layer IDs added by service, used for cleanup 
    private NODATA_VALUE = -5.3e37;
    private FLOOD_MAP_OPACITY = 0.8; 
    private CRS_CODE = "EPSG:3035";


    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        const crsDef = "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs";

        if (proj4) {
            proj4.defs(this.CRS_CODE, crsDef);
            register(proj4);
            const projExtent = [2500000.0, 1500000.0, 6500000.0, 5500000.0]; // ETRS89, EPSG:3035
            const proj = getProjection(this.CRS_CODE);
            console.log(`INFO: Registered CRS ${this.CRS_CODE} for stable rendering`);
        } else {
            console.warn("WARNING: proj4 library unavailable. CRS stability might be affected.");
        }
    }

    async addFloodMapLayer(url: string, title: string): Promise<void> {
        //// Option to clear old layers before adding new one
        // await this.clearFloodMapLayers();
        const model = await this.mapRegistry.getMapModel(this.MAP_ID);
        if (!model) {
            console.error("Map model not found.");
            return;
        }

        // DEBUG 
        console.log("DEBUG SUCCESS(1): Map Model found. Attempting to add layer..");

        // 1. Define a unique ID for the new layer
        const layerId = `floodmap-output-${Date.now()}`;

        // 2. Create the OpenLayers WebGL layer and GeoTIFF source
        const olLayer = new WebGLTileLayer({
            source: new GeoTIFF({
                projection: this.CRS_CODE,
                normalize: false,
                sources: [{ url: url, nodata: this.NODATA_VALUE}] 
            }),
            style: this.createFloodMapStyle(), 
            properties: { title: title }
        });
        
        olLayer.setZIndex(10); // Ensure it draws on top of base layers

        // 3. Wrap it in a SimpleLayer for the TOC
        const floodLayer = new SimpleLayer({
            id: layerId,
            title: title,
            description: `Generated Flood Map from ${title}`,
            olLayer: olLayer,
            attributes: {
                "legend": {
                    Component: FloodMapLegend
                }
            },
            isBaseLayer: false,
            visible: true
        });

        // 4. Add the layer to the MapModel (and thus the TOC)
        model.layers.addLayer(floodLayer);
        this.addedLayerIds.push(layerId); // Store ID for potential removal
        console.log(`DEBUG SUCESS (2): Added new flood map layer: ${layerId}`);
    }

    // async clearFloodMapLayers(): Promise<void> {
    //     const model = await this.mapRegistry.getMapModel(this.MAP_ID);
    //     if (!model) {
    //         console.warn("Map model not found. Cannot clear layers.");
    //         return;
    //     }

    //     this.addedLayerIds.forEach(id => {
    //         const layer = model.layers.getLayerById(id);
    //         if (layer) {
    //             model.layers.removeLayer(layer);
    //         }
    //     });
    //     this.addedLayerIds = []; 
    //     console.log("Cleared all dynamically generated flood map layers.");
    // }

    private floodDepthColormap: ColorStop[] = [
        { value: 0.00, color: "#FFFFFF", label: "0m", opacity: 0.05 }, // Transparent
        // Shallow Flood (High Contrast)
        { value: 0.05, color: "#87CEFA", label: "5cm", opacity: 0.95 }, 
        { value: 0.50, color: "#00BFFF", label: "0.5m", opacity: 0.95 },
        // Medium Flood
        { value: 1.00, color: "#3282F6", label: "1m", opacity: 0.95 },
        { value: 3.00, color: "#005BA1", label: "3m", opacity: 0.95 },
        // Deep Flood / Clipping
        { value: 6.00, color: "#001E64", label: "6m", opacity: 0.95 }, 
        { value: 10.00, color: "#4B0082", label: "10m", opacity: 1.0 }, // Indigo/Deep Purple
        { value: 15.00, color: "#800080", label: "15m", opacity: 1.0 }, // Solid Purple
        { value: 15.01, color: "#FF0000", label: "> 15m", opacity: 1.0 } // Alarm Red for clipping
    ];


    private createFloodMapStyle() {
        const colorMapping = this.floodDepthColormap;

        // Extract boundaries and colors
        const boundaries = colorMapping.map((item) => item.value);
        const gradientColors = colorMapping.map((item) => item.color);

        // Use chroma-js to create a continuous color scale
        const colorScale = chroma.scale(gradientColors).domain(boundaries).mode("lab");

        // Generate interpolation points using chroma-js, converting output to RGBA strings
        const chromaStops: (number | string)[] = boundaries.flatMap((boundary) => {
            // Get the color and convert it to RGBA string with the desired fixed opacity
            const rgb = colorScale(boundary).rgb();
            let opacity = this.FLOOD_MAP_OPACITY;

            const stop = colorMapping.find(s => s.value === boundary); 
            if (stop && stop.opacity !== undefined) {
                opacity = stop.opacity;
            } else if (boundary === 0.00) {
                opacity = 0.05; // Default low opacity for 0m if not specified 
            }
            const roundedRgb = rgb.map(Math.round); // Round rbg values so there are no floating-point RGB values
            const rgbaString = `rgba(${roundedRgb[0]}, ${roundedRgb[1]}, ${roundedRgb[2]}, ${opacity})`;

            return [
                boundary,
                rgbaString // Use RGBA string for transparency
            ];
        });
        
        // Prepend the transparent stop
        const finalInterpolationStops: (number | string)[] = [
            // Absolute lowest value for transparency (Nodata)
            -100.00, "rgba(255, 255, 255, 0.0)", 
            ...chromaStops // Starts at 0.00m
        ];

        return {
            color: [
                "interpolate",
                ["linear"],
                ["band", 1], // Read the first band
                ...finalInterpolationStops
                // -10.00, "rgba(255, 255, 0, 1.0)", // solid yellow
                // 0.00, "rgba(10, 245, 237)", // teal
                // 100.00, "rgba(245, 49, 10)" // red
            ], 
            variables: {
                nodata: this.NODATA_VALUE
            }, 
            default: "rgba(0, 0, 0, 0.0)" // transparent
        };
    }
}