// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState, ChangeEvent } from "react";
import {
    Box,
    Button,
    Input,
    Select,
    useDisclosure,
    VStack,
    Flex,
    Text, 
    Popover, 
    PopoverBody, 
    PopoverContent, 
    PopoverTrigger,
    PopoverArrow, 
    IconButton,
    Dialog,
    Field,
    NativeSelect,
    HoverCard
} from "@chakra-ui/react";
import { ToolButton } from "@open-pioneer/map-ui-components";
import { FaWater, FaInfo } from "react-icons/fa";
import { useService } from "open-pioneer:react-hooks";
import { FloodMapService } from "./FloodMapService";
import { ApiService, JobStatusResponse } from "processclient";
import { TaxonomyInfo } from "taxonomy";
import { useIntl } from "open-pioneer:react-hooks";


// --- Interfaces ---

interface SaferRainInputs {
    dem: string;
    rain: string;
    water: string;
    presigned_url_out: boolean;
    mode: string; // Lambda for async default batch for sync
    sync: boolean;
    user: string;
    token: string;
    debug: boolean;
}

type SaferRainPayload = {
    inputs: SaferRainInputs;
}

interface SaferCoastInputs {
    file_dem: string;
    file_seamask: string;
    esl: number;
    barrier: null;
    file_water: string;
    presigned_url_out: boolean;
    user: string;
    token: string;
    debug: boolean;
}

type SaferCoastPayload = {
    inputs: SaferCoastInputs;
}

// Union type for all possible payloads
type ProcessExecutionPayload = SaferRainPayload | SaferCoastPayload;

