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
    Popover, 
    PopoverBody, 
    PopoverContent, 
    PopoverTrigger,
    PopoverArrow
} from "@open-pioneer/chakra-integration";
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
            // marginBottom="5px"
            // overflow="auto"
        >
            <Popover trigger="hover" openDelay={250} closeDelay={100} placement="right">
                <PopoverTrigger>
                    <IconButton
                        marginLeft="2px" 
                        size="s"
                        aria-label="Info"
                        icon={<FaInfo />}
                        variant="ghost"
                        color="black"
                    />
                </PopoverTrigger>
                <PopoverContent>
                    <PopoverArrow />
                    <PopoverBody>
                        {intl.formatMessage({id: "map.flood_layer_selector.description"})}
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
