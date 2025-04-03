// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    Button,
    Container,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Text
} from "@open-pioneer/chakra-integration";
import { AuthService, ForceAuth, useAuthState } from "@open-pioneer/authentication";
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
import { useId, useMemo, useRef, useState } from "react";
import TileLayer from "ol/layer/Tile";
import { Measurement } from "@open-pioneer/measurement";
import OSM from "ol/source/OSM";
import { PiRulerLight } from "react-icons/pi";
import { useService } from "open-pioneer:react-hooks";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { Navbar } from "navbar";
import { LayerSelector } from "./controls/LayerSelector";
import Legend from "./components/Legend";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import ExpandableBox from "./components/ExpandableBox";
import StationInformation from "./components/StationInformation";
import { StationSelector } from "./services/StationSelector";
import { IsimipSelector } from "./controls/IsimipSelector";

export function MapApp() {
    const authService = useService<AuthService>("authentication.AuthService");
    const authState = useAuthState(authService);
    const sessionInfo = authState.kind == "authenticated" ? authState.sessionInfo : undefined;
    const userName = sessionInfo?.attributes?.userName as string;

    const closableBoxRef = useRef();

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
    const stationService = useService<StationSelector>("app.StationSelector");
    const { stationData } = useReactiveSnapshot(
        () => ({
            stationData: stationService.stationData
        }),
        [prepSrvc]
    );

    return (
        <ForceAuth>
            <Flex height="100%" direction="column" overflow="hidden">
                <Navbar>
                    <Flex flexDirection="row" align={"center"} ml={"auto"} gap="2em">
                        <Text>Logged in as: {userName}</Text>
                        <Button onClick={() => authService.logout()}>Logout</Button>
                    </Flex>
                </Navbar>
                <Container p={5}></Container>
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
                            <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
                                <div
                                    style={{
                                        width: window.innerWidth * 0.6,
                                        marginLeft: window.innerWidth * 0.2,
                                        marginRight: window.innerWidth * 0.2,
                                        borderRadius: "10px",
                                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                                        marginTop: "5px"
                                    }}
                                >
                                    <LayerSelector />
                                </div>
                            </MapAnchor>
                            <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
                                <IsimipSelector />

                                <ExpandableBox title="Event Information" marginBottom="10px">
                                    <StationInformation data={stationData} />
                                </ExpandableBox>
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
                                                        {intl.formatMessage({
                                                            id: "measurementTitle"
                                                        })}
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
                                    <Toc
                                        mapId={MAP_ID}
                                        showTools={true}
                                        showBasemapSwitcher={false}
                                    />
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
                                        <BasemapSwitcher
                                            mapId={MAP_ID}
                                            allowSelectingEmptyBasemap
                                        />
                                    </FormControl>
                                </Box>
                                <Legend
                                    range={legendMetadata.range}
                                    variable={legendMetadata.variable}
                                ></Legend>
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
        </ForceAuth>
    );
}
