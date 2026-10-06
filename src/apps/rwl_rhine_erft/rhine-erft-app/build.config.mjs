// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    styles: "./app.css",
    i18n: ["en", "de"],
    services: {
        MainMapProvider: {
            provides: ["map.MapConfigProvider"]
        },
        FloodDepthServiceImpl: {
            provides: ["app.FloodDepthService"]
        },
        FlowVelocityServiceImpl: {
            provides: ["app.FlowVelocityService"]
        },
        DamBreakServiceImpl: {
            provides: ["app.DamBreakService"],
            references: {
                floodDepthService: "app.FloodDepthService",
                flowVelocityService: "app.FlowVelocityService"
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
            "app.FloodDepthService",
            "app.FlowVelocityService",
            "app.DamBreakService"
        ]
    }
});
