// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ApplicationConfig, createCustomElement } from "@open-pioneer/runtime";
import { theme } from "@open-pioneer/theme";
import * as appMetadata from "open-pioneer:app";
import { MapApp } from "./MapApp";

// Reads the 'lang' parameter from the URL and, if set, uses it
// for the application's locale.
// This can be helpful during development, but its entirely optional.
const URL_PARAMS = new URLSearchParams(window.location.search);
const FORCED_LANG = URL_PARAMS.get("lang") || undefined;

const element = createCustomElement({
    component: MapApp,
    theme,
    appMetadata,
    config: {
        locale: FORCED_LANG
    },
    async resolveConfig(): Promise<ApplicationConfig> {
        try {
            const targetUrl = new URL("../../../public/config.json", import.meta.url);
            const config = await (await fetch(targetUrl)).json();
            return {
                properties: {
                    "copenhagen-app": {
                        "userConfig": config
                    }
                }
            };
        } catch {
            return {
                properties: {
                    "copenhagen-app": {
                        userConfig: {
                            pygeoapiBaseUrl: "https://directed.dev.52north.org/api"
                        }
                    }
                }
            };
        }
    }
});

customElements.define("ol-map-app", element);
