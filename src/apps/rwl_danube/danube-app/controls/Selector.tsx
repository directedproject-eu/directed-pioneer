// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Heading } from "@chakra-ui/react";
import { useState } from "react";
import SelectorItem from "./SelectorItem";
import { ISIMIP_VARIABLES, isIsimipVariable } from "../config/isimipVariables";

interface SelectorProps {
    options: string[];
    setSelected: (value: string) => void;
    marginBottom?: string;
    title?: string;
    alternativeText: boolean;
}

const Selector: React.FC<SelectorProps> = ({
    options,
    setSelected,
    marginBottom,
    title,
    alternativeText
}) => {
    const [currentSelected, setCurrentSelected] = useState(options[0]);

    return (
        <Box
            background={"white"}
            borderRadius={"7px"}
            marginBottom={marginBottom}
            borderWidth={"1px"}
        >
            <Heading marginLeft="1em" fontSize={"1.2em"}>
                {title}
            </Heading>
            {options.map((option) => (
                <SelectorItem
                    key={option}
                    selected={currentSelected == option}
                    onClick={() => {
                        setSelected(option);
                        setCurrentSelected(option);
                    }}
                >
                    {/* This component also lists scenarios and models, which have no entry
                        in the variable table -- those fall back to the raw option. */}
                    {alternativeText && isIsimipVariable(option)
                        ? ISIMIP_VARIABLES[option].shortName
                        : option}
                </SelectorItem>
            ))}
        </Box>
    );
};

export default Selector;
