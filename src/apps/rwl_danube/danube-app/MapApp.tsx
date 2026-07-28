// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useId, useState } from "react";
import {
    PiRulerLight,
    PiChartLineDownLight,
    PiDownload,
    PiCaretLeft,
    PiCaretRight
} from "react-icons/pi";
import { GiCircleForest, GiWheat } from "react-icons/gi";
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
    Text,
    useDisclosure,
    Dialog,
    NativeSelect,
    Field,
    defaultSystem,
    HoverCard
} from "@chakra-ui/react";
import { CloseButton } from "@open-pioneer/chakra-snippets/close-button";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { Geolocation } from "@open-pioneer/geolocation";
import { Legend as PioneerLegend } from "@open-pioneer/legend";
import {
    MapAnchor,
    MapContainer,
    SimpleLayer,
    useMapModel,
    DefaultMapProvider
} from "@open-pioneer/map";
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
import { OgcFeaturesVectorSourceFactory } from "@open-pioneer/ogc-features";
import { GeosphereForecasts } from "./controls/GeosphereForecasts";
import { LayerDownload } from "layerdownload";
import { ChakraProvider } from "@chakra-ui/react";
import { ForestrySelector } from "./services/ForestrySelector";
import { NutsSelector } from "./services/NutsSelector";
import { SaferPlacesFloodMap } from "saferplaces";
import { system } from "theme";


import ChartComponentCropyield from "./components/ChartComponentCropyield/ChartComponentCropyield";
import ChartComponentForestry from "./components/ChartComponentForestry";

type ActiveChartType = "crop" | "forestry" | null;

