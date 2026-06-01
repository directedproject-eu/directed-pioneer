// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useService } from "open-pioneer:react-hooks";
import { FloodHandler } from "../services/FloodHandler";
import Selector from "./Selector";
// import ExpandableBox from "../Components/ExpandableBox";
import { Box, Flex, Heading, Spacer } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import {
    IconButton,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    PopoverArrow
} from "@open-pioneer/chakra-integration";
// import { FaInfo } from "react-icons/fa";

// import { TaxonomyInfo } from "taxonomy";

export function FloodSelector() {
    const intl = useIntl();
    // const [activeKeyword, setActiveKeyword] = useState<string | null>(null); // Taxonomy
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
            p={4}
            boxShadow="md"
            marginBottom="10px"
            overflowY="auto"
        >
            <Flex alignItems="center" marginBottom="3px">
                <Heading size="l" color="black">
                    {intl.formatMessage({ id: "map.flood_layer_selector.title" })}
                </Heading>
                <Popover 
                    trigger="hover" 
                    openDelay={250} 
                    closeDelay={100} 
                    placement="right"
                >
                    <PopoverTrigger>
                        {/* <IconButton
                            marginLeft="2px"
                            size="s"
                            aria-label="Info"
                            icon={<FaInfo />}
                            variant="ghost"
                            color="black"
                        /> */}
                        <IconButton
                            marginLeft="4px"
                            size="xs"
                            aria-label="Info"
                            variant="ghost"
                            color="black"
                            _hover={{
                                transform: "scale(1.1)",
                                bg: "rgba(0, 0, 0, 0.05)"
                            }}
                            transition="all 0.2s ease"
                            // Render custom styled "i" badge as the icon
                            icon={
                                <Box
                                    as="span"
                                    display="inline-flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    width="18px"
                                    height="18px"
                                    borderRadius="50%"
                                    border="1.5px solid currentColor"
                                    fontFamily="serif"
                                    fontWeight="bold"
                                    fontStyle="normal"
                                    fontSize="12px"
                                    lineHeight="1"
                                    paddingBottom="1px"
                                >
                                    i
                                </Box>
                            }
                        />
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverArrow />
                        <PopoverBody overflow="auto">
                            {intl.formatMessage({ id: "map.flood_layer_selector.description" })}
                            {/* {" "}
                            <Button
                                variant="link"
                                color="#2e9ecc"
                                onClick={() => setActiveKeyword("climate model")}
                            >
                                {intl.formatMessage({id: "map.layer_select.keyword1"})}
                            </Button> */}
                        </PopoverBody>
                    </PopoverContent>
                    {/* {activeKeyword && (
                        <Flex>
                            <TaxonomyInfo
                                keyword={activeKeyword}
                                onClose={() => setActiveKeyword(null)}
                            />
                        </Flex>
                    )} */}
                </Popover>
            </Flex>
            <Selector
                options={["pluvial", "coastal"]}
                setSelected={setFloodType}
                marginBottom="5px"
                // title={intl.formatMessage({ id: "map.flood_layer_selector.floodtype" })}
                alternativeText={false}
            ></Selector>
        </Box>
    );
}
