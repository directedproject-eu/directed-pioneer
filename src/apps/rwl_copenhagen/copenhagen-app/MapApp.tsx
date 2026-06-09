// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    Button,
    Flex,
    Field,
    VStack,
    Text,
    Spacer
} from "@chakra-ui/react";
import { DefaultMapProvider, MapAnchor, MapContainer, useMapModel } from "@open-pioneer/map";
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
import { useId, useMemo, useState } from "react";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { PiRulerLight, PiDownload } from "react-icons/pi";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { Legend } from "@open-pioneer/legend";
import { Navbar } from "navbar";
import { LayerZoom } from "./services/LayerZoom";
import { FeatureInfo } from "featureinfo";
import { useService } from "open-pioneer:react-hooks";
import { Forecasts } from "./controls/Forecasts";
import { TaxonomyInfo } from "taxonomy";
import { SaferPlacesFloodMap } from "saferplaces";
import { ModelClient } from "mcdm";
import { FloodSelector } from "./controls/FloodSelector";
import { FloodHandler } from "./services/FloodHandler";
import { FloodSlider } from "./controls/FloodSlider";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "theme";

import { LayerDownload } from "layerdownload";

export function MapApp() {
    const intl = useIntl();
    const measurementTitleId = useId();
    const { map } = useMapModel(MAP_ID);
    const zoomService = useService<LayerZoom>("app.LayerZoom"); //municipal layer zoom service
    const [activeLayerIds, setActiveLayerIds] = useState<string[]>([]); //feature info
    const [activeKeyword, setActiveKeyword] = useState<string | null>(null); //taxonomy
    const prepSrvc = useService<FloodHandler>("app.FloodHandler"); // Rainfall + Coastal Slider 
    const [windowClosed, setWindowClosed] = useState<boolean>(false); //for testing window component

    const overviewMapLayer = useMemo(
        () =>
            new TileLayer({
                source: new OSM()
            }),
        []
    );

    const [measurementIsActive, setMeasurementIsActive] = useState<boolean>(false);
    const [downloadIsActive, setDownloadIsActive] = useState<boolean>(false);
    const [floodModelIsActive, setFloodModelIsActive] = useState<boolean>(false);
    const [modelClientIsActive, setModelClientIsActive] = useState<boolean>(false);

    function toggleMeasurement() {
        setMeasurementIsActive(!measurementIsActive);
    }
    function toggleDownload() {
        setDownloadIsActive(!downloadIsActive);
    }
    function toggleFloodModel() {
        setFloodModelIsActive(!floodModelIsActive);
    }
    function toggleModelClient() {
        setModelClientIsActive(!modelClientIsActive);
    }

    return (
        <Flex height="100%" direction="column" overflow="hidden">
            <Navbar />
            <Notifier />
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
                {map && (
                    <DefaultMapProvider map={map}>
                        <Flex flex="1" direction="column" position="relative">
                            <MapContainer
                                role="main"
                                aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                            >
                                <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                                    <Forecasts />
                                    <FloodSlider/>
                                </MapAnchor>

                                <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
                                    <FloodSelector />
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
                                        <ChakraProvider value={system}>
                                            <Toc
                                                showTools={true}
                                                collapsibleGroups={true}
                                                initiallyCollapsed={true}
                                                showBasemapSwitcher={false}
                                            />
                                        </ChakraProvider>
                                        <Field.Root>
                                            <Field.Label mt={2}>
                                                <Text as="b">
                                                    {intl.formatMessage({ id: "basemapLabel" })}
                                                </Text>
                                            </Field.Label>
                                            <BasemapSwitcher
                                                allowSelectingEmptyBasemap={true}
                                            />
                                        </Field.Root>
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
                                                color="#2e9ecc"
                                                onClick={() => setActiveKeyword("Disaster Risk")}
                                            >
                                                {intl.formatMessage({ id: "description.keyword1" })}
                                            </Button>{" "}
                                            {intl.formatMessage({ id: "description.text2" })}{" "}
                                            <Button
                                                color="#2e9ecc"
                                                onClick={() => setActiveKeyword("Climate Change")}
                                            >
                                                {intl.formatMessage({ id: "description.keyword2" })}
                                            </Button>
                                            .
                                        </Text>
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
                                {/* zoom to municipalities */}
                                <MapAnchor position="bottom-left" horizontalGap={15} verticalGap={60}>
                                    <VStack align="stretch">
                                        <Button
                                            size="sm"
                                            onClick={() => zoomService.zoomToEgedal(map!)}
                                        >
                                            {intl.formatMessage({ id: "zoom_buttons.egedal" })}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => zoomService.zoomToFrederikssund(map!)}
                                        >
                                            {intl.formatMessage({ id: "zoom_buttons.frederikssund" })}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => zoomService.zoomToHalsnaes(map!)}
                                        >
                                            {intl.formatMessage({ id: "zoom_buttons.halsnaes" })}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => zoomService.zoomToLejre(map!)}
                                        >
                                            {intl.formatMessage({ id: "zoom_buttons.lejre" })}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => zoomService.zoomToRoskilde(map!)}
                                        >
                                            {intl.formatMessage({ id: "zoom_buttons.roskilde" })}
                                        </Button>
                                    </VStack>

                                    {map && (
                                        <FeatureInfo
                                            mapModel={map!}
                                            projection="EPSG:3857"
                                            layerId={""}
                                        />
                                    )}
                                </MapAnchor>

                                {/*legend*/}
                                <MapAnchor position="top-right" horizontalGap={5} verticalGap={10}>
                                    <Flex direction="column" gap={4}>
                                        {activeKeyword && (
                                            <Flex>
                                                <TaxonomyInfo
                                                    keyword={activeKeyword}
                                                    onClose={() => setActiveKeyword(null)}
                                                />
                                            </Flex>
                                        )}
                                        <Flex
                                            maxHeight={250}
                                            overflow="auto"
                                            borderRadius="md"
                                            boxShadow="lg"
                                            alignSelf="flex-end"
                                        >
                                            <Legend />
                                        </Flex>
                                    </Flex>
                                </MapAnchor>

                                <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={60}>
                                    <Flex
                                        // role="bottom-right"
                                        aria-label={intl.formatMessage({ id: "ariaLabel.bottomRight" })}
                                        direction="row"
                                        gap={1}
                                        padding={1}
                                    >
                                        {/* SaferPlaces flood model dialog */}
                                        {/*<ModelClient />*/}
                                        <SaferPlacesFloodMap />
                                        <ToolButton
                                            label={intl.formatMessage({ id: "measurementTitle" })}
                                            icon={<PiRulerLight />}
                                            onClick={toggleMeasurement}
                                        />
                                        <ToolButton
                                            label={intl.formatMessage({ id: "map.download.heading" })}
                                            icon={<PiDownload />}
                                            onClick={toggleDownload}
                                        />
                                        <Geolocation />
                                        <InitialExtent />
                                        <ZoomIn />
                                        <ZoomOut />
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
                            <CoordinateViewer precision={2} />
                            <ScaleBar />
                            <ScaleViewer />
                        </Flex>
                    </DefaultMapProvider>
                )}
            </TitledSection>
        </Flex>
    );
}
