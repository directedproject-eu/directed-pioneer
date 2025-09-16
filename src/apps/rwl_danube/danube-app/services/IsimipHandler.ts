// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { reactive, Reactive } from "@conterra/reactivity-core";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { GroupLayer, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import * as GeoTIFFJS from "geotiff"; // geotiff.js for reading values

import chroma from "chroma-js";

const LAYER_INFO = [
    {
        "name": "hurs",
        "title": "Near-Surface Relative Humidity",
        "description": "Near-Surface Relative Humidity in %"
    },
    {
        "name": "pr",
        "title": "Precipitation",
        "description": "Precipitation in kg·m⁻²·s⁻¹"
    },
    {
        "name": "rsds",
        "title": "Surface Downwelling Shortwave Radiation",
        "description": "Surface Downwelling Shortwave Radiation in W/m²"
    },
    {
        "name": "sfcwind",
        "title": "Near-Surface Wind Speed",
        "description": "Near-Surface Wind Speed in m/s"
    },
    {
        "name": "spei12",
        "title": "SPEI drought index",
        "description": "SPEI drought index"
    },
    {
        "name": "tas",
        "title": "Near-Surface Air Temperature",
        "description": "Near-Surface Air Temperature in K"
    },
    {
        "name": "tasmax",
        "title": "Daily Maximum Near-Surface Air Temperature",
        "description": "Daily Maximum Near-Surface Air Temperature in K"
    },
    {
        "name": "tasmin",
        "title": "Daily Minimum Near-Surface Air Temperature",
        "description": "Daily Minimum Near-Surface Air Temperature in K"
    }
];

async function getRangeFromGeoTiff(url: string): Promise<number[]> {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        const tiff = await GeoTIFFJS.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();

        const rasterData = await image.readRasters();
        const bandData = rasterData[0]; // expecting only one band in the geotif

        const maxValue = Math.max(...bandData);
        const minValue = Math.min(...bandData);

        return [minValue, maxValue];
    } catch (error) {
        console.error("Error reading GeoTIFF:", error);
        return NaN;
    }
}

interface References {
    mapRegistry: MapRegistry;
}

interface legendMetadata {
    range: number[];
    variable: string;
}

export interface IsimipHandler extends DeclaredService<"app.IsimipHandler"> {
    setYear(newYear: number): void;
    setMonth(newMonth: number): void;
    setScenario(newScenario: string): void;
    setVariable(newVariable: string): void;
    setModel(newModel: string): void;
}

export class IsimipHandlerImpl implements IsimipHandler {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;
    private olLayers: { [id: string] : WebGLTileLayer; } = {};
    private layers: SimpleLayer[] = [];

