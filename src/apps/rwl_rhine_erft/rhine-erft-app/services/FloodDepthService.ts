// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, PackageIntl, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, MapModel, SimpleLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { WaterDepthLegend } from "../Components/Legends/WaterDepthLegend";
import { buildUrl, FIRST_TIME, SOURCE_PROJECTION, waterDepthColorMap } from "../config/floodDepth";
import { buildColorGradient } from "../config/geotiffStyle";
import { NotificationService } from "@open-pioneer/notifier";
import { createGeoTiffSource } from "./geotiff";

interface References {
    mapRegistry: MapRegistry;
    notificationService: NotificationService;
}

// Register UTM 32N (EPSG:25832) with OpenLayers so the geotiff source is reprojected
// correctly to EPSG:3857, the map projection. Has to run before any source is built --
// hence at module level, the same as the saferplaces FloodMapService.
proj4.defs(
    SOURCE_PROJECTION,
    "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);
register(proj4);

export interface FloodDepthService extends DeclaredService<"app.FloodDepthService"> {
    setFileUrl(url: string): void;
    getMapModel(): Promise<MapModel | undefined>;
}

/**
 * Manages a time-varying water depth geotiff layer (HRB Eicherscheid).
 * The time slider calls `setFileUrl(url)`, which swaps the layer's geotiff source for the
 * geotiff of the selected time.
 */
export class FloodDepthServiceImpl implements FloodDepthService {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;
    private notificationService: NotificationService;
    private intl: PackageIntl;
    private layer: WebGLTileLayer | undefined;
    /** Message of the error already reported, or undefined while the layer loads fine. */
    private reportedError: string | undefined;

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry, notificationService } = options.references;
        const intl = options.intl;
        this.mapRegistry = mapRegistry;
        this.notificationService = notificationService;
        this.intl = intl;

        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: this.createSource(buildUrl(FIRST_TIME)),
                style: {
                    color: buildColorGradient(waterDepthColorMap)
                },
                properties: {
                    title: intl.formatMessage({ id: "flood_depth.layer_title" }),
                    type: "GeoTIFF",
                    id: "flood_depth"
                }
            });
            model?.layers.addLayer(
                new SimpleLayer({
                    id: "flood_depth",
                    title: intl.formatMessage({ id: "flood_depth.layer_title" }),
                    description: intl.formatMessage({ id: "flood_depth.layer_description" }),
                    olLayer: this.layer,
                    attributes: {
                        "legend": {
                            Component: WaterDepthLegend
                        }
                    },
                    isBaseLayer: false,
                    visible: false
                })
            );
            this.layer.setZIndex(5);
        });
    }

    async getMapModel() {
        return await this.mapRegistry.getMapModel(this.MAP_ID);
    }

    setFileUrl(url: string): void {
        if (this.layer) {
            this.layer.setSource(this.createSource(url));
        }
    }

    private createSource(url: string) {
        return createGeoTiffSource(
            url,
            (error) => this.reportError(error),
            () => (this.reportedError = undefined)
        );
    }

    /** Reports a load failure once, until the layer has loaded successfully again. */
    private reportError(error: Error | null): void {
        const message = error?.message ?? "";
        if (this.reportedError === message) {
            return;
        }
        this.reportedError = message;
        this.notificationService.error({
            title: this.intl.formatMessage({ id: "flood_depth.load_error" }),
            message: message
        });
    }
}
