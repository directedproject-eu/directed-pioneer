// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Button, Checkbox, Stack , Text} from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import EnsembleCrops from "./EnsembleCrops";

const ChartComponentRhineErft = () => {
    const intl = useIntl();
    const [selectedScenario, setSelectedScenario] = useState("ssp585");
    const [selectedCrops, setSelectedCrops] = useState<string[]>(["Potatoes"]);
    const crops = [
        "Green maize",
        "Potatoes",
        "Spring barley",
        "Triticale",
        "Winter barley",
        "Winter rape",
        "Rye and maslin",
        "Winter wheat",
        "Oats",
        "Sugar beet"
    ];
    const files = [
        "/crop_yield_scenarios_rwl3and4/cysz_rwl4_CMIP6_SSP370.csv",
        "/crop_yield_scenarios_rwl3and4/cysz_rwl4_CMIP6_SSP585.csv",
        "/crop_yield_scenarios_rwl3and4/cysz_rwl4_CMIP5_RCP8dot5.csv"
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
                <Button
                    mr={"1em"}
                    className={`choice-button ${selectedScenario === "RCP8dot5" ? "" : "inactive"}`}
                    onClick={() => {
                        setSelectedScenario("RCP8dot5");
                    }}
                >
                    RCP8.5
                </Button>
            </div>

            <EnsembleCrops
                files={files}
                regionName={"Rhine - Erft"}
                regionCode="RWL4:Rhine-Erft"
                selectedScenario={selectedScenario}
                selectedCrops={selectedCrops}
            />

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
            <Text mt={"2em"} size={"2em"}>
                {intl.formatMessage({id: "charts.explanation"})}
            </Text>
        </>
    );
};

export default ChartComponentRhineErft;
