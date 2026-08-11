// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import * as GeoTIFFJS from "geotiff"; // geotiff.js for reading values

/**
 * Pixels at or beyond this magnitude are fill values, not measurements.
 *
 * A threshold rather than an exact value on purpose: the files carry no GDAL_NODATA tag,
 * and the nodata configured on the OpenLayers sources (-5.3e37) does not match what the
 * data actually uses (1e30). See BACKLOG.md.
 */
const FILL_VALUE_THRESHOLD = 1e29;

/**
 * Lowest and highest real value in the first band of the geotiff at `url`.
 *
 * Returns undefined when the file holds no usable values at all. That is a real case and
 * not a defensive branch: spei12 accumulates over twelve months, so its files for the
 * first year are entirely fill -- 9576 of 9576 pixels, measured against the bucket.
 * Callers are expected to keep their previous scale rather than colour a raster from a
 * degenerate range.
 *
 * The whole raster is decoded to answer this, because the files carry neither header
 * statistics nor overviews. At 126x76 pixels (isimip) and 28x23 (forecast) that is cheap,
 * but it is why the callers debounce or guard their calls.
 */
export async function getRangeFromGeoTiff(url: string): Promise<[number, number] | undefined> {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        const tiff = await GeoTIFFJS.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();

        const rasterData = await image.readRasters();
        const bandData = rasterData[0]; // expecting only one band in the geotif
        if (!bandData) {
            throw new Error("The geotiff contains no raster band");
        }

        let min = Infinity;
        let max = -Infinity;
        for (const value of bandData) {
            if (!Number.isFinite(value) || Math.abs(value) >= FILL_VALUE_THRESHOLD) {
                continue;
            }
            if (value < min) min = value;
            if (value > max) max = value;
        }

        return min <= max ? [min, max] : undefined;
    } catch (error) {
        // Rethrow rather than return a substitute: the caller keeps the previous range,
        // which is wrong but usable, instead of feeding NaN into the colour scale.
        throw new Error(`Failed to read the value range from ${url}`, { cause: error });
    }
}
