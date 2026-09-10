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
// import { useColorMode } from "@/components/ui/color-mode"
import { RxHamburgerMenu } from "react-icons/rx";
import { CgClose } from "react-icons/cg";
import { SlArrowRight, SlArrowDown } from "react-icons/sl";
import React, { useLayoutEffect, useRef, useState } from "react";

import { AuthService } from "@open-pioneer/authentication";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import Disclaimer from "./components/Disclaimer";
import LocaleSwitcher from "./components/LocaleSwitcher";
import { useIntl } from "open-pioneer:react-hooks";

export const BASE_URL = import.meta.env.DEV
    ? import.meta.env.VITE_DEV_URL
    : import.meta.env.VITE_PROD_URL;

if (!BASE_URL) {
    if (import.meta.env.DEV) {
        throw new Error("variable import.meta.env.VITE_DEV_URL is not set");
    } else {
        throw new Error("variable import.meta.env.VITE_PROD_URL is not set");
    }
}

interface NavItem {
    label: string;
    subLabel?: string;
    children?: Array<NavItem>;
    href?: string;
}

type NavbarProps = {
    children?: React.ReactNode;
    authService?: AuthService;
};

const Navbar: React.FC<NavbarProps> = ({ children, authService }) => {
    const intl = useIntl();
    const { open, onToggle } = useDisclosure();

    const authState = useReactiveSnapshot(
        () => (authService ? authService.getAuthState() : undefined),
        [authService]
    );

    // Define navbar items inside the component to use i18n
    const navItems: Array<NavItem> = [
        {
            label: intl.formatMessage({ id: "navbar.home" }),
            href: `${BASE_URL}`
        },
        {
            label: intl.formatMessage({ id: "navbar.rwls" }),
            children: [
                {
                    label: intl.formatMessage({ id: "navbar.rwl1" }),
                    href: `${BASE_URL}apps/rwl_copenhagen/index.html`
                },
                {
                    label: intl.formatMessage({ id: "navbar.rwl2" }),
                    href: "https://directed-rwl2.saferplaces.co/"
                },
                {
                    label: intl.formatMessage({ id: "navbar.rwl3" }),
                    href: `${BASE_URL}apps/rwl_danube/index.html`
                },
                {
                    label: intl.formatMessage({ id: "navbar.rwl4" }),
                    href: `${BASE_URL}apps/rwl_rhine_erft/index.html`
                }
            ]
        },
        {
            label: intl.formatMessage({ id: "navbar.website" }),
            href: "https://directedproject.eu/"
        },
        {
            label: "Github",
            href: "https://github.com/directedproject-eu"
        },
        {
            label: intl.formatMessage({ id: "navbar.documentation" }),
            children: [
                { label: "SaferPlaces", href: "https://saferplaces.co/" },
                {
                    label: "CLIMADA",
                    href: "https://climada-python.readthedocs.io/en/stable/tutorial/1_main_climada.html"
                },
                { label: "RIM2D", href: "https://www.rim2d.eu/was-ist-rim2d" },
                {
                    label: "Danube Model",
                    href: "https://www.sciencedirect.com/science/article/pii/S2405880717301383"
                },
                { label: "DTU Damage-Cost Model", href: "https://github.com/Skadesokonomi" }
            ]
        },
        {
            label: intl.formatMessage({ id: "navbar.gettingStarted" }),
            children: [
                {
                    label: intl.formatMessage({ id: "navbar.userManual" }),
                    href: "https://directed-eu.gitbook.io/data-fabric-manual/"
                }
            ]
        }
    ];

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
                        (open ? <Icon as={CgClose} w={3} h={3} /> :{" "}
                        <Icon as={RxHamburgerMenu} w={3} h={3} />)
                    </IconButton>
                </Flex>
                <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }} align="center">
                    <Image
                        src="/data-fabric-logo4.png"
                        alt="Directed Project Data Fabric"
                        height="60px"
                    />
                    {/* flex="1" hands DesktopNav all the room left between the logo and the
                        locale switcher, minWidth={0} lets it be narrower than the links need.
                        Both together are what makes the width DesktopNav measures the width
                        actually available -- without minWidth={0} this would never report
                        less than the single row takes, and the row would just overflow. */}
                    <Flex
                        display={{ base: "none", md: "flex" }}
                        ml={{ base: 4, "2xl": 10 }}
                        flex="1"
                        minWidth={0}
                    >
                        <DesktopNav items={navItems} />
                    </Flex>
                </Flex>
                <Box width={{ base: "120px", "2xl": "150px" }} mx={{ base: 2, "2xl": 4 }}>
                    <LocaleSwitcher />
                </Box>
                {authService && authState?.kind === "authenticated" ? (
                    <Flex
                        flexDirection="row"
                        align={"center"}
                        ml={"auto"}
                        gap={{ base: "1em", "2xl": "2em" }}
                    >
                        <Text fontSize={{ base: "sm", "2xl": "md" }} whiteSpace="nowrap">
                            {intl.formatMessage({ id: "navbar.loggedInAs" })}
                            <br />
                            {authState.sessionInfo?.userName ?? "unknown"}
                        </Text>
                        <Button onClick={() => authService.logout()}>
                            {intl.formatMessage({ id: "navbar.logout" })}
                        </Button>
                    </Flex>
                ) : authService ? (
                    <Flex
                        flexDirection="row"
                        align="center"
                        ml="auto"
                        gap={{ base: "1em", "2xl": "2em" }}
                    >
                        <Button onClick={() => authService.getLoginBehavior().login()}>
                            {intl.formatMessage({ id: "navbar.login" })}
                        </Button>
                    </Flex>
                ) : null}
                <Flex
                    width={{ base: "240px", "2xl": "350px" }}
                    px={{ base: 2, "2xl": 5 }}
                    align="center"
                    flexShrink={0}
                >
                    <Text fontSize={{ base: 12, "2xl": 14 }}>
                        {intl.formatMessage({ id: "disclaimerContent.brief" })}
                    </Text>
                    <Disclaimer />
                </Flex>
            </Flex>

            <Collapsible.Root open={open}>
                <Collapsible.Content>
                    <MobileNav items={navItems} />
                </Collapsible.Content>
            </Collapsible.Root>
        </Box>
    );
};

