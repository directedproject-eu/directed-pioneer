// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { reactive, Reactive } from "@conterra/reactivity-core";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import { Style } from "ol/style.js";
import * as GeoTIFFJS from "geotiff"; // geotiff.js for reading values

import chroma from "chroma-js";

const legend_text = {
    hurs: "Near-Surface Relative Humidity in %",
    pr: "Precipitation in kg·m⁻²·s⁻¹",
    rsds: "Surface Downwelling Shortwave Radiation in W/m²",
    sfcwind: "Near-Surface Wind Speed in m/s",
    spei12: "SPEI drought index",
    tas: "Near-Surface Air Temperature in K",
    tasmax: "Daily Maximum Near-Surface Air Temperature in K",
    tasmin: "Daily Minimum Near-Surface Air Temperature in K"
};

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

export interface LayerHandler extends DeclaredService<"app.LayerHandler"> {
    setYear(newYear: number): void;
    setMonth(newMonth: number): void;
    setScenario(newScenario: string): void;
    setVariable(newVariable: string): void;
    setModel(newModel: string): void;
}

export class LayerHandlerImpl implements LayerHandler {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

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
            this.layer = new WebGLTileLayer({
                source: this.updateSource(),
                style: {
                    color: this.createColorGradiant([0, 100])
                },
                properties: { title: "Layer Title" }
            });
            model?.layers.addLayer(
                new SimpleLayer({
                    id: "isimip",
                    description: legend_text["hurs"],
                    title: this.#selectedVariable.value,
                    isBaseLayer: false,
                    olLayer: this.layer
                })
            );
            this.layer.setZIndex(0);
        });
    }

    setYear(newYear: number): void {
        this.#selectedYear.value = newYear;
        this.layer?.setSource(this.updateSource());
        this.updateStyle();
    }

    setMonth(newMonth: number): void {
        this.#selectedMonth.value = newMonth;
        this.layer?.setSource(this.updateSource());
        this.updateStyle();
    }

    setScenario(newScenario: string): void {
        this.#selectedScenario.value = newScenario;
        this.layer?.setSource(this.updateSource());
        this.updateStyle();
    }

    setVariable(newVariable: string): void {
        this.#selectedVariable.value = newVariable;
        this.layer?.setSource(this.updateSource());
        this.updateStyle();
        this.changeTitleOfLayer(this.#selectedVariable.value);
    }
    setModel(newModel: string): void {
        this.#selectedModel.value = newModel;
        this.layer?.setSource(this.updateSource());
        this.updateStyle();
    }
    get legendMetadata(): legendMetadata {
        return this.#legendMetadata.value;
    }

    get variable(): string {
        return this.#selectedVariable.value;
    }

    private updateSource(): GeoTIFF {
        return new GeoTIFF({
            projection: "EPSG:4326",
            normalize: false,
            sources: [
                {
                    url: `https://52n-directed.obs.eu-de.otc.t-systems.com/data/isimip/cogs/${this.#selectedScenario.value}/${this.#selectedModel.value}/${this.#selectedVariable.value}/${this.#selectedScenario.value}_${this.#selectedModel.value}_${this.#selectedVariable.value}_mon_${this.#selectedYear.value}-${this.#selectedMonth.value}.tif`,
                    nodata: -5.3e37
                }
            ]
        });
    }

    private updateStyle(): Style {
        const url = `https://52n-directed.obs.eu-de.otc.t-systems.com/data/isimip/cogs/${this.#selectedScenario.value}/${this.#selectedModel.value}/${this.#selectedVariable.value}/${this.#selectedScenario.value}_${this.#selectedModel.value}_${this.#selectedVariable.value}_mon_${this.#selectedYear.value}-${this.#selectedMonth.value}.tif`;
        getRangeFromGeoTiff(url)
            .then((range) => {
                this.#legendMetadata.value = {
                    range: range,
                    variable: this.#selectedVariable.value
                };

                this.layer?.setStyle({
                    color: this.createColorGradiant([range[0], range[1]])
                });
            })
            .catch((error) => console.error("Error fetching max value:", error));

        return new Style({});
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
    private changeTitleOfLayer(newTitle: string) {
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            model?.layers.getLayerById("isimip")?.setTitle(newTitle);
            model?.layers
                .getLayerById("isimip")
                ?.setDescription(legend_text[this.#selectedVariable.value]);
        });
    }
}
