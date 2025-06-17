// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Box, Button, Collapse, Text } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { isRegExp } from "util";

type ResizeBoxProps = {
    title: string;
    children?: React.ReactNode;
    marginBottom?: string;
    overflowY?: "auto" | "scroll" | "hidden";
};

const ResizeBox: React.FC<ResizeBoxProps> = ({ title, children, marginBottom, overflowY }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Box
            backgroundColor={"white"}
            borderWidth="1px"
            borderRadius="lg"
            overflow="auto"
            p={4}
            w={isExpanded ? "" : "300px"}
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
                <Box mt={4}>{children}</Box>
            </Collapse>
        </Box>
    );
};

export default ResizeBox;
