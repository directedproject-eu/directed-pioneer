// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@chakra-ui/react";
import { useService } from "open-pioneer:react-hooks";
import { IsimipHandler } from "../../services/IsimipHandler";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { ISIMIP_COLORS } from "../../config/isimipScale";

/**
 * Legend for the "isimip" climate raster: the colour ramp and what its classes mean.
 *
 * Registered as `attributes.legend.Component` on that layer, so it is rendered by
 * `@open-pioneer/legend` with a single `layer` prop -- the range and variable come from
 * the service instead. The past-event layers used to be listed here too; each of them now
 * carries its own {@link EventLayerLegend}.
 */
const Legend: React.FC = () => {
    const prepSrvc = useService<IsimipHandler>("app.IsimipHandler");

    const { legendMetadata } = useReactiveSnapshot(
        () => ({
            legendMetadata: prepSrvc.legendMetadata
        }),
        [prepSrvc]
    );
    const range = legendMetadata.range;
    const variable = legendMetadata.variable;
    if (Number.isNaN(range)) {
        return (
            <Box bg={"white"} p={2} borderRadius="md" boxShadow="md" mt="1em">
                <Text fontWeight="bold" mb={0}>
                    {"There is no map data for this scenario"}
                </Text>
            </Box>
        );
    }

    const legend_text: Record<string, string> = {
        hurs: "Near-Surface Relative Humidity in %",
        pr: "Precipitation in kg·m⁻²·s⁻¹",
        rsds: "Surface Downwelling Shortwave Radiation in W/m²",
        sfcwind: "Near-Surface Wind Speed in m/s",
        spei12: "SPEI drought index",
        tas: "Near-Surface Air Temperature in K",
        tasmax: "Daily Maximum Near-Surface Air Temperature in K",
        tasmin: "Daily Minimum Near-Surface Air Temperature in K"
    };

    // Same ramp the service paints the raster with; the labels follow the value range of
    // the file currently shown, so they are computed rather than fixed.
    const increment = (range[1] - range[0]) / (ISIMIP_COLORS.length - 1);
    const to_display = ISIMIP_COLORS.map((color, index) => ({
        label: (range[0] + increment * index).toFixed(2),
        color: color
    }));

    return (
        <Box bg={"white"} p={2} borderRadius="md" boxShadow="md" mt="1em">
            <Text fontWeight="bold" mb={0}>
                {legend_text[variable]}
            </Text>
            <Box display="flex">
                <div style={{ marginRight: "3em" }}>
                    {to_display.map((item, index) => (
                        <Box key={index} display="flex" mb={1}>
                            <Box
                                width="12px"
                                height="12px"
                                bg={item.color}
                                mr={2}
                                border={"2px solid black"}
                            />
                            <Box>{item.label}</Box>
                        </Box>
                    ))}
                </div>
            </Box>
        </Box>
    );
};
export default Legend;
