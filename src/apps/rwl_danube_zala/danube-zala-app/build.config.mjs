// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    styles: "./app.css",
    i18n: ["en", "de"],
    services: {
        MainMapProvider: {
            provides: ["map.MapConfigProvider"],
            references: {
                vectorSourceFactory: "ogc-features.VectorSourceFactory",
                authService: "authentication.AuthService"
            }
        },
        LayerHandlerImpl: {
            provides: ["app.LayerHandler"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
        StationSelectorImpl: {
            provides: ["app.StationSelector"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
        TokenInterceptor: {
            provides: ["http.Interceptor"],
            references: {
                authService: "authentication.AuthService"
            }
        }
    },
    ui: {
        references: [
            "authentication.AuthService",
            "http.HttpService",
            "app.LayerHandler",
            "app.StationSelector",
            "ogc-features.VectorSourceFactory",
            "ogc-features.SearchSourceFactory"
        ]
    },
    properties: {
        userConfig: {}
    }
});
