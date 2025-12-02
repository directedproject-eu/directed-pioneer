// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { watch } from "@conterra/reactivity-core";
import {
    Box,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Text,
    Spinner,
    Center
} from "@open-pioneer/chakra-integration";
import { useService, useIntl } from "open-pioneer:react-hooks";
import { FloodHandler } from "../services/FloodHandler";


type SliderConfigType = { min: number, max: number, unit: string, step: number };

const SLIDER_CONFIG: Record<string, { min: number, max: number, unit: string, step: number }> = {
    "pluvial": {
        min: 30, 
        max: 150, // Rainfall in mm (30-150)
        unit: "mm",
        step: 10 
    },
    "coastal": {
        min: 170, 
        max: 300, // Storm surge in cm (170-300)
        unit: "cm",
        step: 10 
    }
};

export const FloodSlider = () => {
    const intl = useIntl();
    const prepSrvc = useService<FloodHandler>("app.FloodHandler");

    // Initialize state using the synchronous service getters
    const [floodType, setFloodType] = useState(prepSrvc.getFloodType());
    const [currentModel, setCurrentModel] = useState(prepSrvc.getModel());
    const [sliderValue, setSliderValue] = useState(prepSrvc.getFloodLevel());
    
    const [isLoading, setIsLoading] = useState(false); 

    useEffect(() => {
        // Define the Getter Function (What state to watch)
        const reactiveGetter = () => [
            prepSrvc.getFloodType(),    
            prepSrvc.getFloodLevel(),   
            prepSrvc.getModel()         
        ];

        // Define the Callback Function
        const callbackFn = () => {
            setFloodType(prepSrvc.getFloodType()); 
            setCurrentModel(prepSrvc.getModel());
            setSliderValue(prepSrvc.getFloodLevel());
        };

        // Call watch and save the result as the cleanup function.
        
        const watcherResult = watch(
            reactiveGetter, 
            callbackFn
        );

        // Return a function that calls the .stop() method on the result
        return () => {
            if ("stop" in watcherResult) {
                (watcherResult as { stop: () => void }).stop(); 
            } else if (typeof watcherResult === "function") {
                (watcherResult as () => void)();
            }
        };
    }, [prepSrvc]);

    // Keep only the single, correct declaration for 'config'
    const config = (SLIDER_CONFIG[floodType] || SLIDER_CONFIG["pluvial"]) as SliderConfigType;

    const onChange = (val: number) => {
        setSliderValue(val);
    };
    
    // When finished dragging slider, update service
    const onChangeEnd = (val: number) => {
        setIsLoading(true);
        prepSrvc.setFloodLevel(val); 
        setTimeout(() => setIsLoading(false), 1500); 
    };

    const levelUnit = config.unit;
    const levelTitle = floodType === "pluvial" 
        ? intl.formatMessage({ id: "slider.rainfall_level", defaultMessage: "Rainfall Level (mm)"}) 
        : intl.formatMessage({ id: "slider.storm_surge_level", defaultMessage: "Storm Surge Level (cm)"});

    if (!floodType || !currentModel) {
        return null;
    }

    return (
        <div
            style={{
                width: window.innerWidth * 0.4,
                marginLeft: window.innerWidth * 0.3,
                marginRight: window.innerWidth * 0.3,
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                marginTop: "5px"
            }}
        >
            <Box padding={4}>
                <Text fontWeight="semibold" mb={3} color="gray.700">
                    {levelTitle}
                </Text>
                
                {isLoading ? (
                    <Center height="80px">
                        <Spinner size="md" color="blue.500" thickness="4px" />
                        <Text ml={3} fontSize="sm">Loading Flood Data...</Text>
                    </Center>
                ) : (
                    <>
                        <Slider
                            aria-label="level-slider"
                            min={config.min}
                            max={config.max}
                            value={sliderValue}
                            onChange={onChange}
                            onChangeEnd={onChangeEnd}
                            step={config.step}
                            colorScheme="blue"
                        >
                            <SliderTrack bg="blue.100">
                                <SliderFilledTrack bg="blue.500" />
                            </SliderTrack>
                            <SliderThumb boxSize={6} />
                        </Slider>
                        <Text mt={2} fontSize="md">
                            Selected Level: 
                            <Text as="span" fontWeight="bold" color="blue.600" ml={1}>
                                {sliderValue} {levelUnit}
                            </Text>
                            <Text as="span" fontSize="sm" ml={2} color="gray.500">
                                (Model: {currentModel})
                            </Text>
                        </Text>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "4px",
                                fontSize: "0.8em",
                                color: "gray.500"
                            }}
                        >
                            <span>{config.min} {levelUnit}</span>
                            <span>{config.max} {levelUnit}</span>
                        </div>
                    </>
                )}
            </Box>
        </div>
    );
};

export default FloodSlider;