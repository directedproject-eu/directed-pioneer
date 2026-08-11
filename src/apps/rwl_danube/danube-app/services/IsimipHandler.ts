// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { reactive, Reactive } from "@conterra/reactivity-core";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import * as GeoTIFFJS from "geotiff"; // geotiff.js for reading values
import Legend from "../components/legends/Legend";

import chroma from "chroma-js";

const layer_info = {
    "hurs": {
        "title": "Near-Surface Relative Humidity",
        "description": "Near-Surface Relative Humidity in %"
    },
    "pr": {
        "title": "Precipitation",
        "description": "Precipitation in kg·m⁻²·s⁻¹"
    },
    "rsds": {
        "title": "Surface Downwelling Shortwave Radiation",
        "description": "Surface Downwelling Shortwave Radiation in W/m²"
    },
    "sfcwind": {
        "title": "Near-Surface Wind Speed",
        "description": "Near-Surface Wind Speed in m/s"
    },
    "spei12": {
        "title": "SPEI drought index",
        "description": "SPEI drought index"
    },
    "tas": {
        "title": "Near-Surface Air Temperature",
        "description": "Near-Surface Air Temperature in K"
    },
    "tasmax": {
        "title": "Daily Maximum Near-Surface Air Temperature",
        "description": "Daily Maximum Near-Surface Air Temperature in K"
    },
    "tasmin": {
        "title": "Daily Minimum Near-Surface Air Temperature",
        "description": "Daily Minimum Near-Surface Air Temperature in K"
    }
};

/** Pixels at or beyond this magnitude are fill values, not measurements. */
const FILL_VALUE_THRESHOLD = 1e29;

async function getRangeFromGeoTiff(url: string): Promise<[number, number] | undefined> {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        const tiff = await GeoTIFFJS.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();

        const rasterData = await image.readRasters();
        const bandData = rasterData[0]; // expecting only one band in the geotif
        if (!bandData) {
            throw new Error("The geotiff contains no raster band");
        }

        let min = Infinity;
        let max = -Infinity;
        for (const value of bandData) {
            if (!Number.isFinite(value) || Math.abs(value) >= FILL_VALUE_THRESHOLD) {
                continue;
            }
            if (value < min) min = value;
            if (value > max) max = value;
        }

        // spei12 accumulates over twelve months, so its files for the first year consist
        // entirely of fill values. Report "no usable range" instead of a degenerate one.
        return min <= max ? [min, max] : undefined;
    } catch (error) {
        // Rethrow rather than return a substitute: the caller keeps the previous range,
        // which is wrong but usable, instead of feeding NaN into the colour scale.
        throw new Error(`Failed to read the value range from ${url}`, { cause: error });
    }
}

interface References {
    mapRegistry: MapRegistry;
}

interface legendMetadata {
    range: [number, number];
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
    private layer: WebGLTileLayer | undefined;

