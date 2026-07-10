// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { createCustomElement } from "@open-pioneer/runtime";
// import { theme } from "@open-pioneer/theme";
import * as appMetadata from "open-pioneer:app";
import { MapApp } from "./MapApp";
import {config as themeConfig} from "@open-pioneer/base-theme";

const element = createCustomElement({
    component: MapApp,
    chakraSystemConfig: themeConfig,
    appMetadata
});

customElements.define("ol-map-app", element);
