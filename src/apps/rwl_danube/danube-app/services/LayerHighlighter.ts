// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { isLayer, MapRegistry } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { Vector as VectorLayer } from "ol/layer.js";
import type View from "ol/View";
import { MAP_ID } from "./MapProvider";

interface References {
    mapRegistry: MapRegistry;
}

export interface LayerHighlighter extends DeclaredService<"app.LayerHighlighter"> {
    highlightLayer(layerId: string): void;
    unHighlightLayer(layerId: string): void;
    zoomTo(layerId: string): void;
}

/**
 * Emphasises one of the past-event layers while the pointer rests on its legend entry.
 *
 * Driven by {@link EventLayerLegend}: hovering enlarges the layer's points and lifts them
 * above the others, leaving restores the style {@link MapApp} gave them, clicking zooms to
 * their extent.
 *
 * The colour is read from the layer's `eventColor` attribute rather than kept in a table
 * here. That matters for `unHighlightLayer`: restoring a style means reproducing what the
 * layer was created with, and a second copy of those values would silently drift from the
 * first.
 */
export class LayerHighlighterImpl implements LayerHighlighter {
    private mapRegistry: MapRegistry;

    constructor(options: ServiceOptions<References>) {
        this.mapRegistry = options.references.mapRegistry;
    }

    highlightLayer(layerId: string): void {
        this.withEventLayer(layerId, (olLayer, color) => {
            olLayer.setStyle({
                "circle-radius": 10,
                "circle-fill-color": color,
                "circle-stroke-color": "lightblue",
                "circle-stroke-width": 3
            });
            olLayer.setZIndex(20);
        });
    }

    unHighlightLayer(layerId: string): void {
        // Mirrors the style createPastEventLayer applies in MapApp.tsx.
        this.withEventLayer(layerId, (olLayer, color) => {
            olLayer.setStyle({
                "circle-radius": 8.0,
                "circle-fill-color": color,
                "circle-stroke-color": "white",
                "circle-stroke-width": 0.5
            });
            olLayer.setZIndex(15);
        });
    }

    zoomTo(layerId: string): void {
        this.withEventLayer(layerId, (olLayer, _color, view) => {
            const extent = olLayer.getSource()?.getExtent();
            // An empty source reports [Infinity, Infinity, -Infinity, -Infinity].
            if (!extent || !extent.every((value) => Number.isFinite(value))) {
                console.warn(`Layer '${layerId}' has no extent to zoom to.`);
                return;
            }
            view.fit(extent);
        });
    }

    /**
     * Resolves `layerId` to its OpenLayers vector layer and hands it, its event colour and
     * the map view to `action`.
     *
     * Warns and does nothing if the layer is absent -- the past-event layers are only added
     * once a user is authenticated, so a stale legend entry must not throw -- if it is a
     * group, or if it is not a vector layer, none of which can be styled this way.
     */
    private withEventLayer(
        layerId: string,
        action: (olLayer: VectorLayer, color: string, view: View) => void
    ): void {
        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            const layer = model?.layers.getLayerById(layerId);
            if (!layer || !isLayer(layer)) {
                console.warn(`No layer '${layerId}' to highlight.`);
                return;
            }
            if (!(layer.olLayer instanceof VectorLayer)) {
                console.warn(`Layer '${layerId}' is not a vector layer and cannot be styled.`);
                return;
            }
            action(layer.olLayer, layer.attributes.eventColor as string, layer.map.olView);
        });
    }
}
