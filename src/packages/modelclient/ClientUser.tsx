// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import ClientService from "./ClientService";

export function ModelClient() {
    const [name, setName] = useState("");
    const [jobStatus, setJobStatus] = useState("Idle");
    const [jobMessage, setJobMessage] = useState("");
    const { submitJob } = ClientService();
    // const { submitJob, pollJobStatus } = ClientService();
    // const [greeting, setGreeting] = useState("");
    // const { sayHello } = ClientService();

    const handleInputChange = (event: { target: { value: React.SetStateAction<string> } }) => {
        setName(event.target.value);
    };

    const handleSayHelloClick = async () => {
        setJobStatus("Submitting job");
        setJobMessage(""); //clear previous messages

        const processId = "hello-world"; //set the process ID

        // const inputs = new Map();
        const inputs = new Map<string, string>();
        inputs.set("name", name || "User"); //use name from input, default to "User"
        inputs.set("message", "hello");
        console.log("Inputs prepared:", inputs);

        // const outputs = new Map();
        const outputs = new Map<
            string,
            { mediaType: string; transmissionMode: "value" | "reference" }
        >();
        outputs.set("echo", { mediaType: "application/json", transmissionMode: "value" });
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

            if (finalResult.status === "successful") {
                setJobStatus("Job Completed Successfully!");
                const messageOutput = finalResult.outputs;
                const displayMessage =
                    messageOutput || "Job successful, no specific output message";
                setJobMessage(displayMessage);
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
            <h2>Hello World Client</h2>
            <label htmlFor="nameInput">Enter your name:</label>
            <input type="text" id="nameInput" value={name} onChange={handleInputChange} />
            <button onClick={handleSayHelloClick}>Say Hello</button>
            {/* {greeting && <p>Greeting: {greeting}</p>} */}
            <div>
                <h3>Job Status: {jobStatus}</h3>
                {jobMessage && <p>Message: {jobMessage}</p>}
            </div>
        </div>
    );
}

export default ModelClient;
