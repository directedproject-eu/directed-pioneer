// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, MapModel, SimpleLayer, GroupLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { PrecipitationLegend } from "../components/legends/PrecipitationLegend";
import { MAP_ID } from "./MapProvider";
import { DAILY_PRECIPITATION_STOPS } from "../config/precipitationScale";
import { createGeoTiffSource } from "./geotiff";
import { toColorExpression } from "../config/colorScale";

interface References {
    mapRegistry: MapRegistry;
}

export interface GeosphereService extends DeclaredService<"app.GeosphereService"> {
    setFileUrl(url: string): void;
    getMapModel(): Promise<MapModel | undefined>;
}

/**
 * Owns the "daily_precipitation_sum" raster: GeoSphere's measured daily rainfall totals
 * for Austria in 2024, one file per day.
 *
 * The layer is not declared in `MapProvider`. This service creates it here inside the
 * "geosphere_historical" group and keeps a reference so it can swap the raster as the user
 * moves through the year.
 *
 * Worth reading before the other two raster services, because this one is the simpler
 * design and arguably the right one: its colour scale is **fixed**
 * ({@link DAILY_PRECIPITATION_STOPS}, 0-300 mm in six classes). It therefore needs no
 * value-range read, no request id, no debouncing -- and a colour means the same amount of
 * rain on every day of the year, which is what makes the animation comparable.
 * IsimipHandler and GeosphereForecastService derive their scale per frame instead; see
 * BACKLOG.md for that discussion.
 *
 * The url is not built here. `TimeSlider.tsx` turns a slider position into a file name and
 * passes it to {@link setFileUrl}. The one url that *is* written out below, as the initial
 * source, is that function's output for position 0 -- the same knowledge in two places, in
 * two directories. Note also that the slider derives the file name in local time, which
 * produces a nonexistent url on the day of a midnight dst transition; see BACKLOG.md.
 */
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
        return toColorExpression(
            DAILY_PRECIPITATION_STOPS.map((stop) => stop.color),
            DAILY_PRECIPITATION_STOPS.map((stop) => stop.value)
        );
    }
}
