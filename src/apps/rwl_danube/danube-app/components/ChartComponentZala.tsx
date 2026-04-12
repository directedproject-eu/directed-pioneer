// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Center,
    Checkbox,
    Stack,
    Text,
    Flex,
    Select,
    Spinner
} from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import EnsembleCrops from "./EnsembleCrops";
import { TaxonomyInfo } from "taxonomy";

// Location list provided
const locations = [
    "AT11", "AT12", "AT13", "AT21", "AT22", "AT31", "AT32", "AT33", "AT34",
    "BA__", "BG31", "BG32", "BG33", "BG34", "BG41", "CH05", "CZ03", "CZ05",
    "CZ06", "CZ07", "CZ08", "DE11", "DE13", "DE14", "DE21", "DE22", "DE23",
    "DE24", "DE25", "DE27", "HR02", "HR03", "HR05", "HR06", "HU11", "HU12",
    "HU21", "HU22", "HU23", "HU31", "HU32", "HU33", "ITC4", "ITH1", "ITH4",
    "ME00", "MK00", "PL21", "RO11", "RO12", "RO21", "RO22", "RO31", "RO32",
    "RO41", "RO42", "RS11", "RS12", "RS21", "RS22", "SI03", "SI04", "SK01",
    "SK02", "SK03", "SK04", "XK__"
];
// Mapping: Crop Code aus der CSV -> Angezeigter Name im Frontend
const CODE_TO_DISPLAY_NAME: Record<string, string> = {
    "ALFA": "Lucerne",
    "CORN": "Corn maize",
    "GMAI": "Green maize",
    "POTA": "Potatoes",
    "SBAR": "Spring barley",
    "SOYB": "Soya beans",
    "SUNF": "Sunflowers",
    "TRIT": "Triticale",
    "WBAR": "Winter barley",
    "WRAP": "Winter rape",
    "WRYE": "Rye and maslin",
    "WWHT": "Winter wheat"
};

// Extrahieren aller Codes als Array für den Fallback (z.B. ["ALFA", "CORN", "GMAI", ...])
const ALL_CROP_CODES = Object.keys(CODE_TO_DISPLAY_NAME);

const files = [
    "/crop_yield_scenarios_rwl3and4/cysz_zala_CMIP6_SSP126.csv",
    "/crop_yield_scenarios_rwl3and4/cysz_zala_CMIP6_SSP370.csv",
    "/crop_yield_scenarios_rwl3and4/cysz_zala_CMIP6_SSP585.csv"
];

interface Props {
    nutsId?: string; // <-- Changed from initialLocation to nutsId
}

