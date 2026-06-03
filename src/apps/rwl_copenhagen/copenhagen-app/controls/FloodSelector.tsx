// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useService } from "open-pioneer:react-hooks";
import { FloodHandler } from "../services/FloodHandler";
import Selector from "./Selector";
import { Box, Flex, Heading } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
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
