// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import {
    Box,
    Button,
    Center,
    NativeSelect,
    Stack,
    Text,
    Flex,
    Checkbox,
    Spinner
} from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import CropyieldChart from "./CropyieldChart";
import { TaxonomyInfo } from "taxonomy";
import { useCropYieldData } from "./useCropYieldData";
import { locations, nutsRegionLabel } from "./utils";
interface Props {
    nutsId?: string;
}

/**
 * The crop yield dialog: region, emission scenario and crops on top, the chart below, the
 * explanatory text underneath.
 *
 * All state lives in {@link useCropYieldData}; this component only renders it. `nutsId` is
 * the region the user clicked on the map, passed through as a starting value.
 *
 * The crop checkboxes are built from what the hook found to exist for the current region,
 * not from the full list -- so they change when the region changes, and the selection can
 * shrink with them.
 *
 * The explanation is one paragraph assembled from six translated fragments with three
 * clickable keywords in between, each opening a {@link TaxonomyInfo} panel. The keyword
 * arguments are the taxonomy's own english terms and are deliberately not translated;
 * only the visible link text is.
 */
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
                    <NativeSelect.Root>
                        <NativeSelect.Field
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                        >
                            {locations.map((id) => (
                                <option key={id} value={id}>
                                    {nutsRegionLabel(id)}
                                </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </Box>

                <Flex gap={4}>
                    {["ssp126", "ssp370", "ssp585"].map((scenario) => (
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
                regionName={nutsRegionLabel(selectedLocation)}
                selectedScenario={selectedScenario}
                selectedCrops={selectedCrops}
                seriesData={seriesData}
                isLoading={isChartLoading}
            />

            <Center>
                <Box
                    minHeight="60px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    {isAvailabilityLoading ? (
                        <Flex alignItems="center" gap={3}>
                            <Spinner size="md" color="blue.500" />
                            <Text>Verifying available crops...</Text>
                        </Flex>
                    ) : (
                        <Stack
                            direction="row"
                            wrap="wrap"
                            mt={6}
                            mb={4}
                            justifyContent="center"
                            maxWidth="800px"
                        >
                            {availableCrops.length === 0 ? (
                                <Text color="gray.500">No crop data found for this region.</Text>
                            ) : (
                                availableCrops.map((cropCode) => (
                                    <Checkbox.Root
                                        key={cropCode}
                                        checked={selectedCrops.includes(cropCode)} // Updated prop
                                        onCheckedChange={() => toggleCropSelection(cropCode)} // Updated prop
                                        mr={4}
                                        mb={2}
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Label>
                                            {intl.formatMessage({ id: `crops.${cropCode}` })}
                                        </Checkbox.Label>
                                    </Checkbox.Root>
                                ))
                            )}
                        </Stack>
                    )}
                </Box>
            </Center>

            <Text mt={"2em"} textStyle={"2em"}>
                {intl.formatMessage({ id: "charts.zala_crop.explanation1" })}{" "}
                <Text
                    as="span"
                    color={"#49b7e6"}
                    cursor="pointer"
                    onClick={() => setActiveKeyword("agriculture")}
                >
                    {intl.formatMessage({ id: "charts.zala_crop.keyword1" })}
                </Text>{" "}
                {intl.formatMessage({ id: "charts.zala_crop.explanation2" })}{" "}
                <Text
                    as="span"
                    color="#49b7e6"
                    cursor="pointer"
                    onClick={() => setActiveKeyword("Shared socio-economic pathways (SSPs)")}
                >
                    {intl.formatMessage({ id: "charts.zala_crop.keyword2" })}
                </Text>{" "}
                {intl.formatMessage({ id: "charts.zala_crop.explanation3" })}{" "}
                {intl.formatMessage({ id: "charts.zala_crop.explanation4" })}{" "}
                <Text
                    as="span"
                    color="#49b7e6"
                    cursor="pointer"
                    onClick={() => setActiveKeyword("Agricultural and ecological drought")}
                >
                    {intl.formatMessage({ id: "charts.zala_crop.keyword3" })}
                </Text>
                {intl.formatMessage({ id: "charts.zala_crop.explanation5" })}
            </Text>

            <Flex alignItems="center" mt={4}>
                <Text>{intl.formatMessage({ id: "charts.zala_crop.explanation6" })}</Text>
            </Flex>

            <Box padding="15px" />

            {activeKeyword && (
                <Flex>
                    <TaxonomyInfo keyword={activeKeyword} onClose={() => setActiveKeyword(null)} />
                </Flex>
            )}
        </>
    );
};

export default ChartComponentCropyield;
