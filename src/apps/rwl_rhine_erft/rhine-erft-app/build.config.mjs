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
            provides: ["app.FloodDepthService"],
            references: {
                mapRegistry: "map.MapRegistry",
                notificationService: "notifier.NotificationService"
            }
        },
        FlowVelocityServiceImpl: {
            provides: ["app.FlowVelocityService"],
            references: {
                mapRegistry: "map.MapRegistry",
                notificationService: "notifier.NotificationService"
            }
        }
    },
    ui: {
        references: [
            "authentication.AuthService",
            "app.FloodDepthService",
            "app.FlowVelocityService"
        ]
    }
});
