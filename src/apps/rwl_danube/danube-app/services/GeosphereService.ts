// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, MapModel, SimpleLayer, GroupLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import chroma from "chroma-js";
import { PrecipitationLegend } from "../components/legends/PrecipitationLegend";
import { MAP_ID } from "./MapProvider";
import { DAILY_PRECIPITATION_STOPS } from "../config/precipitationScale";
import { createGeoTiffSource } from "./geotiff";

interface References {
    mapRegistry: MapRegistry;
}

export interface GeosphereService extends DeclaredService<"app.GeosphereService"> {
    setFileUrl(url: string): void;
    getMapModel(): Promise<MapModel | undefined>;
}

export class GeosphereServiceImpl implements GeosphereService {
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: createGeoTiffSource(
                    "https://52n-directed.obs.eu-de.otc.t-systems.com/data/geosphere/historical/daily_precipitation_sum/20240101T000000.tif"
                ),
                style: {
                    color: this.createColorGradient()
                },
                properties: {
                    title: "GeoSphere daily precipitation sum",
                    type: "GeoTIFF",
                    id: "geosphere service"
                }
            });
            model?.layers.addLayer(
                new GroupLayer({
                    id: "geosphere_historical",
                    title: "GeoSphere Historical Data",
                    visible: false,
                    layers: [
                        new SimpleLayer({
                            id: "daily_precipitation_sum",
                            title: "Precipitation (2024)",
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
            this.layer.setSource(createGeoTiffSource(url));
        }
    }

    private createColorGradient() {
        const boundaries = DAILY_PRECIPITATION_STOPS.map((item) => item.value);
        const gradientColors = DAILY_PRECIPITATION_STOPS.map((item) => item.color);

        const colorScale = chroma.scale(gradientColors).domain(boundaries).mode("lab");

        return [
            "interpolate",
            ["linear"],
            ["band", 1],
            ...boundaries.flatMap((boundary) => [boundary, colorScale(boundary).hex()])
        ];
    }
}
