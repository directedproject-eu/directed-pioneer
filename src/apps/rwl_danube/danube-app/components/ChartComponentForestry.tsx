// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import {
    Box,
    Center,
    Checkbox,
    Stack,
    Text,
    Select,
    Flex
} from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import ForestryChart from "./ForestryChart";

const locations = [
    { id: "keszthelyi_erdeszet_vallus", name: "Keszthelyi Erdészet Vállus" },
    { id: "placeholder_1", name: "Platzhalter Ort 1" },
    { id: "placeholder_2", name: "Platzhalter Ort 2" }
];

// NEU: Interface für die Properties hinzufügen
interface Props {
    initialLocation?: string;
}

// NEU: Die Komponente nimmt jetzt 'initialLocation' entgegen
const ChartComponentForestry: React.FC<Props> = ({ initialLocation }) => {
    const intl = useIntl();
    
    const [selectedVariables, setSelectedVariables] = useState<string[]>(["temperature"]);
    
    // NEU: Wir nutzen 'initialLocation' als Startwert (oder den Fallback)
    const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation || "keszthelyi_erdeszet_vallus");

    // NEU: Wenn ein neuer Punkt auf der Karte geklickt wird, updaten wir das Dropdown
    useEffect(() => {
        if (initialLocation) {
            setSelectedLocation(initialLocation);
        }
    }, [initialLocation]);
    
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

    const currentLocationName = locations.find(loc => loc.id === selectedLocation)?.name || "";

    return (
        <>
            <Flex justifyContent="center" mb={4}>
                <Box width="300px">
                    <Select 
                        value={selectedLocation} 
                        onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                        {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                    </Select>
                </Box>
            </Flex>

            <ForestryChart 
                selectedVariables={selectedVariables} 
                selectedLocation={selectedLocation}
                locationName={currentLocationName}
            />
            
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