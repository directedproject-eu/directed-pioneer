// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    Button,
    Flex,
    Field,
    Text,
    NativeSelect,
    useDisclosure,
    Dialog,
    HoverCard,
    ChakraProvider
} from "@chakra-ui/react";
import {
    MapAnchor,
    MapContainer,
    useMapModel,
    SimpleLayer,
    DefaultMapProvider
} from "@open-pioneer/map";
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
import { MAP_ID } from "./services";
import { useId, useMemo, useState, useEffect } from "react";
import TileLayer from "ol/layer/Tile";
import { Measurement } from "@open-pioneer/measurement";
import OSM from "ol/source/OSM";
import { GiWheat } from "react-icons/gi";
import { PiRulerLight, PiDownload } from "react-icons/pi";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { Navbar } from "navbar";
import { FeatureInfo } from "featureinfo";
import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import Layer from "ol/layer/Layer";
import { Legend } from "@open-pioneer/legend";
import Swipe from "ol-ext/control/Swipe";
import ChartComponentRhineErft from "./Components/ChartComponentRhineErft";
import { Group } from "ol/layer";
import { LayerDownload } from "layerdownload";
import { system } from "theme";
import { useService } from "open-pioneer:react-hooks";
import { Vector as VectorLayer } from "ol/layer.js";
import type { PackageIntl } from "@open-pioneer/runtime";
import { OgcFeaturesVectorSourceFactory } from "@open-pioneer/ogc-features";
import { AuthService, useAuthState } from "@open-pioneer/authentication";

interface PastEventLayerConfig {
    /** Collection below the protected pygeoapi endpoint. */
    collectionId: string;
    id: string;
    /** Suffix of the i18n key under `map.legend.event_variables`. */
    titleKey: string;
    description: string;
    color: string;
}

/**
 * Recorded events in the Zala region. Only available to authenticated users, which is why
 * these layers are added at runtime rather than declared in `MapProvider`.
 */
const PAST_EVENT_LAYERS: PastEventLayerConfig[] = [
    {
        collectionId: "zala/events/damage/storm",
        id: "storm_damage",
        titleKey: "storm_damage",
        description: "Storm damage",
        color: "black"
    },
    {
        collectionId: "zala/events/damage/water",
        id: "water_damage",
        titleKey: "water_damage",
        description: "Water damage",
        color: "blue"
    },
    {
        collectionId: "zala/events/fires/forest_vegetation",
        id: "forest_vegetation_fires",
        titleKey: "forest_and_vegetation_fire",
        description: "Forest and vegetation fires",
        color: "red"
    },
    {
        collectionId: "zala/events/timber_cutting",
        id: "timber_cutting",
        titleKey: "tree_clearing",
        description: "Tree clearing",
        color: "green"
    }
];

/**
 * Builds one past-event layer.
 *
 * Lives outside the component on purpose: as a function declared in the body it would be
 * recreated on every render, and could therefore never appear in the dependencies of the
 * effect that uses it.
 */
function createPastEventLayer(
    config: PastEventLayerConfig,
    intl: PackageIntl,
    vectorSourceFactory: OgcFeaturesVectorSourceFactory
): SimpleLayer {
    return new SimpleLayer({
        id: config.id,
        title: intl.formatMessage({ id: `map.legend.event_variables.${config.titleKey}` }),
        description: config.description,
        visible: true,
        olLayer: new VectorLayer({
            source: vectorSourceFactory.createVectorSource({
                baseUrl: "https://directed.dev.52north.org/protected",
                collectionId: config.collectionId,
                crs: "http://www.opengis.net/def/crs/EPSG/0/3857",
                limit: 5000,
                additionalOptions: {}
            }),
            style: {
                "circle-radius": 8.0,
                "circle-fill-color": config.color,
                "circle-stroke-color": "white",
                "circle-stroke-width": 0.5
            },
            properties: { title: "GeoJSON Layer" }
        }),
        // `color` is the single definition of this event's colour: it styles the points
        // here, EventLayerLegend paints its dot from it, and LayerHighlighter restores
        // it when the pointer leaves the legend entry.
        attributes: {
            // legend: { Component: EventLayerLegend },
            eventColor: config.color
        },
        isBaseLayer: false
    });
}

