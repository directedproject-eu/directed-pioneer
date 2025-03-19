// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Flex, Heading } from "@open-pioneer/chakra-integration";
import { useState } from "react";
import SelectorItem from "./SelectorItem";

interface SelectorProps {
    options: string[];
    setSelected: (value: string) => void;
    placeholder?: string;
    heading: string;
}

const Selector: React.FC<SelectorProps> = ({ options, setSelected, heading }) => {
    const [currentSelected, setCurrentSelected] = useState(options[0]);

    return (
        <Box background={"white"} borderRadius={"7px"} marginBottom={"0.5em"}>
            <Flex width={"100%"} justifyContent={"center"}>
                <Heading size="m">{heading}</Heading>
            </Flex>
            {options.map((option, index) => (
                <SelectorItem
                    key={index}
                    selected={currentSelected == option}
                    onClick={() => {
                        setSelected(option);
                        setCurrentSelected(option);
                    }}
                >
                    {option}
                </SelectorItem>
            ))}
        </Box>
    );
};

export default Selector;
