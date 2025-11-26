// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Text,
    Select,
    Spacer,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalHeader,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    ModalFooter
} from "@open-pioneer/chakra-integration";
import { MapAnchor, MapContainer, useMapModel, SimpleLayer } from "@open-pioneer/map";
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
import DownloadLayer from "./Components/DownloadLayer";
import { Group } from "ol/layer";

export function MapApp() {
    const { isOpen: isOpenChart, onClose: onCloseChart, onOpen: onOpenChart } = useDisclosure();

    const intl = useIntl();
    const measurementTitleId = useId();
    const mapModel = useMapModel("main");
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
            <TitledSection
                title={
                    <Box
                        role="region"
                        aria-label={intl.formatMessage({ id: "ariaLabel.header" })}
                        textAlign="left"
                        py={1}
                    >
                        <SectionHeading size={"md"} color="#2e9ecc" mt={6} mb={6}>
                            RWL The Rhine Erft Region
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
                                <Toc mapId={MAP_ID} showBasemapSwitcher={false} showTools={true} />
                                <FormControl>
                                    <FormLabel mt={2}>
                                        <Text as="b">
                                            {/* {intl.formatMessage({ id: "basemapLabel" })} */}
                                            Basemap
                                        </Text>
                                    </FormLabel>
                                    <BasemapSwitcher
                                        mapId={MAP_ID}
                                        allowSelectingEmptyBasemap={true}
                                    />
                                </FormControl>
                            </Box>
                            {downloadIsActive && <DownloadLayer mapID={MAP_ID} />}
                        </MapAnchor>

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
                                                Operational Layers are viewable for comparison
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
                                <Flex
                                    maxHeight={400}
                                    maxWidth={250}
                                    overflow="auto"
                                    borderRadius="md"
                                    boxShadow="lg"
                                    alignSelf="flex-end"
                                >
                                    <Legend mapId={MAP_ID} />
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

                        <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                            <Flex
                                role="bottom-right"
                                aria-label={intl.formatMessage({ id: "ariaLabel.bottomRight" })}
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
                                    isActive={measurementIsActive}
                                    onClick={toggleMeasurement}
                                />
                                <ToolButton
                                    label={intl.formatMessage({ id: "map.download.button" })}
                                    icon={<PiDownload />}
                                    isActive={downloadIsActive}
                                    onClick={toggleDownload}
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

            <Modal isOpen={isOpenChart} onClose={onCloseChart} size={"full"}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Rhine-Erft Chart</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <ChartComponentRhineErft></ChartComponentRhineErft>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onCloseChart}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
}
