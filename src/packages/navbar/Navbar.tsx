// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    Flex,
    Stack,
    IconButton,
    Image,
    useDisclosure,
    Button,
    useColorModeValue,
    PopoverTrigger,
    PopoverContent,
    Collapse,
    Icon,
    Popover
} from "@open-pioneer/chakra-integration";
import { HamburgerIcon, CloseIcon, ChevronRightIcon, ChevronDownIcon } from "@chakra-ui/icons";

export function Navbar() {
    const { isOpen, onToggle } = useDisclosure();

    return (
        <Box>
            <Flex
                bg={"white"}
                color={useColorModeValue("#2e9ecc", "gray.200")}
                minH={"60px"}
                py={{ base: 2 }}
                px={{ base: 4 }}
                borderBottom={1}
                borderStyle={"none"}
                borderColor={useColorModeValue("gray.200", "gray.900")}
                align={"center"}
            >
                <Flex
                    flex={{ base: 1, md: "auto" }}
                    ml={{ base: -2 }}
                    display={{ base: "flex", md: "none" }}
                >
                    <IconButton
                        onClick={onToggle}
                        icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
                        variant={"ghost"}
                        aria-label={"Toggle Navigation"}
                    />
                </Flex>
                <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }} align="center">
                    <Image
                        src="Directed-Project-Logo-Blue-White_Background.png"
                        alt="Directed Project Data Fabric"
                        height="60px"
                    />
                    <Flex display={{ base: "none", md: "flex" }} ml={10}>
                        <DesktopNav />
                    </Flex>
                </Flex>

                <Stack flex={{ base: 1, md: 0 }} justify={"flex-end"} direction={"row"} spacing={6}>
                    <Button
                        as={"a"}
                        fontSize={"md"}
                        fontWeight={400}
                        color={"#2e9ecc"}
                        _hover={{ textDecoration: "none", color: "gray" }}
                        variant={"link"}
                        href={"#"}
                    >
                        Login
                    </Button>
                    <Button
                        as={"a"}
                        display={{ base: "none", md: "inline-flex" }}
                        fontSize={"md"}
                        fontWeight={600}
                        color={"white"}
                        bg={"#2e9ecc"}
                        href={"#"}
                        _hover={{
                            bg: "gray"
                        }}
                    >
                        Sign Up
                    </Button>
                </Stack>
            </Flex>

            <Collapse in={isOpen} animateOpacity>
                <MobileNav />
            </Collapse>
        </Box>
    );
}

const DesktopNav = () => {
    return (
        <Stack direction={"row"} spacing={4}>
            {NAV_ITEMS.map((navItem) => (
                <Box key={navItem.label}>
                    <Popover trigger={"hover"} placement={"bottom-start"}>
                        <PopoverTrigger>
                            <Box
                                as="a"
                                p={2}
                                href={navItem.href ?? "#"}
                                fontSize={"md"}
                                fontWeight={500}
                                color={"#2e9ecc"}
                                _hover={{ textDecoration: "none", color: "gray" }}
                            >
                                {navItem.label}
                            </Box>
                        </PopoverTrigger>
                        {navItem.children && (
                            <PopoverContent
                                border={0}
                                boxShadow={"xl"}
                                p={4}
                                rounded={"xl"}
                                minW={"sm"}
                            >
                                <Stack>
                                    {navItem.children.map((child) => (
                                        <DesktopSubNav key={child.label} {...child} />
                                    ))}
                                </Stack>
                            </PopoverContent>
                        )}
                    </Popover>
                </Box>
            ))}
        </Stack>
    );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
    return (
        <Box
            as="a"
            href={href}
            p={2}
            rounded={"md"}
            _hover={{ bg: useColorModeValue("gray.200", "gray.900") }}
        >
            <Stack direction={"row"} align={"center"}>
                <Box>
                    <Flex fontWeight={500}>{label}</Flex>
                    <Flex fontSize={"md"}>{subLabel}</Flex>
                </Box>
                <Flex justify={"flex-end"} align={"center"} flex={1}>
                    <Icon color={"#2e9ecc"} w={5} h={5} as={ChevronRightIcon} />
                </Flex>
            </Stack>
        </Box>
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
    const { isOpen, onToggle } = useDisclosure();

    return (
        <Stack spacing={4} onClick={children && onToggle}>
            <Box py={2} as="a" href={href ?? "#"}>
                <Flex fontWeight={600}>{label}</Flex>
                {children && (
                    <Icon
                        as={ChevronDownIcon}
                        w={6}
                        h={6}
                        transform={isOpen ? "rotate(180deg)" : ""}
                    />
                )}
            </Box>
            <Collapse in={isOpen} animateOpacity>
                <Stack mt={2} pl={4} borderLeft={1} align={"start"}>
                    {children?.map((child) => (
                        <Box as="a" key={child.label} py={2} href={child.href}>
                            {child.label}
                        </Box>
                    ))}
                </Stack>
            </Collapse>
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
    { label: "Home", href: "./index.html" },
    {
        label: "Real World Labs",
        children: [
            { label: "The Capital Region of Denmark", href: "./apps/rwl_copenhagen/index.html" },
            { label: "Emilia Romagna Region", href: "./apps/rwl_emilia_romagna/index.html" },
            { label: "Danube Region", href: "./apps/rwl_danube/index.html" },
            { label: "Rhine Erft Region", href: "./apps/rwl_rhine_erft/index.html" }
        ]
    },
    { label: "Directed Project Website", href: "https://directedproject.eu/" },
    { label: "Github Organization", href: "https://github.com/directedproject-eu" }
];
