// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, MapModel, SimpleLayer, GroupLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import chroma from "chroma-js";
import { SeaLevelLegend } from "../Components/Legends/SeaLevelLegend";
import { PrecipitationLegend } from "../Components/Legends/PrecipitationLegend";
import { PrecipitationRateLegend } from "../Components/Legends/PrecipitationRateLegend";

interface References {
    mapRegistry: MapRegistry;
}

export interface ForecastService extends DeclaredService<"app.ForecastService"> {
    setFileUrl(url: string): void;
    setFileUrl2(url2: string): void;
    setFileUrl3(url3: string): void;
    getMapModel(): Promise<MapModel | undefined>;
}

export class ForecastServiceImpl implements ForecastService {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;
    private total_precip: WebGLTileLayer | undefined;
    private rate_precip: WebGLTileLayer | undefined;

    //constructor with grouped DMI forecast layers
    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            //DKSS sea level mean deviation
            this.layer = new WebGLTileLayer({
                source: this.updateSource(""),
                style: {
                    color: this.createColorGradient([0, 100], "layer")
                },
                properties: { title: "Sea Level Mean Deviation Forecasts" }
            });
            //Harmonie total precip
            this.total_precip = new WebGLTileLayer({
                source: this.updateSource(""),
                style: {
                    color: this.createColorGradient([0, 100], "total_precip")
                },
                properties: { title: "Total Precipitation Forecasts" }
            });
            //Harmonie precipitation rate
            this.rate_precip = new WebGLTileLayer({
                source: this.updateSource(""),
                style: {
                    color: this.createColorGradient([0, 100], "rate_precip")
                },
                properties: { title: "Precipitation Rate Forecasts" }
            });
            model?.layers.addLayer(
                new GroupLayer({
                    id: "dmi_forecasts",
                    title: "DMI Forecasts",
                    visible: false,
                    layers: [
                        new SimpleLayer({
                            id: "sea_forecast_mean_deviation",
                            title: "Sea Level Mean Deviation Forecasts",
                            description:
                                "Deviation of sea level in meters from the mean value, based on DMI's forecast model for storm surge, DKSS. Forecasts available for 5 days at hourly intervals.",
                            olLayer: this.layer,
                            attributes: {
                                "legend": {
                                    Component: SeaLevelLegend
                                }
                            },
                            isBaseLayer: false,
                            visible: false
                        }),
                        new SimpleLayer({
                            id: "total_precipitation_forecast",
                            title: "Total Precipitation Forecasts",
                            description:
                                "Total precipitation forecasts from the HARMONIE weather model via DMI. Forecasts available for 3 days at hourly intervals.",
                            olLayer: this.total_precip,
                            attributes: {
                                "legend": {
                                    Component: PrecipitationLegend
                                }
                            },
                            isBaseLayer: false,
                            visible: false
                        }),
                        new SimpleLayer({
                            id: "precipitation_rate_forecast",
                            title: "Precipitation Rate Forecasts",
                            description:
                                "Precipitation rate forecasts from the HARMONIE weather model via DMI. Forecasts available for 3 days at hourly intervals.",
                            olLayer: this.rate_precip,
                            attributes: {
                                "legend": {
                                    Component: PrecipitationRateLegend
                                }
                            },
                            isBaseLayer: false,
                            visible: false
                        })
                    ]
                })
            );
            this.layer.setZIndex(0);
            this.total_precip.setZIndex(0);
            this.rate_precip.setZIndex(0);
        });
    }

    async getMapModel() {
        return await this.mapRegistry.getMapModel(this.MAP_ID);
    }

    setFileUrl(url: string): void {
        if (this.layer) {
            //update the tile layer source with the new .tif file URL from the JSON
            const newSource = this.updateSource(url); //use geotiff source
            this.layer.setSource(newSource); //set source to layer
            // this.updateStyleForUrl(url, "layer");
        }
    }

    setFileUrl2(url2: string): void {
        if (this.total_precip) {
            const newSource = this.updateSource(url2);
            this.total_precip.setSource(newSource);
        }
    }

    setFileUrl3(url3: string): void {
        if (this.rate_precip) {
            const newSource = this.updateSource(url3);
            this.rate_precip.setSource(newSource);
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

    private precipRateColorMap = [
        { value: 0, color: "rgba(255, 255, 255, 0)", label: "0" },
        { value: 0.015, color: "#af7ab3", label: "0.015" },
        { value: 0.03, color: "#95649a", label: "0.030" },
        { value: 0.045, color: "#885889", label: "0.045" },
        { value: 0.06, color: "#674571", label: "0.06" },
        { value: 0.075, color: "#503752", label: "0.075" }
    ];

    private seaLevelColorMap = [
        { value: 0, color: "rgba(255, 255, 255, 0)", label: "0 m" },
        { value: 0.05, color: "#ff958c", label: "0.05 m" },
        { value: 0.3, color: "#ee85b5", label: "0.30 m" },
        { value: 0.55, color: "#ca61c3", label: "0.55 m" },
        { value: 0.7, color: "#883677", label: "0.70 m" },
        { value: 0.95, color: "#441151", label: "0.95 m" }
    ];

    private createColorGradient(
        range: number[],
        layerType: "layer" | "total_precip" | "rate_precip"
    ) {
        let colorMapping;

        switch (layerType) {
            case "total_precip":
                colorMapping = this.precipTotalColorMap;
                break;
            case "rate_precip":
                colorMapping = this.precipRateColorMap;
                break;
            case "layer":
            default:
                colorMapping = this.seaLevelColorMap;
        }

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
