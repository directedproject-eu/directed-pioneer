// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    Flex,
    Stack,
    IconButton,
    Image,
    useDisclosure,
    Button,
    Collapsible,
    Icon,
    Text,
    HoverCard,
    Link
} from "@chakra-ui/react";
import { RxHamburgerMenu } from "react-icons/rx";
import { CgClose } from "react-icons/cg";
import { SlArrowRight, SlArrowDown  } from "react-icons/sl";
import React from "react";
export const BASE_URL = import.meta.env.DEV
    ? import.meta.env.VITE_DEV_URL
    : import.meta.env.VITE_PROD_URL;

import { AuthService } from "@open-pioneer/authentication";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import Disclaimer from "./components/Disclaimer";
import DisclaimerContent from "./components/DisclaimerContent";
import LocaleSwitcher from "./components/LocaleSwitcher";
console.info("base url: " + BASE_URL);
console.info("mode: " + import.meta.env.MODE);

if (!BASE_URL) {
    if (import.meta.env.DEV) {
        throw new Error("variable import.meta.env.VITE_DEV_URL is not set");
    } else {
        throw new Error("variable import.meta.env.VITE_PROD_URL is not set");
    }
}
type NavbarProps = {
    children?: React.ReactNode;
    authService?: AuthService;
};

const Navbar: React.FC<NavbarProps> = ({ children, authService }) => {
    const { open, onToggle } = useDisclosure();

    const authState = useReactiveSnapshot(
        () => (authService ? authService.getAuthState() : undefined),
        [authService]
    );

    return (
        <Box>
            <Flex
                bg={"white"}
                color="#2e9ecc"
                minH={"60px"}
                py={{ base: 2 }}
                px={{ base: 4 }}
                borderBottom={1}
                borderStyle={"none"}
                borderColor="gray.200"
                align={"center"}
                _dark={{
                    color: "gray.200",
                    borderColor: "gray.900"
                }}
            >
                <Flex
                    flex={{ base: 1, md: "auto" }}
                    ml={{ base: -2 }}
                    display={{ base: "flex", md: "none" }}
                >
                    <IconButton
                        onClick={onToggle}
                        variant={"ghost"}
                        aria-label={"Toggle Navigation"}
                    >
                        (open ? <Icon as={CgClose} w={3} h={3} /> : <Icon as={RxHamburgerMenu} w={3} h={3} />)
                    </IconButton>
                </Flex>
                <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }} align="center">
                    <Image
                        src="/Directed-Project-Logo-Blue-White_Background.png"
                        alt="Directed Project Data Fabric"
                        height="60px"
                    />
                    <Flex display={{ base: "none", md: "flex" }} ml={10}>
                        <DesktopNav />
                    </Flex>
                </Flex>
                <Box width="150px" mx={4}> 
                    <LocaleSwitcher/>
                </Box>
                {authService && authState?.kind === "authenticated" ? (
                    <Flex flexDirection="row" align={"center"} ml={"auto"} gap="2em">
                        <Text>Logged in as: {authState.sessionInfo?.userName ?? "unknown"}</Text>
                        <Button onClick={() => authService.logout()}>Logout</Button>
                    </Flex>
                ) : authService ? (
                    <Flex flexDirection="row" align="center" ml="auto" gap="2em">
                        <Button onClick={() => authService.getLoginBehavior().login()}>
                            Login
                        </Button>
                    </Flex>
                ) : null}
                <div style={{ width: "350px", display: "flex", padding: "0px 20px" }}>
                    <Text>
                        Users are advised to verify the information independently and use the
                        service at their own risk.
                    </Text>
                    <Disclaimer>
                        <DisclaimerContent></DisclaimerContent>
                    </Disclaimer>
                </div>
            </Flex>

            <Collapsible.Root open={open}>
                <Collapsible.Content>
                    <MobileNav />
                </Collapsible.Content>
            </Collapsible.Root>
        </Box>
    );
};

