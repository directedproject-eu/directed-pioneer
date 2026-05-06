// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
declare module "ol-ext/control/Swipe" {
    import { Control } from "ol/control";
    import Layer from "ol/layer/Layer";

    interface SwipeOptions {
        className?: string;
        layers?: Layer[];
        rightLayers?: Layer[];
        position?: number;
        orientation?: "horizontal" | "vertical";
        thumbSize?: number;
        thumbLabel?: boolean;
    }

    export default class Swipe extends Control {
        constructor(options?: SwipeOptions);
        addLayer(layer: Layer, left: boolean): void;
        setPosition(position: number): void;
    }
}
