// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ApplicationConfig, createCustomElement } from "@open-pioneer/runtime";
import { KeycloakProperties } from "@open-pioneer/authentication-keycloak";
import * as appMetadata from "open-pioneer:app";
import {config as themeConfig} from "@open-pioneer/base-theme";
import { MapApp } from "./MapApp";

const DEFAULT_USER_CONFIG = {
    pygeoapiBaseUrl: "https://directed.dev.52north.org/api"
};

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
            url: "https://directed.dev.52north.org/auth/",
            realm: "directed",
            clientId: "4XVoPpeRyh3S5RynkHLPvHum49aj39Ti"
            // uncomment for local development (need to create .env.local)
            // url: import.meta.env.VITE_KEYCLOAK_CONFIG_URL,
            // realm: import.meta.env.VITE_KEYCLOAK_CONFIG_REALM,
            // clientId: import.meta.env.VITE_KEYCLOAK_CONFIG_CLIENT_ID
        }
    }
} satisfies KeycloakProperties;

async function loadUserConfig() {
    try {
        const targetUrl = new URL("../../../public/config.json", import.meta.url);
        return await (await fetch(targetUrl)).json();
    } catch {
        return DEFAULT_USER_CONFIG;
    }
}

const element = createCustomElement({
    component: MapApp,
    chakraSystemConfig: themeConfig,
    appMetadata,
    async resolveConfig(): Promise<ApplicationConfig> {
        return {
            properties: {
                "danube-app": {
                    userConfig: await loadUserConfig()
                },
                "@open-pioneer/authentication-keycloak": KEYCLOAK_PROPERTIES
            }
        };
    }
});

customElements.define("ol-map-app", element);
