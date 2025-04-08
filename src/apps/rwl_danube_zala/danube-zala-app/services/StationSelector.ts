// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { MapRegistry } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { reactive, Reactive } from "@conterra/reactivity-core";
import { Circle, Fill, Stroke, Style } from "ol/style";
import { FeatureLike } from "ol/Feature";

interface References {
    mapRegistry: MapRegistry;
}
interface StationData {
    settlement?: string;
    adress?: string;
    type?: string;
    eventType?: string;
    locationType?: string;
    date?: string;
    damageType?: string;
    county?: string;
}

export interface StationSelector extends DeclaredService<"app.StationSelector"> {}

export class StationSelectorImpl implements StationSelector {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;

    #stationData: Reactive<StationData> = reactive({});

    private selectedFeature: FeatureLike = null; // Store the previously selected feature

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            const map = model?.olMap;
            map.on("click", (event) => {
                const result = map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                    if (layer !== model.layers.getLayerById("isimip")) {
                        return [feature, layer.style_["circle-fill-color"]];
                    }
                });

                if (result) {
                    const [feature, color] = result;
                    this.setStationData(feature.getProperties());
                    if (this.selectedFeature) {
                        this.selectedFeature.setStyle(null);
                    }
                    feature.setStyle(
                        new Style({
                            image: new Circle({
                                radius: 10,
                                fill: new Fill({ color: color }),
                                stroke: new Stroke({ color: "lightblue", width: 2 })
                            })
                        })
                    );
                    this.selectedFeature = feature;
                } else {
                    this.#stationData.value = {};
                    if (this.selectedFeature) {
                        this.selectedFeature.setStyle(null);
                    }
                    this.selectedFeature = null;
                }
            });
        });
    }
    get stationData(): StationData {
        return this.#stationData.value;
    }

    private setStationData(properties: Record<string, string>): void {
        this.#stationData.value = {
            type: properties["Beavatkozás típusa"],
            adress: properties["Cím"],
            eventType: properties["Esemény típus"],
            locationType: properties["Helyszín típusa"],
            date: properties["Jelzés dátuma"],
            damageType: properties["Káreset fajtája"],
            county: properties["Megye (mk.)"],
            settlement: properties["Település"]
        };
    }
}
