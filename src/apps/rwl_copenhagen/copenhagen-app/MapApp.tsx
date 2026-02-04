// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    VStack,
    Text,
    Select,
    Spacer, 
    IconButton, 
    Popover, 
    PopoverBody, 
    PopoverContent, 
    PopoverTrigger,
    PopoverArrow
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
import { MAP_ID1 } from "./services"; //add MAP_ID2 for shared view again
import { useId, useMemo, useState, useEffect } from "react";
import TileLayer from "ol/layer/Tile";
import Layer from "ol/layer/Layer";
import OSM from "ol/source/OSM";
import { PiRulerLight, PiDownload } from "react-icons/pi";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { Legend } from "@open-pioneer/legend";
import { Navbar } from "navbar";
import { LayerZoom } from "./services/LayerZoom";
import { FeatureInfo } from "featureinfo";
import { useService } from "open-pioneer:react-hooks";
// import ExpandableBox from "./Components/ExpandableBox";
import { Forecasts } from "./controls/Forecasts";
import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import { TaxonomyInfo } from "taxonomy";
import { SaferPlacesFloodMap } from "saferplaces";
// import { ModelClient } from "modelclient";
import Swipe from "ol-ext/control/Swipe";
import { ModelClient } from "mcdm";
// import DownloadLayer from "./Components/DownloadLayer";
import { Group } from "ol/layer";
import { FloodSelector } from "./controls/FloodSelector";
import { FloodHandler } from "./services/FloodHandler";
import { FloodSlider } from "./controls/FloodSlider";
import { FaInfo } from "react-icons/fa";

import { LayerDownload } from "layerdownload";


