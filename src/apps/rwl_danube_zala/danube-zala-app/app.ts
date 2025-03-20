// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { createCustomElement } from "@open-pioneer/runtime";
import { KeycloakProperties } from "@open-pioneer/authentication-keycloak";
import { theme } from "@open-pioneer/theme";
import * as appMetadata from "open-pioneer:app";
import { MapApp } from "./MapApp";

const element = createCustomElement({
    component: MapApp,
    theme,
    appMetadata,
    config: {
        properties: {
            "@open-pioneer/authentication-keycloak": {
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
            } satisfies KeycloakProperties
        }
    }
});

customElements.define("ol-map-app", element);