const DesktopNav = () => {
    return (
        <Stack direction={"row"} gap={4}>
            {NAV_ITEMS.map((navItem) => (
                <Box key={navItem.label}>
                    <HoverCard.Root positioning={{placement:"bottom-start"}}>
                        <HoverCard.Trigger>
                            <Link
                                as="a"
                                p={2}
                                href={navItem.href ?? "#"}
                                fontSize={"md"}
                                fontWeight={500}
                                color={"#2e9ecc"}
                                _hover={{ textDecoration: "none", color: "gray" }}
                            >
                                {navItem.label}
                            </Link>
                        </HoverCard.Trigger>
                        {navItem.children && (
                            <HoverCard.Content
                                border={0}
                                boxShadow={"xl"}
                                p={4}
                                rounded={"xl"}
                                minW={"sm"}
                                position={"absolute"}
                            >
                                <Stack>
                                    {navItem.children.map((child) => (
                                        <DesktopSubNav key={child.label} {...child} />
                                    ))}
                                </Stack>
                            </HoverCard.Content>
                        )}
                    </HoverCard.Root>
                </Box>
            ))}
        </Stack>
    );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
    return (
        <Link
            as="a"
            href={href}
            p={2}
            rounded={"md"}
            _hover={{ bg: "gray.200" }}
            _dark={{ _hover: { bg: "gray.900" } }}
        >
            <Stack direction={"row"} align={"center"}>
                <Box>
                    <Flex fontWeight={500}>{label}</Flex>
                    <Flex fontSize={"md"}>{subLabel}</Flex>
                </Box>
                <Flex justify={"flex-end"} align={"center"} flex={1}>
                    <Icon color={"#2e9ecc"} w={5} h={5} as={SlArrowRight} />
                </Flex>
            </Stack>
        </Link>
    );
};

const MobileNav = () => {
    return (
        <Stack p={4} display={{ md: "none" }}>
            {NAV_ITEMS.map((navItem) => (
                <MobileNavItem key={navItem.label} {...navItem} />
            ))}
        </Stack>
    );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
    const { open, onToggle } = useDisclosure();

    return (
        <Stack gap={4} onClick={children && onToggle}>
            <Link py={2} as="a" href={href ?? "#"}>
                <Flex fontWeight={600}>{label}</Flex>
                {children && (
                    <Icon
                        as={SlArrowDown}
                        w={6}
                        h={6}
                        transform={open ? "rotate(180deg)" : ""}
                    />
                )}
            </Link>
            <Collapsible.Root open={open}>
                <Collapsible.Content>
                    <Stack mt={2} pl={4} borderLeft={1} align={"start"}>
                        {children?.map((child) => (
                            <Link as="a" key={child.label} py={2} href={child.href}>
                                {child.label}
                            </Link>
                        ))}
                    </Stack>
                </Collapsible.Content>
            </Collapsible.Root>
        </Stack>
    );
};

interface NavItem {
    label: string;
    subLabel?: string;
    children?: Array<NavItem>;
    href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
    { label: "Home", href: `${BASE_URL}` },
    {
        label: "Real World Labs",
        children: [
            {
                label: "The Capital Region of Denmark",
                href: `${BASE_URL}apps/rwl_copenhagen/index.html`
            },
            {
                label: "Emilia Romagna Region",
                href: "https://directed-rwl2.saferplaces.co/"
            },
            {
                label: "Danube Region",
                href: `${BASE_URL}apps/rwl_danube/index.html`
            },
            {
                label: "Rhine Erft Region",
                href: `${BASE_URL}apps/rwl_rhine_erft/index.html`
            }
        ]
    },
    {
        label: "Directed Project Website",
        href: "https://directedproject.eu/"
    },
    {
        label: "Github Organization",
        href: "https://github.com/directedproject-eu"
    },
    {
        label: "Model Documentation",
        children: [
            {
                label: "SaferPlaces",
                href: "https://saferplaces.co/"
            },
            {
                label: "CLIMADA",
                href: "https://climada-python.readthedocs.io/en/stable/tutorial/1_main_climada.html"
            },
            {
                label: "RIM2D",
                href: "https://www.rim2d.eu/was-ist-rim2d"
            },
            {
                label: "Danube Model",
                href: "https://www.sciencedirect.com/science/article/pii/S2405880717301383"
            },
            {
                label: "DTU Damage-Cost Model",
                href: "https://github.com/Skadesokonomi"
            }
        ]
    }, 
    {
        label: "Getting Started",
        children: [
            {
                label: "User Manual",
                href: "https://directed-eu.gitbook.io/data-fabric-manual/"
            }
        ]
    }
];

export default Navbar;
