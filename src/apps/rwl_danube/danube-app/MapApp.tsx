// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useId, useState } from "react";
import { PiRulerLight, PiChartLineDownLight } from "react-icons/pi";
import { EventsKey } from "ol/events";
import { Vector as VectorLayer } from "ol/layer.js";
import Layer from "ol/layer/Layer";
import { unByKey } from "ol/Observable";
import Swipe from "ol-ext/control/Swipe";
import { AuthService, useAuthState } from "@open-pioneer/authentication";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import {
    Box,
    Button,
    Container,
    Flex,
    FormControl,
    FormLabel,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Select,
    Spacer,
    Text,
    useDisclosure,
    VStack
} from "@open-pioneer/chakra-integration";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { Geolocation } from "@open-pioneer/geolocation";
//import { Legend } from "@open-pioneer/legend";
import { MapAnchor, MapContainer, SimpleLayer, useMapModel } from "@open-pioneer/map";
import { InitialExtent, ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { ToolButton } from "@open-pioneer/map-ui-components";
import { Notifier } from "@open-pioneer/notifier";
import { OgcFeaturesVectorSourceFactory } from "@open-pioneer/ogc-features";
import { useIntl } from "open-pioneer:react-hooks";
import { SectionHeading, TitledSection } from "@open-pioneer/react-utils";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { ScaleBar } from "@open-pioneer/scale-bar";
import { ScaleViewer } from "@open-pioneer/scale-viewer";
import { Toc } from "@open-pioneer/toc";
import { Measurement } from "@open-pioneer/measurement";
import { useService } from "open-pioneer:react-hooks";
import { MAP_ID } from "./services/MapProvider";
import { FeatureInfo } from "featureinfo";
import { Navbar } from "navbar";
import { IsimipSelector } from "./controls/IsimipSelector";
import { LayerSelector } from "./controls/LayerSelector";
import { TimeSlider } from "./controls/TimeSlider";
import ExpandableBox from "./components/ExpandableBox";
import StationInformation from "./components/StationInformation";
import ChartComponentZala from "./components/ChartComponentZala";
import Legend from "./components/legends/Legend";
import { IsimipHandler } from "./services/IsimipHandler";
import { StationSelector } from "./services/StationSelector";
import { LayerZoom } from "./services/LayerZoom";

export function MapApp() {
    const highlightService = useService<LayerHighlighter>("app.LayerHighlighter");

    // const { isOpen, onOpen, onClose } = useDisclosure();
    const mapModel = useMapModel(MAP_ID);
    const zoomService = useService<LayerZoom>("app.LayerZoom"); // administrative boundary layer zoom service
    const vectorSourceFactory = useService<OgcFeaturesVectorSourceFactory>(
        "ogc-features.VectorSourceFactory"
    );

    const authService = useService<AuthService>("authentication.AuthService");
    const authState = useAuthState(authService);

    const intl = useIntl();
    const measurementTitleId = useId();

    const [measurementIsActive, setMeasurementIsActive] = useState<boolean>(false);
    function toggleMeasurement() {
        setMeasurementIsActive(!measurementIsActive);
    }

    const prepSrvc = useService<IsimipHandler>("app.IsimipHandler");

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
    const { isOpen: isOpenChart, onClose: onCloseChart, onOpen: onOpenChart } = useDisclosure();
    const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

    /////////////////////////
    /// Past event layers ///
    ////////////////////////
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

    //////////////////
    /// LayerSwipe ///
    //////////////////
    const [selectedLeftLayer, setSelectedLeftLayer] = useState<string | null>(null);
    const [selectedRightLayer, setSelectedRightLayer] = useState<string | null>(null);
    const [visibleAvailableLayers, setVisibleAvailableLayers] = useState<SimpleLayer[]>([]); //filter for visible layers

    useEffect(() => {
        if (!mapModel.map) return;

        const map = mapModel.map.olMap;
        const allLayers = mapModel.map.layers.getRecursiveLayers() as SimpleLayer[];

        const updateVisibleLayers = () => {
            const visibleLayers = allLayers.filter(
                (layer) => layer.olLayer?.getVisible?.() === true
            );
            setVisibleAvailableLayers(visibleLayers);
        };

        updateVisibleLayers();

        const eventKeys: EventsKey[] = allLayers
            .map((layer) => {
                const olLayer = layer.olLayer;
                if (!olLayer || typeof olLayer.on !== "function") return null;
                return olLayer.on("change:visible", () => {
                    updateVisibleLayers();
                    handleSwipeUpdate();
                });
            })
            .filter((k): k is EventsKey => !!k);

        let swipe: Swipe | null = null;

        const removeSwipe = () => {
            if (swipe) {
                map.removeControl(swipe);
                swipe = null;
            }
        };

        const addSwipe = (leftLayer: Layer, rightLayer: Layer) => {
            removeSwipe();
            swipe = new Swipe({
                layers: [leftLayer],
                rightLayers: [rightLayer],
                position: 0.5,
                orientation: "vertical",
                className: "ol-swipe"
            });
            map.addControl(swipe);
        };

        const handleSwipeUpdate = () => {
            if (!selectedLeftLayer || !selectedRightLayer) {
                removeSwipe();
                return;
            }

            const leftLayer = (mapModel.map.layers.getLayerById(selectedLeftLayer) as SimpleLayer)
                ?.olLayer as Layer;
            const rightLayer = (mapModel.map.layers.getLayerById(selectedRightLayer) as SimpleLayer)
                ?.olLayer as Layer;

            if (!leftLayer || !rightLayer) {
                removeSwipe();
                return;
            }

            if (leftLayer.getVisible() && rightLayer.getVisible()) {
                addSwipe(leftLayer, rightLayer);
            } else {
                removeSwipe();
            }
        };

        handleSwipeUpdate();

        return () => {
            eventKeys.forEach(unByKey);
            removeSwipe();
        };
    }, [mapModel, selectedLeftLayer, selectedRightLayer]);

    return (
        <>
            <Flex height="100%" direction="column" overflow="hidden">
                <Navbar authService={authService}></Navbar>
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
                        <Modal
                            closeOnOverlayClick={false}
                            isOpen={isOpen}
                            onClose={onClose}
                            size={"5xl"}
                            isCentered={true}
                        >
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>
                                    {intl.formatMessage({ id: "welcome_window.header" })}
                                </ModalHeader>
                                <ModalCloseButton />
                                <ModalBody pb={6}>
                                    <Text as="b">
                                        {intl.formatMessage({ id: "welcome_window.body" })}
                                    </Text>
                                </ModalBody>
                                <ModalFooter>
                                    <Button onClick={onClose}>Close</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
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

                                <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                                    <TimeSlider />
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

                                {/* zoom to region and feature info */}
                                <MapAnchor position="bottom-left" horizontalGap={15} verticalGap={60}>
                                    <VStack align="stretch" spacing={2}>
                                        <Button
                                            size="sm"
                                            onClick={() => zoomService.zoomToVienna(mapModel.map!)}
                                        >
                                            {intl.formatMessage({ id: "zoom_buttons.vienna" })}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => zoomService.zoomToZala(mapModel.map!)}
                                        >
                                            {intl.formatMessage({ id: "zoom_buttons.zala" })}
                                        </Button>
                                    </VStack>

                                    {mapModel && (
                                        <FeatureInfo
                                            mapModel={mapModel.map!}
                                            projection="EPSG:3857"
                                            layerId={""}
                                        />
                                    )}
                                </MapAnchor>

                                {/* layerswipe and legend */}
                                <MapAnchor position="top-right" horizontalGap={5} verticalGap={10}>
                                    <Flex direction="column" gap={4}>
                                        <Box
                                            backgroundColor="white"
                                            borderWidth="1px"
                                            borderRadius="lg"
                                            padding={2}
                                            boxShadow="lg"
                                            role="top-right"
                                            aria-label={intl.formatMessage({ id: "ariaLabel.topRight" })}
                                            maxHeight={615}
                                            maxWidth={430}
                                            overflow="hidden"
                                            marginBottom={5}
                                        >
                                            <Box>
                                                <Box maxHeight={300} overflow="auto">
                                                    <Flex
                                                        direction="column"
                                                        justifyContent="center"
                                                        alignItems="center"
                                                    ></Flex>
                                                    <Text fontWeight="bold" mt={4}>
                                                        Select Layers for Comparison
                                                    </Text>
                                                    <Spacer />
                                                    <Text fontSize={16}>
                                                        ➡️ Only layers which have been selected in the
                                                        Operational Layers are viewable for comparison.
                                                    </Text>
                                                    <Flex direction="row" gap={4} p={4}>
                                                        <Select
                                                            placeholder="Select Left Layer"
                                                            value={selectedLeftLayer ?? ""}
                                                            onChange={(e) =>
                                                                setSelectedLeftLayer(e.target.value)
                                                            }
                                                        >
                                                            {visibleAvailableLayers.map((layer) => (
                                                                <option key={layer.id} value={layer.id}>
                                                                    {layer.title || layer.id}
                                                                </option>
                                                            ))}
                                                        </Select>

                                                        <Select
                                                            placeholder="Select Right Layer"
                                                            value={selectedRightLayer ?? ""}
                                                            onChange={(e) =>
                                                                setSelectedRightLayer(e.target.value)
                                                            }
                                                        >
                                                            {visibleAvailableLayers.map((layer) => (
                                                                <option key={layer.id} value={layer.id}>
                                                                    {layer.title || layer.id}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    </Flex>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Legend
                                            range={legendMetadata.range}
                                            variable={legendMetadata.variable}
                                            isAuthenticated={authState.kind === "authenticated"}
                                        ></Legend>
                                    </Flex>
                                </MapAnchor>

                                {/* tool buttons */}
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
                                            label={intl.formatMessage({
                                                id: "charts.button_title"
                                            })}
                                            icon={<PiChartLineDownLight />}
                                            onClick={onOpenChart}
                                        />
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
                                <MapAnchor position="bottom-left" horizontalGap={5} verticalGap={5}>
                                    <Button
                                        size="sm"
                                        onClick={() => highlightService.zoomTo("zala_region")}
                                    >
                                        Zoom Zala region
                                    </Button>
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

            <Modal isOpen={isOpenChart} onClose={onCloseChart} size={"full"}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Zala Chart</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <ChartComponentZala></ChartComponentZala>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onCloseChart}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
