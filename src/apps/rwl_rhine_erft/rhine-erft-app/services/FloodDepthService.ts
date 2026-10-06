// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { WMSLayer } from "@open-pioneer/map";
import { WmsLegend } from "../Components/Legends/WMSLegend";
import { buildLayerName, FIRST_TIME, WMS_URL } from "../config/floodDepth";

export interface FloodDepthService extends DeclaredService<"app.FloodDepthService"> {
    setLayerName(name: string): void;
    /** The layer is not added to the map here; see {@link DamBreakService}. */
    getLayer(): WMSLayer;
}

/**
 * Manages a time-varying water depth WMS layer (HRB Eicherscheid).
 * GeoServer publishes one layer per timestep. The time slider calls `setLayerName(name)`,
 * which points the layer's `LAYERS` param at the layer of the selected time.
 *
 * WMSLayer derives `LAYERS` from its visible sublayers and rewrites it whenever their
 * visibility changes. The single sublayer is therefore internal: the Toc does not show it,
 * so its visibility never changes and the param set here is not overwritten.
 */
export class FloodDepthServiceImpl implements FloodDepthService {
    private layer: WMSLayer;

    constructor(options: ServiceOptions) {
        const intl = options.intl;

        this.layer = new WMSLayer({
            id: "flood_depth",
            title: intl.formatMessage({ id: "flood_depth.layer_title" }),
            description: intl.formatMessage({ id: "flood_depth.layer_description" }),
            url: WMS_URL,
            sublayers: [
                {
                    name: buildLayerName(FIRST_TIME),
                    title: intl.formatMessage({ id: "flood_depth.layer_title" }),
                    internal: true
                }
            ],
            // The legend comes from WmsLegend; skipping capabilities also avoids
            // fetching a document that lists every timestep layer.
            fetchCapabilities: false,
            attributes: {
                "legend": {
                    Component: WmsLegend
                }
            },
            isBaseLayer: false,
            visible: false
        });
        this.layer.olLayer.setZIndex(5);
    }

    getLayer(): WMSLayer {
        return this.layer;
    }

    setLayerName(name: string): void {
        this.layer.olSource?.updateParams({ LAYERS: name });
    }
}
