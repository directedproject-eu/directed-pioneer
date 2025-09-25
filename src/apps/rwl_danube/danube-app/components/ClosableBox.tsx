// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Text } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

type ClosableBoxProps = {
    title: string;
    closeRef: React.RefObject<HTMLDivElement>;
    children?: React.ReactNode;
    marginBottom?: string;
};

const ClosableBox: React.FC<ClosableBoxProps> = ({ title, closeRef, children, marginBottom }) => {
    return (
        <Box
            ref={closeRef}
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
                <Button
                    size="sm"
                    onClick={() => {
                        closeRef.current.remove();
                    }}
                >
                    <CloseIcon />
                </Button>
            </Box>
            <Box mt={4}>{children}</Box>
        </Box>
    );
};

export default ClosableBox;
