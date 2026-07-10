// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import {HoverCard, Button, Box } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";


interface Props{
    children?: React.ReactNode;
}

const Disclaimer: React.FC<Props> = ({ children }) => {
    const intl = useIntl();
    return (
        <HoverCard.Root openDelay={250} closeDelay={100} positioning={{ placement: "bottom" }}>
            <HoverCard.Trigger asChild>
                <Button
                    size="sm" variant="ghost" color="black" borderRadius="full"
                    p={0} minW="30px" h="30px" transition="all 0.2s ease"
                    paddingTop={8}
                    _hover={{ transform: "scale(1.05)", bg: "rgba(0, 0, 0, 0.05)" }}
                >
                    <Box
                        as="span" display="inline-flex" alignItems="center" justifyContent="center"
                        width="25px" height="25px" borderRadius="50%" border="1.5px solid currentColor"
                        fontFamily="serif" fontWeight="bold" fontSize="15px" lineHeight="1" pb="1px"
                    >
                        i
                    </Box>
                </Button>
            </HoverCard.Trigger>
            <HoverCard.Positioner>
                <HoverCard.Content>
                    {intl.formatMessage({ id: "disclaimerContent.text" })}
                </HoverCard.Content>
            </HoverCard.Positioner>
        </HoverCard.Root>
    );
};

export default Disclaimer;