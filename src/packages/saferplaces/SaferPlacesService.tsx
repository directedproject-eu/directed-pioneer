// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useState, ChangeEvent } from "react";
import {
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormLabel,
    FormControl,
    Input,
    Select,
    useDisclosure
} from "@open-pioneer/chakra-integration";
import { ToolButton } from "@open-pioneer/map-ui-components";
import { FaWater } from "react-icons/fa";


//interface for the job status response
interface JobStatusResponse {
    jobID?: string; //jobID option, might not be present for synchronous responses ?
    status?: "accepted" | "running" | "successful" | "failed" | "dismissed"; //status is optional for synchronous responses
    message?: string;
    progress?: number; //optional
    outputs?: {
        [key: string]: {
            href: string; //the URL to the output s3:// etc
            title?: string;
            type?: string;
        };
    };
    presigned_url?: string;
}

//define interfaces for the inputs
interface SaferRainInputs {
    dem: string;
    rain: string;
    water: string;
    presigned_url_out: boolean;
    sync: boolean;
    user: string;
    token: string;
    debug: boolean;
}

interface SaferRainPayload {
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

interface SaferCoastPayload {
    inputs: SaferCoastInputs;
}

//union type for all possible payloads
type ProcessExecutionPayload = SaferRainPayload | SaferCoastPayload;

export function SaferPlacesFloodMap() {
    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [rainIntensity, setRainIntensity] = useState<string>("");
    const [extremeSeaLevel, setExtremeSeaLevel] = useState<number| null>(null);
    // const [barrierFile, setBarrierFile] = useState<File | null>(null); //file object or null
    const [model, setModel] = useState<string>("");
    const [generationStatus, setGenerationStatus] = useState<string>("");
    const [downloadLink, setDownloadLink] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [jobId, setJobId] = useState<string | null>(null); //to store the job ID
    const [pollingIntervalId, setPollingIntervalId] = useState<number | null>(null); //to store the interval ID for clearing
    const { isOpen, onOpen, onClose } = useDisclosure(); //for model dialog

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

    const API_BASE_URL = "http://pygeoapi-saferplaces-lb-409838694.us-east-1.elb.amazonaws.com"; //saferplaces pygeoapi
    const API_PROCESS_RAIN_URL = `${API_BASE_URL}/processes/safer-rain-process/execution`;
    const API_PROCESS_COAST_URL = `${API_BASE_URL}/processes/safer-coast-process/execution`;

    const handleLocationChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedLocation(event.target.value);
    };

    const handleRainIntensityChange = (event: ChangeEvent<HTMLInputElement>) => {
        setRainIntensity(event.target.value);
    };

    const handleESLChange = (event: ChangeEvent<HTMLInputElement>) => {
        //if input is empty, set state to null, otherwise parse to float
        const value = event.target.value;
        setExtremeSeaLevel(value === "" ? null : parseFloat(value));
    };

    // const handleBarrierFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const files = event.target.files;

    //     if (files && files.length > 0) {
    //         const selectedFile = files[0];
    //         if (selectedFile) {
    //             setBarrierFile(selectedFile);
    //         } else {
    //             setBarrierFile(null); //if files[0] is undefined
    //         }
    //     } else {
    //         setBarrierFile(null); //if no file is selected
    //     }
    // };

    const pollJobStatus = async (jobStatusUrl: string) => {
        const maxAttempts = 60; //poll for up to 5 minutes (60 * 5 seconds)
        let attempts = 0;

        //clear any existing interval to prevent multiple polling loops
        if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
            setPollingIntervalId(null);
        }

