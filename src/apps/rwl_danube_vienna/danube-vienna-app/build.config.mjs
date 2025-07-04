// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    styles: "./app.css",
    i18n: ["en", "de"],
    ui: {
        references: ["app.GeosphereService"]
    },
    services: {
        MainMapProvider: {
            provides: ["map.MapConfigProvider"]
        },
        GeosphereServiceImpl: {
            provides: ["app.GeosphereService"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        }
    }
});
