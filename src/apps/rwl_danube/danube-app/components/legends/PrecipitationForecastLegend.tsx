// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@chakra-ui/react";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { GeosphereForecastService } from "../../services/GeosphereForecastService";
import { FORECAST_PRECIPITATION_COLORS } from "../../config/precipitationScale";

export function PrecipitationForecastLegend(props: LegendItemComponentProps) {
    const intl = useIntl();

    const prepSrvc = useService<GeosphereForecastService>("app.GeosphereForecastService");
    const { legendMetadata } = useReactiveSnapshot(
        () => ({
            legendMetadata: prepSrvc.legendMetadata
        }),
        [prepSrvc]
    );
    const range = legendMetadata.range;

    const increment = (range[1] - range[0]) / 5;

    // Same colours the service paints the layer with; the class bounds follow the value
    // range of the file currently shown, so they are computed rather than fixed.
    const to_display = FORECAST_PRECIPITATION_COLORS.map((color, index) => ({
        label: (range[0] + increment * index).toFixed(2),
        color: color
    }));

    return (
        <Box bg={"white"} p={2} borderRadius="md" boxShadow="md" mt="1em">
            <Text fontWeight="bold" mb={0}>
                {" "}
                {props.layer.title}{" "}
            </Text>
            <Text fontWeight="bold" fontSize={15} mb={2}>
                Unit: mm
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
}
export default PrecipitationForecastLegend;