export function SaferPlacesFloodMap() {
    // --- UI States ---
    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [rainIntensity, setRainIntensity] = useState<string>("");
    const [extremeSeaLevel, setExtremeSeaLevel] = useState<number | null>(null);
    // const [barrierFile, setBarrierFile] = useState<File | null>(null); // File object or null
    const [model, setModel] = useState<string>("");
    const [generationStatus, setGenerationStatus] = useState<string>("");
    const [downloadLink, setDownloadLink] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [jobId, setJobId] = useState<string | null>(null); 
    // States for user and token input
    const [userInput, setUserInput] = useState<string>("");
    const [tokenInput, setTokenInput] = useState<string>("");
    const [tokenSubmitted, setTokenSubmitted] = useState(false);
    const [activeKeyword, setActiveKeyword] = useState<string | null>(null); // Taxonomy

    const intl = useIntl();
    const { isOpen, onOpen, onClose } = useDisclosure(); // For model dialog

    // --- Services ---
    const floodMapService = useService<FloodMapService>("app.FloodMapService"); // FloodMapService to add new layer to TOC
    const apiService = useService<ApiService>("app.ApiService"); // API service for OGC processes 

    // --- API Process URLs ---
    const API_BASE_URL = "https://api.saferplaces.co"; // SaferPlaces pygeoapi
    const API_PROCESS_RAIN_URL = `${API_BASE_URL}/processes/safer-rain-process/execution`;
    const API_PROCESS_COAST_URL = `${API_BASE_URL}/processes/safer-coast-process/execution`;

    // Pre-determined location DEM files
    const locationDemFiles: Record<string, { dem: string; seamask: string }> = {
        Vienna: {
            dem: "s3://s3-directed/api_data/c5298b37096499d3c8bcfc49e449b393/dem_building.tif",
            seamask: "s3://s3-directed/api_data/c5298b37096499d3c8bcfc49e449b393/seamask.tif"
        },
        Esbjerg: {
            dem: "s3://s3-directed/api_data/b0d2dfae6d7dfe22594c58a28b00e183/dem_building.tif",
            seamask: "s3://s3-directed/api_data/b0d2dfae6d7dfe22594c58a28b00e183/seamask.tif"
        }
    };

    // --- Input Handlers ---
    const handleLocationChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedLocation(event.target.value);
    };

    const handleRainIntensityChange = (event: ChangeEvent<HTMLInputElement>) => {
        setRainIntensity(event.target.value);
    };

    const handleESLChange = (event: ChangeEvent<HTMLInputElement>) => {
        // If input is empty, set state to null, otherwise parse to float
        const value = event.target.value;
        setExtremeSeaLevel(value === "" ? null : parseFloat(value));
    };

    const handleTokenInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTokenInput(event.target.value);
    };

    const handleUserInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setUserInput(event.target.value);
    };

    // const handleBarrierFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const files = event.target.files;

   
    const processFinalResult = (data: JobStatusResponse) => {
        const rawData = data as Record<string, unknown>;
        let finalDownloadUrl = "";
    
        // Check for presigned_url
        if (typeof rawData.presigned_url === "string") {
            finalDownloadUrl = rawData.presigned_url;
        } 
        // Check for water_depth_file'
        else if (typeof rawData.water_depth_file === "string") {
            finalDownloadUrl = rawData.water_depth_file;
        }
        // Fallback to standard OGC outputs structure
        else if (data.outputs) {
            const output = (data.outputs.water_depth_file || data.outputs.result) as Record<string, unknown> | undefined;
            if (output && typeof output.href === "string") {
                finalDownloadUrl = output.href;
            }
        }
    
        // Transform S3 to HTTPS
        let urlString: string = finalDownloadUrl;
        if (urlString.startsWith("s3://")) {
            urlString = urlString.replace("s3://", "https://s3.amazonaws.com/");
        }
    
        // UI Logic
        if (urlString && urlString.startsWith("http")) {
            setDownloadLink(urlString);
            const generatedMapTitle = `${selectedLocation} Flood Map (${model})`;
    
            if (floodMapService) {
                floodMapService.addFloodMapLayer(urlString, generatedMapTitle);
                setGenerationStatus("Flood map generated successfully!");
            } else {
                setGenerationStatus("Success, but map service missing.");
            }
        } else {
            console.error("Link Detection Failed. Data received:", data);
            setError("Download URL not found in the API response.");
            setGenerationStatus("Failed to locate result link.");
        }
    };

    const handleGenerateMap = async () => {
        setGenerationStatus("Initiating flood map generation");
        setError("");
        setDownloadLink("");
        setJobId(null);

        let requestDataPayload: ProcessExecutionPayload | null = null;
        let apiUrl = "";
        const outputRain = `watermap_rain_${Date.now()}.tif`;
        const outputCoast = `watermap_coast_${Date.now()}.tif`;
        const selectedDemFile = locationDemFiles[selectedLocation]?.dem;
        const selectedSeamaskFile = locationDemFiles[selectedLocation]?.seamask;
        const s3Bucket = "s3-directed";
        const user = userInput;
        const token = tokenInput;

        if (!selectedLocation || !selectedDemFile) {
            setError("Please select a valid location");
            setGenerationStatus("Failed");
            return;
        }

        if (model === "safer_rain") {
            apiUrl = API_PROCESS_RAIN_URL;
            requestDataPayload = {
                inputs: {
                    dem: selectedDemFile,
                    rain: rainIntensity, // Parse string to return integer, even with leading zeros
                    water: `s3://${s3Bucket}/api_data/${outputRain}`, // Construct S3 output
                    mode: "lambda", // Async lambda, sync batch
                    presigned_url_out: true,
                    sync: false,
                    debug: true,
                    user: user,
                    token: token
                }
            };
        } else if (model === "safer_coast") {
            if (extremeSeaLevel === null || extremeSeaLevel <= 0) {
                setError("For the Safer Coast Model, ESL must be a positive number");
                setGenerationStatus("Failed");
                return; // Exit if validation fails
            }
            apiUrl = API_PROCESS_COAST_URL;
            requestDataPayload = {
                inputs: {
                    file_dem: selectedDemFile,
                    file_seamask: selectedSeamaskFile!,
                    barrier:
                        // "s3://s3-disasterbrain/api_data/09d06de7c80ba18d0a099a05b3cedc8f/barrier.shp", // From jupyter
                        null,
                    esl: extremeSeaLevel,
                    presigned_url_out: true,
                    file_water: `s3://${s3Bucket}/api_data/${outputCoast}`,
                    debug: true,
                    user: user,
                    token: token
                }
            };
        } else {
            setError("Please provide input and select a model to run");
            setGenerationStatus("Failed");
            return;
        }

        try {
            // Find if sync/async from payload, otherwise default true
            const isSync = (model === "safer_rain" && "sync" in requestDataPayload.inputs) 
                ? requestDataPayload.inputs.sync 
                : true;
            // Execute the process 
            const job = await apiService.executeProcess(apiUrl, requestDataPayload, isSync);
            setGenerationStatus("Job accepted. Waiting for results...");
            const result = await job.wait(); // Wait for job completion
            processFinalResult(result); // Process final data 

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred during process execution.";
            setError(errorMessage);
            setGenerationStatus("Failed.");
        }
    };

    const handleCredentialsSubmit = () => {
        if (tokenInput.trim() && userInput.trim()) {
            // Check for valid inputs
            setTokenSubmitted(true); // Open model config page
            setError(""); // Clean-up, clear previous errors when moving to next screen
        }
    };

    return (
        <Box>
            <ToolButton label="Run Flood Models" icon={<FaWater />} onClick={onOpen} />
            <Dialog.Root closeOnInteractOutside={true} open={isOpen} onOpenChange={onClose}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            {intl.formatMessage({id: "modal.header"})}
                        </Dialog.Header>
                        <Dialog.CloseTrigger />
                        <Dialog.Body>
                            {!tokenSubmitted ? (
                                // --- TOKEN INPUT VIEW (Page 1) ---
                                <VStack gap={4} align="stretch">
                                    <Flex align="center">
                                        <Text fontWeight="semibold">
                                            {intl.formatMessage({id: "modal.credentials"})}
                                        </Text>
                                    </Flex>
                                    <Field.Root required>
                                        <Field.Label htmlFor="user">
                                            {intl.formatMessage({id: "modal.userName"})}
                                        </Field.Label>
                                        <Input
                                            type="text"
                                            id="user"
                                            value={userInput}
                                            onChange={handleUserInputChange}
                                            placeholder={intl.formatMessage({id: "placeholders.info1"})}
                                            variant="outline"
                                        />
                                    </Field.Root>
                                    <Field.Root required>
                                        <Field.Label htmlFor="token">
                                            {intl.formatMessage({id: "modal.token"})}
                                        </Field.Label>
                                        <Input
                                            type="password"
                                            id="token"
                                            value={tokenInput}
                                            onChange={handleTokenInputChange}
                                            placeholder={intl.formatMessage({id: "placeholders.info2"})}
                                            variant="outline"
                                        />
                                    </Field.Root>
                                    <Button
                                        mt={4}
                                        color={"white"}
                                        bg={"#2e9ecc"}
                                        onClick={handleCredentialsSubmit}
                                        // Disable if either field is empty
                                        disabled={!tokenInput.trim() || !userInput.trim()}
                                    >
                                        {intl.formatMessage({id: "modal.enter"})}
                                    </Button>
                                    {error && <p style={{ color: "red" }}>Error: {error}</p>}
                                </VStack>
                            ) : (
                                // --- MODEL CONFIGURATION VIEW (Page 2) ---
                                <VStack gap={4} align="stretch">
                                    <Flex justify="space-between" align="center" mb={2}>
                                        <Text fontWeight="semibold">
                                            🌊 {intl.formatMessage({id: "modal.configuration"})}
                                        </Text>
                                        <Button
                                            justifyContent="flex-end"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setTokenSubmitted(false)}
                                        >
                                            ← {intl.formatMessage({id: "modal.credentialChangeButton"})}
                                        </Button>
                                    </Flex>
                                    <Flex justify="flex-start" align="center" mb={1} width="100%">
                                        <Text width="100%">
                                            {" "}
                                            {intl.formatMessage({
                                                id: "description_saferplaces.text1"
                                            })}{" "}
                                            <Button
                                                variant="plain"
                                                color="#2e9ecc"
                                                onClick={() => setActiveKeyword("pluvial flood")}
                                            >
                                                {intl.formatMessage({
                                                    id: "description_saferplaces.keyword1"
                                                })}
                                            </Button>{" "}
                                            {intl.formatMessage({
                                                id: "description_saferplaces.text2"
                                            })}{" "}
                                            <Button
                                                variant="plain"
                                                color="#2e9ecc"
                                                onClick={() => setActiveKeyword("coastal flood")}
                                            >
                                                {intl.formatMessage({
                                                    id: "description_saferplaces.keyword2"
                                                })}
                                            </Button>{" "}
                                            {intl.formatMessage({
                                                id: "description_saferplaces.text3"
                                            })}
                                            .
                                        </Text>
                                    </Flex>
                                    {activeKeyword && (
                                        <Flex>
                                            <TaxonomyInfo
                                                keyword={activeKeyword}
                                                onClose={() => setActiveKeyword(null)}
                                            />
                                        </Flex>
                                    )}
                                    <Field.Root required>
                                        <Field.Label padding={0}> 
                                            {intl.formatMessage({id: "modal.location"})}
                                        </Field.Label>
                                        <NativeSelect.Root
                                            id="location"
                                        >
                                            <NativeSelect.Field 
                                                placeholder={intl.formatMessage({id: "modal.selectLocation"})}
                                                onChange={handleLocationChange}
                                                value={selectedLocation}
                                            >
                                                {Object.keys(locationDemFiles).map((locationName) => (
                                                    <option key={locationName} value={locationName}>
                                                        {locationName}
                                                    </option>
                                                ))}
                                            </NativeSelect.Field>
                                        </NativeSelect.Root>
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label padding={0}> 
                                            {intl.formatMessage({id: "modal.model"})} 
                                        </Field.Label>
                                        <NativeSelect.Root
                                            id="model"
                                        >
                                            <NativeSelect.Field
                                                value={model}
                                                placeholder={intl.formatMessage({id: "modal.selectModel"})}
                                                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                                    setModel(e.target.value)
                                                }
                                            >
                                                <option value="safer_rain">Safer Rain</option>
                                                <option value="safer_coast">Safer Coast</option>
                                            </NativeSelect.Field>
                                        </NativeSelect.Root>
                                    </Field.Root>

                                    {model === "safer_rain" && (
                                        <><HoverCard.Root openDelay={250} closeDelay={100} positioning={{placement: "top"}}>
                                            <HoverCard.Trigger asChild>
                                                <IconButton
                                                    marginLeft="2px"
                                                    size="sm"
                                                    aria-label="Info"
                                                    variant="ghost"
                                                    color="black">
                                                    <FaInfo />
                                                </IconButton>
                                            </HoverCard.Trigger>
                                            <HoverCard.Positioner>
                                                <HoverCard.Content>
                                                    <HoverCard.Arrow />
                                                    {intl.formatMessage({ id: "info_icon_saferrain.description" })}
                                                </HoverCard.Content>
                                            </HoverCard.Positioner>
                                        </HoverCard.Root>
                                        <Field.Root required>
                                            <Field.Label padding={0} htmlFor="rain">
                                                {intl.formatMessage({id: "modal.inputRain"})}{" "}
                                            </Field.Label>
                                            <Input
                                                type="text"
                                                id="rain"
                                                value={rainIntensity}
                                                onChange={handleRainIntensityChange}
                                                placeholder={intl.formatMessage({id: "placeholders.info3"})}
                                                variant="outline" />
                                        </Field.Root></>
                                    )}

                                    {model === "safer_coast" && (
                                        <><HoverCard.Root openDelay={250} closeDelay={100} positioning={{placement:"top"}}>
                                            <HoverCard.Trigger asChild>
                                                <IconButton
                                                    marginLeft="2px"
                                                    size="sm"
                                                    aria-label="Info"
                                                    variant="ghost"
                                                    color="black">
                                                    <FaInfo />
                                                </IconButton>
                                            </HoverCard.Trigger>
                                            <HoverCard.Positioner>
                                                <HoverCard.Content>
                                                    <HoverCard.Arrow />
                                                    {intl.formatMessage({ id: "info_icon_safercoast.description" })}
                                                </HoverCard.Content>
                                            </HoverCard.Positioner>
                                        </HoverCard.Root>
                                        <Field.Root required>
                                            <Field.Label padding={0} htmlFor="esl">
                                                {intl.formatMessage({id: "modal.inputSea"})}
                                            </Field.Label>
                                            <Input
                                                type="number"
                                                id="esl"
                                                value={extremeSeaLevel === null ? "" : extremeSeaLevel}
                                                onChange={handleESLChange}
                                                placeholder={intl.formatMessage({id: "placeholders.info4"})}
                                                variant="outline" />
                                        </Field.Root></>
                                    )}
                                    {generationStatus && <p>Status: {generationStatus}</p>}
                                    {error && <p style={{ color: "red" }}>Error: {error}</p>}
                                    {downloadLink && (
                                        <Button color={"white"} bg={"#2e9ecc"}>
                                            {" "}
                                            <a
                                                href={downloadLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {intl.formatMessage({id: "modal.downloadMap"})}
                                            </a>
                                        </Button>
                                    )}
                                </VStack>
                            )}
                        </Dialog.Body>
                        <Dialog.Footer display="flex" justifyContent="space-between">
                            {tokenSubmitted && (
                                <>
                                    <Button
                                        color={"white"}
                                        bg={"#2e9ecc"}
                                        onClick={handleGenerateMap}
                                        disabled={
                                            !selectedLocation ||
                                            (model === "safer_rain" && !rainIntensity) || // Only rainIntensity for safer_rain
                                            (model === "safer_coast" && extremeSeaLevel === 0) || // Only ESL for safer_coast
                                            !!jobId
                                        }
                                    >
                                        {intl.formatMessage({id: "modal.runModel"})}
                                    </Button>
                                </>
                            )}
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Box>
    );
}

export default SaferPlacesFloodMap;