export function MapApp() {
    const mapModel = useMapModel(MAP_ID);
    const zoomService = useService<LayerZoom>("app.LayerZoom");
    const vectorSourceFactory = useService<OgcFeaturesVectorSourceFactory>(
        "ogc-features.VectorSourceFactory"
    );

    const authService = useService<AuthService>("authentication.AuthService");
    const authState = useAuthState(authService);

    const intl = useIntl();
    const measurementTitleId = useId();

    const [measurementIsActive, setMeasurementIsActive] = useState<boolean>(false);
    const [downloadIsActive, setDownloadIsActive] = useState<boolean>(false);
    const [zoomMenuOpen, setZoomMenuOpen] = useState<boolean>(false);

    const [activeChart, setActiveChart] = useState<ActiveChartType>(null);
    const [forestryLocation, setForestryLocation] = useState<string>("keszthelyi_erdeszet_vallus");
    const [nuts, setNuts] = useState<string>("AT11");

    useEffect(() => {
        document.title = intl.formatMessage({ id: "heading" });
    }, [intl]);

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
    const { open, onClose } = useDisclosure({ defaultOpen: true });

    const forestrySelector = useService<ForestrySelector>("app.ForestrySelector");
    const nutsSelector = useService<NutsSelector>("app.NutsSelector");

    const { clickedForestryLocation } = useReactiveSnapshot(
        () => ({
            clickedForestryLocation: forestrySelector.selectedLocationId
        }),
        [forestrySelector]
    );

    const { clickedNuts } = useReactiveSnapshot(
        () => ({
            clickedNuts: nutsSelector.selectedNutsId
        }),
        [nutsSelector]
    );


    useEffect(() => {
        if (clickedForestryLocation) {
            setForestryLocation(clickedForestryLocation);
            setActiveChart("forestry");
        }
    }, [clickedForestryLocation]);

    const closeChartModal = () => {
        setActiveChart(null);
        forestrySelector.clearSelection();
        nutsSelector.clearSelection();
    };

    useEffect(() => {
        if (clickedNuts) {
            setNuts(clickedNuts);
            setActiveChart("crop");
        }
    }, [clickedNuts]);

    function createPastEventLayer(
        collectionId: string,
        id: string,
        title: string,
        description: string,
        color: string
    ) {
        return new SimpleLayer({
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
    }, [authState.kind, mapModel]);

    //////////////////
    /// LayerSwipe ///
    //////////////////
    const [selectedLeftLayer, setSelectedLeftLayer] = useState<string | null>(null);
    const [selectedRightLayer, setSelectedRightLayer] = useState<string | null>(null);
    const [visibleAvailableLayers, setVisibleAvailableLayers] = useState<SimpleLayer[]>([]);

    useEffect(() => {
        if (!mapModel.map) return;

        const map = mapModel.map.olMap;
        const allLayers = mapModel.map.layers.getRecursiveLayers() as SimpleLayer[];

        const updateVisibleLayers = () => {
            const visibleLayers = allLayers.filter(
                (layer) =>
                    layer.olLayer?.getVisible?.() === true && !(layer.olLayer instanceof Group)
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
                <Notifier />
                {mapModel.map && (
                    <DefaultMapProvider map={mapModel.map}>
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
                                        <Dialog.Title>
                                            {intl.formatMessage({
                                                id: "welcome_window.header"
                                            })}
                                        </Dialog.Title>
                                    </Dialog.Header>
                                    <Dialog.CloseTrigger asChild>
                                        <CloseButton size="sm" />
                                    </Dialog.CloseTrigger>
                                    <Dialog.Body pb={6}>
                                        <Text as="b">
                                            {intl.formatMessage({
                                                id: "welcome_window.body"
                                            })}
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
                                <MapAnchor
                                    position="top-right"
                                    horizontalGap={5}
                                    verticalGap={5}
                                >
                                    <LayerSelector />
                                    <TimeSlider />
                                    <GeosphereForecasts />
                                </MapAnchor>
                                {/* zoom to region and feature info */}
                                <MapAnchor
                                    position="bottom-left"
                                    horizontalGap={5}
                                    verticalGap={5}
                                >
                                    <Flex direction="row" align="center" gap={2} flexWrap="wrap">
                                        <Button
                                            size="sm"
                                            flexShrink={0}
                                            onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
                                            aria-expanded={zoomMenuOpen}
                                        >
                                            {zoomMenuOpen ? (
                                                <PiCaretLeft />
                                            ) : (
                                                <>
                                                    {intl.formatMessage({
                                                        id: "zoom_buttons.title"
                                                    })}
                                                    <PiCaretRight />
                                                </>
                                            )}
                                        </Button>
                                        {zoomMenuOpen && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    flexShrink={0}
                                                    onClick={() =>
                                                        zoomService.zoomToVienna(mapModel.map!)
                                                    }
                                                >
                                                    {intl.formatMessage({
                                                        id: "zoom_buttons.vienna"
                                                    })}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    flexShrink={0}
                                                    onClick={() =>
                                                        zoomService.zoomToZala(mapModel.map!)
                                                    }
                                                >
                                                    {intl.formatMessage({
                                                        id: "zoom_buttons.zala"
                                                    })}
                                                </Button>
                                            </>
                                        )}
                                    </Flex>

                                    {mapModel && (
                                        <FeatureInfo
                                            mapModel={mapModel.map!}
                                            projection="EPSG:3857"
                                            layerId={""}
                                        />
                                    )}
                                </MapAnchor>

                                {/* layerswipe and legend */}
                                <MapAnchor
                                    position="top-right"
                                    horizontalGap={5}
                                    verticalGap={5}
                                >
                                    <style>{`@media (max-height: 768px) { .dnb-topright-box { max-height: calc(100vh - 250px) !important; overflow-y: auto; } }`}</style>
                                    <Flex direction="column" gap={4}>
                                        <Box
                                            className="dnb-topright-box"
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
                                            maxWidth="calc(30vw - 20px)"
                                            marginBottom={5}
                                        >
                                            <Box>
                                                <Box maxHeight={300} overflow="auto">
                                                    <Flex
                                                        alignItems="center"
                                                        flexDirection={"row"}
                                                    >
                                                        <HoverCard.Root openDelay={250} closeDelay={100} positioning={{ placement: "bottom" }}>
                                                            <HoverCard.Trigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    color="black"
                                                                    borderRadius="full"
                                                                    paddingRight={2}
                                                                    _hover={{
                                                                        transform: "scale(1.05)",
                                                                        bg: "rgba(0, 0, 0, 0.05)",
                                                                    }}
                                                                    transition="all 0.2s ease"
                                                                >
                                                                    <Box
                                                                        as="span"
                                                                        display="inline-flex"
                                                                        alignItems="center"
                                                                        justifyContent="center"
                                                                        width="20px"
                                                                        height="20px"
                                                                        borderRadius="50%"
                                                                        border="1.5px solid currentColor"
                                                                        fontFamily="serif"
                                                                        fontWeight="bold"
                                                                        fontSize="12px"
                                                                        lineHeight="1"
                                                                        pb="1px"
                                                                    >
                                                                        i
                                                                    </Box>
                                                                </Button>
                                                            </HoverCard.Trigger>
                                                            <HoverCard.Positioner>
                                                                <HoverCard.Content>
                                                                    {intl.formatMessage({
                                                                        id: "layer_swipe.description"
                                                                    })}
                                                                </HoverCard.Content>
                                                            </HoverCard.Positioner>
                                                        </HoverCard.Root>
                                                        <Text fontWeight="bold">
                                                            {intl.formatMessage({
                                                                id: "layer_swipe.title"
                                                            })}
                                                        </Text>
                                                    </Flex>
                                                    <Flex direction="row" gap={4} p={4}>
                                                        <NativeSelect.Root>
                                                            <NativeSelect.Field
                                                                placeholder={intl.formatMessage(
                                                                    {
                                                                        id: "layer_swipe.left"
                                                                    }
                                                                )}
                                                                value={
                                                                    selectedLeftLayer ?? ""
                                                                }
                                                                onChange={(e) =>
                                                                    setSelectedLeftLayer(
                                                                        e.target.value
                                                                    )
                                                                }
                                                            >
                                                                {visibleAvailableLayers.map(
                                                                    (layer) => (
                                                                        <option
                                                                            key={layer.id}
                                                                            value={layer.id}
                                                                        >
                                                                            {layer.title ||
                                                                                layer.id}
                                                                        </option>
                                                                    )
                                                                )}
                                                            </NativeSelect.Field>
                                                            <NativeSelect.Indicator />
                                                        </NativeSelect.Root>
                                                        <NativeSelect.Root>
                                                            <NativeSelect.Field
                                                                placeholder={intl.formatMessage(
                                                                    {
                                                                        id: "layer_swipe.right"
                                                                    }
                                                                )}
                                                                value={
                                                                    selectedRightLayer ?? ""
                                                                }
                                                                onChange={(e) =>
                                                                    setSelectedRightLayer(
                                                                        e.target.value
                                                                    )
                                                                }
                                                            >
                                                                {visibleAvailableLayers.map(
                                                                    (layer) => (
                                                                        <option
                                                                            key={layer.id}
                                                                            value={layer.id}
                                                                        >
                                                                            {layer.title ||
                                                                                layer.id}
                                                                        </option>
                                                                    )
                                                                )}
                                                            </NativeSelect.Field>
                                                            <NativeSelect.Indicator />
                                                        </NativeSelect.Root>
                                                    </Flex>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Flex
                                            minWidth={250}
                                            overflow="hidden"
                                            maxHeight="calc(100vh - 380px)"
                                            overflowY="auto"
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
                                    horizontalGap={5}
                                    verticalGap={5}
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
                                        <SaferPlacesFloodMap />
                                        <ToolButton
                                            label={intl.formatMessage({
                                                id: "charts.zala_crop.button_title"
                                            })}
                                            icon={<GiWheat />}
                                            onClick={() => setActiveChart("crop")}
                                        />
                                        <ToolButton
                                            label={intl.formatMessage({
                                                id: "charts.forestry.button_title"
                                            })}
                                            icon={<GiCircleForest />}
                                            onClick={() => setActiveChart("forestry")}
                                        />
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
                                                id: "measurementTitle"
                                            })}
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
                                <MapAnchor
                                    position="top-left"
                                    horizontalGap={5}
                                    verticalGap={5}
                                >
                                    <Flex
                                        direction="column"
                                        maxHeight="calc(100vh - 200px)"
                                        overflowY="auto"
                                        overflowX="visible"
                                        pr={1}
                                    >
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
                                            <Box
                                                role="dialog"
                                                aria-labelledby={measurementTitleId}
                                            >
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
                                        aria-label={intl.formatMessage({
                                            id: "ariaLabel.toc"
                                        })}
                                        marginBottom="10px"
                                        maxHeight="min(500px, calc(100vh - 330px))"
                                        overflow="auto"
                                    >
                                        <ChakraProvider value={system}>
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
                                                        {intl.formatMessage({
                                                            id: "basemapLabel"
                                                        })}
                                                    </Text>
                                                </Field.Label>
                                                <BasemapSwitcher
                                                    map={mapModel.map}
                                                    allowSelectingEmptyBasemap={true}
                                                    className="custom-basemap-switcher"
                                                />
                                            </Field.Root>
                                        </ChakraProvider>
                                    </Box>
                                    {downloadIsActive && (
                                        <LayerDownload
                                            mapID={MAP_ID}
                                            intl={intl}
                                            isOpen={downloadIsActive}
                                            onClose={() => setDownloadIsActive(false)}
                                        />
                                    )}
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
                        <CoordinateViewer map={mapModel.map} precision={2} />
                        <ScaleBar map={mapModel.map} />
                        <ScaleViewer map={mapModel.map} />
                    </Flex>
                    </DefaultMapProvider>
                )}
            </Flex>

            <Dialog.Root
                open={activeChart !== null}
                onOpenChange={closeChartModal}
                placement={"center"}
            >
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content w="80vw" maxW="80vw">
                        <Dialog.Header>
                            <Dialog.Title>
                                {activeChart === "crop" && "Crop Yield Chart"}
                                {activeChart === "forestry" && "Forestry Data Chart"}
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.CloseTrigger />
                        <Dialog.Body>
                            {activeChart === "crop" && <ChartComponentCropyield nutsId={nuts} />}
                            {activeChart === "forestry" && (
                                <ChartComponentForestry initialLocation={forestryLocation} />
                            )}
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button colorScheme="blue" mr={3} onClick={closeChartModal}>
                                Close
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
}