export function MapApp() {
    const { open: isOpenChart, onClose: onCloseChart, onOpen: onOpenChart } = useDisclosure();

    const intl = useIntl();
    const measurementTitleId = useId();
    const mapModel = useMapModel(MAP_ID);
    const [activeLayerIds, setActiveLayerIds] = useState<string[]>([]); //wms feature info

    const [measurementIsActive, setMeasurementIsActive] = useState<boolean>(false);
    const [downloadIsActive, setDownloadIsActive] = useState<boolean>(false);
    const vectorSourceFactory = useService<OgcFeaturesVectorSourceFactory>(
        "ogc-features.VectorSourceFactory"
    );

    // Authentication 
    const authService = useService<AuthService>("authentication.AuthService");
    const authState = useAuthState(authService);

    useEffect(() => {
        document.title = intl.formatMessage({ id: "title" });
    }, [intl]);

    function toggleMeasurement() {
        setMeasurementIsActive(!measurementIsActive);
    }

    function toggleDownload() {
        setDownloadIsActive(!downloadIsActive);
    }

    useEffect(() => {
        const map = mapModel?.map;
        if (authState.kind !== "authenticated" || !map) {
            return;
        }

        const layers = PAST_EVENT_LAYERS.map((config) =>
            createPastEventLayer(config, intl, vectorSourceFactory)
        );
        layers.forEach((layer) => map.layers.addLayer(layer));

        // Not for unmount -- MapApp is the root component and never unmounts on its own.
        // This runs when a dependency changes, and removing what this run added is what
        // keeps the next one from hitting "Layer id 'storm_damage' is not unique".
        return () => {
            layers.forEach((layer) => map.layers.removeLayer(layer));
        };
    }, [authState.kind, mapModel, intl, vectorSourceFactory]);

    //////////////////
    /// LayerSwipe ///
    /////////////////
    const [selectedLeftLayer, setSelectedLeftLayer] = useState<string | null>(null);
    const [selectedRightLayer, setSelectedRightLayer] = useState<string | null>(null);
    const [visibleAvailableLayers, setVisibleAvailableLayers] = useState<SimpleLayer[]>([]); //filter for visible layers

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

    const overviewMapLayer = useMemo(
        () =>
            new TileLayer({
                source: new OSM()
            }),
        []
    );

    return (
        <Flex height="100%" direction="column" overflow="hidden">
            <Navbar authService={authService}></Navbar>
            {/* <Notifier position="bottom" /> */}
            <Notifier/>
            {mapModel.map && (
                <DefaultMapProvider map={mapModel.map}>
                <Flex flex="1" direction="column" position="relative">
                {authState.kind !== "pending" && (
                    <MapContainer
                        map={mapModel.map}
                        role="main"
                        aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                    >
                        <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                            <Flex direction="column" gap={4}>
                                <Box
                                    backgroundColor="white"
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    padding={2}
                                    boxShadow="lg"
                                    aria-label={intl.formatMessage({
                                        id: "ariaLabel.topRight"
                                    })}
                                    maxHeight={615}
                                    maxWidth={430}
                                    overflow="hidden"
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
                                                        placeholder={intl.formatMessage({ id: "layer_swipe.left" })}
                                                        value={selectedLeftLayer ?? ""}
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
                                                        placeholder={intl.formatMessage({ id: "layer_swipe.right" })}
                                                        value={selectedRightLayer ?? ""}
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
                                    maxHeight={400}
                                    maxWidth={250}
                                    overflow="auto"
                                    borderRadius="md"
                                    boxShadow="lg"
                                    alignSelf="flex-end"
                                >
                                    <Legend map={mapModel.map} />
                                </Flex>
                            </Flex>
                            {mapModel && (
                                <FeatureInfo
                                    mapModel={mapModel.map!}
                                    projection="EPSG:3857"
                                    layerId={""}
                                />
                            )}
                        </MapAnchor>

                        <MapAnchor
                            position="bottom-right"
                            horizontalGap={5}
                            verticalGap={5}
                        >
                            <Flex
                                aria-label={intl.formatMessage({
                                    id: "ariaLabel.bottomRight"
                                })}
                                direction="row"
                                gap={1}
                                padding={1}
                            >
                                <ToolButton
                                    label={intl.formatMessage({
                                        id: "charts.button_title"
                                    })}
                                    icon={<GiWheat />}
                                    onClick={onOpenChart}
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
                            {measurementIsActive && (
                                <Box
                                    marginBottom={2}
                                    backgroundColor="white"
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    padding={2}
                                    boxShadow="lg"
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
                                maxHeight={500}
                                overflow="auto"
                            >
                                <ChakraProvider value={system}>
                                    <Toc
                                        map={mapModel.map}
                                        showBasemapSwitcher={false}
                                        showTools={true}
                                    />
                                </ChakraProvider>
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
                            {downloadIsActive && (
                                <LayerDownload
                                    mapID={MAP_ID}
                                    intl={intl}
                                    isOpen={downloadIsActive}
                                    onClose={() => setDownloadIsActive(false)}
                                />
                            )}
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

            <Dialog.Root open={isOpenChart} onOpenChange={onCloseChart} placement="center">
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content w="80vw" maxW="80vw">
                        <Dialog.Header>
                            <Dialog.Title>
                            {intl.formatMessage({ id: "charts.chart_title" })}
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.CloseTrigger />
                        <Dialog.Body>
                            <ChartComponentRhineErft></ChartComponentRhineErft>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button colorScheme="blue" mr={3} onClick={onCloseChart}>
                                Close
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Flex>
    );
}
