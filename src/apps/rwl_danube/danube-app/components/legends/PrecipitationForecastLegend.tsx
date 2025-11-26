// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@open-pioneer/chakra-integration";
import { LegendItemComponentProps } from "@open-pioneer/legend";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { GeosphereForecastService } from "../../services/GeosphereForecastService";


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

    const tempColors = {
        color1: "#00000000",
        color2: "#af7ab3",
        color3: "#95649a",
        color4: "#885889",
        color5: "#674571",
        color6: "#503752"
    };

    const increment = (range[1] - range[0]) / 5;

    const to_display = [
        { label: range[0].toFixed(2), color: tempColors.color1 },
        { label: (range[0] + increment * 1).toFixed(2), color: tempColors.color2 },
        { label: (range[0] + increment * 2).toFixed(2), color: tempColors.color3 },
        { label: (range[0] + increment * 3).toFixed(2), color: tempColors.color4 },
        { label: (range[0] + increment * 4).toFixed(2), color: tempColors.color5 },
        { label: (range[0] + increment * 5).toFixed(2), color: tempColors.color6 }
    ];

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
                            <Box width="12px" height="12px" bg={item.color} mr={2}  border={"2px solid black"} />
                            <Box>{item.label}</Box>
                        </Box>
                    ))}
                </div>
            </Box>
        </Box>
    );
};
export default PrecipitationForecastLegend;