        const intervalId = window.setInterval(async () => {
            if (attempts >= maxAttempts) {
                clearInterval(intervalId);
                setGenerationStatus("Job polling timed out.");
                setError("Flood map generation took too long or timed out.");
                setJobId(null);
                setPollingIntervalId(null);
                return;
            }

            try {
                const response = await fetch(jobStatusUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const jobStatus: JobStatusResponse = await response.json();
                console.log(`Job Status (${jobStatus.jobID}):`, jobStatus.status, jobStatus);

                setGenerationStatus(`Status: ${jobStatus.status}`);

                if (jobStatus.status === "successful") {
                    clearInterval(intervalId);
                    setGenerationStatus("Flood map generated successfully!");
                    setJobId(null);
                    setPollingIntervalId(null);

                    //prioritize presigned_url 
                    if (jobStatus.presigned_url) {
                        setDownloadLink(jobStatus.presigned_url);
                    } else if (jobStatus.outputs && jobStatus.outputs.water_depth_file) {
                        //fallback to water_depth_file if presigned_url isn't directly present
                        const s3OutputUrl = jobStatus.outputs.water_depth_file.href;
                        //S3 URLs need conversion if directly from S3 paths
                        const downloadUrl = s3OutputUrl.startsWith("s3://")
                            ? s3OutputUrl.replace("s3://", "https://s3.amazonaws.com/")
                            : s3OutputUrl; //use as-is if already a direct URL
                        setDownloadLink(downloadUrl);
                    } else {
                        setError("Download URL not found in the API response.");
                    }
                } else if (jobStatus.status === "failed" || jobStatus.status === "dismissed") {
                    clearInterval(intervalId);
                    setError(
                        `Flood map generation failed: ${jobStatus.message || "Unknown error"}`
                    );
                    setGenerationStatus("Failed.");
                    setJobId(null);
                    setPollingIntervalId(null);
                }
            } catch (err: unknown) {
                clearInterval(intervalId);
                if (err instanceof Error) {
                    setError(`An error occurred while polling the job status: ${err.message}`);
                } else {
                    setError(`An unknown error occurred while polling the job status.`);
                }
                setGenerationStatus("Failed.");
                setJobId(null);
                setPollingIntervalId(null);
            }
            attempts++;
        }, 5000); //poll every 5 seconds

        setPollingIntervalId(intervalId);
    };

