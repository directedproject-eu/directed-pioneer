// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Box, Flex, Image, Link, Text, Grid } from "@chakra-ui/react";
import { Navbar, BASE_URL } from "navbar";

export function AppUI() {
    
    return (
        <Flex direction="column" height="100vh">
            <Navbar />
            <Flex flex="1" position="relative" width="100%">
                <Image
                    src="/Fig1-FRB_Niederberg.jpg"
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
                        fontSize="3xl"
                        fontWeight="bold"
                        color="white"
                        textShadow="2px 2px 4px rgba(0, 0, 0, 0.7)"
                    >
                        Fostering disaster-resilience with the Directed Data Fabric
                    </Text>
                    <Text
                        fontSize="xl"
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
                    top="50%" // You might need to adjust this (e.g. to 65% or 70%) if it covers your text
                    left="50%"
                    transform="translate(-50%, -50%)"
                    width="100%"
                    maxW="3000px" // Significantly increased to allow for massive cards
                    px={4}
                >
                    <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={12}>
                        
                        {/* Card 1 */}
                        <Box
                            as="a"
                            href={`${BASE_URL}apps/rwl_copenhagen/index.html`}
                            backgroundImage="url('/real_world_labs_logos/DenmarkRWL.png')"
                            backgroundSize="contain"
                            backgroundRepeat="no-repeat"
                            backgroundPosition="center"
                            display="flex"
                            flexDirection="column"
                            textDecoration="none"
                            // p={3}
                            // boxShadow="lg"
                            rounded={6}
                            transition="all 0.3s ease"
                            _hover={{ 
                                transform: "scale(1.05)",
                                textDecoration: "none",
                                boxShadow: "2xl"
                            }}
                        >
                        </Box>

                        {/* Card 2 */}
                        <Box
                            as="a"
                            href="https://directed-rwl2.saferplaces.co/"
                            backgroundImage="url('/real_world_labs_logos/ERRWL.png')"
                            backgroundSize="contain"
                            backgroundRepeat="no-repeat"
                            backgroundPosition="center"
                            target="_blank"
                            rel="noopener noreferrer"
                            display="flex"
                            flexDirection="column"
                            textDecoration="none"
                            // p={3}
                            // boxShadow="lg"
                            rounded={6}
                            transition="all 0.3s ease"
                            _hover={{ 
                                transform: "scale(1.05)",
                                textDecoration: "none",
                                boxShadow: "2xl"
                            }}
                        >
                        </Box>

                        {/* Card 3 */}
                        <Box
                            as="a"
                            href={`${BASE_URL}apps/rwl_danube/index.html`}
                            backgroundImage="url('/real_world_labs_logos/DanubeRWL.png')"
                            backgroundSize="contain"
                            backgroundRepeat="no-repeat"
                            backgroundPosition="center"
                            display="flex"
                            flexDirection="column"
                            textDecoration="none"
                            // p={3}
                            // boxShadow="lg"
                            rounded={6}
                            transition="all 0.3s ease"
                            _hover={{ 
                                transform: "scale(1.05)",
                                textDecoration: "none",
                                boxShadow: "2xl"
                            }}
                        >
                        </Box>

                        {/* Card 4 */}
                        <Box
                            as="a"
                            href={`${BASE_URL}apps/rwl_rhine_erft/index.html`}
                            backgroundImage="url('/real_world_labs_logos/RhineErftRWL.png')"
                            backgroundSize="contain"
                            backgroundRepeat="no-repeat"
                            backgroundPosition="center"
                            display="flex"
                            flexDirection="column"
                            textDecoration="none"
                            // p={3}
                            // boxShadow="lg"
                            rounded={6}
                            transition="all 0.3s ease"
                            _hover={{ 
                                transform: "scale(1.05)",
                                textDecoration: "none",
                                boxShadow: "2xl"
                            }}
                        >
                            <Box
                                w="100%"
                                h="20vh"
                               
                            />
                                <Box pt={12} pb={20}>
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
