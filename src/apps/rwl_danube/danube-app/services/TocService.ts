// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { reactive, Reactive } from "@conterra/reactivity-core";
import { Layer, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

interface References {
    mapRegistry: MapRegistry;
}

export interface TocService extends DeclaredService<"app.TocService"> {
    deactivateLayer(layerTitle: string, visibility: boolean): void;
    zoomTo(layerName: string): void;
    layers: SimpleLayer[];
}

export class TocServiceImpl implements TocService {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;

    #layersTitle: Reactive<string[]> = reactive([]);
    #layers: Reactive<SimpleLayer[]> = reactive([]);
    #description: Reactive<string[]> = reactive([]);

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            const allLayers = model?.layers.getLayers();
            this.#layers.value = allLayers;
            this.#description.value = allLayers
                .filter((layer) => !layer.isBaseLayer)
                .map((layer) => layer.description);
            this.#layersTitle.value = allLayers
                .filter((layer) => !layer.isBaseLayer)
                .map((layer) => layer.title);
        });
    }

    get layersTitle(): string[] {
        return this.#layersTitle.value;
    }

    get description(): string[] {
        return this.#description.value;
    }

    get layers(): SimpleLayer[] {
        return this.#layers.value.filter((layer) => !layer.isBaseLayer);
    }
    deactivateLayer(layerTitle: string, visibility: boolean) {
        // console.log(this.#layers.value);
        const layer = this.#layers.value.find((layer) => layer.title === layerTitle);
        layer.setVisible(visibility);
    }

    zoomTo = (layerTitle: string) => {
        const layer = this.#layers.value.find((layer) => layer.title === layerTitle);

        if (layer?.olLayer instanceof VectorLayer) {
            this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
                model?.olView.fit(layer?.olLayer.getSource().getExtent());
                console.log(layer.olLayer.getZIndex());
                layer.olLayer.setZIndex(10);
            });
        } else {
            this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
                console.log(layer?.olLayer.getZIndex());
                model?.olView.fit(layer?.olLayer.getExtent());
            });
        }
    };
}
