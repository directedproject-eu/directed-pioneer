// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import React, { useState, ChangeEvent } from "react";
import { ClientService } from "./ClientService";
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
import { useService } from "open-pioneer:react-hooks";

export function ModelClient() {
    // const [name, setName] = useState("");
    const clientService = useService<ClientService>("app.ClientService");
    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [rainIntensity, setRainIntensity] = useState("10");
    const [extremeSeaLevel, setExtremeSeaLevel] = useState<number | null>(null);
    const [model, setModel] = useState<string>("");
    const [jobStatus, setJobStatus] = useState("Idle");
    const [jobMessage, setJobMessage] = useState("");
    const [downloadLink, setDownloadLink] = useState("");
    // const { submitJob } = ClientService();
    const { isOpen, onOpen, onClose } = useDisclosure(); //for model dialog

    // const { submitJob, pollJobStatus } = ClientService();
    // const [greeting, setGreeting] = useState("");
    // const { sayHello } = ClientService();

    // const handleInputChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    //     setName(event.target.value);
    // };

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

    const handleLocationChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedLocation(event.target.value);
    };

    const handleRainIntensityChange = (event: {
        target: { value: React.SetStateAction<string> };
    }) => {
        setRainIntensity(event.target.value);
    }; //saferplaces

    const handleESLChange = (event: ChangeEvent<HTMLInputElement>) => {
        //if input is empty, set state to null, otherwise parse to float
        const value = event.target.value;
        setExtremeSeaLevel(value === "" ? null : parseFloat(value));
    };

    // const handleSayHelloClick = async () => {
    //     setJobStatus("Submitting job");
    //     setJobMessage(""); //clear previous messages

    //     const processId = "hello-world"; //set the process ID

    // const inputs = new Map();
    // const inputs = new Map<string, string>();
    // inputs.set("name", name || "User"); //use name from input, default to "User"
    // inputs.set("message", "hello");
    // console.log("Inputs prepared:", inputs);

    const handleGenerateMapClick = async () => {
        setJobStatus("Submitting job");
        setJobMessage(""); //clear previous messages
        setDownloadLink(""); // Clear previous download link

        // const processId = "safer-rain-process"; //set the process ID to safer-rain-process

        const s3Bucket = "s3-directed";
        const user = "saferplaces";
        const token = "S4fer_api_token";
        const selectedDemFile = locationDemFiles[selectedLocation]?.dem;
        const selectedSeamaskFile = locationDemFiles[selectedLocation]?.seamask;

        if (!selectedLocation || !selectedDemFile) {
            setJobStatus("Failed");
            setJobMessage("Please select a valid location.");
            return;
        }

        let processId = "";
        const inputs = new Map<string, string | number | boolean>();
        // const outputs = new Map();
        const outputs = new Map<
            string,
            { mediaType: string; transmissionMode: "value" | "reference" }
        >();
        // outputs.set("echo", { mediaType: "application/json", transmissionMode: "value" }); //original

        if (model === "safer_rain") {
            if (!rainIntensity) {
                setJobStatus("Failed");
                setJobMessage("Please provie a Rain Intensity value");
                return;
            }
            processId = "safer-rain-process";
            const outputRain = `watermap_rain_${Date.now()}.tif`;

            inputs.set("dem", selectedDemFile);
            inputs.set("rain", parseInt(rainIntensity, 10)); //ensure rain is a number
            inputs.set("water", `s3://${s3Bucket}/api_data/${outputRain}`);
            inputs.set("presigned_url_out", true);
            inputs.set("sync", true); //request execution mode
            inputs.set("user", user);
            inputs.set("token", token);
            inputs.set("debug", true);
            console.log("Inputs prepared:", inputs);
            outputs.set("water_depth_file", {
                mediaType: "application/json",
                transmissionMode: "reference"
            });
        } else if (model === "safer_coast") {
            if (extremeSeaLevel === null || extremeSeaLevel <= 0) {
                setJobStatus("Failed");
                setJobMessage("Extreme Sea Level must be a postive number");
                return;
            }
            if (!selectedSeamaskFile) {
                setJobStatus("Failed");
                setJobMessage("Seamask file not found for the selected location");
                return;
            }
            processId = "safer-coast-process";
            const outputCoast = `watermap_coast_${Date.now()}.tif`;

            inputs.set("file_dem", selectedDemFile);
            inputs.set("file_seamask", selectedSeamaskFile);
            inputs.set("esl", extremeSeaLevel);
            inputs.set("barrier", null); //assume barrier null for now
            inputs.set("file_water", `s3://${s3Bucket}/api_data/${outputCoast}`);
            inputs.set("presigned_url_out", true);
            inputs.set("user", user);
            inputs.set("token", token);
            inputs.set("debug", true);

            outputs.set("water_depth_file", {
                mediaType: "application/json",
                transmissionMode: "reference"
            });
        } else {
            setJobStatus("Failed");
            setJobMessage("Please select a model to run.");
            return;
        }

        console.log("Inputs prepared:", inputs);
        console.log("Outputs requested:", outputs);

        const preferSynchronous = false; //set true for sync, false async

        try {
            const finalResult = await clientService.submitJob({
                inputs: inputs,
                outputs: outputs,
                synchronous: preferSynchronous,
                processId: processId,
                response: "document"
            });
            // const { jobID } = initialJobResponse;

            // if (finalResult.status === "successful") {
            //     setJobStatus("Job Completed Successfully!");
            //     const messageOutput = finalResult.outputs;
            //     const displayMessage =
            //         messageOutput || "Job successful, no specific output message";
            //     setJobMessage(displayMessage);
            // } else {
            //     setJobStatus(`Job finished with status: ${finalResult.status}`);
            //     setJobMessage(
            //         `Error: ${finalResult.message || JSON.stringify(finalResult, null, 2)}`
            //     );
            // } //original

            if (finalResult.status === "successful") {
                setJobStatus("Job Completed Successfully!");
                let displayMessage = "Job successful, no specific output message";
                let downloadUrl = "";

                if (finalResult.presigned_url) {
                    downloadUrl = finalResult.presigned_url;
                    displayMessage = `Job successful. Download available via presigned URL.`;
                } else if (finalResult.outputs) {
                    if (Array.isArray(finalResult.outputs)) {
                        if (finalResult.outputs.length > 0) {
                            const outputItem = finalResult.outputs[0];
                            if (outputItem) {
                                if (outputItem.presigned_url) {
                                    downloadUrl = outputItem.presigned_url;
                                    displayMessage = `Job successful. Download available via presigned URL from output item.`;
                                } else if (
                                    "water_depth_file" in outputItem &&
                                    outputItem.water_depth_file
                                ) {
                                    const s3OutputUrl = outputItem.water_depth_file;
                                    downloadUrl = s3OutputUrl.startsWith("s3://")
                                        ? s3OutputUrl.replace("s3://", "https://s3.amazonaws.com/")
                                        : s3OutputUrl;
                                    displayMessage = `Job successful. Download available for water_depth_file.`;
                                } else if (outputItem.href) {
                                    const genericHref = outputItem.href;
                                    downloadUrl = genericHref.startsWith("s3://")
                                        ? genericHref.replace("s3://", "https://s3.amazonaws.com/")
                                        : genericHref;
                                    displayMessage = `Job successful. Download available via generic link from output item.`;
                                } else {
                                    console.warn(
                                        "No specific download link found in the first output item."
                                    );
                                }
                            } else {
                                console.warn(
                                    "Outputs array contained a null/undefined item at index 0."
                                );
                            }
                        }
                    } else if (
                        typeof finalResult.outputs === "object" &&
                        "water_depth_file" in finalResult.outputs
                    ) {
                        const specificOutput = (
                            finalResult.outputs as {
                                water_depth_file: { href: string };
                            }
                        ).water_depth_file;

                        if (specificOutput?.href) {
                            const s3OutputUrl = specificOutput.href;
                            downloadUrl = s3OutputUrl.startsWith("s3://")
                                ? s3OutputUrl.replace("s3://", "https://s3.amazonaws.com/")
                                : s3OutputUrl;
                            displayMessage = `Job successful. Download available for water_depth_file.`;
                        }
                    }
                }

                setJobMessage(displayMessage);
                setDownloadLink(downloadUrl);
            } else {
                setJobStatus(`Job finished with status: ${finalResult.status}`);
                setJobMessage(
                    `Error: ${finalResult.message || JSON.stringify(finalResult, null, 2)}`
                );
            }
        } catch (error: unknown) {
            console.error("Job execution failed:", error);
            setJobStatus("Job Failed!");
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            setJobMessage(`Error: ${errorMessage}`);
        }
    };

    // setJobStatus(`Job ${jobID} submitted. Polling status...`);

    // //poll for job status until completion
    // const finalJobStatus = await pollJobStatus("hello-world", jobID);

    // //handle successful job completion
    // if (finalJobStatus.status === "successful") {
    //     const message =
    //         finalJobStatus.outputs?.message ||
    //         "Job successful, no specific output message.";
    //     setJobStatus("Job Completed Successfully!");
    //     setJobMessage(message);
    // } else {
    //     //case to be caught when pollJobStatus's rejects
    //     setJobStatus("Job finished with unexpected status.");
    //     setJobMessage(JSON.stringify(finalJobStatus, null, 2));
    // }

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
                                    <FormLabel padding={2} htmlFor="rain">
                                        Rain Intensity (mm){" "}
                                    </FormLabel>
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
                                    <FormLabel padding={2} htmlFor="esl">
                                        Extreme Sea Level (m)
                                    </FormLabel>
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
                        {jobStatus && <p>Status: {jobStatus}</p>}
                        {jobMessage && <p style={{ color: "red" }}>Message: {jobMessage}</p>}
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
                            onClick={handleGenerateMapClick}
                            disabled={
                                !selectedLocation ||
                                (model === "safer_rain" && !rainIntensity) || //only rainIntensity for safer_rain
                                (model === "safer_coast" && extremeSeaLevel === 0) || //only ESL for safer_coast
                                jobStatus.includes("Submitting") //disable button when job is being submitted
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
// export default ModelClient
