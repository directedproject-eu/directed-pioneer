// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        McdmServiceImpl: {
            provides: ["app.McdmService"], 
            references: {
                apiService: "app.ApiService"
            }
        }
    },
    i18n: ["en", "de", "da"],
    ui: {
        references: [
            "app.McdmService", 
            "app.ApiService"
        ]
    },
    properties: {
        userConfig: {
            apiBaseUrl: "https://directed.dev.52north.org/k8s-jobs"
        }
    }
});
