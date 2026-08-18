// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { MapRegistry } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { reactive, Reactive } from "@conterra/reactivity-core";
import { Circle, Fill, Stroke, Style } from "ol/style";
import type Feature from "ol/Feature";
import { MAP_ID } from "./MapProvider";

interface References {
    mapRegistry: MapRegistry;
}
/**
 * One clicked event, mapped from the hungarian field names the Zala collections use.
 *
 * Every field is optional: a feature may carry any subset of them, and the empty object
 * means "nothing selected".
 */
export interface StationData {
    settlement?: string;
    address?: string;
    type?: string;
    eventType?: string;
    locationType?: string;
    date?: string;
    damageType?: string;
    county?: string;
}

export interface StationSelector extends DeclaredService<"app.StationSelector"> {
    /** Properties of the feature the user last clicked, or `{}` if none. Reactive. */
    readonly stationData: StationData;
}

export class StationSelectorImpl implements StationSelector {
    private mapRegistry: MapRegistry;

    #stationData: Reactive<StationData> = reactive({});

    /** The feature currently drawn in the highlight style, so it can be reset on the next click. */
    private selectedFeature: Feature | undefined;

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            const map = model?.olMap;
            if (!model || !map) {
                console.warn("StationSelector found no map; clicks will not be handled.");
                return;
            }

            map.on("click", (event) => {
                const result = map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                    if (layer !== model.layers.getLayerById("isimip")) {
                        return [
                            feature,
                            layer.style_["circle-fill-color"],
                            layer.getProperties().title
                        ];
                    }
                });

                if (result) {
                    const [feature, color, title] = result;
                    this.setStationData(feature.getProperties());
                    if (this.selectedFeature) {
                        this.selectedFeature.setStyle(undefined);
                    }
                    if (title == "Nuts regions") {
                        feature.setStyle(
                            new Style({
                                fill: new Fill({
                                    color: "rgba(255, 51, 0, 0.5)"
                                }),
                                stroke: new Stroke({
                                    color: "black",
                                    width: 3
                                })
                            })
                        );
                    } else {
                        feature.setStyle(
                            new Style({
                                image: new Circle({
                                    radius: 10,
                                    fill: new Fill({ color: color }),
                                    stroke: new Stroke({ color: "lightblue", width: 2 })
                                })
                            })
                        );
                    }
                    this.selectedFeature = feature;
                } else {
                    this.#stationData.value = {};
                    if (this.selectedFeature) {
                        this.selectedFeature.setStyle(undefined);
                    }
                    this.selectedFeature = undefined;
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
            address: properties["Cím"],
            eventType: properties["Esemény típus"],
            locationType: properties["Helyszín típusa"],
            date: properties["Jelzés dátuma"],
            damageType: properties["Káreset fajtája"],
            county: properties["Megye (mk.)"],
            settlement: properties["Település"]
        };
    }
}
