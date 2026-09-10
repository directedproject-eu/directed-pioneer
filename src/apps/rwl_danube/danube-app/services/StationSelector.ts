// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { isLayer, MapRegistry } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { reactive, Reactive } from "@conterra/reactivity-core";
import { Circle, Fill, Stroke, Style } from "ol/style";
import Feature from "ol/Feature";
import { MAP_ID } from "./MapProvider";

interface References {
    mapRegistry: MapRegistry;
}

/**
 * The NUTS regions are highlighted as an area rather than a point.
 *
 * Matched by id, not by title: the title is user-facing and translated, and the two do not
 * even agree today -- the pioneer layer is called "Crop Yield Projections" while its
 * OpenLayers properties still say "Nuts regions".
 */
const NUTS_LAYER_ID = "danube_basin_territorial_units";

const REGION_HIGHLIGHT_STYLE = new Style({
    fill: new Fill({ color: "rgba(255, 51, 0, 0.5)" }),
    stroke: new Stroke({ color: "black", width: 3 })
});

/**
 * Enlarged dot in the layer's own colour. `color` is undefined for layers that carry no
 * `eventColor` attribute -- the forestry stations, for one -- and OpenLayers then falls
 * back to its default fill.
 */
function createPointHighlight(color: string | undefined): Style {
    return new Style({
        image: new Circle({
            radius: 10,
            fill: new Fill({ color: color }),
            stroke: new Stroke({ color: "lightblue", width: 2 })
        })
    });
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

/**
 * Turns a click on the map into the "station information" panel, and marks what was hit.
 *
 * Despite the name it is not limited to stations: the handler is attached to the map, not
 * to a layer, so it answers for whatever feature lies under the pointer -- an event point
 * from the Zala collections, a forestry station, a NUTS region. What the panel shows comes
 * from {@link setStationData}, which only knows the hungarian field names of the Zala data;
 * clicking anything else publishes an object of undefined values, and the panel renders the
 * labels with nothing behind them.
 *
 * Only one feature is highlighted at a time. The previous one is reset by dropping its
 * individual style, which lets the layer style take over again -- so the highlight must
 * never be the layer style itself.
 */
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
                const hit = map.forEachFeatureAtPixel(event.pixel, (feature, olLayer) => {
                    // Render features cannot carry an individual style, so they cannot be
                    // highlighted -- skip them and let the search continue.
                    if (!(feature instanceof Feature)) {
                        return;
                    }
                    // OpenLayers reports its own layer; the colour and the id live on the
                    // pioneer layer wrapping it.
                    const layer = model.layers
                        .getRecursiveLayers()
                        .find((candidate) => isLayer(candidate) && candidate.olLayer === olLayer);
                    return { feature, layer };
                });

                this.selectedFeature?.setStyle(undefined);

                if (!hit) {
                    this.#stationData.value = {};
                    this.selectedFeature = undefined;
                    return;
                }

                const { feature, layer } = hit;
                this.setStationData(feature.getProperties());
                feature.setStyle(
                    layer?.id === NUTS_LAYER_ID
                        ? REGION_HIGHLIGHT_STYLE
                        : createPointHighlight(layer?.attributes?.eventColor as string | undefined)
                );
                this.selectedFeature = feature;
            });
        });
    }
    get stationData(): StationData {
        return this.#stationData.value;
    }

    /**
     * Maps a feature's raw properties onto {@link StationData}.
     *
     * The keys are the column names of the Zala fire brigade records, in hungarian, exactly
     * as the pygeoapi collections deliver them -- "Beavatkozás típusa" is the type of
     * intervention, "Káreset fajtája" the kind of damage. They are not translated anywhere;
     * renaming a column upstream silently turns the corresponding field undefined.
     */
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
