// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useService } from "open-pioneer:react-hooks";
import { useState } from "react";
import { IsimipHandler } from "../services/IsimipHandler";
import Selector from "./Selector";
import ExpandableBox from "../components/ExpandableBox";
import { useIntl } from "open-pioneer:react-hooks";
import {
    Button,
    IconButton, 
    Flex,
    HoverCard,
} from "@chakra-ui/react";
import { FaInfo } from "react-icons/fa";
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
            <HoverCard.Root openDelay={250} closeDelay={100} positioning={{placement:"right"}}>
                <HoverCard.Trigger asChild>
                    <IconButton
                        marginLeft="2px" 
                        size="sm"
                        aria-label="Info"
                        variant="ghost"
                        color="black"
                    >
                        <FaInfo />
                    </IconButton>
                </HoverCard.Trigger>
                <HoverCard.Positioner>
                    <HoverCard.Content>
                        <HoverCard.Arrow />
                            {intl.formatMessage({id: "map.layer_select.info1"})}
                            {" "}
                            <Button
                                variant="plain"
                                color="#2e9ecc"
                                onClick={() => setActiveKeyword("climate model")}
                            >
                                {intl.formatMessage({id: "map.layer_select.keyword1"})}
                            </Button>
                            {" "}
                            {intl.formatMessage({id: "map.layer_select.info2"})}
                            {" "}
                            <Button
                                variant="plain"
                                color="#2e9ecc"
                                onClick={() => setActiveKeyword("Shared socio-economic pathways (SSPs)")}
                            >
                                {intl.formatMessage({id: "map.layer_select.keyword2"})}
                            </Button>
                            {intl.formatMessage({id: "map.layer_select.info3"})}
                            <Button
                                variant="plain"
                                color="#2e9ecc"
                                onClick={() => setActiveKeyword("Variables")}
                            >
                                {intl.formatMessage({id: "map.layer_select.keyword3"})}
                            </Button>
                            {" "}
                            {intl.formatMessage({id: "map.layer_select.info4"})}
                    </HoverCard.Content>
                </HoverCard.Positioner>
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
