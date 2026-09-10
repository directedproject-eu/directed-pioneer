// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useRef } from "react";
import { SeriesData } from "./CropyieldChart";
import { checkCropAvailability, fetchAndProcessCropData, seriesColor } from "./utils";
import { useIntl } from "open-pioneer:react-hooks";

/**
 * Owns the entire state of the crop yield chart: which region, scenario and crops are
 * selected, which crops exist at all, and the series built from them.
 *
 * Three effects run in sequence, each feeding the next:
 *
 * 1. `initialNutsId` -- the region the user clicked on the map -- is adopted into state.
 * 2. A change of region probes which crops have data there and prunes the selection to
 *    what survives. This is why picking a new region can silently change the chosen crops.
 * 3. Any change of region, scenario or crop selection loads the matching csv files and
 *    turns them into highcharts series.
 *
 * Two loading flags rather than one, because the two questions are answered at different
 * times: `isAvailabilityLoading` covers step 2, `isChartLoading` step 3. The latter is
 * deliberately not raised for every change -- see the note at its assignment.
 *
 * `initialNutsId` is a starting value, not a binding: once adopted, the dropdown can move
 * the selection elsewhere and the prop does not pull it back until the map sends a new one.
 */
export function useCropYieldData(initialNutsId?: string) {
    const [selectedLocation, setSelectedLocation] = useState<string>(initialNutsId || "RO11");
    const [selectedScenario, setSelectedScenario] = useState("ssp585");
    const [selectedCrops, setSelectedCrops] = useState<string[]>(["POTA"]);

    const [availableCrops, setAvailableCrops] = useState<string[]>([]);
    const [isAvailabilityLoading, setIsAvailabilityLoading] = useState<boolean>(true);

    const [seriesData, setSeriesData] = useState<SeriesData[]>([]);
    const [isChartLoading, setIsChartLoading] = useState<boolean>(true);

    const prevLocation = useRef<string | null>(null);
    const intl = useIntl();
    // Adopt the region the map passes in. Runs only when that prop changes, so it does not
    // fight the dropdown -- and setting the same value again is a no-op in React, which is
    // why no comparison against the current selection is needed.
    useEffect(() => {
        if (initialNutsId) {
            setSelectedLocation(initialNutsId);
        }
    }, [initialNutsId]);

    // Check available crops when location changes
    useEffect(() => {
        const verifyAvailability = async () => {
            setIsAvailabilityLoading(true);
            const validCrops = await checkCropAvailability(selectedLocation);

            setAvailableCrops(validCrops);

            setSelectedCrops((prev) => {
                const validSelections = prev.filter((c) => validCrops.includes(c));
                if (validSelections.length > 0) {
                    return validSelections;
                }
                // Nothing the user had picked exists here. Fall back to the first crop
                // that does, or leave the chart empty if the region has none at all.
                const [firstCrop] = validCrops;
                return firstCrop ? [firstCrop] : [];
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

        // Only a change of region shows the loading state. Switching scenario or crop keeps
        // the previous series on screen until the new one arrives -- deliberate, so the
        // chart does not flicker empty on every checkbox click.
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
                    seriesColor(index),
                    intl
                )
            )
        )
            .then((results) => {
                const validSeries = results
                    .filter((res): res is SeriesData[] => res !== null)
                    .flat();
                setSeriesData(validSeries);
            })
            .finally(() => {
                setIsChartLoading(false);
            });
        // intl is a dependency because the series names are translated while the data is
        // built. A language switch therefore refetches -- cheap, the csv files are small and
        // the browser has them cached.
    }, [selectedCrops, selectedScenario, selectedLocation, intl]);

    const toggleCropSelection = (cropCode: string) => {
        setSelectedCrops((prev) =>
            prev.includes(cropCode) ? prev.filter((id) => id !== cropCode) : [...prev, cropCode]
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
