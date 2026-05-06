// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useRef } from "react";
import { SeriesData } from "./CropyieldChart";
import { 
    checkCropAvailability, 
    fetchAndProcessCropData, 
    distinctColors 
} from "./utils";

export function useCropYieldData(initialNutsId?: string) {
    const [selectedLocation, setSelectedLocation] = useState<string>(initialNutsId || "RO11");
    const [selectedScenario, setSelectedScenario] = useState("ssp585");
    const [selectedCrops, setSelectedCrops] = useState<string[]>(["POTA"]);
    
    const [availableCrops, setAvailableCrops] = useState<string[]>([]);
    const [isAvailabilityLoading, setIsAvailabilityLoading] = useState<boolean>(true);

    const [seriesData, setSeriesData] = useState<SeriesData[]>([]);
    const [isChartLoading, setIsChartLoading] = useState<boolean>(true);

    const prevLocation = useRef<string | null>(null);

    // Sync initial NUTS ID
    useEffect(() => {
        if (initialNutsId && initialNutsId !== selectedLocation) {
            setSelectedLocation(initialNutsId);
        }
    }, [initialNutsId]);

    // Check available crops when location changes
    useEffect(() => {
        const verifyAvailability = async () => {
            setIsAvailabilityLoading(true);
            const validCrops = await checkCropAvailability(selectedLocation);
            
            setAvailableCrops(validCrops);

            setSelectedCrops(prev => {
                const validSelections = prev.filter(c => validCrops.includes(c));
                if (validSelections.length === 0 && validCrops.length > 0) {
                    return [validCrops[0]]; 
                }
                return validSelections;
            });

            setIsAvailabilityLoading(false);
        };

        verifyAvailability();
    }, [selectedLocation]);

    // Fetch chart data when scenario, location, or selected crops change
    useEffect(() => {
        if (!selectedCrops || selectedCrops.length === 0) {
            setSeriesData([]);
            setIsChartLoading(false);
            return;
        }

        if (prevLocation.current !== selectedLocation) {
            setIsChartLoading(true);
            prevLocation.current = selectedLocation;
        }

        const scenarioUpper = selectedScenario.toUpperCase();

        Promise.all(
            selectedCrops.map((crop, index) => 
                fetchAndProcessCropData(
                    selectedLocation, 
                    scenarioUpper, 
                    crop, 
                    distinctColors[index % distinctColors.length]
                )
            )
        )
            .then((results) => {
                const validSeries = results.filter((res) => res !== null).flat() as SeriesData[];
                setSeriesData(validSeries);
            })
            .finally(() => {
                setIsChartLoading(false);
            });

    }, [selectedCrops, selectedScenario, selectedLocation]);

    const toggleCropSelection = (cropCode: string) => {
        setSelectedCrops((prev) => 
            prev.includes(cropCode) 
                ? prev.filter((id) => id !== cropCode) 
                : [...prev, cropCode]
        );
    };

    return {
        selectedLocation,
        setSelectedLocation,
        selectedScenario,
        setSelectedScenario,
        selectedCrops,
        toggleCropSelection,
        availableCrops,
        isAvailabilityLoading,
        seriesData,
        isChartLoading
    };
}