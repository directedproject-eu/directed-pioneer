// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
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
}

export class ForecastServiceImpl implements ForecastService {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;
    private total_precip: WebGLTileLayer | undefined;
    private rate_precip: WebGLTileLayer | undefined;

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            
            //DKSS sea level mean deviation
            this.layer = new WebGLTileLayer({
                source: this.updateSource(""),
                style: {
                    color: this.createColorGradiant([0, 100])
                },
                properties: { title: "Sea Level Mean Deviation Forecasts" }
            });
            model?.layers.addLayer(
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
                    visible: false,
                })
            );

            //Harmonie total precip
            this.total_precip = new WebGLTileLayer({
                source: this.updateSource(""),
                style: {
                    color: this.createColorGradiant([0, 100])
                },
                properties: { title: "Total Precipitation Forecasts" }
            });
            model?.layers.addLayer(
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
                    visible: false,
                })
            );

            //Harmonie precipitation rate
            this.rate_precip = new WebGLTileLayer({
                source: this.updateSource(""),
                style: {
                    color: this.createColorGradiant([0, 100])
                },
                properties: { title: "Precipitation Rate Forecasts" }
            });
            model?.layers.addLayer(
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
                    visible: false,
                })
            );

            this.layer.setZIndex(0);
            this.total_precip.setZIndex(0);
            this.rate_precip.setZIndex(0);

        });
    }

    setFileUrl(url: string): void {
        if (this.layer) {
            //update the tile layer source with the new .tif file URL from the JSON
            const newSource = this.updateSource(url); //use geotiff source
            this.layer.setSource(newSource); //set source to layer
            this.updateStyleForUrl(url, "layer");
        }
    }

    setFileUrl2(url2: string): void {
        if (this.total_precip) {
            const newSource = this.updateSource(url2); 
            this.total_precip.setSource(newSource); 
            this.updateStyleForUrl(url2, "total_precip");
        }
    }

    setFileUrl3(url3: string): void {
        if (this.rate_precip) {
            const newSource = this.updateSource(url3); 
            this.rate_precip.setSource(newSource); 
            this.updateStyleForUrl(url3, "rate_precip");
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

    private createColorGradiant(range: number[]) {
        const transparentWhite = "rgba(255, 255, 255, 0)";
        const l_01 = "#ff958c"; //rgb (255,149,140)
        const l_02 = "#ee85b5"; //rgb (238,133,181)
        const l_03 = "#ca61c3"; //rgb (202,97,195)
        const l_04 = "#883677"; //rgb (136,54,119)
        const l_05 = "#441151"; //rgb (68,17,81)

        const colorMapping = [
            { value: 0, color: transparentWhite, label: "0 m" },
            { value: 0.05, color: l_01, label: "0.05 m" },
            { value: 0.3, color: l_02, label: "0.30 m" },
            { value: 0.55, color: l_03, label: "0.55 m" },
            { value: 0.7, color: l_04, label: "0.70 m" },
            { value: 0.95, color: l_04, label: "0.95 m" }
        ];

        //boundaries for each color
        const boundaries = colorMapping.map((item) => item.value);
        const gradientColors = colorMapping.map((item) => item.color);

        //color scale using chroma.js with gradient and defined bounds
        const colorScale = chroma.scale(gradientColors).domain(boundaries).mode("lab");

        //color gradient with interpolation for each boundary
        const ColorGradient = [
            "interpolate",
            ["linear"],
            ["band", 1],
            ...boundaries.flatMap((boundary) => [boundary, colorScale(boundary).hex()])
        ];

        return ColorGradient;
    }

    private updateStyleForUrl(url: string, layerType: "layer" | "total_precip" | "rate_precip" ) {
        console.log("Update style based on URL:", url);
    }
}
