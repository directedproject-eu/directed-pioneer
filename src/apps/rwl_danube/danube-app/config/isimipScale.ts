// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

/**
 * Colour ramp for the ISIMIP climate raster, coldest first.
 *
 * The "BC" alpha suffix is ~74% opacity, which is what lets the basemap show through. The
 * first stop is fully transparent, so the lowest class disappears rather than covering the
 * map in black.
 *
 * The class bounds are not fixed: they are recomputed from each file's own value range, so
 * this ramp is stretched differently for every frame. Whether that is the right behaviour
 * is an open question -- see BACKLOG.md.
 */
export const ISIMIP_COLORS: readonly string[] = [
    "#00000000", // transparent
    "#eb7fe9BC", // pink
    "#4f59cdBC", // cold blue
    "#1ceae1BC", // ice blue
    "#5fdf65BC", // green
    "#eade57BC", // yellow
    "#ec8647BC", // orange
    "#832525BC", // red
    "#53050aBC" // dark red, rgba(83,5,10,0.74)
];
