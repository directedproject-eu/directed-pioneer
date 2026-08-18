// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ApplicationConfig, createCustomElement } from "@open-pioneer/runtime";
import { KeycloakProperties } from "@open-pioneer/authentication-keycloak";
import * as appMetadata from "open-pioneer:app";
import { config as themeConfig } from "@open-pioneer/base-theme";
import { MapApp } from "./MapApp";

/**
 * The properties this app reads from `src/public/config.json`.
 *
 * Deliberately narrow: the file also carries settings for other packages, e.g.
 * `taxonomyBaseUrl`. Those are passed through untouched rather than declared here.
 */
interface UserConfig {
    pygeoapiBaseUrl: string;
}

/**
 * Used when `config.json` is missing or unusable. Points at the default deployment so
 * the app still starts instead of coming up without a data source.
 */
const DEFAULT_USER_CONFIG: UserConfig = {
    pygeoapiBaseUrl: "https://directed.dev.52north.org/api"
};

/**
 * Configuration for `@open-pioneer/authentication-keycloak`.
 *
 * Note the mixed units: `interval` is in milliseconds, `timeLeft` in seconds -- it is
 * handed to `keycloak.updateToken` as `minValidity`. So: check every 6 seconds, renew a
 * token that expires within the next 70.
 */
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

/**
 * Loads `config.json`, falling back to {@link DEFAULT_USER_CONFIG} on any problem.
 *
 * Both checks below matter: `fetch` resolves on HTTP error status, so an error page that
 * happens to parse as JSON would otherwise reach the services, and a config without
 * `pygeoapiBaseUrl` would leave the map layers requesting "undefined/collections/...".
 */
async function loadUserConfig(): Promise<UserConfig> {
    try {
        // Vite rewrites this at build time; the path is relative to this module, not to
        // the served document.
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
