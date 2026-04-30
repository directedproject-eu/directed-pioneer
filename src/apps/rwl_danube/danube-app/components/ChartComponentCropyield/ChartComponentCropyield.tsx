// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import {
    Box,
    Button,
    Center,
    Checkbox,
    Stack,
    Text,
    Flex,
    Select,
    Spinner
} from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import CropyieldChart from "./CropyieldChart";
import { TaxonomyInfo } from "taxonomy";
import { useCropYieldData } from "./useCropYieldData";
import { locations, CODE_TO_DISPLAY_NAME, NUTS_REGIONS } from "./utils";
interface Props {
    nutsId?: string;
}

const ChartComponentCropyield: React.FC<Props> = ({ nutsId }) => {
    const intl = useIntl();
    const [activeKeyword, setActiveKeyword] = useState<string | null>(null);

    // Using the custom hook to handle the data pipeline
    const {
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
    } = useCropYieldData(nutsId);

    return (
        <>
            <Flex justifyContent="center" mb={6} direction="column" alignItems="center" gap={4}>
                <Box width="300px">
                    <Select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                        {Object.entries(NUTS_REGIONS).map(([id, name]) => (
                            <option key={id} value={id}>
                                {id} ({name})
                            </option>
                        ))}
                    </Select>
                </Box>
                
                <Flex gap={4}>
                    {["ssp126", "ssp370", "ssp585"].map(scenario => (
                        <Button
                            key={scenario}
                            className={`choice-button ${selectedScenario === scenario ? "" : "inactive"}`}
                            onClick={() => setSelectedScenario(scenario)}
                        >
                            {scenario}
                        </Button>
                    ))}
                </Flex>
            </Flex>

            <CropyieldChart
                regionName={selectedLocation}
                selectedScenario={selectedScenario}
                selectedCrops={selectedCrops}
                seriesData={seriesData}
                isLoading={isChartLoading}
            />

            <Center>
                <Box minHeight="60px" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    {isAvailabilityLoading ? (
                        <Flex alignItems="center" gap={3}>
                            <Spinner size="md" color="blue.500" />
                            <Text>Verifying available crops...</Text>
                        </Flex>
                    ) : (
                        <Stack direction="row" wrap="wrap" mt={6} mb={4} justifyContent="center" maxWidth="800px">
                            {availableCrops.length === 0 ? (
                                <Text color="gray.500">No crop data found for this region.</Text>
                            ) : (
                                availableCrops.map((cropCode) => (
                                    <Checkbox
                                        key={cropCode}
                                        isChecked={selectedCrops.includes(cropCode)}
                                        onChange={() => toggleCropSelection(cropCode)}
                                        mr={4}
                                        mb={2}
                                    >
                                        {CODE_TO_DISPLAY_NAME[cropCode]} 
                                    </Checkbox>
                                ))
                            )}
                        </Stack>
                    )}
                </Box>
            </Center>

            <Text mt={"2em"} size={"2em"}>
                {intl.formatMessage({id: "charts.zala_crop.explanation1"})}
                {" "}
                <Button variant="link" color="#2e9ecc" onClick={() => setActiveKeyword("agriculture")}>
                    {intl.formatMessage({id: "charts.zala_crop.keyword1"})}
                </Button>{" "}
                {intl.formatMessage({id: "charts.zala_crop.explanation2"})}
                {" "}
                <Button variant="link" color="#2e9ecc" onClick={() => setActiveKeyword("Shared socio-economic pathways (SSPs)")}>
                    {intl.formatMessage({id: "charts.zala_crop.keyword2"})}
                </Button>{" "}
                {intl.formatMessage({id: "charts.zala_crop.explanation3"})} {" "}
                {intl.formatMessage({id: "charts.zala_crop.explanation4"})}
                {" "}
                <Button variant="link" color="#2e9ecc" onClick={() => setActiveKeyword("Agricultural and ecological drought")}>
                    {intl.formatMessage({id: "charts.zala_crop.keyword3"})}
                </Button> 
                {intl.formatMessage({id: "charts.zala_crop.explanation5"})}
            </Text>
            
            <Flex alignItems="center" mt={4}>
                <Text>{intl.formatMessage({id: "charts.zala_crop.explanation6"})}</Text>
            </Flex>
            
            <Box padding="15px" />
            
            {activeKeyword && (
                <Flex>
                    <TaxonomyInfo
                        keyword={activeKeyword}
                        onClose={() => setActiveKeyword(null)}
                    />
                </Flex>
            )}
        </>
    );
};

export default ChartComponentCropyield;