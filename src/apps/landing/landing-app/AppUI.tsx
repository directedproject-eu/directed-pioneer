// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Box, Flex, Image, Link, Text } from "@open-pioneer/chakra-integration";
import { Navbar } from "navbar";

export function AppUI() {
    return (
        <Flex direction="column" height="100vh">
            <Navbar />
            <Flex flex="1" position="relative" width="100%">
                <Image
                    src="/images/Fig.1 - FRB Niederberg.jpg"
                    alt="background image"
                    objectFit="cover"
                    width="100%"
                    height="100%"
                    position="absolute"
                />

                {/*text overlay */}
                <Box
                    position="absolute"
                    zIndex="1"
                    p={6}
                    maxW="90%"
                    top={["5%", "10%"]} //adjust position in smaller screens
                    left={["5%", "10%"]}
                    padding="16px"
                >
                    <Text
                        fontSize="40"
                        fontWeight="bold"
                        color="white"
                        textShadow="2px 2px 4px rgba(0, 0, 0, 0.7)"
                    >
                        Fostering disaster-resilience with the Directed Data Fabric
                    </Text>
                    <Text
                        fontSize="25"
                        fontWeight="bold"
                        color="white"
                        textShadow="2px 2px 4px rgba(0, 0, 0, 0.7)"
                        mt={2}
                    >
                        Welcome to the Data Fabric platform! Get started by interacting with the
                        Real World Labs.
                    </Text>
                </Box>
            </Flex>

            <Box as="footer" bg="white" color="black" py={4} textAlign="center" mt="auto">
                <Flex justify="center" align="center" flexWrap="wrap">
                    <Text fontSize="xs" fontWeight="200">
                        &copy; 2024 copyright:
                    </Text>
                    <Link
                        href="https://52north.org/"
                        fontSize="xs"
                        fontWeight="200"
                        mx={2}
                        color="black"
                    >
                        52°North Spatial Information Research GmbH
                    </Link>
                    <Text fontSize="xs" fontWeight="200">
                        |
                    </Text>
                    <Link
                        href="https://52north.org/about-us/contact-us/"
                        fontSize="xs"
                        fontWeight="200"
                        mx={2}
                        color="black"
                    >
                        Contact Us
                    </Link>
                    <Text fontSize="xs" fontWeight="200">
                        |
                    </Text>
                    <Link
                        href="https://52north.org/about-us/contact-us/legal-notice/"
                        fontSize="xs"
                        fontWeight="200"
                        mx={2}
                        color="black"
                    >
                        Legal Notice
                    </Link>
                </Flex>
            </Box>
        </Flex>
    );
}
