// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import { OgcFeaturesVectorSourceFactory } from "@open-pioneer/ogc-features";
import { ServiceOptions } from "@open-pioneer/runtime";
import TileLayer from "ol/layer/Tile";
import { Vector as VectorLayer } from "ol/layer.js";
import OSM from "ol/source/OSM";

interface References {
    vectorSourceFactory: OgcFeaturesVectorSourceFactory;
}

export const MAP_ID = "main";
export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    private vectorSourceFactory: OgcFeaturesVectorSourceFactory;

    constructor({ references }: ServiceOptions<References>) {
        this.vectorSourceFactory = references.vectorSourceFactory;
    }

    createPastEventLayer(
        collectionId: string,
        id: string,
        title: string,
        description: string,
        color: string
    ) {
        const pastEventLayer = new SimpleLayer({
            id: `${id}`,
            title: `${title}`,
            description: `${description}`,
            visible: true,
            olLayer: new VectorLayer({
                source: this.vectorSourceFactory.createVectorSource({
                    baseUrl: "https://directed.dev.52north.org/protected",
                    collectionId: collectionId,
                    crs: "http://www.opengis.net/def/crs/EPSG/0/3857",
                    //attributions: "",
                    limit: 5000,
                    additionalOptions: {}
                }),
                style: {
                    "circle-radius": 8.0,
                    "circle-fill-color": color,
                    "circle-stroke-color": "white",
                    "circle-stroke-width": 0.5
                },
                properties: { title: "GeoJSON Layer" }
            }),
            isBaseLayer: false
        });
        return pastEventLayer;
    }

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 1900000, y: 5900000 },
                zoom: 10
            },
            projection: "EPSG:3857",
            layers: [
                new SimpleLayer({
                    title: "OpenStreetMap",
                    olLayer: new TileLayer({
                        source: new OSM(),
                        properties: { title: "OSM" }
                    }),
                    isBaseLayer: true
                }),
                this.createPastEventLayer(
                    "zala/events/damage/storm",
                    "storm_damage",
                    "Storm damage",
                    "Storm damage",
                    "black"
                ),
                this.createPastEventLayer(
                    "zala/events/damage/water",
                    "water_damage",
                    "Water damage",
                    "Water damage",
                    "blue"
                ),
                this.createPastEventLayer(
                    "zala/events/fires/forest_vegetation",
                    "forest_vegetation_fires",
                    "Forest and vegetation fires",
                    "Forest and vegetation fires",
                    "red"
                ),
                this.createPastEventLayer(
                    "zala/events/timber_cutting",
                    "timber_cutting",
                    "Timber cutting",
                    "Timber cutting",
                    "green"
                )
            ]
        };
    }
}
