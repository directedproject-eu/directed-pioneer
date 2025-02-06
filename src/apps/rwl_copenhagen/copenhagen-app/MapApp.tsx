// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Box, Divider, Flex, FormControl, FormLabel, Text } from "@open-pioneer/chakra-integration";
import { MapAnchor, MapContainer } from "@open-pioneer/map";
import { ScaleBar } from "@open-pioneer/scale-bar";
import { InitialExtent, ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { useIntl } from "open-pioneer:react-hooks";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { SectionHeading, TitledSection } from "@open-pioneer/react-utils";
import { ToolButton } from "@open-pioneer/map-ui-components";
import { ScaleViewer } from "@open-pioneer/scale-viewer";
import { Geolocation } from "@open-pioneer/geolocation";
import { Notifier } from "@open-pioneer/notifier";
import { OverviewMap } from "@open-pioneer/overview-map";
import { Toc } from "@open-pioneer/toc";
import { MAP_ID1, MAP_ID2 } from "./services";
import { useId, useMemo, useState } from "react";
import TileLayer from "ol/layer/Tile";
import { Measurement } from "@open-pioneer/measurement";
import OSM from "ol/source/OSM";
import { PiRulerLight } from "react-icons/pi";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
// import { navbar } from "navbar";

export function MapApp() {
    const intl = useIntl();
    const measurementTitleId = useId();

    const [measurementIsActive, setMeasurementIsActive] = useState<boolean>(false);
    function toggleMeasurement() {
        setMeasurementIsActive(!measurementIsActive);
    }

    const overviewMapLayer = useMemo(
        () =>
            new TileLayer({
                source: new OSM()
            }),
        []
    );

    return (
        <Flex height="100%" direction="column" overflow="hidden">
            {/* <navbar /> */}
            <Notifier position="bottom" />
            <TitledSection
                title={
                    <Box
                        role="region"
                        aria-label={intl.formatMessage({ id: "ariaLabel.header" })}
                        textAlign="center"
                        py={1}
                    >
                        {/* <SectionHeading size={"md"}>
                            RWL - The Capital Region of Denmark
                        </SectionHeading> */}
                    </Box>
                }
            >
                <Flex flex="1" direction="column" position="relative">
                    {/*MAP1*/}
                    <MapContainer
                        mapId={MAP_ID1}
                        role="main"
                        aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                    >
                        <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
                            {measurementIsActive && (
                                <Box
                                    backgroundColor="white"
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    padding={2}
                                    boxShadow="lg"
                                    role="top-left"
                                    aria-label={intl.formatMessage({ id: "ariaLabel.topLeft" })}
                                >
                                    <Box role="dialog" aria-labelledby={measurementTitleId}>
                                        <TitledSection
                                            title={
                                                <SectionHeading
                                                    id={measurementTitleId}
                                                    size="md"
                                                    mb={2}
                                                >
                                                    {intl.formatMessage({ id: "measurementTitle" })}
                                                </SectionHeading>
                                            }
                                        >
                                            <Measurement mapId={MAP_ID1} />
                                        </TitledSection>
                                    </Box>
                                </Box>
                            )}
                            {/*add Table of Contents (Toc) */}
                            <Box
                                backgroundColor="white"
                                borderWidth="1px"
                                borderRadius="lg"
                                padding={2}
                                boxShadow="lg"
                                role="dialog"
                                aria-label={intl.formatMessage({ id: "ariaLabel.toc" })}
                            >
                                <Toc mapId={MAP_ID1} />
                            </Box>
                        </MapAnchor>
                        <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                            <Box
                                backgroundColor="white"
                                borderWidth="1px"
                                borderRadius="lg"
                                padding={2}
                                boxShadow="lg"
                                role="top-right"
                                aria-label={intl.formatMessage({ id: "ariaLabel.topRight" })}
                            >
                                <OverviewMap mapId={MAP_ID1} olLayer={overviewMapLayer} />
                                <Divider mt={4} />
                                <FormControl>
                                    <FormLabel mt={2}>
                                        <Text as="b">
                                            {intl.formatMessage({ id: "basemapLabel" })}
                                        </Text>
                                    </FormLabel>
                                    <BasemapSwitcher mapId={MAP_ID1} allowSelectingEmptyBasemap />
                                </FormControl>
                            </Box>
                        </MapAnchor>
                        <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                            <Flex
                                role="bottom-right"
                                aria-label={intl.formatMessage({ id: "ariaLabel.bottomRight" })}
                                direction="column"
                                gap={1}
                                padding={1}
                            >
                                <ToolButton
                                    label={intl.formatMessage({ id: "measurementTitle" })}
                                    icon={<PiRulerLight />}
                                    isActive={measurementIsActive}
                                    onClick={toggleMeasurement}
                                />
                                <Geolocation mapId={MAP_ID1} />
                                <InitialExtent mapId={MAP_ID1} />
                                <ZoomIn mapId={MAP_ID1} />
                                <ZoomOut mapId={MAP_ID1} />
                            </Flex>
                        </MapAnchor>
                    </MapContainer>
                    {/*END MAP1*/}
                </Flex>

                <Flex flex="1" direction="column" position="relative">
                    {/*MAP2*/}
                    <MapContainer
                        mapId={MAP_ID2}
                        role="second"
                        aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                    >
                        <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
                            {measurementIsActive && (
                                <Box
                                    backgroundColor="white"
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    padding={2}
                                    boxShadow="lg"
                                    role="top-left"
                                    aria-label={intl.formatMessage({ id: "ariaLabel.topLeft" })}
                                >
                                    <Box role="dialog" aria-labelledby={measurementTitleId}>
                                        <TitledSection
                                            title={
                                                <SectionHeading
                                                    id={measurementTitleId}
                                                    size="md"
                                                    mb={2}
                                                >
                                                    {intl.formatMessage({ id: "measurementTitle" })}
                                                </SectionHeading>
                                            }
                                        >
                                            <Measurement mapId={MAP_ID2} />
                                        </TitledSection>
                                    </Box>
                                </Box>
                            )}
                            {/*add Table of Contents (Toc) */}
                            <Box
                                backgroundColor="white"
                                borderWidth="1px"
                                borderRadius="lg"
                                padding={2}
                                boxShadow="lg"
                                role="dialog"
                                aria-label={intl.formatMessage({ id: "ariaLabel.toc" })}
                            >
                                <Toc mapId={MAP_ID2} />
                            </Box>
                        </MapAnchor>
                        <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                            <Box
                                backgroundColor="white"
                                borderWidth="1px"
                                borderRadius="lg"
                                padding={2}
                                boxShadow="lg"
                                role="top-right"
                                aria-label={intl.formatMessage({ id: "ariaLabel.topRight" })}
                            >
                                {/* <OverviewMap mapId={MAP_ID2} olLayer={overviewMapLayer} /> */}
                                {/* <Divider mt={4} />
                                <FormControl>
                                    <FormLabel mt={2}>
                                        <Text as="b">
                                            {intl.formatMessage({ id: "basemapLabel" })}
                                        </Text>
                                    </FormLabel>
                                    <BasemapSwitcher mapId={MAP_ID2} allowSelectingEmptyBasemap />
                                </FormControl> */}
                            </Box>
                        </MapAnchor>
                        <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                            <Flex
                                role="bottom-right"
                                aria-label={intl.formatMessage({ id: "ariaLabel.bottomRight" })}
                                direction="column"
                                gap={1}
                                padding={1}
                            >
                                <ToolButton
                                    label={intl.formatMessage({ id: "measurementTitle" })}
                                    icon={<PiRulerLight />}
                                    isActive={measurementIsActive}
                                    onClick={toggleMeasurement}
                                />
                                <Geolocation mapId={MAP_ID2} />
                                <InitialExtent mapId={MAP_ID2} />
                                <ZoomIn mapId={MAP_ID2} />
                                <ZoomOut mapId={MAP_ID2} />
                            </Flex>
                        </MapAnchor>
                    </MapContainer>
                    {/*END MAP2*/}
                </Flex>

                <Flex
                    role="region"
                    aria-label={intl.formatMessage({ id: "ariaLabel.footer" })}
                    gap={3}
                    alignItems="center"
                    justifyContent="center"
                >
                    <CoordinateViewer mapId={MAP_ID1} precision={2} />
                    <ScaleBar mapId={MAP_ID1} />
                    <ScaleViewer mapId={MAP_ID1} />
                </Flex>

                <Flex
                    role="region"
                    aria-label={intl.formatMessage({ id: "ariaLabel.footer" })}
                    gap={3}
                    alignItems="center"
                    justifyContent="center"
                >
                    <CoordinateViewer mapId={MAP_ID2} precision={2} />
                    <ScaleBar mapId={MAP_ID2} />
                    <ScaleViewer mapId={MAP_ID2} />
                </Flex>
            </TitledSection>
        </Flex>
    );
}
