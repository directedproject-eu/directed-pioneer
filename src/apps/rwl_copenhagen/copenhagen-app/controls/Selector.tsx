// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Heading } from "@open-pioneer/chakra-integration";
import { useState } from "react";
import SelectorItem from "./SelectorItem";

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
            // borderRadius={"7px"}
            marginBottom={marginBottom}
            // borderWidth={"1px"}
        >
            <Heading marginLeft="1em" fontSize={"1px"}>
                {title}
            </Heading>
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
