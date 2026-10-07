// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FunctionComponent } from "react";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { GroupLayer, WMSLayer } from "@open-pioneer/map";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { WmsLegend } from "../Components/Legends/WMSLegend";
import { buildMaxLayerName as buildDepthMaxLayerName, WMS_URL } from "../config/floodDepth";
import { buildVelocityMaxLayerName } from "../config/flowVelocity";
import { FloodDepthService } from "./FloodDepthService";
import { FlowVelocityService } from "./FlowVelocityService";

interface References {
    floodDepthService: FloodDepthService;
    flowVelocityService: FlowVelocityService;
}

export interface DamBreakService extends DeclaredService<"app.DamBreakService"> {
    /**
     * The group of all HRB Eicherscheid layers. It is not on the map by default: the data
     * comes from the protected GeoServer, so MapApp adds it only while a user is logged in.
     */
    getGroupLayer(): GroupLayer;
}

/** Configuration of a static flood WMS layer (e.g. maximum water depth or velocity). */
interface MaxLayerConfig {
    id: string;
    title: string;
    description: string;
    layerName: string;
    LegendComponent: FunctionComponent<LegendItemComponentProps>;
}

/**
 * Groups the HRB Eicherscheid layers: the two time series (water depth and flow velocity,
 * owned by their services and driven by the time slider) and the two static maximum layers.
 *
 * The group is created once and reused: `removeLayer` on logout does not destroy it, so it
 * can be added again on the next login with its state (visibility, time) intact.
 */
export class DamBreakServiceImpl implements DamBreakService {
    private group: GroupLayer;

    constructor(options: ServiceOptions<References>) {
        const { floodDepthService, flowVelocityService } = options.references;
        const intl = options.intl;

        // Static layers: the maximum over the whole simulation period, independent of the
        // time slider. They share style and legend with their time series.
        const maxLayers = [
            {
                id: "flood_depth_max",
                title: intl.formatMessage({ id: "flood_depth_max.layer_title" }),
                description: intl.formatMessage({ id: "flood_depth_max.layer_description" }),
                layerName: buildDepthMaxLayerName(),
                LegendComponent: WmsLegend
            },
            {
                id: "flow_velocity_max",
                title: intl.formatMessage({ id: "flow_velocity_max.layer_title" }),
                description: intl.formatMessage({ id: "flow_velocity_max.layer_description" }),
                layerName: buildVelocityMaxLayerName(),
                LegendComponent: WmsLegend
            }
        ].map((config) => createMaxLayer(config));

        this.group = new GroupLayer({
            id: "eicherscheid",
            title: intl.formatMessage({ id: "eicherscheid.group_title" }),
            description: intl.formatMessage({ id: "eicherscheid.group_description" }),
            visible: true,
            layers: [...maxLayers, floodDepthService.getLayer(), flowVelocityService.getLayer()]
        });
    }

    getGroupLayer(): GroupLayer {
        return this.group;
    }
}

/**
 * Loads through the http service (WMSLayer does that itself), so the TokenInterceptor
 * authenticates the requests to the protected GeoServer. The sublayer is internal like in
 * the time-varying services, so the Toc lists only the layer itself.
 */
function createMaxLayer({
    id,
    title,
    description,
    layerName,
    LegendComponent
}: MaxLayerConfig): WMSLayer {
    return new WMSLayer({
        id: id,
        title: title,
        description: description,
        url: WMS_URL,
        sublayers: [{ name: layerName, title: title, internal: true }],
        // The legend comes from LegendComponent, the capabilities are not needed.
        fetchCapabilities: false,
        visible: false,
        isBaseLayer: false,
        attributes: {
            "legend": {
                Component: LegendComponent
            }
        }
    });
}
