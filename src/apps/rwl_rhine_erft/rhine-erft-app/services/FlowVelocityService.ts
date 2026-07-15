// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, MapModel, SimpleLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { FlowVelocityLegend } from "../Components/Legends/FlowVelocityLegend";
import { FIRST_TIME, NODATA, SOURCE_PROJECTION } from "../config/floodDepth";
import { buildVelocityUrl, flowVelocityColorMap } from "../config/flowVelocity";
import { buildColorGradient } from "../config/geotiffStyle";

interface References {
    mapRegistry: MapRegistry;
}

// UTM 32N (EPSG:25832) in OpenLayers registrieren, damit die GeoTIFF-Quelle korrekt
// nach EPSG:3857 reprojiziert wird. Idempotent – der Wassertiefe-Service tut dasselbe.
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
 * Verwaltet einen zeitvariablen Fließgeschwindigkeit-GeoTIFF-Layer (HRB Eicherscheid).
 * Aufbau analog zum {@link FloodDepthService}; der gemeinsame Timeslider ruft
 * `setFileUrl(url)`, wodurch die GeoTIFF-Quelle gegen den gewählten Zeitpunkt getauscht wird.
 */
export class FlowVelocityServiceImpl implements FlowVelocityService {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        const intl = options.intl;
        this.mapRegistry = mapRegistry;

        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: this.updateSource(buildVelocityUrl(FIRST_TIME)),
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
            // Über dem Wassertiefe-Layer (zIndex 5), falls beide aktiv sind.
            this.layer.setZIndex(6);
        });
    }

    async getMapModel() {
        return await this.mapRegistry.getMapModel(this.MAP_ID);
    }

    setFileUrl(url: string): void {
        if (this.layer) {
            this.layer.setSource(this.updateSource(url));
        }
    }

    private updateSource(url: string): GeoTIFF {
        return new GeoTIFF({
            projection: SOURCE_PROJECTION,
            normalize: false,
            sources: [
                {
                    url: url,
                    nodata: NODATA
                }
            ]
        });
    }
}
