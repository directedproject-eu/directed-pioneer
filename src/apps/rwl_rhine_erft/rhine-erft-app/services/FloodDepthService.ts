// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry, MapModel, SimpleLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { WaterDepthLegend } from "../Components/Legends/WaterDepthLegend";
import { buildUrl, FIRST_TIME, NODATA, SOURCE_PROJECTION, waterDepthColorMap } from "../config/floodDepth";
import { buildColorGradient } from "../config/geotiffStyle";

interface References {
    mapRegistry: MapRegistry;
}

// UTM 32N (EPSG:25832) in OpenLayers registrieren, damit die GeoTIFF-Quelle korrekt
// nach EPSG:3857 (Kartenprojektion) reprojiziert wird. Muss vor der Source-Erzeugung
// laufen – daher auf Modulebene (analog zum saferplaces-FloodMapService).
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
 * Verwaltet einen zeitvariablen Wassertiefe-GeoTIFF-Layer (HRB Eicherscheid).
 * Der Timeslider ruft `setFileUrl(url)`, wodurch die GeoTIFF-Quelle des Layers
 * gegen den GeoTIFF des gewählten Zeitpunkts getauscht wird.
 */
export class FloodDepthServiceImpl implements FloodDepthService {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        const intl = options.intl;
        this.mapRegistry = mapRegistry;

        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: this.updateSource(buildUrl(FIRST_TIME)),
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
