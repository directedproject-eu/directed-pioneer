// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    styles: "./app.css",
    i18n: ["en", "de", "da"],
    ui: {
        references: [
            "app.LayerZoom", 
            "app.ForecastService", 
            "app.FloodHandler"
        ]
    },
    services: {
        MainMapProvider: {
            provides: ["map.MapConfigProvider"]
        },
        ForecastServiceImpl: {
            provides: ["app.ForecastService"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
        LayerZoomImpl: {
            provides: ["app.LayerZoom"]
        }, 
        FloodHandlerImpl: {
            provides: ["app.FloodHandler"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
    },
    properties: {
        userConfig: {}
    }
});
