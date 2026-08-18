// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

/**
 * Wiring of the app, read by the pioneer vite plugin at build time.
 *
 * - `services` is the dependency graph: each entry names a class exported from
 *   `services.ts`, the interfaces it `provides`, and the other services it wants
 *   injected as `references`. The runtime constructs a service only after everything
 *   it references exists, so a reference that is declared but never read still costs
 *   startup order -- keep this list matching what the constructors actually use.
 * - `ui` lists what the React components may pull in via `useService`. Requesting a
 *   service that is not listed here fails at runtime, not at build time.
 * - `styles` and `i18n` point at `app.css` and the message files in `i18n/`; the
 *   locales named here are the ones `appMetadata.locales` reports back to `app.ts`.
 */
export default defineBuildConfig({
    styles: "./app.css",
    i18n: ["en", "de", "hu"],
    services: {
        MainMapProvider: {
            provides: ["map.MapConfigProvider"]
        },
        IsimipHandlerImpl: {
            provides: ["app.IsimipHandler"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
        StationSelectorImpl: {
            provides: ["app.StationSelector"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
        ForestrySelectorImpl: {
            provides: ["app.ForestrySelector"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
        NutsSelectorImpl: {
            provides: ["app.NutsSelector"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
        TokenInterceptor: {
            provides: ["http.Interceptor"],
            references: {
                authService: "authentication.AuthService"
            }
        },
        LayerHighlighterImpl: {
            provides: ["app.LayerHighlighter"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
        LayerZoomImpl: {
            provides: ["app.LayerZoom"]
        },
        GeosphereServiceImpl: {
            provides: ["app.GeosphereService"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
        GeosphereForecastServiceImpl: {
            provides: ["app.GeosphereForecastService"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        }
    },
    ui: {
        references: [
            "authentication.AuthService",
            "app.GeosphereService",
            "app.GeosphereForecastService",
            "app.IsimipHandler",
            "app.LayerHighlighter",
            "app.LayerZoom",
            "app.StationSelector",
            "app.ForestrySelector",
            "app.NutsSelector",
            "ogc-features.VectorSourceFactory"
        ]
    },
    // Deliberately empty: resolveConfig() in app.ts fills this at startup from
    // config.json and falls back to its own defaults if that fails. Putting a default
    // here as well would give the app two sources of truth, and this one would sit
    // apart from the validation and the warning that go with it.
    properties: {
        userConfig: {}
    }
});
