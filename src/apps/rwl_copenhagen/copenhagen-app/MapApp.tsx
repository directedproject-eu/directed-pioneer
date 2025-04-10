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
import { OverviewMap } from "@open-pioneer/overview-map";
import { Toc } from "@open-pioneer/toc";
import { MAP_ID1 } from "./services"; //add MAP_ID2 for shared view again
import { useId, useMemo, useState, useEffect } from "react";
import TileLayer from "ol/layer/Tile";
import Layer from "ol/layer/Layer";
import { Measurement } from "@open-pioneer/measurement";
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

export function MapApp() {
    const intl = useIntl();
    const measurementTitleId = useId();
    const mapModel = useMapModel("main");
    const zoomService = useService<LayerZoom>("app.LayerZoom"); //municipal layer zoom service
    const [activeLayerIds, setActiveLayerIds] = useState<string[]>([]); //feature info

    //////////////////
    /// LayerSwipe ///
    /////////////////
    const [availableLayers, setAvailableLayers] = useState<SimpleLayer[]>([]);
    const [selectedLeftLayer, setSelectedLeftLayer] = useState<string | null>(null);
    const [selectedRightLayer, setSelectedRightLayer] = useState<string | null>(null);
    const [leftLayers, setLeftLayers] = useState<Layer[]>();
    const [rightLayers, setRightLayers] = useState<Layer[]>();
    const [sliderValue, setSliderValue] = useState<number>(50);

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

    ///////////////////
    ///FeatureInfo////
    /////////////////

    useEffect(() => {
        if (mapModel?.map) {
            const layers = mapModel.map.layers.getRecursiveLayers() as SimpleLayer[];
            const activeLayers = layers
                .filter((layer: SimpleLayer) => layer.olLayer.getVisible())
                .map((layer: SimpleLayer) => layer.olLayer.get("title"));

            setActiveLayerIds(activeLayers);
        }
    }, [mapModel]);

    //////////////////
    /// LayerSwipe ///
    /////////////////
    useEffect(() => {
        if (mapModel.map) {
            const layers = mapModel.map.layers.getRecursiveLayers() as SimpleLayer[];
            setAvailableLayers(layers);

            if (selectedLeftLayer && selectedRightLayer) {
                const leftLayer = (
                    mapModel.map.layers.getLayerById(selectedLeftLayer) as SimpleLayer
                )?.olLayer as TileLayer;
                const rightLayer = (
                    mapModel.map.layers.getLayerById(selectedRightLayer) as SimpleLayer
                )?.olLayer as TileLayer;

                if (leftLayer && rightLayer) {
                    setLeftLayers([leftLayer]);
                    setRightLayers([rightLayer]);
                }
            }
        }
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
                            <div
                                style={{
                                    width: window.innerWidth * 0.4,
                                    marginLeft: window.innerWidth * 0.3,
                                    marginRight: window.innerWidth * 0.3,
                                    borderRadius: "10px",
                                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                                    marginTop: "5px"
                                }}
                            >
                                <Forecasts />
                            </div>
                        </MapAnchor>

                        <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
                            <Flex>
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
                                {/* <ExpandableBox title="Analysis">
                                    <>Example Analysis Text</>
                                </ExpandableBox> */}
                            </Flex>
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
                                aria-label={intl.formatMessage({ id: "ariaLabel.toc" })}
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
                                {/* <Legend mapId={MAP_ID1} /> */}
                            </Box>
                        </MapAnchor>
                        {/* zoom to municipalities */}
                        <MapAnchor position="bottom-left" horizontalGap={15} verticalGap={60}>
                            {/* {mapModel && (
                                <FeatureInfo
                                    mapModel={mapModel.map!}
                                    layerId="pluvial_100yrcp4-5_wd_max"
                                    projection="EPSG:3857"
                                />
                            )} */}

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

                            {mapModel &&
                                activeLayerIds.length > 0 &&
                                activeLayerIds.map((layerId) => (
                                    <FeatureInfo
                                        key={layerId}
                                        mapModel={mapModel.map!}
                                        layerId={layerId}
                                        projection="EPSG:3857"
                                    />
                                ))}
                        </MapAnchor>

                        {/*layerswipe layers, overview map, and legend*/}
                        <MapAnchor position="top-right" horizontalGap={5} verticalGap={10}>
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
                                <Flex direction="column" gap={4}>
                                    {/* overview map box */}
                                    <Box>
                                        <Box maxHeight={300} overflow="auto">
                                            <Flex
                                                direction="column"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                {/* <OverviewMap
                                                    mapId={MAP_ID1}
                                                    olLayer={overviewMapLayer}
                                                    width={390}
                                                /> */}
                                            </Flex>
                                            <Text fontWeight="bold" mt={4}>
                                                Select Layers for Comparison:
                                            </Text>
                                            <Flex direction="row" gap={4} p={4}>
                                                <Select
                                                    placeholder="Select Left Layer"
                                                    onChange={(e) =>
                                                        setSelectedLeftLayer(e.target.value)
                                                    }
                                                >
                                                    {availableLayers.map((layer) => (
                                                        <option key={layer.id} value={layer.id}>
                                                            {layer.title || layer.id}
                                                        </option>
                                                    ))}
                                                </Select>

                                                <Select
                                                    placeholder="Select Right Layer"
                                                    onChange={(e) =>
                                                        setSelectedRightLayer(e.target.value)
                                                    }
                                                >
                                                    {availableLayers.map((layer) => (
                                                        <option key={layer.id} value={layer.id}>
                                                            {layer.title || layer.id}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </Flex>
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
                                    </Box>
                                </Flex>
                            </Box>
                            <Flex>
                                <Text 
                                    fontSize={14} 
                                    fontWeight="semibold" 
                                    textAlign="right"
                                    width="97%"
                                >
                                    👇Scroll down to view all selected layer legends
                                </Text>
                            </Flex>
                            <Flex
                                maxHeight={500} 
                                maxWidth={250}
                                boxShadow="lg"
                                overflow="auto" 
                                borderRadius="md" 
                                marginLeft="auto"
                            >
                                <Legend mapId={MAP_ID1} />
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
