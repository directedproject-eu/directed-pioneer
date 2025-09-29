// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Button,
    Center,
    Checkbox,
    Stack,
    Text,
    Icon,
    Flex
} from "@open-pioneer/chakra-integration";
import { FiAlertTriangle } from "react-icons/fi";
import EnsembleCrops from "./EnsembleCrops";
import { useState } from "react";

const ChartComponentZala = () => {
    const [selectedScenario, setSelectedScenario] = useState("ssp585");
    const [selectedCrops, setSelectedCrops] = useState<string[]>(["Potatoes"]);
    const crops = [
        "Lucerne",
        "Corn maize",
        "Green maize",
        "Potatoes",
        "Spring barley",
        "Soya beans",
        "Sunflowers",
        "Triticale",
        "Winter barley",
        "Winter rape",
        "Rye and maslin",
        "Winter wheat"
    ];
    const files = [
        "/crop_yield_scenarios_rwl3and4/cysz_zala_CMIP6_SSP126.csv",
        "/crop_yield_scenarios_rwl3and4/cysz_zala_CMIP6_SSP370.csv",
        "/crop_yield_scenarios_rwl3and4/cysz_zala_CMIP6_SSP585.csv"
    ];
    const handleCheckboxChange = (crop: string) => {
        // Use the functional update form to ensure you're working with the latest state.
        setSelectedCrops((prevSelectedCrops) => {
            const isChecked = prevSelectedCrops.includes(crop);
            if (isChecked) {
                // Return a new array excluding the crop
                return prevSelectedCrops.filter((id) => id !== crop);
            } else {
                // Return a new array including the new crop
                return [...prevSelectedCrops, crop];
            }
        });
    };

    return (
        <>
            <div>
                <Button
                    mr={"1em"}
                    className={`choice-button ${selectedScenario === "ssp126" ? "" : "inactive"}`}
                    onClick={() => {
                        setSelectedScenario("ssp126");
                    }}
                >
                    ssp126
                </Button>
                <Button
                    mr={"1em"}
                    className={`choice-button ${selectedScenario === "ssp370" ? "" : "inactive"}`}
                    onClick={() => {
                        setSelectedScenario("ssp370");
                    }}
                >
                    ssp370
                </Button>
                <Button
                    mr={"1em"}
                    className={`choice-button ${selectedScenario === "ssp585" ? "" : "inactive"}`}
                    onClick={() => {
                        setSelectedScenario("ssp585");
                    }}
                >
                    ssp585
                </Button>
            </div>

            <EnsembleCrops
                files={files}
                regionName={"Zala"}
                regionCode="HU22"
                selectedScenario={selectedScenario}
                selectedCrops={selectedCrops}
            />
            <Center>
                <Stack direction="row" wrap="wrap" mt={4}>
                    {" "}
                    {/* Added wrap and margin for better layout */}
                    {crops.map((crop, id) => (
                        <Checkbox
                            key={id}
                            // Use isChecked to control the component's state
                            isChecked={selectedCrops.includes(crop)}
                            onChange={() => handleCheckboxChange(crop)}
                            mr={4} // Add some margin between checkboxes
                        >
                            {crop}
                        </Checkbox>
                    ))}
                </Stack>
            </Center>
            <Text mt={"2em"} size={"2em"}>
                This graph displays the average value, as well as the 20th to 80th percentile, of
                predicted crop yields across all models in the Danula region.
            </Text>
            <Flex alignItems="center">
                <Text>
                    There was insufficient yield data for summer barley and lucerne in Western
                    Danubia for local simulations. Therefore, data from a neighboring region in
                    Austria was utilized.
                </Text>
            </Flex>
        </>
    );
};

export default ChartComponentZala;
