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
