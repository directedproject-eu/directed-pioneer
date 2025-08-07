// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        ClientServiceImpl: {
            provides: ["app.ClientService"]
        }
    },
    ui: {
        references: ["app.ClientService"]
    },
    properties: {
        userConfig: {
            apiBaseUrl: "http://pygeoapi-saferplaces-lb-409838694.us-east-1.elb.amazonaws.com"
        }
    }
});
