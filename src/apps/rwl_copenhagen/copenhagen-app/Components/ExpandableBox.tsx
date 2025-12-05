// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Box, Button, Collapse, Text } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

type ExpandableBoxProps = {
    title: string;
    children?: React.ReactNode;
    marginBottom?: string;
    marginTop?: string;
    overflowY?: "auto" | "scroll" | "hidden";
};

const ExpandableBox: React.FC<ExpandableBoxProps> = ({
    title,
    children,
    marginBottom,
    marginTop,
    overflowY
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Box
            backgroundColor={"white"}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={4}
            boxShadow="md"
            marginBottom={marginBottom}
            marginTop={marginTop}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">{title}</Text>
                <Button size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
            </Box>
            <Collapse in={isExpanded} animateOpacity>
                <Box maxHeight={"15em"} overflow={overflowY} mt={4}>
                    {children}
                </Box>
            </Collapse>
        </Box>
    );
};

export default ExpandableBox;
