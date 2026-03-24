// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useId, useState } from "react";
import { PiRulerLight, PiChartLineDownLight, PiDownload } from "react-icons/pi";
import { EventsKey } from "ol/events";
import { Group, Vector as VectorLayer } from "ol/layer.js";
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
    Dialog,
    Field,
    Spacer,
    Text,
    useDisclosure,
    VStack,
    NativeSelect
} from "@chakra-ui/react";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { Geolocation } from "@open-pioneer/geolocation";
import { Legend as PioneerLegend } from "@open-pioneer/legend";
import { MapAnchor, MapContainer, SimpleLayer, useMapModel, DefaultMapProvider } from "@open-pioneer/map";
import { InitialExtent, ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { ToolButton } from "@open-pioneer/map-ui-components";
import { Notifier } from "@open-pioneer/notifier";
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
import { IsimipHandler } from "./services/IsimipHandler";
import { StationSelector } from "./services/StationSelector";
import { LayerZoom } from "./services/LayerZoom";
import { LayerSelector } from "./controls/LayerSelector";
import { TimeSlider } from "./controls/TimeSlider";
import ExpandableBox from "./components/ExpandableBox";
import StationInformation from "./components/StationInformation";
import ChartComponentZala from "./components/ChartComponentZala";
import { OgcFeaturesVectorSourceFactory } from "@open-pioneer/ogc-features";
import { GeosphereForecasts } from "./controls/GeosphereForecasts";
import { LayerDownload } from "layerdownload";

export function MapApp() {
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
    const [downloadIsActive, setDownloadIsActive] = useState<boolean>(false);

    function toggleMeasurement() {
        setMeasurementIsActive(!measurementIsActive);
    }
    function toggleDownload() {
        setDownloadIsActive(!downloadIsActive);
    }

    const prepSrvc = useService<IsimipHandler>("app.IsimipHandler");

    const stationService = useService<StationSelector>("app.StationSelector");
    const { stationData } = useReactiveSnapshot(
        () => ({
            stationData: stationService.stationData
        }),
        [prepSrvc]
    );
    const { open: isOpenChart, onClose: onCloseChart, onOpen: onOpenChart } = useDisclosure();
    const { open, onClose } = useDisclosure({ defaultOpen: true });

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
                (layer) => layer.olLayer?.getVisible?.() === true && !(layer.olLayer instanceof Group)
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
                <Notifier />
                {mapModel.map && (<DefaultMapProvider map={mapModel.map}>
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
                            <Dialog.Root
                                closeOnInteractOutside={false}
                                open={open}
                                onOpenChange={onClose}
                                size={"xl"}
                                placement={"center"}
                            >
                                <Dialog.Backdrop />
                                <Dialog.Positioner>
                                    <Dialog.Content>
                                        <Dialog.Header>
                                            {intl.formatMessage({ id: "welcome_window.header" })}
                                        </Dialog.Header>
                                        <Dialog.CloseTrigger />
                                        <Dialog.Body pb={6}>
                                            <Text as="b">
                                                {intl.formatMessage({ id: "welcome_window.body" })}
                                            </Text>
                                        </Dialog.Body>
                                        <Dialog.Footer>
                                            <Button onClick={onClose}>Close</Button>
                                        </Dialog.Footer>
                                    </Dialog.Content>
                                </Dialog.Positioner>
                            </Dialog.Root>
                            {authState.kind !== "pending" && (
                                <MapContainer
                                    map={mapModel.map}
                                    role="main"
                                    aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                                >
                                    <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                                        <LayerSelector />
                                        <TimeSlider />
                                        <GeosphereForecasts />
                                    </MapAnchor>
                                    {/* zoom to region and feature info */}
                                    <MapAnchor
                                        position="bottom-left"
                                        horizontalGap={15}
                                        verticalGap={60}
                                    >
                                        <VStack align="stretch" gap={2}>
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
                                                // role="top-right"
                                                aria-label={intl.formatMessage({
                                                    id: "ariaLabel.topRight"
                                                })}
                                                maxHeight={615}
                                                maxWidth={430}
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
                                                            ➡️ Only layers which have been selected in
                                                            the Operational Layers are viewable for
                                                            comparison.
                                                        </Text>
                                                        <Flex direction="row" gap={4} p={4}>
                                                            <NativeSelect.Root>
                                                                <NativeSelect.Field
                                                                    placeholder="Select Left Layer"
                                                                    value={selectedLeftLayer ?? ""}
                                                                    onChange={(e) =>
                                                                        setSelectedLeftLayer(e.target.value)
                                                                    }
                                                                >
                                                                    {visibleAvailableLayers.map((layer) => (
                                                                        <option
                                                                            key={layer.id}
                                                                            value={layer.id}
                                                                        >
                                                                            {layer.title || layer.id}
                                                                        </option>
                                                                    ))}
                                                                </NativeSelect.Field>
                                                            </NativeSelect.Root>
                                                            <NativeSelect.Root>
                                                                <NativeSelect.Field
                                                                    placeholder="Select Right Layer"
                                                                    value={selectedRightLayer ?? ""}
                                                                    onChange={(e) =>
                                                                        setSelectedRightLayer(
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                >
                                                                    {visibleAvailableLayers.map((layer) => (
                                                                        <option
                                                                            key={layer.id}
                                                                            value={layer.id}
                                                                        >
                                                                            {layer.title || layer.id}
                                                                        </option>
                                                                    ))}
                                                                </NativeSelect.Field>
                                                            </NativeSelect.Root>
                                                        </Flex>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Flex
                                                maxHeight={800}
                                                minWidth={250}
                                                overflow="auto"
                                                borderRadius="md"
                                                boxShadow="lg"
                                                // marginLeft="auto"
                                                alignSelf="flex-end"
                                            >
                                                <PioneerLegend map={mapModel.map} />
                                            </Flex>
                                        </Flex>
                                    </MapAnchor>

                                    {/* tool buttons */}
                                    <MapAnchor
                                        position="bottom-right"
                                        horizontalGap={10}
                                        verticalGap={30}
                                    >
                                        <Flex
                                            role="menubar"
                                            aria-label={intl.formatMessage({
                                                id: "ariaLabel.bottomRight"
                                            })}
                                            direction="row"
                                            gap={1}
                                            padding={1}
                                        >
                                            <ToolButton
                                                label={intl.formatMessage({
                                                    id: "map.download.button"
                                                })}
                                                icon={<PiDownload />}
                                                active={downloadIsActive}
                                                onClick={toggleDownload}
                                            />
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
                                                active={measurementIsActive}
                                                onClick={toggleMeasurement}
                                            />
                                            <Geolocation map={mapModel.map} />
                                            <InitialExtent map={mapModel.map} />
                                            <ZoomIn map={mapModel.map} />
                                            <ZoomOut map={mapModel.map} />
                                        </Flex>
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
                                                // role="top-left"
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
                                                        <Measurement map={mapModel.map} />
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
                                            marginBottom="10px"
                                        >
                                            <Toc
                                                map={mapModel.map}
                                                showTools={true}
                                                collapsibleGroups={true}
                                                initiallyCollapsed={true}
                                                showBasemapSwitcher={false}
                                            />
                                            <Field.Root>
                                                <Field.Label mt={2}>
                                                    <Text as="b">
                                                        {intl.formatMessage({ id: "basemapLabel" })}
                                                    </Text>
                                                </Field.Label>
                                                <BasemapSwitcher
                                                    map={mapModel.map}
                                                    allowSelectingEmptyBasemap={true}
                                                    className="custom-basemap-switcher"
                                                />
                                            </Field.Root>
                                        </Box>
                                        {downloadIsActive && <LayerDownload mapID={MAP_ID} intl={intl} isOpen={downloadIsActive} onClose={() => setDownloadIsActive(false)} />}
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
                            <CoordinateViewer map={mapModel.map} precision={2} />
                            <ScaleBar map={mapModel.map} />
                            <ScaleViewer map={mapModel.map} />
                        </Flex>
                    </TitledSection>
                </DefaultMapProvider>)}
            </Flex>

            <Dialog.Root open={isOpenChart} onOpenChange={onCloseChart} size={"full"}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>Zala Chart</Dialog.Header>
                        <Dialog.CloseTrigger />
                        <Dialog.Body>
                            <ChartComponentZala></ChartComponentZala>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Button colorScheme="blue" mr={3} onClick={onCloseChart}>
                                Close
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
}
