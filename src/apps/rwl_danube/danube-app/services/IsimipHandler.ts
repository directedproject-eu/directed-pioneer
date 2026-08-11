// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { reactive, Reactive } from "@conterra/reactivity-core";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapModel, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import Legend from "../components/legends/Legend";

import chroma from "chroma-js";
import { MAP_ID } from "./MapProvider";
import { createGeoTiffSource, getRangeFromGeoTiff } from "./geotiff";

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

/** The variables `layer_info` knows about, and therefore the only ones that can be shown. */
type IsimipVariable = keyof typeof layer_info;

function isIsimipVariable(value: string): value is IsimipVariable {
    return value in layer_info;
}

/** Where the ISIMIP cloud-optimised geotiffs live. */
const ISIMIP_COG_BASE_URL = "https://52n-directed.obs.eu-de.otc.t-systems.com/data/isimip/cogs";

/** Slider drags fire one setter per step; collapse those bursts into one range request. */
const STYLE_UPDATE_DELAY_MS = 250;

interface References {
    mapRegistry: MapRegistry;
}

export interface LegendMetadata {
    range: [number, number];
    variable: string;
}

export interface IsimipHandler extends DeclaredService<"app.IsimipHandler"> {
    /** Range and variable the colour scale currently represents. Reactive. */
    readonly legendMetadata: LegendMetadata;

    setYear(newYear: number): void;
    setMonth(newMonth: number): void;
    setScenario(newScenario: string): void;
    setVariable(newVariable: string): void;
    setModel(newModel: string): void;

    getMapModel(): Promise<MapModel | undefined>;
}

/**
 * Owns the "isimip" climate raster layer: which file it shows and how it is coloured.
 *
 * The layer is not declared in `MapProvider`. This service creates it in its constructor
 * and adds it to the map model, which is why it can keep a direct reference and retitle it
 * as the selection changes. Its id is "isimip"; `Legend.tsx` and `LayerSelector.tsx` reach
 * back in through `legendMetadata` and `getMapModel()`.
 *
 * One selection -- scenario, model, variable, year, month -- addresses exactly one geotiff
 * (see {@link IsimipHandlerImpl.currentCogUrl}), and each setter triggers two things:
 *
 * - `updateSource()` immediately, swapping the raster OpenLayers displays
 * - `scheduleStyleUpdate()` debounced, which reads the file a second time to derive the
 *   value range for the colour scale and the legend
 *
 * That second read is the awkward part: the files carry no statistics in their header and
 * no overviews, so min and max can only be had by decoding the whole raster. At 126x76
 * pixels and ~50 KB that is affordable, but it means the scale is recomputed per frame --
 * so the same colour means different values in different months, and the warming trend the
 * viewer exists to show is normalised away. See BACKLOG.md; fixing it properly means fixed
 * ranges per variable, which would make most of this machinery unnecessary.
 */
export class IsimipHandlerImpl implements IsimipHandler {
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    #selectedYear: Reactive<number> = reactive(1991);
    #selectedMonth: Reactive<number> = reactive(1);
    #selectedScenario: Reactive<string> = reactive("ssp585");
    #selectedModel: Reactive<string> = reactive("canesm5");
    #selectedVariable: Reactive<IsimipVariable> = reactive("hurs");
    #legendMetadata: Reactive<LegendMetadata> = reactive({ range: [0, 100], variable: "hurs" });
    /** Identifies the most recent range request, so that stale answers can be dropped. */
    #styleRequestId = 0;
    #styleUpdateTimer: ReturnType<typeof setTimeout> | undefined;

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        const variable = this.#selectedVariable.value;
        const info = layer_info[variable];

        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
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
        return await this.mapRegistry.getMapModel(MAP_ID);
    }

    setYear(newYear: number): void {
        this.#selectedYear.value = newYear;
        this.updateSource();
        this.scheduleStyleUpdate();
    }

    setMonth(newMonth: number): void {
        this.#selectedMonth.value = newMonth;
        this.updateSource();
        this.scheduleStyleUpdate();
    }

    setScenario(newScenario: string): void {
        this.#selectedScenario.value = newScenario;
        this.updateSource();
        this.scheduleStyleUpdate();
    }

    setVariable(newVariable: string): void {
        if (!isIsimipVariable(newVariable)) {
            console.warn(
                `Ignoring unknown isimip variable '${newVariable}'; known variables are ` +
                    `${Object.keys(layer_info).join(", ")}.`
            );
            return;
        }
        this.#selectedVariable.value = newVariable;
        this.updateSource();
        this.scheduleStyleUpdate();
        this.changeLayerInfo();
    }
    setModel(newModel: string): void {
        this.#selectedModel.value = newModel;
        this.updateSource();
        this.scheduleStyleUpdate();
    }
    get legendMetadata(): LegendMetadata {
        return this.#legendMetadata.value;
    }

    /**
     * Url of the geotiff for the current selection. Read fresh at each call: the source is
     * swapped immediately while the style update is debounced, so the two legitimately
     * resolve at different points in time.
     */
    private currentCogUrl(): string {
        const scenario = this.#selectedScenario.value;
        const model = this.#selectedModel.value;
        const variable = this.#selectedVariable.value;
        const year = this.#selectedYear.value;
        const month = this.#selectedMonth.value;
        return (
            `${ISIMIP_COG_BASE_URL}/${scenario}/${model}/${variable}/` +
            `${scenario}_${model}_${variable}_mon_${year}-${month}.tif`
        );
    }

    /**
     * Points the layer at the geotiff for the current selection.
     *
     * ssp126 is offered in the selector but has no files, so it is caught here and the
     * layer is emptied and renamed. That the list of scenarios with data lives in this
     * condition rather than next to the selector is a wart -- see BACKLOG.md.
     */
    private updateSource(): void {
        if (this.#selectedScenario.value == "ssp126") {
            this.layer?.setSource(null);

            this.mapRegistry.getMapModel(MAP_ID).then((model) => {
                model?.layers.getLayerById("isimip")?.setDescription("No map data available");
                model?.layers.getLayerById("isimip")?.setVisible(false);
                model?.layers.getLayerById("isimip")?.setTitle("No map data available");
            });
        } else {
            this.changeLayerInfo();
            this.layer?.setSource(createGeoTiffSource(this.currentCogUrl()));
        }
    }

    /**
     * Defers {@link updateStyle}. Only the colour scale and the legend wait -- the raster
     * source is swapped right away, so the map itself still follows the slider without lag.
     */
    private scheduleStyleUpdate(): void {
        clearTimeout(this.#styleUpdateTimer);
        this.#styleUpdateTimer = setTimeout(() => this.updateStyle(), STYLE_UPDATE_DELAY_MS);
    }

    /**
     * Recomputes the colour scale from the values actually present in the current file.
     *
     * Never call this directly from a setter -- go through {@link scheduleStyleUpdate}, or
     * a slider drag issues one request per step.
     */
    private updateStyle() {
        const url = this.currentCogUrl();
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
    /**
     * Builds the WebGL colour expression: nine colours spread evenly across `range`.
     *
     * The result is an OpenLayers style expression, not a chroma scale -- chroma only
     * mixes the nine stop colours in Lab space, then the stops are handed to WebGL as
     * value/colour pairs so the interpolation happens on the GPU. The alpha suffix "BC" on
     * every colour is ~74% opacity, which is what lets the basemap show through.
     */
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

        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
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
