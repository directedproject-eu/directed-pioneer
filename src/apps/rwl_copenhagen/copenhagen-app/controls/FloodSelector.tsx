// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useService } from "open-pioneer:react-hooks";
import { useState } from "react";
import { FloodHandler } from "../services/FloodHandler";
import Selector from "./Selector";
import ExpandableBox from "../Components/ExpandableBox";
import { useIntl } from "open-pioneer:react-hooks";
import {
    IconButton,
    HoverCard
} from "@chakra-ui/react";
import { FaInfo } from "react-icons/fa";
// import { TaxonomyInfo } from "taxonomy";


export function FloodSelector() {
    const intl = useIntl();
    // const [activeKeyword, setActiveKeyword] = useState<string | null>(null); // Taxonomy
    const prepSrvc = useService<FloodHandler>("app.FloodHandler");

    const setFloodType = (option: string) => {
        prepSrvc.setFloodType(option);
    };

    return (
        <ExpandableBox
            title={intl.formatMessage({ id: "map.flood_layer_selector.title" })}
            marginBottom="10px"
            overflowY="auto"
        >
            <HoverCard.Root openDelay={250} closeDelay={100} positioning={{placement: "right"}}>
                <HoverCard.Trigger asChild>
                    <IconButton
                        marginLeft="2px" 
                        size="sm"
                        aria-label="Info"
                        variant="ghost"
                        color="black"
                    >
                        <FaInfo/>
                    </IconButton>
                </HoverCard.Trigger>
                <HoverCard.Positioner>
                    <HoverCard.Content>
                        <HoverCard.Arrow />
                            {intl.formatMessage({id: "map.flood_layer_selector.description"})}
                            {/* {" "}
                            <Button
                                variant="link"
                                color="#2e9ecc"
                                onClick={() => setActiveKeyword("climate model")}
                            >
                                {intl.formatMessage({id: "map.layer_select.keyword1"})}
                            </Button> */}
                    </HoverCard.Content>
                </HoverCard.Positioner>
                {/* {activeKeyword && (
                    <Flex>
                        <TaxonomyInfo
                            keyword={activeKeyword}
                            onClose={() => setActiveKeyword(null)}
                        />
                    </Flex>
                )} */}
            </HoverCard.Root>
            <Selector
                options={["pluvial", "coastal"]}
                setSelected={setFloodType}
                marginBottom="5px"
                // title={intl.formatMessage({ id: "map.flood_layer_selector.floodtype" })}
                alternativeText={false}
            ></Selector>
        </ExpandableBox>
    );
}
