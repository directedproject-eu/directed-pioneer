// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Box, Button, Collapse, Text } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

type ExpandableBoxProps = {
    title: string;
    children?: React.ReactNode;
    marginBottom?: string;
    overflowY?: "auto" | "scroll" | "hidden"; 

};

const ExpandableBox: React.FC<ExpandableBoxProps> = ({ title, children, marginBottom, overflowY }) => {
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
            marginBottom={marginBottom}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">{title}</Text>
                <Button size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
            </Box>
            <Collapse in={isExpanded} animateOpacity>
                <Box maxHeight={"15em"} overflow={overflowY} mt={4}>{children}</Box>
            </Collapse>
        </Box>
    );
};

export default ExpandableBox;
