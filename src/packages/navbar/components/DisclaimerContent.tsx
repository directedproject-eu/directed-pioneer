// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Text} from "@open-pioneer/chakra-integration";


const DisclaimerContent = () => {
    return (
        <Text>
            This web service integrates and combines various publicly available data sources, including data and information from the Copernicus Climate Change Service (C3S) and other Copernicus components. The service has been developed as part of the European Innovation project DIRECTED, and the information products provided herein have been crafted with care and to the best of our knowledge.
            <br></br>
            The service may process, integrate, or transform Copernicus data. While we strive to provide high-quality and useful information, the outputs are not official Copernicus products. The European Union and the Copernicus programme bear no responsibility for the use of the data or information presented through this service.
            <br></br>
            Furthermore, the information provided through this service is offered “as is”, without any warranty of any kind, whether express or implied, including but not limited to fitness for a particular purpose, accuracy, completeness, timeliness, or reliability.
            <br></br>
            We disclaim all liability for any loss, damage, or inconvenience that may result from the use of the service or reliance upon its outputs. Users are strongly encouraged to independently verify the information and to use this service at their own risk.
            <br></br>
            By using this web service, you acknowledge and agree to these terms.
        </Text>
    );
};

export default DisclaimerContent;