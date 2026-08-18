// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import chroma from "chroma-js";

/**
 * Turns colour stops into the style expression OpenLayers evaluates per pixel.
 *
 * chroma only mixes the stop colours in Lab space; the interpolation between them happens
 * in WebGL, which is why the stops are emitted as value/colour pairs rather than the scale
 * itself being handed over. Values outside `boundaries` take the colour of the nearest end.
 */
export function toColorExpression(colors: readonly string[], boundaries: readonly number[]) {
    const scale = chroma
        .scale([...colors])
        .domain([...boundaries])
        .mode("lab");
    return [
        "interpolate",
        ["linear"], // Specify the interpolation type
        ["band", 1], // The data band
        ...boundaries.flatMap((boundary) => [boundary, scale(boundary).hex()])
    ];
}

/**
 * `count` evenly spaced class bounds across `range`.
 *
 * The last bound is set to `range[1]` rather than computed, so floating point drift cannot
 * leave the highest pixel value just outside the domain.
 */
export function evenBoundaries(range: [number, number], count: number): number[] {
    const step = (range[1] - range[0]) / (count - 1);
    return Array.from({ length: count }, (_, index) =>
        index === count - 1 ? range[1] : range[0] + index * step
    );
}
