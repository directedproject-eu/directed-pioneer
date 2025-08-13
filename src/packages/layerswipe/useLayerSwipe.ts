// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect, useMemo } from "react";
import { MapModel, SimpleLayer } from "@open-pioneer/map";
import Layer from "ol/layer/Layer";
import TileLayer from "ol/layer/Tile";
import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";

interface useLayerSwipeProps {
    mapModel: MapModel;
}

export function useLayerSwipe({ mapModel }: useLayerSwipeProps) {
    // const mapModel = useMapModel("main");
    const [availableLayers, setAvailableLayers] = useState<SimpleLayer[]>([]);
    const [selectedLeftLayer, setSelectedLeftLayer] = useState<string | null>(null);
    const [selectedRightLayer, setSelectedRightLayer] = useState<string | null>(null);
    const [leftLayers, setLeftLayers] = useState<Layer[]>();
    const [rightLayers, setRightLayers] = useState<Layer[]>();
    const [sliderValue, setSliderValue] = useState<number>(50);
    const [visibleAvailableLayers, setVisibleAvailableLayers] = useState<SimpleLayer[]>([]); //filter for visible layers
    const [isLayerSwipeActive, setIsLayerSwipeActive] = useState<boolean>(false); //new render layerswipe

    useEffect(() => {
        if (!mapModel.map) return;

        //get all layers from the mapmodel
        const layers = mapModel.map.layers.getRecursiveLayers() as SimpleLayer[];
        setAvailableLayers(layers);

        //set only visible layers in the dropdowns for left and right layer
        const updateVisibleLayers = () => {
            const visibleLayers = layers.filter((layer) => layer.olLayer?.getVisible?.() === true);
            setVisibleAvailableLayers(visibleLayers);
        };

        updateVisibleLayers(); //filter

        const eventKeys = layers
            .map((layer) => {
                const olLayer = layer.olLayer;
                if (!olLayer || typeof olLayer.on !== "function") return null;
                return olLayer.on("change:visible", updateVisibleLayers);
            })
            .filter((k): k is EventsKey => !!k);

        //set selected layers & set back to initial state if "select left layer" & "select right layer" in dropdowns
        if (selectedLeftLayer && selectedRightLayer) {
            const leftLayer = (mapModel.map.layers.getLayerById(selectedLeftLayer) as SimpleLayer)
                ?.olLayer as TileLayer;
            const rightLayer = (mapModel.map.layers.getLayerById(selectedRightLayer) as SimpleLayer)
                ?.olLayer as TileLayer;

            if (leftLayer && rightLayer) {
                setLeftLayers([leftLayer]);
                setRightLayers([rightLayer]);
                setIsLayerSwipeActive(true); //activate layerswipe
                leftLayer.setVisible(true);
                rightLayer.setVisible(true);
            } else {
                setLeftLayers([]);
                setRightLayers([]);
                setIsLayerSwipeActive(false); //deactivate if layers not selected
            }
        } else {
            setLeftLayers([]);
            setRightLayers([]);
            setIsLayerSwipeActive(false);
        }

        return () => {
            eventKeys.forEach(unByKey);
        };
    }, [mapModel, selectedLeftLayer, selectedRightLayer]);

    const olMap = mapModel.olMap;

    // const handleSliderValueChange = (value: number) => {
    //     setSliderValue(value);
    //     if (mapModel && !mapModel?.olMap){
    //         mapModel.olMap.render();
    //     }
    // };

    const handleSliderValueChange = (value: number) => {
        setSliderValue(value);
        olMap.render();
    };

    return useMemo(
        () => ({
            selectedLeftLayer,
            setSelectedLeftLayer,
            selectedRightLayer,
            setSelectedRightLayer,
            sliderValue,
            onSliderValueChanged: handleSliderValueChange,
            visibleAvailableLayers,
            leftLayers,
            rightLayers,
            isLayerSwipeActive
        }),
        [
            selectedLeftLayer,
            setSelectedLeftLayer,
            selectedRightLayer,
            setSelectedRightLayer,
            sliderValue,
            handleSliderValueChange,
            visibleAvailableLayers,
            leftLayers,
            rightLayers,
            isLayerSwipeActive
        ]
    );
}