    #selectedYear: Reactive<number> = reactive(1991);
    #selectedMonth: Reactive<number> = reactive(1);
    #selectedScenario: Reactive<string> = reactive("ssp585");
    #selectedModel: Reactive<string> = reactive("canesm5");
    #selectedVariable: Reactive<string> = reactive("hurs");
    #legendMetadata: Reactive<legendMetadata> = reactive({ range: [0, 100], variable: "hurs" });
    /** Identifies the most recent range request, so that stale answers can be dropped. */
    #styleRequestId = 0;

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        const variable = this.#selectedVariable.value;
        const info = layer_info[variable];

        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                style: {
                    color: this.createColorGradiant([0, 100])
                },
                properties: {
                    title: info.title,
                    type: "GeoTIFF",
                    id: "isimip"
                },
                extent: [-2782996, 4000985, 4254277, 11753013]
            });
            this.updateSource();
            model?.layers.addLayer(
                // new GroupLayer({
                //     title: "Isimip Data",
                //     visible: true,
                //     id: "isimip",
                //     layers: []
                // }),
                new SimpleLayer({
                    id: "isimip",
                    description: info.description,
                    title: info.title,
                    isBaseLayer: false,
                    olLayer: this.layer,
                    visible: false,
                    attributes: {
                        "legend": {
                            Component: Legend
                        }
                    }
                })
            );
            this.layer.setZIndex(0);
        });
    }

    async getMapModel() {
        return await this.mapRegistry.getMapModel(this.MAP_ID);
    }

    setYear(newYear: number): void {
        this.#selectedYear.value = newYear;
        this.updateSource();
        this.updateStyle();
    }

    setMonth(newMonth: number): void {
        this.#selectedMonth.value = newMonth;
        this.updateSource();
        this.updateStyle();
    }

    setScenario(newScenario: string): void {
        this.#selectedScenario.value = newScenario;
        this.updateSource();
        this.updateStyle();
    }

    setVariable(newVariable: string): void {
        this.#selectedVariable.value = newVariable;
        this.updateSource();
        this.updateStyle();
        this.changeLayerInfo();
    }
    setModel(newModel: string): void {
        this.#selectedModel.value = newModel;
        this.updateSource();
        this.updateStyle();
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

    private updateSource(): void {
        if (this.#selectedScenario.value == "ssp126") {
            this.layer?.setSource(null);

            this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
                model?.layers.getLayerById("isimip")?.setDescription("No map data available");
                model?.layers.getLayerById("isimip")?.setVisible(false);
                model?.layers.getLayerById("isimip")?.setTitle("No map data available");
            });
        } else {
            this.changeLayerInfo();
            const newSource = new GeoTIFF({
                projection: "EPSG:4326",
                normalize: false,
                sources: [
                    {
                        url: `https://52n-directed.obs.eu-de.otc.t-systems.com/data/isimip/cogs/${this.#selectedScenario.value}/${this.#selectedModel.value}/${this.#selectedVariable.value}/${this.#selectedScenario.value}_${this.#selectedModel.value}_${this.#selectedVariable.value}_mon_${this.#selectedYear.value}-${this.#selectedMonth.value}.tif`,
                        nodata: -5.3e37
                    }
                ]
            });
            this.layer?.setSource(newSource);
        }
    }

    private updateStyle() {
        const url = `https://52n-directed.obs.eu-de.otc.t-systems.com/data/isimip/cogs/${this.#selectedScenario.value}/${this.#selectedModel.value}/${this.#selectedVariable.value}/${this.#selectedScenario.value}_${this.#selectedModel.value}_${this.#selectedVariable.value}_mon_${this.#selectedYear.value}-${this.#selectedMonth.value}.tif`;
        // Read at request time, not when the answer arrives: switching the variable in
        // between must not label this range with the name of another one.
        const variable = this.#selectedVariable.value;
        const requestId = ++this.#styleRequestId;

        getRangeFromGeoTiff(url)
            .then((range) => {
                // A newer request was started meanwhile -- that one decides the style.
                if (requestId !== this.#styleRequestId) {
                    return;
                }
                if (!range) {
                    // Nothing but fill values in this file; keep the previous scale.
                    return;
                }
                this.#legendMetadata.value = { range: range, variable: variable };
                this.layer?.setStyle({
                    color: this.createColorGradiant(range)
                });
            })
            .catch((error) => {
                if (requestId === this.#styleRequestId) {
                    console.error("Error fetching the value range:", error);
                }
            });
    }
    private createColorGradiant(range: [number, number]) {
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
    private changeLayerInfo() {
        const info = layer_info[this.#selectedVariable.value];

        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            model?.layers.getLayerById("isimip")?.setTitle(info.title);
            model?.layers.getLayerById("isimip")?.setDescription(info.description);
        });

        if (this.layer) {
            this.layer.setProperties({
                title: info.title,
                description: info.description
            });
        }
    }
}
