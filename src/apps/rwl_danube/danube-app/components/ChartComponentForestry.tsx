// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import {
    Box,
    Center,
    Text,
    Select,
    Flex,
    Field,
    NativeSelect
} from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import ForestryChart from "./ForestryChart";

const locations = [
    { id: "bakonybel_2_ti5", name: "Bakonybél (2 TI5)" },
    { id: "bakonyszentlaszlo_erdeszet_hodo", name: "Bakonyszentlászló Erdészet Hódo" },
    { id: "csehbanya_20ep", name: "Csehbánya (20ÉP)" },
    { id: "devecser_59_d", name: "Devecser (59 D)" },
    { id: "devecseri_edeszet_sarosfo", name: "Devecseri Erdészet Sárosfő" },
    { id: "dorgicse_18_ey", name: "Dörgicse (18 EY)" },
    { id: "keszthelyi_erdeszet_vallus", name: "Keszthelyi Erdészet Vállus" },
    { id: "kup_24_ti", name: "Kup (24 TI)" },
    { id: "saska_61_vf", name: "Sáska (61 VF)" },
    { id: "tuskevar_36_c", name: "Tüskevár (36 C)" },
    { id: "zalaerdod_29_a", name: "Zalaerdőd (29 A)" }
];

const variables = [
    { id: "none", name: "--- display nothing --- " },
    { id: "temperature", name: "Temperature" },
    { id: "wind_speed", name: "Wind Speed" },
    { id: "soil_moisture_10cm", name: "Soil Moisture 10cm" },
    { id: "soil_moisture_25cm", name: "Soil Moisture 25cm" },
    { id: "soil_moisture_50cm", name: "Soil Moisture 50cm" },
    { id: "soil_moisture_70cm", name: "Soil Moisture 70cm" }
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

    const currentLocationName = locations.find((loc) => loc.id === selectedLocation)?.name || "";

    const selectedVariables = [leftAxisVariable, rightAxisVariable].filter((v) => v !== "none");

    return (
        <>
            <Flex justifyContent="center" mb={4}>
                <Box width="300px">
                    <NativeSelect.Root>
                        <NativeSelect.Field
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                        >
                        {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                        </NativeSelect.Field>
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
                                {variables.map((v) => (
                                    <option key={`left-${v.id}`} value={v.id}>
                                        {v.name}
                                    </option>
                                ))}
                            </NativeSelect.Field>
                        </NativeSelect.Root>
                    </Field.Root>

                    <Field.Root>
                        <Field.Label textAlign="center">Right Y-axis</Field.Label>
                        <NativeSelect.Root>
                            <NativeSelect.Field
                                value={rightAxisVariable}
                                onChange={(e) => setRightAxisVariable(e.target.value)}
                            >
                                {variables.map((v) => (
                                    <option key={`right-${v.id}`} value={v.id}>
                                        {v.name}
                                    </option>
                                ))}
                            </NativeSelect.Field>
                        </NativeSelect.Root>
                    </Field.Root>
                </Flex>
            </Center>

            <Text mt={"2em"} size={"2em"}>
                {intl.formatMessage({ id: "charts.forestry.explanation1" })}
            </Text>

            <Box padding="15px" />
        </>
    );
};

export default ChartComponentForestry;
