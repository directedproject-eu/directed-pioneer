// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Box, Button, Collapse, Text } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

type ExpandleBoxProps = {
    title: string;
    children: React.ReactNode;
};

const ExpandleBox: React.FC<ExpandleBoxProps> = ({ title, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Box
            backgroundColor={"white"}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={4}
            w="300px"
            boxShadow="md"
        >
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">{title}</Text>
                <Button size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
            </Box>
            <Collapse in={isExpanded} animateOpacity>
                <Box mt={4}>{children}</Box>
            </Collapse>
        </Box>
    );
};

export default ExpandleBox;
