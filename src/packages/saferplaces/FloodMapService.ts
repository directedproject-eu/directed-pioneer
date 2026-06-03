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
                sources: [{ url: url, nodata: this.NODATA_VALUE }]
            }),
            style: this.createFloodMapStyle(),
            properties: { 
                title: title, 
                type: "GeoTIFF", 
                id: "geotiff"

            }
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
        { value: 0.0,  color: "#FFFFFF", label: "0m", opacity: 0.05 }, // Transparent
        
        // 0-10cm flood 
        { value: 0.02, color: "#440154", label: "2cm", opacity: 0.90 },  
        { value: 0.05, color: "#482878", label: "5cm", opacity: 0.95 },  
        { value: 0.10, color: "#3e4989", label: "10cm", opacity: 0.95 }, 
        
        // 15-35cm flood
        { value: 0.20, color: "#31688e", label: "20cm", opacity: 0.95 }, 
        { value: 0.35, color: "#26828e", label: "35cm", opacity: 0.95 }, 
        
        // 50cm-1m flood 
        { value: 0.50, color: "#1f9e89", label: "50cm", opacity: 0.95 }, 
        { value: 0.75, color: "#35b779", label: "75cm", opacity: 0.95 }, 
        { value: 1.00, color: "#6ece58", label: "1m", opacity: 0.95 }, 
        
        // Fallback max value stop 
        { value: 1.005, color: "#fde725", label: "Maximum", opacity: 0.95 }, 

        // Alarm 
        { value: 1.01, color: "#FF0000", label: "> 1m", opacity: 1.0 } 
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

            const stop = colorMapping.find((s) => s.value === boundary);
            if (stop && stop.opacity !== undefined) {
                opacity = stop.opacity;
            } else if (boundary === 0.0) {
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
            -100.0,
            "rgba(255, 255, 255, 0.0)",
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
