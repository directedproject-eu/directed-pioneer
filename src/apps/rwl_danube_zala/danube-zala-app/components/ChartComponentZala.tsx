// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Button, Checkbox, Stack } from "@open-pioneer/chakra-integration";
import EnsembleCrops from "./EnsembleCrops";
import { useState } from "react";

const ChartComponentRhineErft = () => {
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
        </>
    );
};

export default ChartComponentRhineErft;

// // SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// // SPDX-License-Identifier: Apache-2.0

// import { Button, Radio, RadioGroup, Stack } from "@open-pioneer/chakra-integration";
// import EnsembleCrops from "./EnsembleCrops";
// import { useState } from "react";

// const ChartComponentZala = () => {

//     const [selectedScenario, setSelectedScenario] = useState("ssp126");
//     const [selectedCrop, setSelectedCrop] = useState("Corn maize");

//     const files = [
//         "/crop_yield_scenarios_rwl3and4/cysz_zala_CMIP6_SSP126.csv",
//         "/crop_yield_scenarios_rwl3and4/cysz_zala_CMIP6_SSP370.csv",
//         "/crop_yield_scenarios_rwl3and4/cysz_zala_CMIP6_SSP585.csv"
//     ];
//     return (
//         <>
//             <div>
//                 <Button mr={"1em"} className={`choice-button ${selectedScenario === "ssp126" ? "" : "inactive"}`}  onClick={() => {setSelectedScenario("ssp126");}}>
//                     ssp126
//                 </Button>
//                 <Button mr={"1em"} className={`choice-button ${selectedScenario === "ssp370" ? "" : "inactive"}`}  onClick={() => {setSelectedScenario("ssp370");}}>
//                     ssp370
//                 </Button>
//                 <Button mr={"1em"} className={`choice-button ${selectedScenario === "ssp585" ? "" : "inactive"}`}  onClick={() => {setSelectedScenario("ssp585");}}>
//                     ssp585
//                 </Button>
//             </div>

//             <EnsembleCrops files={files} regionName={"Zala"} regionCode="HU22" selectedScenario={selectedScenario} selectedCrop={selectedCrop}></EnsembleCrops>

//             <RadioGroup onChange={setSelectedCrop} value={selectedCrop}>
//                 <Stack direction='row'>
//                     <Radio value="Lucerne">Lucerne</Radio>
//                     <Radio value="Corn maize">Corn maize</Radio>
//                     <Radio value="Green maize">Green maize</Radio>
//                     <Radio value="Potatoes">Potatoes</Radio>
//                     <Radio value="Spring barley">Spring barley</Radio>
//                     <Radio value="Soya beans">Soya beans</Radio>
//                     <Radio value="Sunflowers">Sunflowers</Radio>
//                     <Radio value="Triticale">Triticale</Radio>
//                     <Radio value="Winter Barley">Winter Barley</Radio>
//                     <Radio value="Winter rape">Winter rape</Radio>
//                     <Radio value="Rye and maslin">Rye and maslin</Radio>
//                     <Radio value="Winter wheat">Winter wheat</Radio>
//                 </Stack>
//             </RadioGroup>
//         </>
//     );
// };

// export default ChartComponentZala;
