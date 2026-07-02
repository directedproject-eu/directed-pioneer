// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useService } from "open-pioneer:react-hooks";
import { useState } from "react";
import { IsimipHandler } from "../services/IsimipHandler";
import Selector from "./Selector";
import ExpandableBox from "../components/ExpandableBox";
import { useIntl } from "open-pioneer:react-hooks";
import { Button, Box, Flex, HoverCard, Text, Portal } from "@chakra-ui/react";
import { TaxonomyInfo } from "taxonomy";

export function IsimipSelector() {
    const intl = useIntl();
    const [activeKeyword, setActiveKeyword] = useState<string | null>(null); // Taxonomy
    const prepSrvc = useService<IsimipHandler>("app.IsimipHandler");

    const setModel = (option: string) => {
        prepSrvc.setModel(option);
    };

    const setVariable = (option: string) => {
        prepSrvc.setVariable(option);
    };

    const setScenario = (option: string) => {
        prepSrvc.setScenario(option);
    };

    return (
        <ExpandableBox
            title={intl.formatMessage({ id: "map.layer_select.heading" })}
            marginBottom="10px"
            overflowY="auto"
        >
            <HoverCard.Root openDelay={250} closeDelay={100} positioning={{ placement: "bottom" }}>
                <HoverCard.Trigger asChild>
                    <Button
                        size="sm" variant="ghost" color="black" borderRadius="full"
                        p={0} minW="30px" h="30px" transition="all 0.2s ease" paddingBottom={1}
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
                <Portal>
                    <HoverCard.Positioner>
                        <HoverCard.Content>
                            <Text>
                                {/* <HoverCard.Arrow /> */}
                                {intl.formatMessage({ id: "map.layer_select.info1" })}
                                {" "}
                                <Text
                                    as="span"
                                    color="#49b7e6"
                                    cursor="pointer"
                                    onClick={() => setActiveKeyword("climate model")}
                                >
                                    {intl.formatMessage({ id: "map.layer_select.keyword1" })}
                                </Text>
                                {" "}
                                {intl.formatMessage({ id: "map.layer_select.info2" })}
                                {" "}
                                <Text
                                    as={"span"}
                                    color="#49b7e6"
                                    cursor={"pointer"}
                                    onClick={() =>
                                        setActiveKeyword("Shared socio-economic pathways (SSPs)")
                                    }
                                >
                                    {intl.formatMessage({ id: "map.layer_select.keyword2" })}
                                </Text>
                                {" "}
                                {intl.formatMessage({ id: "map.layer_select.info3" })}
                                {" "}
                                <Text
                                    as={"span"}
                                    color="#49b7e6"
                                    cursor={"pointer"}
                                    onClick={() => setActiveKeyword("Variables")}
                                >
                                    {intl.formatMessage({ id: "map.layer_select.keyword3" })}
                                </Text>
                                {" "}
                                {intl.formatMessage({ id: "map.layer_select.info4" })}
                            </Text>
                        </HoverCard.Content>
                    </HoverCard.Positioner>
                </Portal>
                {activeKeyword && (
                    <Flex>
                        <TaxonomyInfo
                            keyword={activeKeyword}
                            onClose={() => setActiveKeyword(null)}
                        />
                    </Flex>
                )}
            </HoverCard.Root>
            <Selector
                options={[
                    "canesm5",
                    "cnrm-cm6-1",
                    "cnrm-esm2-1",
                    "ec-earth3",
                    "gfdl-esm4",
                    "ipsl-cm6a-lr",
                    "miroc6",
                    "mpi-esm1-2-hr",
                    "mri-esm2-0",
                    "ukesm1-0-ll"
                ]}
                setSelected={setModel}
                marginBottom="5px"
                title={intl.formatMessage({ id: "map.layer_select.model" })}
                alternativeText={false}
            ></Selector>
            <Selector
                options={["ssp585", "ssp370", "ssp126"]}
                setSelected={setScenario}
                marginBottom="5px"
                title={intl.formatMessage({ id: "map.layer_select.scenario" })}
                alternativeText={false}
            ></Selector>
            <Selector
                options={["hurs", "pr", "rsds", "sfcwind", "spei12", "tasmax", "tasmin", "tas"]}
                setSelected={setVariable}
                marginBottom="5px"
                title={intl.formatMessage({ id: "map.layer_select.variable" })}
                alternativeText={true}
            ></Selector>
        </ExpandableBox>
    );
}
