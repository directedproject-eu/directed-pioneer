// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { reactive, Reactive } from "@conterra/reactivity-core";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, MapModel, SimpleLayer, GroupLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import * as GeoTIFFJS from "geotiff"; // geotiff.js for reading values
import chroma from "chroma-js";
import PrecipitationForecastLegend from "../components/legends/PrecipitationForecastLegend";
import { MAP_ID } from "./MapProvider";

interface References {
    mapRegistry: MapRegistry;
}

export interface GeosphereForecastService extends DeclaredService<"app.GeosphereForecastService"> {
    /** Range the colour scale currently represents. Reactive. */
    readonly legendMetadata: LegendMetadata;

    setFileUrl(url: string): void;
    getMapModel(): Promise<MapModel | undefined>;
}

export interface LegendMetadata {
    range: [number, number];
}

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

        // A forecast file can be entirely fill values; report "no usable range" rather
        // than a degenerate one. Matches IsimipHandler.
        return min <= max ? [min, max] : undefined;
    } catch (error) {
        // Rethrow rather than return a substitute: the caller keeps the previous range,
        // which is wrong but usable, instead of feeding NaN into the colour scale.
        throw new Error(`Failed to read the value range from ${url}`, { cause: error });
    }
}

export class GeosphereForecastServiceImpl implements GeosphereForecastService {
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    #legendMetadata: Reactive<LegendMetadata> = reactive({ range: [0, 100] });
    /** Identifies the most recent range request, so that stale answers can be dropped. */
    #styleRequestId = 0;

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: this.updateSource(""),
                style: {
                    color: this.createColorGradient([0, 100])
                },
                properties: {
                    title: "Total rainfall amount",
                    type: "GeoTIFF",
                    id: "geosphere forecast service"
                }
            });
            model?.layers.addLayer(
                new GroupLayer({
                    id: "geosphere_forecasts",
                    title: "GeoSphere Forecasts",
                    visible: false,
                    layers: [
                        new SimpleLayer({
                            id: "rain_acc_forecast",
                            title: "Total Rainfall Amount Forecasts",
                            description:
                                "Accumulated total amount of rainfall since start of the forecast, based on GeoSphere's forecast model AROME. Forecasts available for 60 hours at hourly intervals.",
                            olLayer: this.layer,
                            attributes: {
                                "legend": {
                                    Component: PrecipitationForecastLegend
                                }
                            },
                            isBaseLayer: false,
                            visible: false
                        })
                    ]
                })
            );
            this.layer.setZIndex(0);
        });
    }

    async getMapModel() {
        return await this.mapRegistry.getMapModel(MAP_ID);
    }

    setFileUrl(url: string): void {
        if (this.layer) {
            // update the tile layer source with the new .tif file URL from the JSON
            const newSource = this.updateSource(url);
            this.layer.setSource(newSource);
            this.updateStyle(url);
        }
    }

    get legendMetadata(): LegendMetadata {
        return this.#legendMetadata.value;
    }

    private updateSource(url: string): GeoTIFF {
        return new GeoTIFF({
            projection: "EPSG:4326",
            normalize: false,
            sources: [
                {
                    url: url,
                    nodata: -5.3e37
                }
            ]
        });
    }

    private updateStyle(url: string) {
        const requestId = ++this.#styleRequestId;

        getRangeFromGeoTiff(url)
            .then((range) => {
                // A newer forecast was selected meanwhile -- that one decides the style.
                if (requestId !== this.#styleRequestId) {
                    return;
                }
                if (!range) {
                    // Nothing but fill values in this file; keep the previous scale.
                    return;
                }
                this.#legendMetadata.value = { range: range };
                this.layer?.setStyle({
                    color: this.createColorGradient(range)
                });
            })
            .catch((error) => {
                if (requestId === this.#styleRequestId) {
                    console.error("Error fetching the value range:", error);
                }
            });
    }

    private createColorGradient(range: [number, number]) {
        if (range[0] === range[1]) {
            return "#00000000";
        }
        const tempColors = {
            color1: "#00000000",
            color2: "#af7ab3",
            color3: "#95649a",
            color4: "#885889",
            color5: "#674571",
            color6: "#503752"
        };
        const increment = (range[1] - range[0]) / 5;

        const boundaries_temp = [
            range[0],
            range[0] + increment,
            range[0] + 2 * increment,
            range[0] + 3 * increment,
            range[0] + 4 * increment,
            range[1]
        ];
        const gradientColors_temp = [
            tempColors.color1,
            tempColors.color2,
            tempColors.color3,
            tempColors.color4,
            tempColors.color5,
            tempColors.color6
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
