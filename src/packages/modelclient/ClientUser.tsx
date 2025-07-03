// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import ClientService from "./ClientService";

export function ModelClient() {
    // const [name, setName] = useState("");
    const [rainIntensity, setRainIntensity] = useState("10");
    const [jobStatus, setJobStatus] = useState("Idle");
    const [jobMessage, setJobMessage] = useState("");
    const [downloadLink, setDownloadLink] = useState("");
    const { submitJob } = ClientService();
    // const { submitJob, pollJobStatus } = ClientService();
    // const [greeting, setGreeting] = useState("");
    // const { sayHello } = ClientService();

    // const handleInputChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    //     setName(event.target.value);
    // };

    const handleRainIntensityChange = (event: {
        target: { value: React.SetStateAction<string> };
    }) => {
        setRainIntensity(event.target.value);
    }; //saferplaces

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

        const processId = "safer-rain-process"; //set the process ID to safer-rain-process

        const s3Bucket = "s3-directed";
        const outputRain = `watermap_rain_${Date.now()}.tif`; //dynamic output file name
        const user = "saferplaces";
        const token = "S4fer_api_token";
        const demFile =
            "s3://s3-directed/api_data/c5298b37096499d3c8bcfc49e449b393/dem_building.tif"; //from jupyter

        //saferplaces safer-rain-process test
        const inputs = new Map<string, string | number | boolean>();
        inputs.set("dem", demFile);
        inputs.set("rain", parseInt(rainIntensity, 10)); //ensure rain is a number
        inputs.set("water", `s3://${s3Bucket}/api_data/${outputRain}`);
        inputs.set("presigned_url_out", true);
        inputs.set("sync", true); //request execution mode
        inputs.set("user", user);
        inputs.set("token", token);
        inputs.set("debug", true);
        console.log("Inputs prepared:", inputs);

        // const outputs = new Map();
        const outputs = new Map<
            string,
            { mediaType: string; transmissionMode: "value" | "reference" }
        >();
        // outputs.set("echo", { mediaType: "application/json", transmissionMode: "value" }); //original
        outputs.set("water_depth_file", {
            mediaType: "application/json",
            transmissionMode: "reference"
        }); //saferplaces
        console.log("Outputs requested:", outputs);

        const preferSynchronous = false; //set true for sync, false async

        try {
            //submit the asynchronous job; synchronous resolves immediately with result
            const finalResult = await submitJob({
                inputs: inputs,
                outputs: outputs,
                synchronous: preferSynchronous, //pass the execution mode
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
                } else if (finalResult.outputs && finalResult.outputs.water_depth_file) {
                    const s3OutputUrl = finalResult.outputs.water_depth_file.href;
                    // Convert S3 URL to HTTPS if necessary for direct download
                    downloadUrl = s3OutputUrl.startsWith("s3://")
                        ? s3OutputUrl.replace("s3://", "https://s3.amazonaws.com/")
                        : s3OutputUrl;
                    displayMessage = `Job successful. Download available for water_depth_file.`;
                }
                setJobMessage(displayMessage);
                setDownloadLink(downloadUrl);
            } else {
                setJobStatus(`Job finished with status: ${finalResult.status}`);
                setJobMessage(
                    `Error: ${finalResult.message || JSON.stringify(finalResult, null, 2)}`
                );
            }

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
        } catch (error: unknown) {
            console.error("Job execution failed:", error);
            setJobStatus("Job Failed!");
            //display error message if available
            // setJobMessage(`Error: ${error.message || JSON.stringify(error)}`);
        }
    };

    return (
        <div>
            <h2>Safer Rain Process Client</h2>
            {/* <label htmlFor="nameInput">Enter your name:</label> */}
            <label htmlFor="rainInput">Rain Intensity (mm):</label>
            <input
                type="number"
                id="rainInput"
                value={rainIntensity}
                onChange={handleRainIntensityChange}
            />
            {/* <input type="text" id="nameInput" value={name} onChange={handleInputChange} /> */}
            {/* <button onClick={handleSayHelloClick}>Say Hello</button> */}
            <button onClick={handleGenerateMapClick}>Generate Flood Map</button>
            {/* {greeting && <p>Greeting: {greeting}</p>} */}
            <div>
                <h3>Job Status: {jobStatus}</h3>
                {jobMessage && <p>Message: {jobMessage}</p>}
                {downloadLink && (
                    <p>
                        Download Link:{" "}
                        <a href={downloadLink} target="_blank" rel="noopener noreferrer">
                            {downloadLink}
                        </a>
                    </p>
                )}
            </div>
        </div>
    );
}

export default ModelClient;
