// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Checkbox, IconButton, Stack, Text } from "@open-pioneer/chakra-integration";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { useService } from "open-pioneer:react-hooks";
import { useEffect, useState } from "react";
import { TocService } from "../../services/TocService";
import { HamburgerIcon } from "@chakra-ui/icons";
import PopoverToc from "./PopoverToc";

interface TocMetaData {
    mapId: string;
}

const OwnToc: React.FC<TocMetaData> = ({ mapId }) => {
    const prepSrvc = useService<TocService>("app.TocService");

    const { description } = useReactiveSnapshot(
        () => ({
            description: prepSrvc.description
        }),
        [prepSrvc]
    );

    const { layers } = useReactiveSnapshot(
        () => ({
            layers: prepSrvc.layers
        }),
        [prepSrvc]
    );

    let zIndex = layers.length;
    layers.forEach((layer) => {
        layer.olLayer.setZIndex(zIndex);
        zIndex -= 1;
    });
    const legendItems = layers.map((layer, index) => ({
        id: index,
        description: description[index],
        name: layer.title
    }));

    const [checkedItems, setCheckedItems] = useState(Array(layers.length).fill(true));

    const setChecked = (id: number, newValue: boolean, name: string): null => {
        const newValues = [...checkedItems]; // create a shallow copy
        newValues[id] = newValue;
        setCheckedItems(newValues);

        prepSrvc.deactivateLayer(name, newValue);

        return null;
    };

    return (
        <Box bg="white" p={2} borderRadius="md" boxShadow="md" mt="1em">
            <Text fontWeight="bold" mb={0}>
                Operational Layers
            </Text>
            <Stack>
                {legendItems.map((item) => (
                    <span key={item.id}>
                        <Box
                            key={item.id}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                        >
                            <Checkbox
                                key={item.id}
                                isChecked={checkedItems[item.id]}
                                onChange={(e) => setChecked(item.id, e.target.checked, item.name)}
                            >
                                {item.name}
                            </Checkbox>
                            <PopoverToc
                                description={item.description}
                                layerTitle={item.name}
                                zoomTo={prepSrvc.zoomTo}
                            ></PopoverToc>
                        </Box>
                    </span>
                ))}
            </Stack>
        </Box>
    );
};
export default OwnToc;
