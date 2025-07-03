// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useId, useState } from "react";
import { PiRulerLight } from "react-icons/pi";
import { EventsKey } from "ol/events";
import Layer from "ol/layer/Layer";
import { unByKey } from "ol/Observable";
import TileLayer from "ol/layer/Tile";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import {
    Box,
    Flex,
    FormControl,
    FormLabel,
    Select,
    Spacer,
    Text
} from "@open-pioneer/chakra-integration";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { Geolocation } from "@open-pioneer/geolocation";
import { Legend } from "@open-pioneer/legend";
import { MapAnchor, MapContainer, SimpleLayer, useMapModel } from "@open-pioneer/map";
import { InitialExtent, ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { ToolButton } from "@open-pioneer/map-ui-components";
import { Measurement } from "@open-pioneer/measurement";
import { Notifier } from "@open-pioneer/notifier";
import { useIntl } from "open-pioneer:react-hooks";
import { SectionHeading, TitledSection } from "@open-pioneer/react-utils";
import { ScaleBar } from "@open-pioneer/scale-bar";
import { ScaleViewer } from "@open-pioneer/scale-viewer";
import { Toc } from "@open-pioneer/toc";
import { FeatureInfo } from "featureinfo";
import { LayerSwipe } from "layerswipe";
import { Navbar } from "navbar";
import { MAP_ID } from "./services";

export function MapApp() {
    const intl = useIntl();
    const measurementTitleId = useId();
    const mapModel = useMapModel(MAP_ID);

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
    const [isLayerSwipeActive, setIsLayerSwipeActive] = useState<boolean>(false); //new render layerswipe

    const [measurementIsActive, setMeasurementIsActive] = useState<boolean>(false);
    function toggleMeasurement() {
        setMeasurementIsActive(!measurementIsActive);
    }

    //////////////////
    /// LayerSwipe ///
    /////////////////

    useEffect(() => {
        if (!mapModel.map) return;

        //get all layers from the mapmodel
        const layers = mapModel.map.layers.getRecursiveLayers() as SimpleLayer[];
        setAvailableLayers(layers);

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

        //set selected layers & set back to initial state if "select left layer" & "select right layer" in dropdowns
        if (selectedLeftLayer && selectedRightLayer) {
            const leftLayer = (mapModel.map.layers.getLayerById(selectedLeftLayer) as SimpleLayer)
                ?.olLayer as TileLayer;
            const rightLayer = (mapModel.map.layers.getLayerById(selectedRightLayer) as SimpleLayer)
                ?.olLayer as TileLayer;

            if (leftLayer && rightLayer) {
                setLeftLayers([leftLayer]);
                setRightLayers([rightLayer]);
                setIsLayerSwipeActive(true); //activate layerswipe
                leftLayer.setVisible(true);
                rightLayer.setVisible(true);
            } else {
                setLeftLayers([]);
                setRightLayers([]);
                setIsLayerSwipeActive(false); //deactivate if layers not selected
            }
        } else {
            setLeftLayers([]);
            setRightLayers([]);
            setIsLayerSwipeActive(false);
        }

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
                            RWL The Danube Region
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

                        {/* feature info */}
                        <MapAnchor position="bottom-left" horizontalGap={15} verticalGap={60}>
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
                                <Flex
                                    maxHeight={400}
                                    maxWidth={250}
                                    overflow="auto"
                                    borderRadius="md"
                                    boxShadow="lg"
                                    // marginLeft="auto"
                                    alignSelf="flex-end"
                                >
                                    <Legend mapId={MAP_ID} />
                                </Flex>
                            </Flex>
                        </MapAnchor>

                        {/*tool buttons*/}
                        <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                            <Flex
                                role="bottom-right"
                                aria-label={intl.formatMessage({ id: "ariaLabel.bottomRight" })}
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

                    {/* add layerswipe slider below map container  */}
                    {isLayerSwipeActive && mapModel.map && leftLayers && rightLayers && (
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
                                    // onSliderValueChanged={onSliderValueChanged}
                                    leftLayers={leftLayers}
                                    rightLayers={rightLayers}
                                    style={{ width: "100%", height: "100%" }}
                                />
                            )}
                        </Box>
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
    );
}
