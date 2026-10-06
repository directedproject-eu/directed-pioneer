// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ApplicationConfig, createCustomElement } from "@open-pioneer/runtime";
import { KeycloakProperties } from "@open-pioneer/authentication-keycloak";
// import { theme } from "@open-pioneer/theme";
import * as appMetadata from "open-pioneer:app";
import { MapApp } from "./MapApp";
import {config as themeConfig} from "@open-pioneer/base-theme";


const KEYCLOAK_PROPERTIES = {
    keycloakOptions: {
        refreshOptions: {
            autoRefresh: true,
            interval: 6000,
            timeLeft: 70
        },
        keycloakInitOptions: {
            onLoad: "check-sso",
            pkceMethod: "S256"
        },
        keycloakConfig: {
            url: import.meta.env.VITE_KEYCLOAK_CONFIG_URL ?? "https://directed.dev.52north.org/auth/",
            realm: import.meta.env.VITE_KEYCLOAK_CONFIG_REALM ?? "directed",
            clientId:
                import.meta.env.VITE_KEYCLOAK_CONFIG_CLIENT_ID ??
                "4XVoPpeRyh3S5RynkHLPvHum49aj39Ti"
        }
    }
} satisfies KeycloakProperties;

const element = createCustomElement({
    component: MapApp,
    chakraSystemConfig: themeConfig,
    appMetadata,
    async resolveConfig(): Promise<ApplicationConfig> {
        return {
            properties: {
                "@open-pioneer/authentication-keycloak": KEYCLOAK_PROPERTIES
            }
        };
    }
});

customElements.define("ol-map-app", element);
