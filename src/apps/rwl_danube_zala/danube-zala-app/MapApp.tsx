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
import { AuthService, useAuthState } from "@open-pioneer/authentication";
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
import { Toc } from "@open-pioneer/toc";
import { MAP_ID } from "./services/MapProvider";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import TileLayer from "ol/layer/Tile";
import { Measurement } from "@open-pioneer/measurement";
import OSM from "ol/source/OSM";
import { PiRulerLight } from "react-icons/pi";
import { useService } from "open-pioneer:react-hooks";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { Navbar } from "navbar";
import { LayerSelector } from "./controls/LayerSelector";
import Legend from "./components/legends/Legend";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import ExpandableBox from "./components/ExpandableBox";
import StationInformation from "./components/StationInformation";
import { StationSelector } from "./services/StationSelector";
import { IsimipSelector } from "./controls/IsimipSelector";
import ChartComponentZala from "./components/ChartComponentZala";
import ResizeBox from "./components/ResizeBox";
import ChartComponentRhineErft from "./components/ChartComopnentRhineErft";

import { useMapModel } from "@open-pioneer/map";
import { OgcFeaturesVectorSourceFactory } from "@open-pioneer/ogc-features";
import { Vector as VectorLayer } from "ol/layer.js";
import { SimpleLayer } from "@open-pioneer/map";

export function MapApp() {
    const mapModel = useMapModel(MAP_ID);
    const vectorSourceFactory = useService<OgcFeaturesVectorSourceFactory>(
        "ogc-features.VectorSourceFactory"
    );

    const authService = useService<AuthService>("authentication.AuthService");
    const authState = useAuthState(authService);
    const sessionInfo = authState.kind == "authenticated" ? authState.sessionInfo : undefined;
    const userName = sessionInfo?.attributes?.userName as string;

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

    function createPastEventLayer(
        collectionId: string,
        id: string,
        title: string,
        description: string,
        color: string
    ) {
        const pastEventLayer = new SimpleLayer({
            id: `${id}`,
            title: intl.formatMessage({ id: `map.legend.event_variables.${title}` }),
            description: `${description}`,
            visible: true,
            olLayer: new VectorLayer({
                source: vectorSourceFactory.createVectorSource({
                    baseUrl: "https://directed.dev.52north.org/protected",
                    collectionId: collectionId,
                    crs: "http://www.opengis.net/def/crs/EPSG/0/3857",
                    limit: 5000,
                    additionalOptions: {}
                }),
                style: {
                    "circle-radius": 8.0,
                    "circle-fill-color": color,
                    "circle-stroke-color": "white",
                    "circle-stroke-width": 0.5
                },
                properties: { title: "GeoJSON Layer" }
            }),
            isBaseLayer: false
        });
        return pastEventLayer;
    }

    useEffect(() => {
        if (authState.kind !== "authenticated") return;
        const map = mapModel?.map?.olMap;

        if (!map) return;

        mapModel.map?.layers.addLayer(
            createPastEventLayer(
                "zala/events/damage/storm",
                "storm_damage",
                "storm_damage",
                "Storm damage",
                "black"
            )
        );
        mapModel.map?.layers.addLayer(
            createPastEventLayer(
                "zala/events/damage/water",
                "water_damage",
                "water_damage",
                "Water damage",
                "blue"
            )
        );
        mapModel.map?.layers.addLayer(
            createPastEventLayer(
                "zala/events/fires/forest_vegetation",
                "forest_vegetation_fires",
                "forest_and_vegetation_fire",
                "Forest and vegetation fires",
                "red"
            )
        );
        mapModel.map?.layers.addLayer(
            createPastEventLayer(
                "zala/events/timber_cutting",
                "timber_cutting",
                "tree_clearing",
                "Tree clearing",
                "green"
            )
        );
    }, [authState.kind]);

    return (
        <>
            <Flex height="100%" direction="column" overflow="hidden">
                <Navbar authService={authService}>
                    {/* {authState.kind === "authenticated" && (
                        <Flex flexDirection="row" align={"center"} ml={"auto"} gap="2em">
                            <Text>Logged in as: {authState.sessionInfo?.userName ?? "unknown"}</Text>
                            <Button onClick={() => authService.logout()}>Logout</Button>
                        </Flex>
                    )}
                    {authState.kind !== "authenticated" && (
                        <Flex flexDirection="row" align="center" ml="auto" gap="2em">
                            <Button onClick={() => authService.getLoginBehavior().login()}>
                                Login
                            </Button>
                        </Flex>
                    )} */}
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
                                {intl.formatMessage({ id: "heading" })}
                            </SectionHeading>
                        </Box>
                    }
                >
                    <Flex flex="1" direction="column" position="relative">
                        {authState.kind !== "pending" && (
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
                                    
                                    {authState.kind === "authenticated" && (
                                        <ExpandableBox
                                            title={intl.formatMessage({
                                                id: "map.station_information.heading"
                                            })}
                                            marginBottom="10px"
                                        >
                                            <StationInformation data={stationData} />
                                        </ExpandableBox>
                                    )}
                                    {measurementIsActive && (
                                        <Box
                                            backgroundColor="white"
                                            borderWidth="1px"
                                            borderRadius="lg"
                                            padding={2}
                                            boxShadow="lg"
                                            role="top-left"
                                            aria-label={intl.formatMessage({
                                                id: "ariaLabel.topLeft"
                                            })}
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
                                            collapsibleGroups={true}
                                            initiallyCollapsed={true}
                                            showBasemapSwitcher={false}
                                        />
                                        <FormControl>
                                            <FormLabel mt={2}>
                                                <Text as="b">
                                                    {intl.formatMessage({ id: "basemapLabel" })}
                                                </Text>
                                            </FormLabel>
                                            <BasemapSwitcher
                                                mapId={MAP_ID}
                                                allowSelectingEmptyBasemap={true}
                                            />
                                        </FormControl>
                                    </Box>
                                </MapAnchor>
                                <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                                    <Legend
                                        range={legendMetadata.range}
                                        variable={legendMetadata.variable}
                                        isAuthenticated={authState.kind === "authenticated"}
                                    ></Legend>
                                </MapAnchor>
                                <MapAnchor
                                    position="bottom-right"
                                    horizontalGap={10}
                                    verticalGap={30}
                                >
                                    <Flex
                                        role="bottom-right"
                                        aria-label={intl.formatMessage({
                                            id: "ariaLabel.bottomRight"
                                        })}
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
                        )}
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
            <ResizeBox title={"Zala Chart"}>
                <ChartComponentZala></ChartComponentZala>
            </ResizeBox>

            <ResizeBox title={"Rhine - Erft Chart"}>
                <ChartComponentRhineErft></ChartComponentRhineErft>
            </ResizeBox>
        </>
    );
}
