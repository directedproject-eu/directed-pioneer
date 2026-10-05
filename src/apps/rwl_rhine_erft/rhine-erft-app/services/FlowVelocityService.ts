// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { WMSLayer } from "@open-pioneer/map";
import ImageLayer from "ol/layer/Image";
import ImageWMS from "ol/source/ImageWMS";
import { WmsLegend } from "../Components/Legends/WMSLegend";
import { FIRST_TIME, WMS_URL } from "../config/floodDepth";
import { buildVelocityLayerName, FIRST_VELOCITY_TIME } from "../config/flowVelocity";

export interface FlowVelocityService extends DeclaredService<"app.FlowVelocityService"> {
    /** Shows the given WMS layer; `undefined` (no layer for that time) shows nothing. */
    setLayerName(name: string | undefined): void;
    /** The layer is not added to the map here; see {@link DamBreakService}. */
    getLayer(): WMSLayer;
}

/**
 * Manages a time-varying flow velocity WMS layer (HRB Eicherscheid).
 * Built like {@link FloodDepthService}; the shared time slider calls `setLayerName(name)`,
 * which points the layer's `LAYERS` param at the layer of the selected time. The single
 * sublayer is internal for the same reason as there: it keeps the Toc from toggling it,
 * which would make WMSLayer overwrite the param.
 *
 * Times without a velocity layer (t = 0) detach the source from the OpenLayers layer, the
 * same thing WMSLayer does when no sublayer is visible. WMSLayer only redoes that when the
 * sublayer visibility changes, which the internal sublayer never does.
 */
export class FlowVelocityServiceImpl implements FlowVelocityService {
    private layer: WMSLayer;

    constructor(options: ServiceOptions) {
        const intl = options.intl;

        this.layer = new WMSLayer({
            id: "flow_velocity",
            title: intl.formatMessage({ id: "flow_velocity.layer_title" }),
            description: intl.formatMessage({ id: "flow_velocity.layer_description" }),
            url: WMS_URL,
            sublayers: [
                {
                    // An existing layer; the real start time is applied below.
                    name: buildVelocityLayerName(FIRST_VELOCITY_TIME),
                    title: intl.formatMessage({ id: "flow_velocity.layer_title" }),
                    internal: true
                }
            ],
            // The legend comes from FlowVelocityLegend; see FloodDepthService.
            fetchCapabilities: false,
            attributes: {
                "legend": {
                    Component: WmsLegend
                }
            },
            isBaseLayer: false,
            visible: false
        });
        // Above the water depth layer (zIndex 5) when both are active.
        this.layer.olLayer.setZIndex(6);
        this.setLayerName(buildVelocityLayerName(FIRST_TIME));
    }

    getLayer(): WMSLayer {
        return this.layer;
    }

    setLayerName(name: string | undefined): void {
        const source = this.layer.olSource;
        if (!source) {
            return;
        }
        const olLayer = this.layer.olLayer as ImageLayer<ImageWMS>;
        if (name) {
            source.updateParams({ LAYERS: name });
            olLayer.setSource(source);
        } else {
            olLayer.setSource(null);
        }
    }
}
