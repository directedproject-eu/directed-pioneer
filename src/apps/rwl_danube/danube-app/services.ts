// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

/**
 * Service registry of the app. Every class that `build.config.mjs` declares under
 * `services` has to be exported from here -- that is how the pioneer runtime resolves a
 * service name to its implementation. Missing an export is a runtime error, not a build
 * error, so the two lists have to be kept in sync by hand.
 *
 * The implementations live in `./services/`; this file only re-exports them. Sorted
 * alphabetically so it can be diffed against `build.config.mjs` at a glance.
 */

export { ForestrySelectorImpl } from "./services/ForestrySelector";
export { GeosphereForecastServiceImpl } from "./services/GeosphereForecastService";
export { GeosphereServiceImpl } from "./services/GeosphereService";
export { IsimipHandlerImpl } from "./services/IsimipHandler";
export { LayerHighlighterImpl } from "./services/LayerHighlighter";
export { LayerZoomImpl } from "./services/LayerZoom";
export { MainMapProvider } from "./services/MapProvider";
export { NutsSelectorImpl } from "./services/NutsSelector";
export { StationSelectorImpl } from "./services/StationSelector";
export { TokenInterceptor } from "./services/TokenInterceptor";