/** Links per row once the navigation is split up. */
const LINKS_PER_ROW = 3;

/**
 * How far the lower row is pushed sideways, as a fraction of the width the navigation gets.
 *
 * A seventh, because that is exactly half an entry: the rows only span six sevenths (one row
 * is inset on the left, the other on the right), so an entry is two sevenths wide.
 */
const ROW_OFFSET = "calc(100% / 7)";

/** The gap between the links, and the font they are set in, in the single row. */
const SINGLE_ROW_GAP = { base: 1, "2xl": 4 };
const SINGLE_ROW_PX = { base: 1, "2xl": 2 };
const SINGLE_ROW_FONT_SIZE = { base: "sm", "2xl": "md" };

/**
 * The six navigation links, in one row for as long as one row fits.
 *
 * Once it no longer does, they break into two rows of three, in source order. The lower row
 * is offset sideways by half an entry, so that two links above each other cannot be mistaken
 * for one -- which is why the upper row keeps its distance from the right edge, and the
 * lower one from the left. While split, each row spreads its links across the width it is
 * given, so the navigation fills the room it has instead of clumping to the left;
 * `columnGap` is the minimum distance that leaves.
 *
 * Rows rather than one grid with a fixed column count: a grid gives both rows the same
 * column positions, and the whole point here is that they differ.
 *
 * As a single row the navigation looks exactly as it always did -- every property that
 * differs between the two layouts falls back to what it was before the split existed.
 */