export function MapApp() {
    const intl = useIntl();
    const measurementTitleId = useId();
    const mapModel = useMapModel(MAP_ID1);
    const zoomService = useService<LayerZoom>("app.LayerZoom"); //municipal layer zoom service
    const [activeLayerIds, setActiveLayerIds] = useState<string[]>([]); //feature info
    const [activeKeyword, setActiveKeyword] = useState<string | null>(null); //taxonomy
    const prepSrvc = useService<FloodHandler>("app.FloodHandler"); // Rainfall + Coastal Slider 


    const overviewMapLayer = useMemo(
        () =>
            new TileLayer({
                source: new OSM()
            }),
        []
    );

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
            const visibleLayers = allLayers.filter((layer) => {
                const ol = layer.olLayer;
                return ol?.getVisible?.() === true && !(ol instanceof Group);
            });
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
        <Flex height="100%" direction="column" overflow="hidden">
            <Navbar />
            <Notifier position="bottom" />
            {/* <ModelClient /> */}
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
                    {/*MAP_ID1*/}
                    <MapContainer
                        mapId={MAP_ID1}
                        role="main"
                        aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                    >
                        <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                            <Forecasts />
                            <FloodSlider/>
                        </MapAnchor>

                        <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
                            <FloodSelector/>
                            {/* <Flex>
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
                                                <Measurement mapId={MAP_ID1} />
                                            </TitledSection>
                                        </Box>
                                    </Box>
                                )}
                                <ExpandableBox title="Analysis">
                                    <>Example Analysis Text</>
                                </ExpandableBox>
                            </Flex> */}
                            {/*add Table of Contents (Toc) and legend */}
                            <Box
                                display="flex"
                                flexDirection="column"
                                backgroundColor="white"
                                borderWidth="1px"
                                borderRadius="lg"
                                padding={2}
                                boxShadow="lg"
                                role="dialog"
                                // aria-label={intl.formatMessage({ id: "ariaLabel.toc" })}
                                maxHeight={500}
                                overflow="auto"
                            >
                                <Toc
                                    mapId={MAP_ID1}
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
                                        mapId={MAP_ID1}
                                        allowSelectingEmptyBasemap={true}
                                    />
                                </FormControl>
                            </Box>
                            <Box
                                flexDirection="column"
                                backgroundColor="white"
                                borderWidth="1px"
                                borderRadius="lg"
                                padding={2}
                                boxShadow="lg"
                                role="dialog"
                                maxHeight={100}
                                overflow="auto"
                                marginTop={2}
                            >
                                <Text fontWeight={600}>
                                    {" "}
                                    {intl.formatMessage({ id: "description.title" })}{" "}
                                </Text>
                                <Text>
                                    {intl.formatMessage({ id: "description.text1" })}
                                    <Spacer />
                                    <Button
                                        variant="link"
                                        color="#2e9ecc"
                                        onClick={() => setActiveKeyword("Disaster Risk")}
                                    >
                                        {intl.formatMessage({ id: "description.keyword1" })}
                                    </Button>{" "}
                                    {intl.formatMessage({ id: "description.text2" })}{" "}
                                    <Button
                                        variant="link"
                                        color="#2e9ecc"
                                        onClick={() => setActiveKeyword("Climate Change")}
                                    >
                                        {intl.formatMessage({ id: "description.keyword2" })}
                                    </Button>
                                    .
                                </Text>
                            </Box>
                            {/* {downloadIsActive && <DownloadLayer mapID={MAP_ID1} />} */}
                            {downloadIsActive && <LayerDownload mapID={MAP_ID1} intl={intl} isOpen={downloadIsActive} onClose={() => setDownloadIsActive(false)}/>}
                        </MapAnchor>
                        {/* zoom to municipalities */}
                        <MapAnchor position="bottom-left" horizontalGap={15} verticalGap={60}>
                            <VStack align="stretch" spacing={2}>
                                <Button
                                    size="sm"
                                    onClick={() => zoomService.zoomToEgedal(mapModel.map!)}
                                >
                                    {intl.formatMessage({ id: "zoom_buttons.egedal" })}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => zoomService.zoomToFrederikssund(mapModel.map!)}
                                >
                                    {intl.formatMessage({ id: "zoom_buttons.frederikssund" })}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => zoomService.zoomToHalsnaes(mapModel.map!)}
                                >
                                    {intl.formatMessage({ id: "zoom_buttons.halsnaes" })}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => zoomService.zoomToLejre(mapModel.map!)}
                                >
                                    {intl.formatMessage({ id: "zoom_buttons.lejre" })}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => zoomService.zoomToRoskilde(mapModel.map!)}
                                >
                                    {intl.formatMessage({ id: "zoom_buttons.roskilde" })}
                                </Button>
                            </VStack>

                            {/* {mapModel &&
                                activeLayerIds.length > 0 &&
                                activeLayerIds.map((layerId) => (
                                    <FeatureInfo
                                        key={layerId}
                                        mapModel={mapModel.map!}
                                        layerId={layerId}
                                        projection="EPSG:3857"
                                    />
                                ))} */}

                            {mapModel && (
                                <FeatureInfo
                                    mapModel={mapModel.map!}
                                    projection="EPSG:3857"
                                    layerId={""}
                                />
                            )}
                        </MapAnchor>

                        {/*layerswipe layers and legend*/}
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
                                    {/* <Flex direction="column" gap={4}> */}
                                    <Box>
                                        <Box maxHeight={300} overflow="auto">
                                            <Flex
                                                direction="column"
                                                justifyContent="center"
                                                alignItems="center"
                                            ></Flex>
                                            <Flex alignItems="center" mt={1}>
                                                <Popover trigger="hover" openDelay={250} closeDelay={100} placement="top">
                                                    <PopoverTrigger>
                                                        <IconButton
                                                            marginLeft="2px" 
                                                            size="s"
                                                            aria-label="Info"
                                                            icon={<FaInfo />}
                                                            variant="ghost"
                                                            color="black"
                                                        />
                                                    </PopoverTrigger>
                                                    <PopoverContent>
                                                        <PopoverArrow />
                                                        <PopoverBody overflow="auto">
                                                            {intl.formatMessage({id: "layer_swipe.description"})}
                                                        </PopoverBody>
                                                    </PopoverContent>
                                                </Popover>
                                                <Text fontWeight="bold" mt={4}>
                                                    {intl.formatMessage({ id: "layer_swipe.title" })}
                                                </Text>
                                            </Flex>
                                            <Spacer />
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
                                {/* <Flex>
                                    <Text
                                        fontSize={14}
                                        fontWeight="semibold"
                                        textAlign="right"
                                        width="97%"
                                    >
                                        👇Scroll Down to View all Selected Layer Legends
                                    </Text>
                                </Flex> */}
                                {/* <Flex>
                                    <TaxonomyInfo keyword="food security" />
                                </Flex> */}
                                {activeKeyword && (
                                    <Flex>
                                        <TaxonomyInfo
                                            keyword={activeKeyword}
                                            onClose={() => setActiveKeyword(null)}
                                        />
                                    </Flex>
                                )}
                                <Flex
                                    maxHeight={800}
                                    // maxWidth={250}
                                    overflow="auto"
                                    borderRadius="md"
                                    boxShadow="lg"
                                    // marginLeft="auto"
                                    alignSelf="flex-end"
                                >
                                    <Legend mapId={MAP_ID1} />
                                </Flex>
                            </Flex>
                        </MapAnchor>

                        <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={60}>
                            <Flex
                                role="bottom-right"
                                aria-label={intl.formatMessage({ id: "ariaLabel.bottomRight" })}
                                direction="row"
                                gap={1}
                                padding={1}
                            >
                                {/* SaferPlaces flood model dialog */}
                                <ModelClient />
                                <SaferPlacesFloodMap />
                                <ToolButton
                                    label={intl.formatMessage({ id: "measurementTitle" })}
                                    icon={<PiRulerLight />}
                                    isActive={measurementIsActive}
                                    onClick={toggleMeasurement}
                                />
                                <ToolButton
                                    label={intl.formatMessage({ id: "map.download.heading" })}
                                    icon={<PiDownload />}
                                    isActive={downloadIsActive}
                                    onClick={toggleDownload}
                                />
                                <Geolocation mapId={MAP_ID1} />
                                <InitialExtent mapId={MAP_ID1} />
                                <ZoomIn mapId={MAP_ID1} />
                                <ZoomOut mapId={MAP_ID1} />
                            </Flex>
                        </MapAnchor>
                    </MapContainer>
                    {/*END MAP_ID1*/}
                </Flex>
                {/* <FloodSlider/> */}
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
            </TitledSection>
        </Flex>
    );
}
