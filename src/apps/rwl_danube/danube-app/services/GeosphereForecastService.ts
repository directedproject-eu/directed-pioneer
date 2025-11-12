// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, MapModel, SimpleLayer, GroupLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import chroma from "chroma-js";
import { PrecipitationForecastLegend } from "../components/legends/PrecipitationForecastLegend";

interface References {
    mapRegistry: MapRegistry;
}

export interface GeosphereForecastService extends DeclaredService<"app.GeosphereForecastService"> {
    setFileUrl(url: string): void;
    getMapModel(): Promise<MapModel | undefined>;
}

export class GeosphereForecastServiceImpl implements GeosphereForecastService {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: this.updateSource(""),
                style: {
                    color: this.createColorGradient([0, 100])
                },
                properties: { title: "Total rainfall amount" }
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
        return await this.mapRegistry.getMapModel(this.MAP_ID);
    }

    setFileUrl(url: string): void {
        if (this.layer) {
            // update the tile layer source with the new .tif file URL from the JSON
            const newSource = this.updateSource(url);
            this.layer.setSource(newSource);
            // this.updateStyleForUrl(url, "layer");
        }
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

    private precipTotalColorMap = [
        { value: 0, color: "rgba(255, 255, 255, 0)", label: "0" },
        { value: 5, color: "#af7ab3", label: "5" },
        { value: 10, color: "#95649a", label: "10" },
        { value: 20, color: "#885889", label: "20" },
        { value: 50, color: "#674571", label: "50" },
        { value: 100, color: "#503752", label: "100" }
    ];

    private createColorGradient(range: number[]) {
        const colorMapping = this.precipTotalColorMap;
        const boundaries = colorMapping.map((item) => item.value);
        const gradientColors = colorMapping.map((item) => item.color);
        const colorScale = chroma.scale(gradientColors).domain(boundaries).mode("lab");

        return [
            "interpolate",
            ["linear"],
            ["band", 1],
            ...boundaries.flatMap((boundary) => [boundary, colorScale(boundary).hex()])
        ];
    }
}
