// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { HamburgerIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    Text,
    IconButton,
    Portal
} from "@open-pioneer/chakra-integration"; // or "@chakra-ui/react"

type PopoverProps = {
    description: string;
    layerTitle: string;
    zoomTo: (layerName: string) => void;
};

const CustomPopover: React.FC<PopoverProps> = ({ description, layerTitle, zoomTo }) => {
    return (
        <Popover>
            <PopoverTrigger>
                <IconButton icon={<HamburgerIcon />} aria-label={""} />
            </PopoverTrigger>
            <Portal>
                <PopoverContent boxShadow="lg" borderRadius="md" bg="white" maxW="300px">
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader fontWeight="bold" borderBottom="1px solid #eee">
                        Custom
                    </PopoverHeader>
                    <PopoverBody>
                        <Box>
                            <Text fontSize="sm" mb={2}>
                                {description}
                            </Text>
                            <Button onClick={() => zoomTo(layerTitle)}>Zoom To Layer</Button>
                        </Box>
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    );
};

export default CustomPopover;
