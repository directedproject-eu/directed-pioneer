// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack
} from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import { MapModel } from "@open-pioneer/map";
import { CommonComponentProps } from "@open-pioneer/react-utils";
import { useEffect, useRef } from "react";
import Layer from "ol/layer/Layer";
import RenderEvent from "ol/render/Event";
import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import { getRenderPixel } from "ol/render";
import { Size } from "ol/size";

export interface LayerSwipeProps extends CommonComponentProps {
    map: MapModel;
    /**
     * immutable list of swipable layers displayed on the left side of the map
     */
    leftLayers: ReadonlyArray<Layer>;
    /**
     * immutable list of swipable layers displayed on the right side of the map
     */
    rightLayers: ReadonlyArray<Layer>;
    /**
     * the value of the slider, number between 0 (left) and 100 (right)
     */
    sliderValue: number;
    /**
     * function that is called after the slider value has been changed
     * @param value new slider value
     */
    onSliderValueChanged: (value: number) => void;
    style?: React.CSSProperties; //add styling
}

export const LayerSwipe = (props: LayerSwipeProps) => {
    const intl = useIntl();
    const { map, leftLayers, rightLayers, sliderValue, onSliderValueChanged } = props;
    const eventKeys = useRef<EventsKey[]>([]);

    let sliderValueValidated = sliderValue <= 100 ? sliderValue : 100;
    sliderValueValidated = sliderValueValidated >= 0 ? sliderValueValidated : 0;
    const sliderValueRef = useRef(sliderValueValidated);

    useEffect(() => {
        leftLayers.concat(rightLayers).forEach((layer) => {
            eventKeys.current.push(layer.on("prerender", handlePrerender));
            eventKeys.current.push(layer.on("postrender", handlePostrender));
        });

        return () => {
            eventKeys.current.forEach((key) => unByKey(key));
            eventKeys.current = [];
        };
    }, [leftLayers, rightLayers, map]);

    function handlePrerender(event: RenderEvent) {
        const renderContext = event.context;
        const olMap = map.olMap;
        if (!renderContext) {
            return;
        }

        const mapSize = olMap.getSize();

        if (!mapSize || mapSize[0] == undefined || mapSize[1] == undefined) {
            return;
        }

        if (renderContext instanceof WebGLRenderingContext) {
            const contextWebGL = renderContext as WebGLRenderingContext;
            clipWebGLLayer(event, contextWebGL, mapSize);
        } else if (renderContext instanceof CanvasRenderingContext2D) {
            const contextCanvas = renderContext as CanvasRenderingContext2D;
            clipCanvasLayer(event, contextCanvas, mapSize);
        }
    }

    function handlePostrender(event: RenderEvent) {
        const renderContext = event.context;
        if (renderContext instanceof WebGLRenderingContext) {
            const contextWebGL = renderContext as WebGLRenderingContext;
            contextWebGL.disable(contextWebGL.SCISSOR_TEST);
        } else if (renderContext instanceof CanvasRenderingContext2D) {
            const contextCanvas = renderContext as CanvasRenderingContext2D;
            contextCanvas.restore();
        }
    }

    function clipWebGLLayer(
        event: RenderEvent,
        renderContext: WebGLRenderingContext,
        mapSize: Size
    ) {
        const bottomLeft = getRenderPixel(event, [0, mapSize[1]!]);
        const topRight = getRenderPixel(event, [mapSize[0]!, 0]);
        const width = Math.round((topRight[0]! - bottomLeft[0]!) * (sliderValueRef.current / 100));
        const height = topRight[1]! - bottomLeft[1]!;

        const isRightLayer = rightLayers.includes(event.target);

        let x, y, w, h;
        if (isRightLayer) {
            x = width;
            y = bottomLeft[1]!;
            w = mapSize[0]! - width;
            h = height;
        } else {
            x = bottomLeft[0]!;
            y = bottomLeft[1]!;
            w = width;
            h = height;
        }
        renderContext.enable(renderContext.SCISSOR_TEST);
        renderContext.scissor(x, y, w, h);
    }

    function clipCanvasLayer(
        event: RenderEvent,
        renderContext: CanvasRenderingContext2D,
        mapSize: Size
    ) {
        const width = Math.round(mapSize[0]! * (sliderValueRef.current / 100));
        const topLeft = getRenderPixel(event, [width, 0]);
        const topRight = getRenderPixel(event, [mapSize[0]!, 0]);
        console.log(mapSize);
        const bottomLeft = getRenderPixel(event, [width, mapSize[1]!]);
        const bottomRight = getRenderPixel(event, mapSize);

        const isRightLayer = rightLayers.includes(event.target);

        renderContext.save();
        renderContext.beginPath();
        if (isRightLayer) {
            renderContext.moveTo(topLeft[0]!, topLeft[1]!);
            renderContext.lineTo(bottomLeft[0]!, bottomLeft[1]!);
            renderContext.lineTo(bottomRight[0]!, bottomRight[1]!);
            renderContext.lineTo(topRight[0]!, topRight[1]!);
        } else {
            renderContext.moveTo(topLeft[0]!, topLeft[1]!);
            renderContext.lineTo(bottomLeft[0]!, bottomLeft[1]!);
            renderContext.lineTo(0, bottomLeft[1]!);
            renderContext.lineTo(0, 0);
        }
        renderContext.closePath();
        renderContext.clip();
    }

    function handleSliderValueChanged(value: number) {
        onSliderValueChanged(value);
        sliderValueRef.current = value;

        map.olMap.render(); //trigger re-render of the map if slider is changed
    }

    return (
        //add styling
        <Box style={props.style}>
            <Slider
                aria-label={intl.formatMessage({ id: "global.layerswipe.slider.title" })}
                value={sliderValueRef.current}
                onChange={(value) => {
                    handleSliderValueChanged(value);
                }}
                min={0}
                max={100}
            >
                <SliderTrack bg="#ffffff80">
                    <SliderFilledTrack bg="#00000080" />
                </SliderTrack>
                <SliderThumb />
            </Slider>
        </Box>
    );
};
