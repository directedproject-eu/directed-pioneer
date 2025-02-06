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
                <Box>
                    <Image
                        src="/images/Directed-Project-Logo-Blue-White_Background.png"
                        alt="Directed Project Data Fabric"
                        height="50px"
                        maxWidth="200px"
                        objectFit="contain"
                    />
                </Box>

                <Spacer />

                {/*desktop links*/}
                <Flex display={{ base: "none", md: "flex" }} gap={4}>
                    <Link href="../index.html" color="#2e9ecc">
                        Home
                    </Link>
                    <Menu>
                        <MenuButton
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                            color="#2e9ecc"
                            variant="ghost"
                        >
                            Real World Labs
                        </MenuButton>
                        <MenuList>
                            <MenuItem as={Link} href="../rwl_copenhagen/index.html" color="#2e9ecc">
                                The Capital Region of Denmark
                            </MenuItem>
                            <MenuItem
                                as={Link}
                                href="../rwl_emilia_romagna/index.html"
                                color="#2e9ecc"
                            >
                                Emilia Romagna Region
                            </MenuItem>
                            <MenuItem as={Link} href="../rwl_danube/index.html" color="#2e9ecc">
                                Danube Region
                            </MenuItem>
                            <MenuItem as={Link} href="../rwl_rhine_erft/index.html" color="#2e9ecc">
                                Rhine-Erft Region
                            </MenuItem>
                        </MenuList>
                    </Menu>
                    <Link href="https://github.com/directedproject-eu" color="#2e9ecc">
                        Github Organization
                    </Link>
                    <Link href="https://directedproject.eu/" color="#2e9ecc">
                        Directed Project Website
                    </Link>
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
                        <Link href="https://github.com/directedproject-eu">
                            Github Organization
                        </Link>
                        <Link href="https://directedproject.eu/">Directed Project Website</Link>
                    </VStack>
                </DrawerContent>
            </Drawer>
        </Box>
    );
}
