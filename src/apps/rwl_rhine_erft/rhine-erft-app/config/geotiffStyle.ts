// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import chroma from "chroma-js";

/** Eine Farbstufe: Wert → Farbe (Label optional, nur für Legenden relevant). */
export interface GeoTiffColorStop {
    value: number;
    color: string;
    label?: string;
}

/**
 * Baut den OpenLayers-WebGLTile-Farbausdruck (`interpolate` linear über Band 1)
 * aus einer Liste von Farbstufen. Von allen GeoTIFF-Layern geteilt (Wassertiefe- und
 * Fließgeschwindigkeit-Zeitreihe sowie die statischen Max-Layer), damit die Style-Logik
 * nur an einer Stelle existiert.
 *
 * `.css()` (statt `.hex()`) erhält den Alphakanal – der erste Stop (0) ist transparent
 * und darf die Karte nicht überdecken.
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
