// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { MapRegistry } from "@open-pioneer/map";
import { reactive, Reactive } from "@conterra/reactivity-core";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";

interface References {
    mapRegistry: MapRegistry;
}

export interface LayerHighlighter extends DeclaredService<"app.LayerHighlighter"> {
    highlightLayer(layerId: string): void;
    unHighlightLayer(layerId: string): void;
    zoomTo(layerId: string): void;
}

export class LayerHighlighterImpl implements LayerHighlighter {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;

    #layers: Reactive<SimpleLayer[]> = reactive([]);

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            this.#layers.value = model?.layers.getAllLayers();
        });
    }

    highlightLayer(layerId: string): void {
        const color = {
            "water_damage": "blue",
            "storm_damage": "black",
            "timber_cutting": "green",
            "forest_vegetation_fires": "red"
        };

        if (layerId != "") {
            const layer = this.#layers.value.find((layer) => layer.id == layerId);
            layer.olLayer.setStyle({
                "circle-radius": 10,
                "circle-fill-color": color[layerId],
                "circle-stroke-color": "lightblue",
                "circle-stroke-width": 3
            });
            layer.olLayer.setZIndex(20);
        }
    }
    unHighlightLayer(layerId: string): void {
        const color = {
            "water_damage": "blue",
            "storm_damage": "black",
            "timber_cutting": "green",
            "forest_vegetation_fires": "red"
        };
        if (layerId != "") {
            const layer = this.#layers.value.find((layer) => layer.id == layerId);
            layer.olLayer.setStyle({
                "circle-radius": 8.0,
                "circle-fill-color": color[layerId],
                "circle-stroke-color": "white",
                "circle-stroke-width": 0.5
            });
            layer.olLayer.setZIndex(15);
        }
    }
    zoomTo = (layerId: string) => {
        const layer = this.#layers.value.find((layer) => layer.id == layerId);

        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            model?.olView.fit(layer?.olLayer.getSource().getExtent());
        });
    };
}