const ChartComponentZala: React.FC<Props> = ({ nutsId }) => {
    const intl = useIntl();

    console.log("ChartComponentZala rendered with nutsId:", nutsId); // Debugging line to check the received nutsId 
    const [selectedLocation, setSelectedLocation] = useState<string>(
        nutsId || "RO11"
    );
    const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
    const [selectedScenario, setSelectedScenario] = useState("ssp585");
    
    const [selectedCrops, setSelectedCrops] = useState<string[]>(["POTA"]);
    
    const [lookupCsv, setLookupCsv] = useState<string | null>(null);
    const [availableCrops, setAvailableCrops] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);

    // <-- Update local state when nutsId prop changes from the parent
    useEffect(() => {
        if (nutsId && nutsId !== selectedLocation) {
            setSelectedLocation(nutsId);
        }
    }, [nutsId]);

    useEffect(() => {
        const fetchLookupTable = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("http://localhost:5000/api/data/crop_availability_lookup.csv");
                if (response.ok) {
                    const textData = await response.text();
                    setLookupCsv(textData);
                } else {
                    console.warn(`Lookup-Tabelle nicht gefunden (Status ${response.status}). Aktiviere Fallback-Modus.`);
                    activateFallback();
                }
            } catch (error) {
                activateFallback();
            } finally {
                setIsLoading(false);
            }
        };

        const activateFallback = () => {
            setIsFallbackMode(true);
            setAvailableCrops(ALL_CROP_CODES);
        };

        fetchLookupTable();
    }, []);

    useEffect(() => {
        if (isFallbackMode) return;
        if (!lookupCsv) return;

        const lines = lookupCsv.split(/\r?\n/);
        const scenarioUpper = selectedScenario.toUpperCase();
        
        const matchingLine = lines.find(line => 
            line.includes(selectedLocation) && line.includes(scenarioUpper)
        );

        if (matchingLine) {
            const codesInLine = matchingLine.match(/\b[A-Z]{4}\b/g) || [];
            
            const validCodes = codesInLine.filter(code => CODE_TO_DISPLAY_NAME[code] !== undefined);

            if (validCodes.length === 0) {
                console.warn(`Keine gültigen Crops für ${selectedLocation} und ${scenarioUpper} gefunden. Zeige alle an.`);
                setAvailableCrops(ALL_CROP_CODES);
            } else {
                setAvailableCrops(validCodes);
            }

            setSelectedCrops(prev => {
                const currentAvailable = validCodes.length > 0 ? validCodes : ALL_CROP_CODES;
                const validSelections = prev.filter(c => currentAvailable.includes(c));
                
                if (validSelections.length === 0 && currentAvailable.length > 0) {
                    return [currentAvailable[0]]; 
                }
                return validSelections;
            });
        } else {
            console.warn(`Kombination ${selectedLocation} und ${scenarioUpper} nicht gefunden. Zeige alle an.`);
            setAvailableCrops(ALL_CROP_CODES);
        }
    }, [selectedLocation, selectedScenario, lookupCsv, isFallbackMode]);

    const handleCheckboxChange = (cropCode: string) => {
        setSelectedCrops((prevSelectedCrops) => {
            if (prevSelectedCrops.includes(cropCode)) {
                return prevSelectedCrops.filter((id) => id !== cropCode);
            } else {
                return [...prevSelectedCrops, cropCode];
            }
        });
    };

    return (
        <>
            {/* Location & Scenario Selection */}
            <Flex justifyContent="center" mb={6} direction="column" alignItems="center" gap={4}>
                <Box width="300px">
                    <Select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                        {locations.map((loc) => (
                            <option key={loc} value={loc}>
                                {loc}
                            </option>
                        ))}
                    </Select>
                </Box>
                
                <Flex gap={4}>
                    <Button
                        className={`choice-button ${selectedScenario === "ssp126" ? "" : "inactive"}`}
                        onClick={() => setSelectedScenario("ssp126")}
                    >
                        ssp126
                    </Button>
                    <Button
                        className={`choice-button ${selectedScenario === "ssp370" ? "" : "inactive"}`}
                        onClick={() => setSelectedScenario("ssp370")}
                    >
                        ssp370
                    </Button>
                    <Button
                        className={`choice-button ${selectedScenario === "ssp585" ? "" : "inactive"}`}
                        onClick={() => setSelectedScenario("ssp585")}
                    >
                        ssp585
                    </Button>
                </Flex>
            </Flex>

            <EnsembleCrops
                files={files}
                regionName={selectedLocation}
                regionCode={selectedLocation}
                selectedScenario={selectedScenario}
                selectedCrops={selectedCrops} 
            />

            <Center>
                <Box minHeight="60px" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    {isLoading ? (
                        <Flex alignItems="center" gap={3}>
                            <Spinner size="md" color="blue.500" />
                            <Text>Loading crop data...</Text>
                        </Flex>
                    ) : (
                        <>
                            {isFallbackMode && (
                                <Text fontSize="sm" color="orange.500" mb={2}>
                                    Note: Displaying all options. Data verification unavailable.
                                </Text>
                            )}
                            <Stack direction="row" wrap="wrap" mt={isFallbackMode ? 2 : 6} mb={4} justifyContent="center" maxWidth="800px">
                                {availableCrops.map((cropCode, id) => (
                                    <Checkbox
                                        key={id}
                                        isChecked={selectedCrops.includes(cropCode)}
                                        onChange={() => handleCheckboxChange(cropCode)}
                                        mr={4}
                                        mb={2}
                                    >
                                        {CODE_TO_DISPLAY_NAME[cropCode]} 
                                    </Checkbox>
                                ))}
                            </Stack>
                        </>
                    )}
                </Box>
            </Center>

            {/* Explanations and Taxonomy Info */}
            <Text mt={"2em"} size={"2em"}>
                {intl.formatMessage({id: "charts.zala_crop.explanation1"})}
                {" "}
                <Button
                    variant="link"
                    color="#2e9ecc"
                    onClick={() => setActiveKeyword("agriculture")}
                >
                    {intl.formatMessage({id: "charts.zala_crop.keyword1"})}
                </Button>{" "}
                {intl.formatMessage({id: "charts.zala_crop.explanation2"})}
                {" "}
                <Button
                    variant="link"
                    color="#2e9ecc"
                    onClick={() => setActiveKeyword("Shared socio-economic pathways (SSPs)")}
                >
                    {intl.formatMessage({id: "charts.zala_crop.keyword2"})}
                </Button>{" "}
                {intl.formatMessage({id: "charts.zala_crop.explanation3"})} {" "}
                {intl.formatMessage({id: "charts.zala_crop.explanation4"})}
                {" "}
                <Button
                    variant="link"
                    color="#2e9ecc"
                    onClick={() => setActiveKeyword("Agricultural and ecological drought")}
                >
                    {intl.formatMessage({id: "charts.zala_crop.keyword3"})}
                </Button> 
                {intl.formatMessage({id: "charts.zala_crop.explanation5"})}
            </Text>
            
            <Flex alignItems="center" mt={4}>
                <Text>
                    {intl.formatMessage({id: "charts.zala_crop.explanation6"})}
                </Text>
            </Flex>
            
            <Box padding="15px" />
            
            {activeKeyword && (
                <Flex>
                    <TaxonomyInfo
                        keyword={activeKeyword}
                        onClose={() => setActiveKeyword(null)}
                    />
                </Flex>
            )}
        </>
    );
};

export default ChartComponentZala;