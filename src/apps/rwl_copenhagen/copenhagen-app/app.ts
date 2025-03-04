// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ApplicationConfig, createCustomElement } from "@open-pioneer/runtime";
import { theme } from "@open-pioneer/theme";
import * as appMetadata from "open-pioneer:app";
import { MapApp } from "./MapApp";

const element = createCustomElement({
    component: MapApp,
    theme,
    appMetadata,
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
