// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useService } from "open-pioneer:react-hooks";
import { FloodHandler } from "../services/FloodHandler";
import Selector from "./Selector";
import { useIntl } from "open-pioneer:react-hooks";
import {
    HoverCard, 
    Box, 
    Flex, 
    Heading, 
    Button, 
} from "@chakra-ui/react";

export function FloodSelector() {
    const intl = useIntl();
    const prepSrvc = useService<FloodHandler>("app.FloodHandler");

    const setFloodType = (option: string) => {
        prepSrvc.setFloodType(option);
    };

    return (
        <Box
            backgroundColor={"white"}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={3}
            boxShadow="md"
            marginBottom="10px"
            overflowY="auto"
        >
            <Flex alignItems="center" marginBottom="3px">
                <Heading fontSize={15} color="black">
                    {intl.formatMessage({ id: "map.flood_layer_selector.title" })}
                </Heading>
                <HoverCard.Root openDelay={250} closeDelay={100} positioning={{ placement: "bottom" }}>
                    <HoverCard.Trigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            color="black"
                            borderRadius="full"
                            paddingRight={2}
                            _hover={{
                                transform: "scale(1.05)",
                                bg: "rgba(0, 0, 0, 0.05)",
                            }}
                            transition="all 0.2s ease"
                        >
                            <Box
                                as="span"
                                display="inline-flex"
                                alignItems="center"
                                justifyContent="center"
                                width="20px"
                                height="20px"
                                borderRadius="50%"
                                border="1.5px solid currentColor"
                                fontFamily="serif"
                                fontWeight="bold"
                                fontSize="12px"
                                lineHeight="1"
                                pb="1px"
                            >
                                i
                            </Box>
                        </Button>
                    </HoverCard.Trigger>
                    <HoverCard.Positioner>
                        <HoverCard.Content>
                            {intl.formatMessage({ id: "map.flood_layer_selector.description" })}
                        </HoverCard.Content>
                    </HoverCard.Positioner>
            </HoverCard.Root>
            </Flex>
            <Selector
                options={["pluvial", "coastal"]}
                setSelected={setFloodType}
                marginBottom="1px"
                // title={intl.formatMessage({ id: "map.flood_layer_selector.floodtype" })}
                alternativeText={false}
            ></Selector>
        </Box>
    );
}
        
            
           