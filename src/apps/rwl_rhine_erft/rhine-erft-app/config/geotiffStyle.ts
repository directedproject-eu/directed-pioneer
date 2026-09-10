// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import chroma from "chroma-js";

/** One colour stop: value → colour (label optional, only relevant for legends). */
export interface GeoTiffColorStop {
    value: number;
    color: string;
    label?: string;
}

/**
 * Builds the OpenLayers WebGLTile colour expression (`interpolate`, linear over band 1)
 * from a list of colour stops. Shared by every geotiff layer -- the water depth and flow
 * velocity time series as well as the static maximum layers -- so the style logic exists
 * in one place only.
 *
 * `.css()` rather than `.hex()` preserves the alpha channel: the first stop (0) is
 * transparent and must not cover the map.
 */
export function buildColorGradient(colorMap: GeoTiffColorStop[]) {
    const boundaries = colorMap.map((item) => item.value);
    const gradientColors = colorMap.map((item) => item.color);
    const colorScale = chroma.scale(gradientColors).domain(boundaries).mode("lab");
    return [
        "interpolate",
        ["linear"],
        ["band", 1],
        ...boundaries.flatMap((boundary) => [boundary, colorScale(boundary).css()])
    ];
}
