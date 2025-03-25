// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { reactive } from "@conterra/reactivity-core";
import { BaseFeature, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import type { DECLARE_SERVICE_INTERFACE, Service, ServiceOptions } from "@open-pioneer/runtime";
import {
    SelectionSource,
    SelectionCompleteEvent,
    VectorLayerSelectionSourceFactory
} from "@open-pioneer/selection";
import {
    FormatOptions,
    ResultColumn,
    ResultList,
    ResultListInput,
    ResultListSelectionChangeEvent
} from "@open-pioneer/result-list";

interface References {
    mapRegistry: MapRegistry;
    vectorSelectionSourceFactory: VectorLayerSelectionSourceFactory;
}

interface ResultListState {
    /** Whether the result list is currently shown. */
    open: boolean;

    /** Incremented to reset result list state. */
    key: number;

    /** Input used for the result list component. */
    input: ResultListInput | undefined;
}

export class FeatureInfo implements Service {
    declare [DECLARE_SERVICE_INTERFACE]: "app.FeatureInfo";
    private MAP_ID = "main";
    protected selectionSources: SelectionSource[] = [];
    protected mapModel;
    protected resultListState = reactive<ResultListState>({
        key: 0,
        input: undefined,
        open: false
    });

    constructor({ references }: ServiceOptions<References>) {
        const vectorSelectionSourceFactory = references.vectorSelectionSourceFactory;
        const mapRegistry = references.mapRegistry;
        this.mapModel = mapRegistry.getMapModel(this.MAP_ID);
        this.mapModel.then((model) => {
            if (!model) {
                throw new Error("No mapModel found.");
            }
            this.addSelectionSource(
                model?.layers.getLayerById("forest_vegetation_fires"),
                vectorSelectionSourceFactory
            );
            this.addSelectionSource(
                model?.layers.getLayerById("storm_damage"),
                vectorSelectionSourceFactory
            );
            this.addSelectionSource(
                model?.layers.getLayerById("timber_cutting"),
                vectorSelectionSourceFactory
            );
            this.addSelectionSource(
                model?.layers.getLayerById("water_damage"),
                vectorSelectionSourceFactory
            );
        });
    }

    addSelectionSource(
        opLayer: SimpleLayer,
        vectorSelectionSourceFactory: VectorLayerSelectionSourceFactory
    ) {
        const layerSelectionSource = vectorSelectionSourceFactory.createSelectionSource({
            vectorLayer: opLayer.olLayer as VectorLayer<VectorSource, Feature>,
            label: opLayer.title
        });
        this.selectionSources.push(layerSelectionSource);
    }

    getSelectionSources() {
        return this.selectionSources;
    }

    get listContainer() {
        const currentState = this.resultListState.value;
        if (!currentState.open || !currentState.input) {
            return undefined;
        }

        return (
            <ResultList
                mapId={this.MAP_ID}
                key={currentState.key}
                input={currentState.input}
                onSelectionChange={this.#onResultListSelectionChange}
            />
        );
    }

    #onResultListSelectionChange = (event: ResultListSelectionChangeEvent) => {
        console.log("Selected features: ", event.features);
    };

    onSelectionComplete = (event: SelectionCompleteEvent) => {
        const { results } = event;
        const formatOptions: FormatOptions = {
            numberOptions: {
                maximumFractionDigits: 3
            },
            dateOptions: {
                dateStyle: "medium",
                timeStyle: "medium",
                timeZone: "UTC"
            }
        };
        const columns: ResultColumn[] = [
            {
                id: "id",
                displayName: "ID",
                width: 10,
                getPropertyValue(feature: BaseFeature) {
                    return feature.id;
                }
            },
            {
                displayName: "Település",
                width: 10,
                getPropertyValue(feature: BaseFeature) {
                    return feature.properties["Település"];
                }
            },
            {
                displayName: "Cím",
                width: 20,
                getPropertyValue(feature: BaseFeature) {
                    return feature.properties["Cím"];
                }
            },
            {
                displayName: "Megye (mk.)",
                width: 10,
                getPropertyValue(feature: BaseFeature) {
                    return feature.properties["Megye (mk.)"];
                }
            },
            {
                displayName: "Esemény típus",
                width: 20,
                getPropertyValue(feature: BaseFeature) {
                    return feature.properties["Esemény típus"];
                }
            },
            {
                displayName: "Beavatkozás típusa",
                width: 20,
                getPropertyValue(feature: BaseFeature) {
                    return feature.properties["Beavatkozás típusa"];
                }
            },
            {
                displayName: "Helyszín típusa",
                width: 20,
                getPropertyValue(feature: BaseFeature) {
                    return feature.properties["Helyszín típusa"];
                }
            },
            {
                displayName: "Káreset fajtája",
                width: 20,
                getPropertyValue(feature: BaseFeature) {
                    return feature.properties["Káreset fajtája"];
                }
            },
            {
                displayName: "Helyszín típusa - Szabadterületen",
                width: 20,
                getPropertyValue(feature: BaseFeature) {
                    return feature.properties["Helyszín típusa - Szabadterületen"];
                }
            }
        ];
        const input: ResultListInput = {
            columns: columns,
            data: results,
            formatOptions: formatOptions
        };

        const oldKey = this.resultListState.value.key;
        this.resultListState.value = {
            open: true,
            key: oldKey + 1,
            input: input
        };
    };
}
