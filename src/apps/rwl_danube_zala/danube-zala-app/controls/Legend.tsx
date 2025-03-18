// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@open-pioneer/chakra-integration";

interface legendmetaData {
    range: number[];
    variable: string;
}
export const Legend = (props: legendmetaData) => {
    console.log(props.metaData);
    const legend_text = {
        hurs: "Near-Surface Relative Humidity in %",
        pr: "Precipitation in kg·m⁻²·s⁻¹",
        rsds: "Surface Downwelling Shortwave Radiation in W/m²",
        sfcwind: "Near-Surface Wind Speed in m/s",
        tas: "Near-Surface Air Temperature in K",
        tasmax: "Daily Maximum Near-Surface Air Temperature in K",
        tasmin: "Daily Minimum Near-Surface Air Temperature in K"
    };

    const tempColors = {
        black: "#00000000",
        pink: "#eb7fe9BC",
        cold_blue: "#4f59cdBC",
        ice_blue: "#1ceae1BC",
        green: "#5fdf65BC",
        yellow: "#eade57BC",
        orange: "#ec8647BC",
        red: "#832525BC",
        dark_red: "#53050aBC" //rgba(83,5,10,0.74)
    };
    const increment = (props.metaData.range[1] - props.metaData.range[0]) / 8;

    const to_display = [
        { label: props.metaData.range[0].toFixed(2), color: tempColors.black },
        { label: (props.metaData.range[0] + increment * 1).toFixed(2), color: tempColors.pink },
        {
            label: (props.metaData.range[0] + increment * 2).toFixed(2),
            color: tempColors.cold_blue
        },
        { label: (props.metaData.range[0] + increment * 3).toFixed(2), color: tempColors.ice_blue },
        { label: (props.metaData.range[0] + increment * 4).toFixed(2), color: tempColors.green },
        { label: (props.metaData.range[0] + increment * 5).toFixed(2), color: tempColors.yellow },
        { label: (props.metaData.range[0] + increment * 6).toFixed(2), color: tempColors.orange },
        { label: (props.metaData.range[0] + increment * 7).toFixed(2), color: tempColors.red },
        { label: (props.metaData.range[0] + increment * 8).toFixed(2), color: tempColors.dark_red }
    ];

    return (
        <Box bg={"white"} p={2} borderRadius="md" boxShadow="md" mt="1em">
            <Text fontWeight="bold" mb={0}>
                {legend_text[props.metaData.variable]}
            </Text>

            {to_display.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Box width="12px" height="12px" bg={item.color} mr={2} />
                    <Box>{item.label}</Box>
                </Box>
            ))}
        </Box>
    );
};
