// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    VStack,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Text,
    Select
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
import { Navbar } from "navbar";
import { LayerSwipe } from "layerswipe";
import { LayerZoom } from "./services/LayerZoom";
// import { FeatureInfo } from "featureinfo";
import { useService } from "open-pioneer:react-hooks";
import ExpandableBox from "./Components/ExpandableBox";

export function MapApp() {
    const intl = useIntl();
    const measurementTitleId = useId();
    const mapModel = useMapModel("main");
    const zoomService = useService<LayerZoom>("app.LayerZoom"); //municipal layer zoom service
    //feature info test
    // const [featureInfo, setFeatureInfo] = useState<Record<string, any> | null>(null);
    // const layerId = "pluvial_100ypresent_wd_ma";
    // const projection = "EPSG:3857"; //web mercator

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

    //////////////////
    /// LayerSwipe ///
    /////////////////
    useEffect(() => {
        if (mapModel.map) {
            const layers = mapModel.map.layers.getAllLayers() as SimpleLayer[];
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
                    {/*MAP1*/}
                    <MapContainer
                        mapId={MAP_ID1}
                        role="main"
                        aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                    >
                        {/* featureinfo */}
                        {/*mapModel.map && (
                            <FeatureInfo
                                mapModel={mapModel.map}
                                layerId={MAP_ID1}
                                projection="EPSG:3857"
                            />
                        )*/}

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
                                <ExpandableBox title="Analysis">
                                    <>Example Analysis Text</>
                                </ExpandableBox>
                            </Flex>
                            {/*add Table of Contents (Toc) */}
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
                                <Toc mapId={MAP_ID1} showTools={true} showBasemapSwitcher={false} />
                            </Box>
                        </MapAnchor>

                        {/* zoom to municipalities */}
                        <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                            <VStack align="stretch" spacing={2}>
                                <Button
                                    onClick={() => zoomService.zoomToFrederikssund(mapModel.map!)}
                                >
                                    Zoom to Frederikssund
                                </Button>
                                ;
                                <Button onClick={() => zoomService.zoomToEgedal(mapModel.map!)}>
                                    Zoom to Egedal
                                </Button>
                                ;
                                <Button onClick={() => zoomService.zoomToHalsnaes(mapModel.map!)}>
                                    Zoom to Halsnaes
                                </Button>
                                ;
                                <Button onClick={() => zoomService.zoomToLejre(mapModel.map!)}>
                                    Zoom to Lejre
                                </Button>
                                ;
                                <Button onClick={() => zoomService.zoomToRoskilde(mapModel.map!)}>
                                    Zoom to Roskilde
                                </Button>
                                ;
                            </VStack>
                        </MapAnchor>

                        {/*layerswipe layers & overview map*/}
                        <MapAnchor position="bottom-left" horizontalGap={5} verticalGap={10}>
                            <Box
                                backgroundColor="white"
                                borderWidth="1px"
                                borderRadius="lg"
                                padding={2}
                                boxShadow="lg"
                                role="top-right"
                                aria-label={intl.formatMessage({ id: "ariaLabel.topRight" })}
                                maxHeight={300}
                                maxWidth={430}
                                overflow="auto" //scroll for overlapping content
                                marginBottom="60px"
                            >
                                <Flex
                                    direction="column"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <OverviewMap
                                        mapId={MAP_ID1}
                                        olLayer={overviewMapLayer}
                                        width={390}
                                    />
                                </Flex>
                                <Text fontWeight="bold" mt={4}>
                                    {" "}
                                    Select Layers for Comparison:{" "}
                                </Text>
                                {/* LayerSwipe Selector */}
                                <Flex direction="row" gap={4} p={4}>
                                    <Select
                                        placeholder="Select Left Layer"
                                        onChange={(e) => setSelectedLeftLayer(e.target.value)}
                                    >
                                        {availableLayers.map((layer) => (
                                            <option key={layer.id} value={layer.id}>
                                                {layer.title || layer.id}
                                            </option>
                                        ))}
                                    </Select>

                                    <Select
                                        placeholder="Select Right Layer"
                                        onChange={(e) => setSelectedRightLayer(e.target.value)}
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
                        </MapAnchor>

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
                                <Geolocation mapId={MAP_ID1} />
                                <InitialExtent mapId={MAP_ID1} />
                                <ZoomIn mapId={MAP_ID1} />
                                <ZoomOut mapId={MAP_ID1} />
                            </Flex>
                        </MapAnchor>
                    </MapContainer>
                    {/*END MAP1*/}
                </Flex>

                {/* add layerswipe below map container  */}
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

                {/* <Flex flex="1" direction="column" position="relative"> */}
                {/*MAP2*/}
                {/* <MapContainer
                        mapId={MAP_ID2}
                        role="second"
                        aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                    > */}
                {/*pixel feature info*/}
                {/* <FeatureInfo mapId={MAP_ID2} /> */}

                {/* <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
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
                                            <Measurement mapId={MAP_ID2} />
                                        </TitledSection>
                                    </Box>
                                </Box>
                            )} */}
                {/*add Table of Contents (Toc) */}
                {/* <Box
                                backgroundColor="white"
                                borderWidth="1px"
                                borderRadius="lg"
                                padding={2}
                                boxShadow="lg"
                                role="dialog"
                                aria-label={intl.formatMessage({ id: "ariaLabel.toc" })}
                            >
                                <Toc mapId={MAP_ID2} showTools={true} showBasemapSwitcher={false} />
                            </Box> */}
                {/* </MapAnchor> */}
                {/* <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                            <Box
                                backgroundColor="white"
                                borderWidth="1px"
                                borderRadius="lg"
                                padding={2}
                                boxShadow="lg"
                                role="top-right"
                                aria-label={intl.formatMessage({ id: "ariaLabel.topRight" })}
                            >
                                <OverviewMap mapId={MAP_ID2} olLayer={overviewMapLayer} />
                                <Divider mt={4} />
                                <FormControl>
                                    <FormLabel mt={2}>
                                        <Text as="b">
                                            {intl.formatMessage({ id: "basemapLabel" })}
                                        </Text>
                                    </FormLabel>
                                    <BasemapSwitcher mapId={MAP_ID2} allowSelectingEmptyBasemap />
                                </FormControl>
                            </Box>
                        </MapAnchor> */}
                {/* <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
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
                                <Geolocation mapId={MAP_ID2} />
                                <InitialExtent mapId={MAP_ID2} />
                                <ZoomIn mapId={MAP_ID2} />
                                <ZoomOut mapId={MAP_ID2} />
                            </Flex>
                        </MapAnchor>
                    </MapContainer> */}
                {/*END MAP2*/}
                {/* </Flex> */}

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

                {/* <Flex
                    role="region"
                    aria-label={intl.formatMessage({ id: "ariaLabel.footer" })}
                    gap={3}
                    alignItems="center"
                    justifyContent="center"
                >
                    <CoordinateViewer mapId={MAP_ID2} precision={2} />
                    <ScaleBar mapId={MAP_ID2} />
                    <ScaleViewer mapId={MAP_ID2} />
                </Flex> */}
            </TitledSection>
        </Flex>
    );
}