    #selectedYear: Reactive<number> = reactive(1991);
    #selectedMonth: Reactive<number> = reactive(1);
    #selectedScenario: Reactive<string> = reactive("ssp585");
    #selectedModel: Reactive<string> = reactive("canesm5");
    #selectedVariable: Reactive<string> = reactive("hurs");
    #legendMetadata: Reactive<legendMetadata> = reactive({ range: [0, 100], variable: "hurs" });

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            LAYER_INFO.forEach( ({name, title, description}) => {
                const olLayer = this.createWebGLTileLayer(name, title);
                this.olLayers[name] = olLayer;
                this.layers.push(new SimpleLayer({
                    id: name,
                    title: title,
                    description: description,
                    isBaseLayer: false,
                    olLayer: olLayer,
                    visible: false
                }));
            });
            const groupLayer = new GroupLayer({
                title: "Climate projections",
                visible: false,
                id: "climate_projections",
                description: "Monthly climate projections from the Inter-Sectoral Impact Model Intercomparison Project (ISIMIP). \
                Data is available for different climate models and Shared Socioeconomic Pathways (SSP). Use the menus in the \
                \"Climate projections\" box at the top to switch between them. The time sliders can be used to change the year (1991-2100) and months.",
                layers: this.layers
            });
            model?.layers.addLayer(groupLayer);
        });
    }

    createWebGLTileLayer(layerId: string, layerTitle: string) {
        return new WebGLTileLayer({
            style: {
                color: this.createColorGradiant([0, 100])
            },
            properties: { title: layerTitle },
            extent: [-2782996, 4000985, 4254277, 11753013],
            source: new GeoTIFF({
                projection: "EPSG:4326",
                normalize: false,
                sources: [
                    {
                        url: `https://52n-directed.obs.eu-de.otc.t-systems.com/data/isimip/cogs/${this.#selectedScenario.value}/${this.#selectedModel.value}/${layerId}/${this.#selectedScenario.value}_${this.#selectedModel.value}_${layerId}_mon_${this.#selectedYear.value}-${this.#selectedMonth.value}.tif`,
                        nodata: -5.3e37
                    }
                ]
            })
        });
    }

    setYear(newYear: number): void {
        this.#selectedYear.value = newYear;
        this.updateSources();
        this.updateStyles();
    }

    setMonth(newMonth: number): void {
        this.#selectedMonth.value = newMonth;
        this.updateSources();
        this.updateStyles();
    }

    setScenario(newScenario: string): void {
        this.#selectedScenario.value = newScenario;
        this.updateSources();
        this.updateStyles();
    }

    setVariable(newVariable: string): void {
        this.#selectedVariable.value = newVariable;
        this.updateSources();
        this.updateStyles();
    }
    setModel(newModel: string): void {
        this.#selectedModel.value = newModel;
        this.updateSources();
        this.updateStyles();
    }
    get legendMetadata(): legendMetadata {
        return this.#legendMetadata.value;
    }

    get variable(): string {
        return this.#selectedVariable.value;
    }

    get selectedModel(): string {
        return this.#selectedModel.value;
    }

    get selectedScenario(): string {
        return this.#selectedScenario.value;
    }

    get selectedYear(): number {
        return this.#selectedYear.value;
    }

    private updateSource(layerId: string): void {
        if (this.#selectedScenario.value == "ssp126") {
            this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
                model?.layers.getLayerById(layerId)?.setDescription("No map data available");
                model?.layers.getLayerById(layerId)?.setVisible(false);
                model?.layers.getLayerById(layerId)?.setTitle("No map data available");
                this.olLayers[layerId]?.setSource(null);
            });
        } else {
            const newSource = new GeoTIFF({
                projection: "EPSG:4326",
                normalize: false,
                sources: [
                    {
                        url: `https://52n-directed.obs.eu-de.otc.t-systems.com/data/isimip/cogs/${this.#selectedScenario.value}/${this.#selectedModel.value}/${layerId}/${this.#selectedScenario.value}_${this.#selectedModel.value}_${layerId}_mon_${this.#selectedYear.value}-${this.#selectedMonth.value}.tif`,
                        nodata: -5.3e37
                    }
                ]
            });
            this.olLayers[layerId]?.setSource(newSource);
        }
    }

    private updateSources(): void {
        for (const layer in this.olLayers) {
            this.updateSource(layer);
        }
    }

    private updateStyle(layerId: string) {
        const url = `https://52n-directed.obs.eu-de.otc.t-systems.com/data/isimip/cogs/${this.#selectedScenario.value}/${this.#selectedModel.value}/${layerId}/${this.#selectedScenario.value}_${this.#selectedModel.value}_${layerId}_mon_${this.#selectedYear.value}-${this.#selectedMonth.value}.tif`;
        getRangeFromGeoTiff(url)
            .then((range) => {
                console.log(range);
                this.#legendMetadata.value = {
                    range: range,
                    variable: layerId
                };
                this.olLayers[layerId]?.setStyle({
                    color: this.createColorGradiant([range[0], range[1]])
                });
            })
            .catch((error) => console.error("Error fetching max value:", error));
    }

    private updateStyles(): void {
        for (const layer in this.olLayers) {
            this.updateStyle(layer);
        }
    }

    private createColorGradiant(range: number[]) {
        const tempColors = {
            black: "#00000000",
            pink: "#eb7fe9BC",
            cold_blue: "#4f59cdBC",
            ice_blue: "#1ceae1BC",
            green: "#5fdf65BC",
            yellow: "#eade57BC",
            orange: "#ec8647BC",
            red: "#832525BC",
            dark_red: "#53050aBC" //rgba(83,5,10,0.74)
        };
        const increment = (range[1] - range[0]) / 8;

        const boundaries_temp = [
            range[0],
            range[0] + increment,
            range[0] + 2 * increment,
            range[0] + 3 * increment,
            range[0] + 4 * increment,
            range[0] + 5 * increment,
            range[0] + 6 * increment,
            range[0] + 7 * increment,
            range[1]
        ];
        const gradientColors_temp = [
            tempColors.black,
            tempColors.pink,
            tempColors.cold_blue,
            tempColors.ice_blue,
            tempColors.green,
            tempColors.yellow,
            tempColors.orange,
            tempColors.red,
            tempColors.dark_red
        ];

        const colorScale_temp = chroma
            .scale(gradientColors_temp)
            .domain(boundaries_temp)
            .mode("lab");

        const tempColorGradient = [
            "interpolate",
            ["linear"], // Specify the interpolation type
            ["band", 1], // The data band
            ...boundaries_temp.flatMap((boundary) => [boundary, colorScale_temp(boundary).hex()])
        ];
        return tempColorGradient;
    }
}
