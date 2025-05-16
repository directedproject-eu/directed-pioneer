// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

// The empty object is the minimal configuration.
// We're not going to use any custom features from the Open Pioneer Trails framework for now.
// export async function getUserConfig() {
//     try {
//         const response = await fetch("/config.json");
//         const config = await response.json();
//         return {
//             userConfig: config
//         };
//     } catch {
//         return {
//             userConfig: {
//                 taxonomyBaseUrl: "https://api-uat.connectivity-hub.com/api"
//             }
//         };
//     }
// };

export default defineBuildConfig({
    ui: {
        references: ["app.TaxonomyService"]
    },
    services: {
        TaxonomyServiceImpl: {
            provides: ["app.TaxonomyService"]
        }
    },
    // properties: getUserConfig()
    properties: {
        userConfig: {
            taxonomyBaseUrl: "https://api-uat.connectivity-hub.com/api"
        }
    }
});
