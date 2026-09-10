// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { GeoTIFF } from "ol/source";
import { NODATA, SOURCE_PROJECTION } from "../config/floodDepth";

/** Called when the source could not be loaded. */
export type GeoTiffErrorHandler = (error: Error | null, url: string) => void;

/**
 * Builds a geotiff source for the HRB Eicherscheid rasters.
 *
 * `normalize: false` is required rather than preferred: the colour scales work in the
 * data's own units -- metres and m/s -- so the values must not be rescaled to 0..1 on the
 * way in. Projection and nodata are the same for water depth and flow velocity; both come
 * out of the same simulation.
 *
 * The source loads headers and metadata asynchronously and has no error event: when that
 * fails -- server unreachable, CORS, missing authorisation -- it switches to state "error"
 * and emits "change". OpenLayers logs it to the console, but without this listener nothing
 * reaches the application: on the map a dead server looks exactly like an empty layer.
 *
 * `onReady` lets callers clear a reported error: `setFileUrl` builds a new source on every
 * slider step, so a dead server would otherwise notify once per step.
 */
export function createGeoTiffSource(
    url: string,
    onError: GeoTiffErrorHandler,
    onReady?: () => void
): GeoTIFF {
    const source = new GeoTIFF({
        projection: SOURCE_PROJECTION,
        normalize: false,
        sources: [{ url: url, nodata: NODATA }]
    });

    source.on("change", () => {
        const state = source.getState();
        if (state === "error") {
            onError(source.getError(), url);
        } else if (state === "ready") {
            onReady?.();
        }
    });

    return source;
}