const DesktopNav = ({ items }: { items: Array<NavItem> }) => {
    const available = useRef<HTMLDivElement>(null);
    const singleRow = useRef<HTMLDivElement>(null);
    const [split, setSplit] = useState(false);

    /*
     * Measured rather than tied to a screen width, because neither side of the comparison
     * follows from the window: what the links need depends on the language, and what they
     * get depends on whether a user name and a logout button sit next to them.
     *
     * Neither element changes with `split` -- the outer one is sized by its parent, the
     * yardstick is a hidden copy of the single row and is laid out on its own -- so this
     * cannot oscillate between the two layouts. The yardstick is observed as well because
     * it is what changes when the language switches or a web font finishes loading.
     */
    useLayoutEffect(() => {
        const availableElement = available.current;
        const singleRowElement = singleRow.current;
        if (!availableElement || !singleRowElement) {
            return;
        }

        const update = () => {
            setSplit(availableElement.clientWidth < singleRowElement.offsetWidth);
        };
        update();

        const observer = new ResizeObserver(update);
        observer.observe(availableElement);
        observer.observe(singleRowElement);
        return () => observer.disconnect();
    }, []);

    const rows: Array<Array<NavItem>> = [];
    for (let start = 0; start < items.length; start += LINKS_PER_ROW) {
        rows.push(items.slice(start, start + LINKS_PER_ROW));
    }

    return (
        // minWidth={0} for the same reason as on the parent: a flex item is floored at the
        // width of its content unless told otherwise, and a width that can never fall below
        // what the links need is useless for deciding whether the links still fit.
        <Flex ref={available} width="100%" minWidth={0} position="relative">
            {/* The yardstick: the single row as it would be laid out, at `max-content` so
                that it reports the width it wants rather than the width it would be given.
                Out of flow and invisible, so it costs nothing but its own measurement.
                Plain boxes, not links -- only the text metrics and the padding matter. */}
            <Flex
                ref={singleRow}
                aria-hidden
                position="absolute"
                top={0}
                left={0}
                visibility="hidden"
                pointerEvents="none"
                width="max-content"
                gap={SINGLE_ROW_GAP}
            >
                {items.map((navItem) => (
                    <Box
                        key={navItem.label}
                        px={SINGLE_ROW_PX}
                        fontSize={SINGLE_ROW_FONT_SIZE}
                        fontWeight={500}
                        whiteSpace="nowrap"
                    >
                        {navItem.label}
                    </Box>
                ))}
            </Flex>
            {/* As a single row the two groups sit next to each other and the seam between
                them must not show, which is why the gap here is the one between the links. */}
            <Flex
                direction={split ? "column" : "row"}
                width="100%"
                gap={split ? 0 : SINGLE_ROW_GAP}
            >
                {rows.map((row, rowIndex) => {
                    const isLowerRow = rowIndex % 2 === 1;
                    return (
                        <Flex
                            key={row[0]?.label ?? rowIndex}
                            flex="none"
                            justifyContent={split ? "space-between" : "flex-start"}
                            columnGap={split ? 1 : SINGLE_ROW_GAP}
                            pl={isLowerRow && split ? ROW_OFFSET : undefined}
                            pr={!isLowerRow && split ? ROW_OFFSET : undefined}
                        >
                            {row.map((navItem) => (
                                <Box key={navItem.label}>
                                    <HoverCard.Root positioning={{ placement: "bottom-start" }}>
                                        <HoverCard.Trigger>
                                            <Link
                                                as="a"
                                                px={split ? 1 : SINGLE_ROW_PX}
                                                // Tighter while split: at py={2} the two rows
                                                // would add up to more than the 60px logo and
                                                // grow the whole navbar.
                                                py={split ? 1 : 2}
                                                href={navItem.href ?? "#"}
                                                fontSize={split ? "sm" : SINGLE_ROW_FONT_SIZE}
                                                fontWeight={500}
                                                color={"#2e9ecc"}
                                                whiteSpace="nowrap"
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
                                                        <DesktopSubNav
                                                            key={child.label}
                                                            {...child}
                                                        />
                                                    ))}
                                                </Stack>
                                            </HoverCard.Content>
                                        )}
                                    </HoverCard.Root>
                                </Box>
                            ))}
                        </Flex>
                    );
                })}
            </Flex>
        </Flex>
    );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
    return (
        <Link
            as="a"
            href={href}
            p={2}
            rounded={"md"}
            _dark={{ _hover: { bg: "gray.900" } }}
            _hover={{ textDecoration: "none", bg: "gray.100" }}
            display="block"
            w="full"
        >
            <Flex justify={"space-between"} align={"center"} w="full">
                <Box>
                    <Flex fontWeight={500}>{label}</Flex>
                    {subLabel && <Flex fontSize={"md"}>{subLabel}</Flex>}
                </Box>
                <Icon color={"#2e9ecc"} w={4} h={4} as={SlArrowRight} />
            </Flex>
        </Link>
    );
};

const MobileNav = ({ items }: { items: Array<NavItem> }) => {
    return (
        <Stack p={4} display={{ md: "none" }}>
            {items.map((navItem) => (
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
                    <Icon as={SlArrowDown} w={6} h={6} transform={open ? "rotate(180deg)" : ""} />
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

export default Navbar;
