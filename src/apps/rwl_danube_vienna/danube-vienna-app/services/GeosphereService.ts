// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, MapModel, SimpleLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import chroma from "chroma-js";
import { PrecipitationLegend } from "../Components/Legends/PrecipitationLegend";

interface References {
    mapRegistry: MapRegistry;
}

export interface GeosphereService extends DeclaredService<"app.GeosphereService"> {
    setFileUrl(url: string): void;
    getMapModel(): Promise<MapModel | undefined>;
}

export class GeosphereServiceImpl implements GeosphereService {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: this.updateSource(
                    "https://52n-directed.obs.eu-de.otc.t-systems.com/data/geosphere/historical/daily_precipitation_sum/20240101T000000.tif"
                ),
                style: {
                    color: this.createColorGradient()
                },
                properties: { title: "GeoSphere daily precipitation sum" }
            });
            model?.layers.addLayer(
                new SimpleLayer({
                    id: "daily_precipitation_sum",
                    title: "Precipitation",
                    description:
                        "Daily precipitation sums for 2024 in Austria provided by GeoSphere.",
                    olLayer: this.layer,
                    attributes: {
                        "legend": {
                            Component: PrecipitationLegend
                        }
                    },
                    isBaseLayer: false,
                    visible: false
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
            const newSource = this.updateSource(url);
            this.layer.setSource(newSource);
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
        { value: 25, color: "#af7ab3", label: "25" },
        { value: 50, color: "#95649a", label: "50" },
        { value: 100, color: "#885889", label: "100" },
        { value: 200, color: "#674571", label: "200" },
        { value: 300, color: "#503752", label: "300" }
    ];

    private createColorGradient() {
        const boundaries = this.precipTotalColorMap.map((item) => item.value);
        const gradientColors = this.precipTotalColorMap.map((item) => item.color);

        const colorScale = chroma.scale(gradientColors).domain(boundaries).mode("lab");

        return [
            "interpolate",
            ["linear"],
            ["band", 1],
            ...boundaries.flatMap((boundary) => [boundary, colorScale(boundary).hex()])
        ];
    }
}
