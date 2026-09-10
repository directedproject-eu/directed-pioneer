// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, PackageIntl, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, MapModel, SimpleLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { FlowVelocityLegend } from "../Components/Legends/FlowVelocityLegend";
import { FIRST_TIME, SOURCE_PROJECTION } from "../config/floodDepth";
import { buildVelocityUrl, flowVelocityColorMap } from "../config/flowVelocity";
import { buildColorGradient } from "../config/geotiffStyle";
import { NotificationService } from "@open-pioneer/notifier";
import { createGeoTiffSource } from "./geotiff";

interface References {
    mapRegistry: MapRegistry;
    notificationService: NotificationService;
}

// Register UTM 32N (EPSG:25832) with OpenLayers so the geotiff source is reprojected
// correctly to EPSG:3857. Idempotent -- the water depth service does the same.
proj4.defs(
    SOURCE_PROJECTION,
    "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);
register(proj4);

export interface FlowVelocityService extends DeclaredService<"app.FlowVelocityService"> {
    setFileUrl(url: string): void;
    getMapModel(): Promise<MapModel | undefined>;
}

/**
 * Manages a time-varying flow velocity geotiff layer (HRB Eicherscheid).
 * Built like {@link FloodDepthService}; the shared time slider calls `setFileUrl(url)`,
 * which swaps the geotiff source for the one of the selected time.
 */
export class FlowVelocityServiceImpl implements FlowVelocityService {
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
                source: this.createSource(buildVelocityUrl(FIRST_TIME)),
                style: {
                    color: buildColorGradient(flowVelocityColorMap)
                },
                properties: {
                    title: intl.formatMessage({ id: "flow_velocity.layer_title" }),
                    type: "GeoTIFF",
                    id: "flow_velocity"
                }
            });
            model?.layers.addLayer(
                new SimpleLayer({
                    id: "flow_velocity",
                    title: intl.formatMessage({ id: "flow_velocity.layer_title" }),
                    description: intl.formatMessage({ id: "flow_velocity.layer_description" }),
                    olLayer: this.layer,
                    attributes: {
                        "legend": {
                            Component: FlowVelocityLegend
                        }
                    },
                    isBaseLayer: false,
                    visible: false
                })
            );
            // Above the water depth layer (zIndex 5) when both are active.
            this.layer.setZIndex(6);
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
            title: this.intl.formatMessage({ id: "flow_velocity.load_error" }),
            message: message
        });
    }
}
