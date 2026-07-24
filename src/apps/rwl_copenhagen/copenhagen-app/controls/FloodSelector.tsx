// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useService } from "open-pioneer:react-hooks";
import { useMapModel } from "@open-pioneer/map";
import { useIntl } from "open-pioneer:react-hooks";
import { MAP_ID } from "../services";
import { FloodHandler } from "../services/FloodHandler";
import Selector from "./Selector";
import {
    HoverCard,
    Box,
    Flex,
    Heading,
    Button,
    Link
} from "@chakra-ui/react";

interface FloodSelectorProps {
    setActiveKeyword: (keyword: string | null) => void;
}

export function FloodSelector({ setActiveKeyword }: FloodSelectorProps) {
    const intl = useIntl();
    const { map } = useMapModel(MAP_ID);
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
                            <Box
                                flexDirection="column"
                                backgroundColor="white"
                                borderRadius="lg"
                                padding={0}
                                role="dialog"
                                maxHeight={100}
                                overflow="auto"
                                marginTop={2}
                            >
                                {intl.formatMessage({ id: "map.flood_layer_selector.description1" })}
                                <Link
                                    variant="plain"
                                    color="#2e9ecc"
                                    paddingEnd={1.5}
                                    paddingStart={1.5}
                                    onClick={() => setActiveKeyword("pluvial flood")}
                                >
                                    {intl.formatMessage({
                                        id: "map.flood_layer_selector.keyword1"
                                    })}
                                </Link>
                                {intl.formatMessage({ id: "map.flood_layer_selector.connector" })}
                                <Link
                                    variant="plain"
                                    color="#2e9ecc"
                                    paddingEnd={1.5}
                                    paddingStart={1.5}
                                    onClick={() => setActiveKeyword("coastal flood")}
                                >
                                    {intl.formatMessage({
                                        id: "map.flood_layer_selector.keyword2"
                                    })}
                                </Link>
                                {intl.formatMessage({ id: "map.flood_layer_selector.description2" })}
                            </Box>
                        </HoverCard.Content>
                    </HoverCard.Positioner>
                </HoverCard.Root>
            </Flex>
            <Selector
                options={["pluvial", "coastal"]}
                setSelected={setFloodType}
                marginBottom="1px"
                alternativeText={false}
            ></Selector>
        </Box>
    );
}
        
            
           