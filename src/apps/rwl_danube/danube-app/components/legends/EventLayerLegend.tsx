// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box } from "@chakra-ui/react";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useService } from "open-pioneer:react-hooks";
import { LayerHighlighter } from "../../services/LayerHighlighter";

/**
 * Legend entry for one of the past-event layers from the Zala region.
 *
 * Renders a dot in the layer's own colour and wires the highlight interaction: hovering
 * enlarges the points on the map, clicking zooms to them.
 *
 * Everything it needs comes from the layer itself -- id, title and the colour stored as
 * the `eventColor` attribute -- so there is no table mapping layer ids to colours here.
 * The entry appears exactly when its layer is visible, and the layers only exist once a
 * user is logged in, which is why no authentication check is needed either.
 */
export function EventLayerLegend({ layer }: LegendItemComponentProps) {
    const highlighter = useService<LayerHighlighter>("app.LayerHighlighter");
    const color = layer.attributes.eventColor as string;

    return (
        <Box
            display="flex"
            alignItems="center"
            mb={1}
            cursor="pointer"
            onMouseEnter={() => highlighter.highlightLayer(layer.id)}
            onMouseLeave={() => highlighter.unHighlightLayer(layer.id)}
            onClick={() => highlighter.zoomTo(layer.id)}
        >
            <Box width="15px" height="15px" bg={color} borderRadius="50%" mr={2} />
            <Box>{layer.title}</Box>
        </Box>
    );
}
