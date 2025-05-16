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
    Spacer
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
import { PiRulerLight } from "react-icons/pi";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { Legend } from "@open-pioneer/legend";
import { Navbar } from "navbar";
import { LayerSwipe } from "layerswipe";
import { LayerZoom } from "./services/LayerZoom";
import { FeatureInfo } from "featureinfo";
import { useService } from "open-pioneer:react-hooks";
// import ExpandableBox from "./Components/ExpandableBox";
import { Forecasts } from "./controls/Forecasts";
import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import { TaxonomyInfo } from "taxonomy";

export function MapApp() {
    const intl = useIntl();
    const measurementTitleId = useId();
    const mapModel = useMapModel("main");
    const zoomService = useService<LayerZoom>("app.LayerZoom"); //municipal layer zoom service
    const [activeLayerIds, setActiveLayerIds] = useState<string[]>([]); //feature info
    const [activeKeyword, setActiveKeyword] = useState<string | null>(null); //taxonomy


    //////////////////
    /// LayerSwipe ///
    /////////////////
    const [availableLayers, setAvailableLayers] = useState<SimpleLayer[]>([]);
    const [selectedLeftLayer, setSelectedLeftLayer] = useState<string | null>(null);
    const [selectedRightLayer, setSelectedRightLayer] = useState<string | null>(null);
    const [leftLayers, setLeftLayers] = useState<Layer[]>();
    const [rightLayers, setRightLayers] = useState<Layer[]>();
    const [sliderValue, setSliderValue] = useState<number>(50);
    const [visibleAvailableLayers, setVisibleAvailableLayers] = useState<SimpleLayer[]>([]); //filter for visible layers

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

    //////////////////
    /// LayerSwipe ///
    /////////////////

    useEffect(() => {
        if (!mapModel.map) return;

        //get all layers from the mapmodel
        const layers = mapModel.map.layers.getRecursiveLayers() as SimpleLayer[];
        setAvailableLayers(layers);

        //set selected layers
        if (selectedLeftLayer && selectedRightLayer) {
            const leftLayer = (mapModel.map.layers.getLayerById(selectedLeftLayer) as SimpleLayer)
                ?.olLayer as TileLayer;
            const rightLayer = (mapModel.map.layers.getLayerById(selectedRightLayer) as SimpleLayer)
                ?.olLayer as TileLayer;

            if (leftLayer && rightLayer) {
                setLeftLayers([leftLayer]);
                setRightLayers([rightLayer]);
            }
        }

        //set only visible layers in the dropdowns for left and right layer
        const updateVisibleLayers = () => {
            const visibleLayers = layers.filter((layer) => layer.olLayer?.getVisible?.() === true);
            setVisibleAvailableLayers(visibleLayers);
        };

        updateVisibleLayers(); //filter

        const eventKeys = layers
            .map((layer) => {
                const olLayer = layer.olLayer;
                if (!olLayer || typeof olLayer.on !== "function") return null;
                return olLayer.on("change:visible", updateVisibleLayers);
            })
            .filter((k): k is EventsKey => !!k);

        return () => {
            eventKeys.forEach(unByKey);
        };
    }, [mapModel, selectedLeftLayer, selectedRightLayer]);

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
                            RWL The Capital Region of Denmark
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
                        </MapAnchor>

                        <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
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
                                            {/* {intl.formatMessage({ id: "basemapLabel" })} */}
                                            Basemap
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
                            >
                                <Text fontWeight={600}> Description </Text>
                                <Text>
                                    This platform serves as a way to learn about 
                                    <Spacer/>
                                    <Button variant="link" color="#2e9ecc" onClick={() => setActiveKeyword("Disaster Risk")}>
                                        disaster risk 
                                    </Button>
                                    {" "} in the lens of {" "}
                                    <Button variant="link" color="#2e9ecc" onClick={() => setActiveKeyword("Climate Change")}>
                                        climate change
                                    </Button>
                                    .
                                </Text>
                            </Box>
                        </MapAnchor>
                        {/* zoom to municipalities */}
                        <MapAnchor position="bottom-left" horizontalGap={15} verticalGap={60}>
                            <VStack align="stretch" spacing={2}>
                                <Button
                                    size="sm"
                                    onClick={() => zoomService.zoomToEgedal(mapModel.map!)}
                                >
                                    Zoom to Egedal
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => zoomService.zoomToFrederikssund(mapModel.map!)}
                                >
                                    Zoom to Frederikssund
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => zoomService.zoomToHalsnaes(mapModel.map!)}
                                >
                                    Zoom to Halsnaes
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => zoomService.zoomToLejre(mapModel.map!)}
                                >
                                    Zoom to Lejre
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => zoomService.zoomToRoskilde(mapModel.map!)}
                                >
                                    Zoom to Roskilde
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
                                        <TaxonomyInfo keyword={activeKeyword} onClose={() => setActiveKeyword(null)} />
                                    </Flex>
                                )}
                                <Flex
                                    maxHeight={400}
                                    maxWidth={250}
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
                                <ToolButton
                                    label={intl.formatMessage({ id: "measurementTitle" })}
                                    icon={<PiRulerLight />}
                                    isActive={measurementIsActive}
                                    onClick={toggleMeasurement}
                                />
                                <Geolocation mapId={MAP_ID1} />
                                <InitialExtent mapId={MAP_ID1} />
                                <ZoomIn mapId={MAP_ID1} />
                                <ZoomOut mapId={MAP_ID1} />
                            </Flex>
                        </MapAnchor>
                    </MapContainer>
                    {/*END MAP_ID1*/}

                    {/* add layerswipe slider below map container  */}
                    <Box
                        position="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                        padding={4}
                        backgroundColor="white"
                        borderTop={1}
                        display="flex"
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                    >
                        {leftLayers && rightLayers && mapModel.map && (
                            <LayerSwipe
                                map={mapModel.map}
                                sliderValue={sliderValue}
                                onSliderValueChanged={(newValue) => {
                                    setSliderValue(newValue);
                                }}
                                leftLayers={leftLayers}
                                rightLayers={rightLayers}
                                style={{ width: "100%", height: "100%" }}
                            />
                        )}
                    </Box>
                </Flex>
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
