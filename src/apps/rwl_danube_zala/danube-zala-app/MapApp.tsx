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
import { MAP_ID } from "./services/MapProvider";
import { useId, useMemo, useState } from "react";
import TileLayer from "ol/layer/Tile";
import { Measurement } from "@open-pioneer/measurement";
import OSM from "ol/source/OSM";
import { PiRulerLight } from "react-icons/pi";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { Navbar } from "navbar";
import { LayerSelector } from "./controls/LayerSelector";
import Selector from "./controls/Selector";
import { ScenarioSelector } from "./controls/ScenarioSelector";
import { ModelSelector } from "./controls/ModelSelector";
import { VariableSelector } from "./controls/VariableSelector";
import { Legend } from "./controls/Legend";
import { useService } from "open-pioneer:react-hooks";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";

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
    const prepSrvc = useService<LayerHandler>("app.LayerHandler");

    const { legendMetadata } = useReactiveSnapshot(
        () => ({
            legendMetadata: prepSrvc.legendMetadata
        }),
        [prepSrvc]
    );

    return (
        <Flex height="100%" direction="column" overflow="hidden">
            <Navbar />
            <Notifier position="bottom" />
            <TitledSection
                title={
                    <Box
                        role="region"
                        aria-label={intl.formatMessage({ id: "ariaLabel.header" })}
                        textAlign="left"
                        py={1}
                    >
                        <SectionHeading size={"md"} color="#2e9ecc" mt={6} mb={6}>
                            RWL The Danube Region
                        </SectionHeading>
                    </Box>
                }
            >
                <Flex flex="1" direction="column" position="relative">
                    <MapContainer
                        mapId={MAP_ID}
                        role="main"
                        aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                    >
                        <MapAnchor position="top-left" horizontalGap={10} verticalGap={10}>
                            <div
                                style={{
                                    width: window.innerWidth * 0.6,
                                    marginLeft: window.innerWidth * 0.2,
                                    marginRight: window.innerWidth * 0.2,
                                    borderRadius: "10px",
                                    backgroundColor: "rgba(255, 255, 255, 0.5)"
                                }}
                            >
                                <LayerSelector />
                            </div>
                        </MapAnchor>
                        <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
                            <ScenarioSelector />
                            <ModelSelector />
                            <VariableSelector />
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
                                            <Measurement mapId={MAP_ID} />
                                        </TitledSection>
                                    </Box>
                                </Box>
                            )}
                            <Box
                                backgroundColor="white"
                                borderWidth="1px"
                                borderRadius="lg"
                                padding={2}
                                boxShadow="lg"
                                role="dialog"
                                aria-label={intl.formatMessage({ id: "ariaLabel.toc" })}
                            >
                                <Toc mapId={MAP_ID} showTools={true} showBasemapSwitcher={false} />
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
                                <OverviewMap mapId={MAP_ID} olLayer={overviewMapLayer} />
                                <Divider mt={4} />
                                <FormControl>
                                    <FormLabel mt={2}>
                                        <Text as="b">
                                            {intl.formatMessage({ id: "basemapLabel" })}
                                        </Text>
                                    </FormLabel>
                                    <BasemapSwitcher mapId={MAP_ID} allowSelectingEmptyBasemap />
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
                                <Geolocation mapId={MAP_ID} />
                                <InitialExtent mapId={MAP_ID} />
                                <ZoomIn mapId={MAP_ID} />
                                <ZoomOut mapId={MAP_ID} />
                            </Flex>
                        </MapAnchor>
                        <MapAnchor position="bottom-left" horizontalGap={10} verticalGap={30}>
                            <Legend metaData={legendMetadata}></Legend>
                        </MapAnchor>
                    </MapContainer>
                </Flex>
                <Flex
                    role="region"
                    aria-label={intl.formatMessage({ id: "ariaLabel.footer" })}
                    gap={3}
                    alignItems="center"
                    justifyContent="center"
                >
                    <CoordinateViewer mapId={MAP_ID} precision={2} />
                    <ScaleBar mapId={MAP_ID} />
                    <ScaleViewer mapId={MAP_ID} />
                </Flex>
            </TitledSection>
        </Flex>
    );
}
