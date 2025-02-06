// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    Flex,
    IconButton,
    useDisclosure,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    VStack,
    Link,
    Spacer,
    Image,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button
} from "@open-pioneer/chakra-integration";
import { HamburgerIcon, ChevronDownIcon } from "@chakra-ui/icons";

export function Navbar() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Box position="sticky" top={0} zIndex={10} bg="white" boxShadow="md" p={4}>
            <Flex alignItems="center" maxW="1200px" mx="auto">
                {/*logo*/}
                <Image src="/logo.png" alt="Logo" boxSize="40px" />

                <Spacer />

                {/*desktop links*/}
                <Flex display={{ base: "none", md: "flex" }} gap={4}>
                    <Link href="#">Home</Link>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            Real World Labs
                        </MenuButton>
                        <MenuList>
                            <MenuItem as={Link} href="../rwl_copenhagen/index.html">
                                The Capital Region of Denmark
                            </MenuItem>
                            <MenuItem as={Link} href="../rwl_emilia_romagna/index.html">
                                Emilia Romagna Region
                            </MenuItem>
                            <MenuItem as={Link} href="../rwl_danube/index.html">
                                Danube Region
                            </MenuItem>
                            <MenuItem as={Link} href="../rwl_rhine_erft/index.html">
                                Rhine-Erft Region
                            </MenuItem>
                        </MenuList>
                    </Menu>
                    <Link href="#">Github Organization</Link>
                    <Link href="#">Directed Project Website</Link>
                </Flex>

                {/*mobile menu button*/}
                <IconButton
                    aria-label="Open menu"
                    icon={<HamburgerIcon />}
                    display={{ base: "flex", md: "none" }}
                    onClick={onOpen}
                />
            </Flex>

            {/*drawer mobile menu*/}
            <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <VStack spacing={4} p={5} align="start">
                        <Link href="#">Home</Link>
                        <Menu>
                            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                                Real World Labs
                            </MenuButton>
                            <MenuList>
                                <MenuItem as={Link} href="../rwl_copenhagen/index.html">
                                    The Capital Region of Denmark
                                </MenuItem>
                                <MenuItem as={Link} href="../rwl_emilia_romagna/index.html">
                                    Emilia Romagna Region
                                </MenuItem>
                                <MenuItem as={Link} href="../rwl_danube/index.html">
                                    Danube Region
                                </MenuItem>
                                <MenuItem as={Link} href="../rwl_rhine_erft/index.html">
                                    Rhine-Erft Region
                                </MenuItem>
                            </MenuList>
                        </Menu>
                        <Link href="#">Github Organization</Link>
                        <Link href="#">Directed Project Website</Link>
                    </VStack>
                </DrawerContent>
            </Drawer>
        </Box>
    );
}
