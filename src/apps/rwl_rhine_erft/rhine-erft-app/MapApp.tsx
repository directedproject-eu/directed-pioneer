// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    Button,
    Flex,
    Field,
    Text,
    NativeSelect,
    Spacer,
    useDisclosure,
    Dialog,
    HoverCard
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
import { PiChartLineDownLight, PiRulerLight, PiDownload } from "react-icons/pi";
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

export function MapApp() {
    const { open: isOpenChart, onClose: onCloseChart, onOpen: onOpenChart } = useDisclosure();

    const intl = useIntl();
    const measurementTitleId = useId();
    const mapModel = useMapModel(MAP_ID);
    const [activeLayerIds, setActiveLayerIds] = useState<string[]>([]); //wms feature info

    const [measurementIsActive, setMeasurementIsActive] = useState<boolean>(false);
    const [downloadIsActive, setDownloadIsActive] = useState<boolean>(false);

    function toggleMeasurement() {
        setMeasurementIsActive(!measurementIsActive);
    }

    function toggleDownload() {
        setDownloadIsActive(!downloadIsActive);
    }

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
            <Navbar />
            <Notifier position="bottom" />
            {mapModel.map && (
                <DefaultMapProvider map={mapModel.map}>
                    <TitledSection
                        title={
                            <Box
                                role="region"
                                aria-label={intl.formatMessage({ id: "ariaLabel.header" })}
                                textAlign="left"
                                py={1}
                            >
                                <SectionHeading size={"md"} color="#2e9ecc" mt={6} mb={6}>
                                    {intl.formatMessage({ id: "title" })}
                                </SectionHeading>
                            </Box>
                        }
                    >
                        <Flex flex="1" direction="column" position="relative">
                            <MapContainer
                                map={mapModel.map}
                                role="main"
                                aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                            >
                                <MapAnchor position="top-right" horizontalGap={5} verticalGap={10}>
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
                                    horizontalGap={10}
                                    verticalGap={30}
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
                                            icon={<PiChartLineDownLight />}
                                            onClick={onOpenChart}
                                        />
                                        <ToolButton
                                            label={intl.formatMessage({ id: "measurementTitle" })}
                                            icon={<PiRulerLight />}
                                            active={measurementIsActive}
                                            onClick={toggleMeasurement}
                                        />
                                        <ToolButton
                                            label={intl.formatMessage({
                                                id: "map.download.button"
                                            })}
                                            icon={<PiDownload />}
                                            active={downloadIsActive}
                                            onClick={toggleDownload}
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
                                    >
                                        <Toc
                                            map={mapModel.map}
                                            showBasemapSwitcher={false}
                                            showTools={true}
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
                </DefaultMapProvider>
            )}

            <Dialog.Root open={isOpenChart} onOpenChange={onCloseChart} placement="center">
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content w="80vw" maxW="80vw">
                        <Dialog.Header fontSize="xl" fontWeight={"bold"}>
                            {intl.formatMessage({ id: "charts.chart_title" })}
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
