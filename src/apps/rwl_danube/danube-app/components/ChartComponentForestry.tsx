// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import {
    Box,
    Center,
    Checkbox,
    Stack,
    Text,
} from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import ForestryChart from "./ForestryChart";

const ChartComponentForestry = () => {
    const intl = useIntl();
    
    const [selectedVariables, setSelectedVariables] = useState<string[]>(["temperature"]);
    
    const variables = [
        "temperature",
        "wind_speed",
        "soil_moisture_10cm",
        "soil_moisture_25cm",
        "soil_moisture_50cm",
        "soil_moisture_70cm"
    ];

    const handleCheckboxChange = (variable: string) => {
        setSelectedVariables((prevSelected) => {
            const isChecked = prevSelected.includes(variable);
            if (isChecked) {
                return prevSelected.filter((id) => id !== variable);
            } else {
                return [...prevSelected, variable];
            }
        });
    };

    const formatLabel = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
    };

    return (
        <>
            <ForestryChart selectedVariables={selectedVariables} />
            
            <Center>
                <Stack direction="row" wrap="wrap" mt={4}>
                    {variables.map((variable, id) => (
                        <Checkbox
                            key={id}
                            isChecked={selectedVariables.includes(variable)}
                            onChange={() => handleCheckboxChange(variable)}
                            mr={4}
                        >
                            {formatLabel(variable)}
                        </Checkbox>
                    ))}
                </Stack>
            </Center>
            
            <Text mt={"2em"} size={"2em"}>
                {intl.formatMessage({id: "charts.forestry.explanation1"})}
            </Text>
            
            <Box padding="15px" />
        </>
    );
};

export default ChartComponentForestry;