// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Button, Checkbox, Stack, Text } from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import CropyieldChart from "./CropyieldChart";

const ChartComponentRhineErft = () => {
    const intl = useIntl();
    const [selectedScenario, setSelectedScenario] = useState("ssp585");
    
    // Default to the code "POTA" instead of the English word "Potatoes"
    const [selectedCrops, setSelectedCrops] = useState<string[]>(["POTA"]);
    
    // Replace English names with their respective codes
    const cropCodes = [
        "GMAI", // Green maize
        "POTA", // Potatoes
        "SBAR", // Spring barley
        "TRIT", // Triticale
        "WBAR", // Winter barley
        "WRAP", // Winter rape
        "WRYE", // Rye and maslin
        "WWHT", // Winter wheat
        "OATS", // Oats
        "SUGB"  // Sugar beet
    ];

    const files = [
        "/crop_yield_scenarios_rwl3and4/cysz_rwl4_CMIP6_SSP370.csv",
        "/crop_yield_scenarios_rwl3and4/cysz_rwl4_CMIP6_SSP585.csv",
        "/crop_yield_scenarios_rwl3and4/cysz_rwl4_CMIP5_RCP8dot5.csv"
    ];

    const handleCheckboxChange = (cropCode: string) => {
        setSelectedCrops((prevSelectedCrops) => {
            const isChecked = prevSelectedCrops.includes(cropCode);
            if (isChecked) {
                return prevSelectedCrops.filter((id) => id !== cropCode);
            } else {
                return [...prevSelectedCrops, cropCode];
            }
        });
    };

    return (
        <>
            <div>
                <Button
                    mr={"1em"}
                    className={`choice-button ${selectedScenario === "ssp370" ? "" : "inactive"}`}
                    onClick={() => setSelectedScenario("ssp370")}
                >
                    ssp370
                </Button>
                <Button
                    mr={"1em"}
                    className={`choice-button ${selectedScenario === "ssp585" ? "" : "inactive"}`}
                    onClick={() => setSelectedScenario("ssp585")}
                >
                    ssp585
                </Button>
                <Button
                    mr={"1em"}
                    className={`choice-button ${selectedScenario === "RCP8dot5" ? "" : "inactive"}`}
                    onClick={() => setSelectedScenario("RCP8dot5")}
                >
                    RCP8.5
                </Button>
            </div>

            <CropyieldChart
                files={files}
                regionName={"Rhine - Erft"}
                regionCode="RWL4:Rhine-Erft"
                selectedScenario={selectedScenario}
                selectedCrops={selectedCrops} 
            />

            <Stack direction="row" wrap="wrap" mt={4}>
                {cropCodes.map((cropCode) => (
                    <Checkbox
                        key={cropCode}
                        isChecked={selectedCrops.includes(cropCode)}
                        onChange={() => handleCheckboxChange(cropCode)}
                        mr={4} 
                        mb={2}
                    >
                        {intl.formatMessage({ id: `crops.${cropCode}` })}
                    </Checkbox>
                ))}
            </Stack>
            
            <Text mt={"2em"} size={"2em"}>
                {intl.formatMessage({ id: "charts.explanation" })}
            </Text>
        </>
    );
};

export default ChartComponentRhineErft;