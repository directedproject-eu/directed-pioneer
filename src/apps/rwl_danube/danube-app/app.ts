// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ApplicationConfig, createCustomElement } from "@open-pioneer/runtime";
import { KeycloakProperties } from "@open-pioneer/authentication-keycloak";
import * as appMetadata from "open-pioneer:app";
import { config as themeConfig } from "@open-pioneer/base-theme";
import { MapApp } from "./MapApp";

interface UserConfig {
    pygeoapiBaseUrl: string;
}

const DEFAULT_USER_CONFIG: UserConfig = {
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

/**
 * Reads the 'lang' parameter from the URL and, if it names a locale the app actually
 * supports, uses it as the application's locale. Helpful during development, but optional.
 */
function getForcedLocale(): string | undefined {
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (!requested) {
        return undefined;
    }
    if (!appMetadata.locales?.includes(requested)) {
        console.warn(
            `Ignoring URL parameter 'lang=${requested}': supported locales are ` +
                `${appMetadata.locales?.join(", ")}.`
        );
        return undefined;
    }
    return requested;
}

async function loadUserConfig(): Promise<UserConfig> {
    try {
        const targetUrl = new URL("../../../public/config.json", import.meta.url);
        const response = await fetch(targetUrl);
        if (!response.ok) {
            throw new Error(`Request failed with status code ${response.status}.`);
        }

        const config = (await response.json()) as Partial<UserConfig>;
        if (!config.pygeoapiBaseUrl) {
            throw new Error("Property 'pygeoapiBaseUrl' is missing.");
        }
        return { ...DEFAULT_USER_CONFIG, ...config };
    } catch (error) {
        console.warn("Failed to load config.json, using defaults:", error);
        return DEFAULT_USER_CONFIG;
    }
}

const element = createCustomElement({
    component: MapApp,
    chakraSystemConfig: themeConfig,
    appMetadata,
    config: {
        locale: getForcedLocale()
    },
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
