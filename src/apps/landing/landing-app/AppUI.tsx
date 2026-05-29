// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Box, Flex, Image, Link, Text, Grid } from "@chakra-ui/react";
import { Navbar } from "navbar";

export function AppUI() {
    // Make sure BASE_URL is defined. Update this to match your project's configuration if needed.
    const BASE_URL = "/"; 

    return (
        <Flex direction="column" height="100vh">
            <Navbar />
            <Flex flex="1" position="relative" width="100%">
                <Image
                    src="/Fig.1 - FRB Niederberg.jpg"
                    alt="background image"
                    objectFit="cover"
                    width="100%"
                    height="100%"
                    position="absolute"
                />

                {/* Text overlay */}
                <Box
                    position="absolute"
                    zIndex="1"
                    p={6}
                    maxW="90%"
                    top={["5%", "10%"]}
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

                {/* Real World Labs Grid */}
                <Box
                    position="absolute"
                    zIndex="1"
                    top="60%" // You might need to adjust this (e.g. to 65% or 70%) if it covers your text
                    left="50%"
                    transform="translate(-50%, -50%)"
                    width="100%"
                    maxW="1600px" // Significantly increased to allow for massive cards
                    px={4}
                >
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={12}>
                        
                        {/* Card 1 */}
                        <Box
                            as="a"
                            href={`${BASE_URL}apps/rwl_copenhagen/index.html`}
                            display="flex"
                            flexDirection="column"
                            textDecoration="none"
                            bg="lightgrey"
                            p={8} // Increased padding to match the bigger card
                            boxShadow="xl"
                            transition="all 0.3s ease"
                            _hover={{ 
                                transform: "scale(1.05)",
                                textDecoration: "none",
                                boxShadow: "2xl"
                            }}
                        >
                            <Box
                                w="100%"
                                h="500px" // Doubled from 250px
                                backgroundImage="url('/real_world_labs_logos/RWL1.png')"
                                backgroundSize="contain"
                                backgroundRepeat="no-repeat"
                                backgroundPosition="center"
                            />
                            <Box pt={6}>
                                <Text fontSize="3xl" fontWeight="bold" color="black" textAlign="center">
                                    Real World Lab 1
                                </Text>
                            </Box>
                        </Box>

                        {/* Card 2 */}
                        <Box
                            as="a"
                            href="https://directed-rwl2.saferplaces.co/"
                            target="_blank"
                            rel="noopener noreferrer"
                            display="flex"
                            flexDirection="column"
                            textDecoration="none"
                            bg="lightgrey"
                            p={8}
                            boxShadow="xl"
                            transition="all 0.3s ease"
                            _hover={{ 
                                transform: "scale(1.05)",
                                textDecoration: "none",
                                boxShadow: "2xl"
                            }}
                        >
                            <Box
                                w="100%"
                                h="500px" // Doubled from 250px
                                backgroundImage="url('/real_world_labs_logos/RWL2.png')"
                                backgroundSize="contain"
                                backgroundRepeat="no-repeat"
                                backgroundPosition="center"
                            />
                            <Box pt={6}>
                                <Text fontSize="3xl" fontWeight="bold" color="black" textAlign="center">
                                    Real World Lab 2
                                </Text>
                            </Box>
                        </Box>

                        {/* Card 3 */}
                        <Box
                            as="a"
                            href={`${BASE_URL}apps/rwl_danube/index.html`}
                            display="flex"
                            flexDirection="column"
                            textDecoration="none"
                            bg="lightgrey"
                            p={8}
                            boxShadow="xl"
                            transition="all 0.3s ease"
                            _hover={{ 
                                transform: "scale(1.05)",
                                textDecoration: "none",
                                boxShadow: "2xl"
                            }}
                        >
                            <Box
                                w="100%"
                                h="500px" // Doubled from 250px
                                backgroundImage="url('/real_world_labs_logos/RWL3.png')"
                                backgroundSize="contain"
                                backgroundRepeat="no-repeat"
                                backgroundPosition="center"
                            />
                            <Box pt={6}>
                                <Text fontSize="3xl" fontWeight="bold" color="black" textAlign="center">
                                    Real World Lab 3
                                </Text>
                            </Box>
                        </Box>

                        {/* Card 4 */}
                        <Box
                            as="a"
                            href={`${BASE_URL}apps/rwl_rhine_erft/index.html`}
                            display="flex"
                            flexDirection="column"
                            textDecoration="none"
                            bg="lightgrey"
                            p={8}
                            boxShadow="xl"
                            transition="all 0.3s ease"
                            _hover={{ 
                                transform: "scale(1.05)",
                                textDecoration: "none",
                                boxShadow: "2xl"
                            }}
                        >
                            <Box
                                w="100%"
                                h="500px" // Doubled from 250px
                                backgroundImage="url('/real_world_labs_logos/RWL4.png')"
                                backgroundSize="contain"
                                backgroundRepeat="no-repeat"
                                backgroundPosition="center"
                            />
                            <Box pt={6}>
                                <Text fontSize="3xl" fontWeight="bold" color="black" textAlign="center">
                                    Real World Lab 4
                                </Text>
                            </Box>
                        </Box>

                    </Grid>
                </Box>
            </Flex>

            {/* Footer */}
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