    const handleGenerateMap = async () => {
        setGenerationStatus("Initiating flood map generation");
        setError("");
        setDownloadLink("");
        setJobId(null);
        if (pollingIntervalId) {
            clearInterval(pollingIntervalId); //clear any existing polling
            setPollingIntervalId(null);
        }

        // let requestDataPayload = {};
        let requestDataPayload: ProcessExecutionPayload | null = null;
        let apiUrl = "";
        const outputRain = `watermap_rain_${Date.now()}.tif`;
        const outputCoast = `watermap_coast_${Date.now()}.tif`;
        const selectedDemFile = locationDemFiles[selectedLocation]?.dem;
        const selectedSeamaskFile = locationDemFiles[selectedLocation]?.seamask;
        const s3Bucket = "s3-directed";
        const user = "saferplaces";
        const token = "S4fer_api_token";

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
                    rain: rainIntensity, //parse string to return integer, even with leading zeros
                    water: `s3://${s3Bucket}/api_data/${outputRain}`, //construct S3 output
                    presigned_url_out: true,
                    sync: true,
                    debug: true,
                    user: user,
                    token: token
                }
            };
        } else if (model === "safer_coast")  {
            if (extremeSeaLevel === null || extremeSeaLevel <= 0) {
                setError("For the Safer Coast Model, ESL must be a positive number");
                setGenerationStatus("Failed");
                return; //exit if validation fails
            }
            apiUrl = API_PROCESS_COAST_URL;
            requestDataPayload = {
                inputs: {
                    file_dem: selectedDemFile,
                    file_seamask: selectedSeamaskFile!,
                    barrier:
                        // "s3://s3-disasterbrain/api_data/09d06de7c80ba18d0a099a05b3cedc8f/barrier.shp", //from jupyter
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
            const headers: HeadersInit = {
                "Content-Type": "application/json"
            };

            if (model === "safer_rain" && "sync" in requestDataPayload.inputs) {
                if (requestDataPayload.inputs.sync === false) {
                    headers["Prefer"] = "respond-async";
                } else {
                    headers["Prefer"] = "respond-sync";
                }
            } else {
                //for safer_coast or if 'sync' property is not present (or add another model)
                headers["Prefer"] = "respond-sync";
            }

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestDataPayload)
            });

            if (response.status === 202 || response.status === 201) {
                //asynchronous response (job created / accepted)
                const locationHeader = response.headers.get("Location");
                console.log("debug: Location header received by JS:", locationHeader); //for async process debug
                console.log("debug: All response headers (JS):", [...response.headers.entries()]);

                let responseData: JobStatusResponse | null = null; //initialize as null

                //attempt to parse response body if it's JSON and not empty,
                //in case 201/202 also provides initial job details.
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    try {
                        const textBody = await response.text();
                        if (textBody.trim() !== "" && textBody.trim() !== "null") {
                            responseData = JSON.parse(textBody);
                        }
                    } catch (jsonParseError) {
                        console.warn(
                            "201/202 response body was not valid JSON, proceeding with Location header.",
                            jsonParseError
                        );
                        //warning, as Location header is primary for async jobs.
                    }
                }

                if (locationHeader) {
                    //prioritize jobID from responseData if available, else parse from Location header
                    const receivedJobId = responseData?.jobID || locationHeader.split("/").pop();
                    setJobId(receivedJobId || null);
                    setGenerationStatus(
                        `Job accepted, ID: ${receivedJobId}. Status: ${responseData?.status || "unknown"}. Polling for results...`
                    );
                    console.log("Job status URL:", locationHeader);
                    pollJobStatus(locationHeader); //start polling
                } else {
                    setError(
                        "Process accepted (201/202), but no Location header for job status found. Cannot poll."
                    );
                    setGenerationStatus("Failed to start polling.");
                }
            } else if (response.ok) {
                //this block is for synchronous 200 OK responses with a full body
                const contentType = response.headers.get("content-type");
                let responseBody: JobStatusResponse | null = null;

                if (contentType && contentType.includes("application/json")) {
                    try {
                        responseBody = await response.json();
                    } catch (jsonError: unknown) {
                        console.error(
                            "Failed to parse JSON for synchronous OK response:",
                            jsonError
                        );
                        setError(`API returned OK status but invalid JSON response.`);
                        setGenerationStatus("Failed.");
                        return;
                    }
                } else {
                    const rawText = await response.text();
                    console.warn("Synchronous OK response is not JSON:", rawText);
                    setError(
                        `API returned OK status but non-JSON response: ${rawText.substring(0, 100)}...`
                    );
                    setGenerationStatus("Failed.");
                    return;
                }

                if (!responseBody) {
                    setError("API returned a successful status but no valid response data.");
                    setGenerationStatus("Failed.");
                    return;
                }

                setGenerationStatus("Flood map generated successfully!");
                console.log("Synchronous API Response Data:", responseBody);

                if (responseBody.presigned_url) {
                    setDownloadLink(responseBody.presigned_url);
                } else if (responseBody.outputs?.water_depth_file) {
                    const s3OutputUrl = responseBody.outputs.water_depth_file.href;
                    const downloadUrl = s3OutputUrl.startsWith("s3://")
                        ? s3OutputUrl.replace("s3://", "https://s3.amazonaws.com/")
                        : s3OutputUrl;
                    setDownloadLink(downloadUrl);
                } else {
                    setError("Download URL not found in the synchronous API response.");
                }
            } else {
                //handles non-2xx failures (e.g., 4xx, 5xx)
                const responseBody = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(responseBody);
                    setError(
                        `API Error: ${response.status}: ${errorData.message || response.statusText}`
                    );
                } catch (_jsonError) {
                    setError(
                        `API response was not valid JSON: ${responseBody || response.statusText}`
                    );
                }
                setGenerationStatus("Failed.");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(`An error occurred during the fetch: ${err.message}`);
            } else {
                setError(`An unknown error occurred during the fetch.`);
            }
            setGenerationStatus("Failed.");
        }
    };

    //         //old response, only sychronous no polling
    //         const responseBody = await response.text();
    //         console.log("Response status:", response.status);
    //         console.log("Raw Response Body:", responseBody);

    //         //parse the response body as JSON
    //         let responseData;
    //         try {
    //             responseData = JSON.parse(responseBody);
    //         } catch (jsonError) {
    //             //ff not a valid JSON, handle it as a plain text error
    //             setError(`API response was not valid JSON: ${responseBody || response.statusText}`);
    //             setGenerationStatus("Failed.");
    //             return;
    //         }

    //         if (!response.ok) {
    //             setError(
    //                 `Flood map generation failed: ${responseData.message || response.statusText}`
    //             );
    //             setGenerationStatus("Failed.");
    //             return;
    //         }

    //         //if response.ok is true and parsing was successful
    //         setGenerationStatus("Flood map generated successfully!");
    //         console.log("Parsed API Response Data:", responseData);

    //         if (model === "safer_coast") {
    //             if (responseData && responseData.files && responseData.files.file_water) {
    //                 const s3OutputUrl = responseData.files.file_water;
    //                 const downloadUrl = s3OutputUrl.replace("s3://", "https://s3.amazonaws.com/");
    //                 setDownloadLink(downloadUrl);
    //             } else {
    //                 setError("Download URL not found in the API response for coastal model.");
    //             }
    //         } else if (model === "safer_rain") {
    //             //download link for safer_rain already set above
    //         }
    //     } catch (err) {
    //         setError(`An error occurred during the fetch: ${err.message}`);
    //         setGenerationStatus("Failed.");
    //     }
    // };
    // //end old response

    return (
        <Box>
            <ToolButton label="Run Flood Models" icon={<FaWater />} onClick={onOpen} />
            <Modal closeOnOverlayClick={true} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Flood Modeling</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormLabel padding={2}> Location </FormLabel>
                        <Select
                            id="location"
                            value={selectedLocation}
                            onChange={handleLocationChange}
                        >
                            <option value="">Select a Location</option>
                            {Object.keys(locationDemFiles).map((locationName) => (
                                <option key={locationName} value={locationName}>
                                    {locationName}
                                </option>
                            ))}
                        </Select>

                        <FormLabel padding={2}> Model </FormLabel>
                        <Select
                            id="model"
                            value={model}
                            placeholder="Select a Model"
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                setModel(e.target.value)
                            }
                        >
                            <option value="safer_rain">Safer Rain</option>
                            <option value="safer_coast">Safer Coast</option>
                        </Select>

                        {model === "safer_rain" && (
                            <>
                                <FormControl>
                                    <FormLabel padding={2} htmlFor="rain">Rain Intensity (mm) </FormLabel>
                                    <Input
                                        type="text"
                                        id="rain"
                                        value={rainIntensity}
                                        onChange={handleRainIntensityChange}
                                        placeholder="Input Value, e.g. 10"
                                        variant="outline"
                                    />
                                </FormControl>
                            </>
                        )}

                        {model === "safer_coast" && (
                            <>
                                <FormControl>
                                    <FormLabel padding={2} htmlFor="esl">Extreme Sea Level (m)</FormLabel>
                                    <Input
                                        type="number"
                                        id="esl"
                                        value={extremeSeaLevel === null ? "" : extremeSeaLevel}
                                        onChange={handleESLChange}
                                        placeholder="Input Value, e.g. 1"
                                        variant="outline"
                                    />
                                </FormControl>
                                {/* <div>
                                        <label htmlFor="barrier">Barrier File:</label>
                                        <input type="file" id="barrier" onChange={handleBarrierFileChange} />
                                    </div> */}
                            </>
                        )}
                        {generationStatus && <p>Status: {generationStatus}</p>}
                        {error && <p style={{ color: "red" }}>Error: {error}</p>}
                        {downloadLink && (
                            <Button color={"white"} bg={"#2e9ecc"}>
                                {" "}
                                <a href={downloadLink} target="_blank" rel="noopener noreferrer">
                                    Download Flood Map
                                </a>
                            </Button>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color={"white"}
                            bg={"#2e9ecc"}
                            onClick={handleGenerateMap}
                            disabled={
                                !selectedLocation ||
                                (model === "safer_rain" && !rainIntensity) || //only rainIntensity for safer_rain
                                (model === "safer_coast" && extremeSeaLevel === 0) || //only ESL for safer_coast
                                !!jobId //disable if job running
                            }
                        >
                            Run Model
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default SaferPlacesFloodMap;
