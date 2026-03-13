// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Box, Button, Collapsible, Text } from "@chakra-ui/react";
import { SlArrowUp, SlArrowDown } from "react-icons/sl";

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
                    {isExpanded ? <SlArrowUp /> : <SlArrowDown />}
                </Button>
            </Box>
            <Collapsible.Root open={isExpanded}>
                <Collapsible.Content>
                    <Box mt={4}>{children}</Box>
                </Collapsible.Content>
            </Collapsible.Root>
        </Box>
    );
};

export default ResizeBox;
