// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { Box, Center, Text, Flex, Field, NativeSelect } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import ForestryChart from "./ForestryChart";
import { FORESTRY_STATIONS, FORESTRY_VARIABLES, NO_VARIABLE } from "../config/forestry";

/** The axis dropdowns offer "show nothing" ahead of the actual variables. */
const axisOptions = [
    { id: NO_VARIABLE, name: "--- display nothing --- " },
    ...FORESTRY_VARIABLES.map(({ id, name }) => ({ id, name }))
];

interface Props {
    initialLocation?: string;
}

const ChartComponentForestry: React.FC<Props> = ({ initialLocation }) => {
    const intl = useIntl();

    const [selectedLocation, setSelectedLocation] = useState<string>(
        initialLocation || "keszthelyi_erdeszet_vallus"
    );

    const [leftAxisVariable, setLeftAxisVariable] = useState<string>("temperature");
    const [rightAxisVariable, setRightAxisVariable] = useState<string>("wind_speed");

    useEffect(() => {
        if (initialLocation) {
            setSelectedLocation(initialLocation);
        }
    }, [initialLocation]);

    const currentLocationName =
        FORESTRY_STATIONS.find((loc) => loc.id === selectedLocation)?.name || "";

    return (
        <>
            <Flex justifyContent="center" mb={4}>
                <Box width="300px">
                    <NativeSelect.Root>
                        <NativeSelect.Field
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                        >
                            {FORESTRY_STATIONS.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </Box>
            </Flex>

            <ForestryChart
                leftVariable={leftAxisVariable}
                rightVariable={rightAxisVariable}
                selectedLocation={selectedLocation}
                locationName={currentLocationName}
            />

            <Center mt={4}>
                <Flex gap={8} width="100%" maxWidth="600px" justifyContent="center">
                    <Field.Root>
                        <Field.Label textAlign="center">Left Y-axis</Field.Label>
                        <NativeSelect.Root>
                            <NativeSelect.Field
                                value={leftAxisVariable}
                                onChange={(e) => setLeftAxisVariable(e.target.value)}
                            >
                                {axisOptions.map((v) => (
                                    <option key={`left-${v.id}`} value={v.id}>
                                        {v.name}
                                    </option>
                                ))}
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                        </NativeSelect.Root>
                    </Field.Root>

                    <Field.Root>
                        <Field.Label textAlign="center">Right Y-axis</Field.Label>
                        <NativeSelect.Root>
                            <NativeSelect.Field
                                value={rightAxisVariable}
                                onChange={(e) => setRightAxisVariable(e.target.value)}
                            >
                                {axisOptions.map((v) => (
                                    <option key={`right-${v.id}`} value={v.id}>
                                        {v.name}
                                    </option>
                                ))}
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                        </NativeSelect.Root>
                    </Field.Root>
                </Flex>
            </Center>

            <Text mt={"2em"} textStyle={"2em"}>
                {intl.formatMessage({ id: "charts.forestry.explanation1" })}
            </Text>

            <Box padding="15px" />
        </>
    );
};

export default ChartComponentForestry;
