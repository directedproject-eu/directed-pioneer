// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    Button,
    Flex,
    Text,
    Spacer,
    Link,
    Select
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
import { PiRulerLight, PiDownload, PiCaretLeft, PiCaretRight } from "react-icons/pi";
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
import { useEffect } from "react";

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
    const [zoomMenuOpen, setZoomMenuOpen] = useState<boolean>(false);

    useEffect(() => {
        document.title = intl.formatMessage({ id: "heading" });
    }, [intl]);

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
            {map && (
                <DefaultMapProvider map={map}>
                    <Flex flex="1" direction="column" position="relative">
                        <MapContainer
                            role="main"
                            aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                        >
                            <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                                <Forecasts />
                                <FloodSlider />
                            </MapAnchor>

                            <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
                                <FloodSelector setActiveKeyword={setActiveKeyword} />
                                <style>{`@media (max-height: 768px) { .cph-toc-box { max-height: calc(100vh - 420px) !important; } }`}</style>
                                <Box
                                    className="cph-toc-box"
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
                                    overflowY="auto"
                                    overflowX="hidden"
                                    paddingTop={4}
                                    paddingLeft={3}
                                >
                                    <ChakraProvider value={system}>
                                        <Toc
                                            showTools={true}
                                            collapsibleGroups={true}
                                            initiallyCollapsed={true}
                                            showBasemapSwitcher={false}
                                        />

                                    </ChakraProvider>
                                    <Select.Root>
                                        <Select.Label mt={2}>
                                            <Text as="b">
                                                {intl.formatMessage({ id: "basemapLabel" })}
                                            </Text>
                                        </Select.Label>
                                        <BasemapSwitcher
                                            allowSelectingEmptyBasemap={true}
                                        />
                                    </Select.Root>
                                </Box>
                                <Box
                                    flexDirection="column"
                                    backgroundColor="white"
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    padding={3}
                                    boxShadow="lg"
                                    role="dialog"
                                    maxHeight={100}
                                    overflow="auto"
                                    marginTop={2}
                                >
                                    <Text fontWeight={600} fontSize={15}>
                                        {" "}
                                        {intl.formatMessage({ id: "description.title" })}{" "}
                                    </Text>
                                    <Text fontSize={14} paddingTop={1}>
                                        {intl.formatMessage({ id: "description.text1" })}
                                        <Spacer />
                                        <Link
                                            variant="plain"
                                            color="#2e9ecc"
                                            marginRight={0.5}
                                            onClick={() => setActiveKeyword("Disaster Risk")}
                                        >
                                            {intl.formatMessage({ id: "description.keyword1" })}
                                        </Link>{" "}
                                        {intl.formatMessage({ id: "description.text2" })}{" "}
                                        <Link
                                            variant="plain"
                                            marginLeft={0.5}
                                            color="#2e9ecc"
                                            onClick={() => setActiveKeyword("Climate Change")}
                                        >
                                            {intl.formatMessage({ id: "description.keyword2" })}
                                        </Link>
                                    </Text>
                                </Box>
                            </MapAnchor>
                            {/* zoom to municipalities */}
                            <MapAnchor position="bottom-left" horizontalGap={5} verticalGap={5}>
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
                                                {intl.formatMessage({ id: "zoom_buttons.title" })}
                                                <PiCaretRight />
                                            </>
                                        )}
                                    </Button>
                                    {zoomMenuOpen && (
                                        <>
                                            <Button
                                                size="sm"
                                                flexShrink={0}
                                                onClick={() => zoomService.zoomToEgedal(map!)}
                                            >
                                                {intl.formatMessage({ id: "zoom_buttons.egedal" })}
                                            </Button>
                                            <Button
                                                size="sm"
                                                flexShrink={0}
                                                onClick={() => zoomService.zoomToFrederikssund(map!)}
                                            >
                                                {intl.formatMessage({
                                                    id: "zoom_buttons.frederikssund"
                                                })}
                                            </Button>
                                            <Button
                                                size="sm"
                                                flexShrink={0}
                                                onClick={() => zoomService.zoomToHalsnaes(map!)}
                                            >
                                                {intl.formatMessage({ id: "zoom_buttons.halsnaes" })}
                                            </Button>
                                            <Button
                                                size="sm"
                                                flexShrink={0}
                                                onClick={() => zoomService.zoomToLejre(map!)}
                                            >
                                                {intl.formatMessage({ id: "zoom_buttons.lejre" })}
                                            </Button>
                                            <Button
                                                size="sm"
                                                flexShrink={0}
                                                onClick={() => zoomService.zoomToRoskilde(map!)}
                                            >
                                                {intl.formatMessage({ id: "zoom_buttons.roskilde" })}
                                            </Button>
                                        </>
                                    )}
                                </Flex>

                                {map && (
                                    <FeatureInfo
                                        mapModel={map!}
                                        projection="EPSG:3857"
                                        layerId={""}
                                    />
                                )}
                            </MapAnchor>

                            {/*legend*/}
                            <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                                <Flex direction="column" gap={4}>
                                    {activeKeyword && (
                                        <Flex alignSelf="flex-end">
                                            <TaxonomyInfo
                                                keyword={activeKeyword}
                                                onClose={() => setActiveKeyword(null)}
                                                maxWidth="calc(30vw - 20px)"
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

                            <MapAnchor position="bottom-right" horizontalGap={5} verticalGap={5}>
                                <Flex
                                    // role="bottom-right"
                                    aria-label={intl.formatMessage({ id: "ariaLabel.bottomRight" })}
                                    direction="row"
                                    gap={1}
                                    padding={1}
                                >
                                    {/* SaferPlaces flood model dialog */}
                                    <ModelClient />
                                    <SaferPlacesFloodMap />
                                    <ToolButton
                                        label={intl.formatMessage({ id: "map.download.heading" })}
                                        icon={<PiDownload />}
                                        onClick={toggleDownload}
                                    />
                                    <ToolButton
                                        label={intl.formatMessage({ id: "measurementTitle" })}
                                        icon={<PiRulerLight />}
                                        onClick={toggleMeasurement}
                                    />
                                    <Geolocation />
                                    <InitialExtent />
                                    <ZoomIn />
                                    <ZoomOut />
                                </Flex>
                            </MapAnchor>
                        </MapContainer>
                        {downloadIsActive && (
                            <LayerDownload
                                mapID={MAP_ID}
                                intl={intl}
                                isOpen={downloadIsActive}
                                onClose={() => setDownloadIsActive(false)}
                            />
                        )}
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
        </Flex>
    );
}
