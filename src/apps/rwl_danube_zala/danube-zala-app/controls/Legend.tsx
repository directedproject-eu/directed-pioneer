// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@open-pioneer/chakra-integration";

interface legendmetaData {
    range: number[];
    variable: string;
}
const Legend: React.FC<legendmetaData> = ({ range, variable }) => {
    const legend_text = {
        hurs: "Near-Surface Relative Humidity in %",
        pr: "Precipitation in kg·m⁻²·s⁻¹",
        rsds: "Surface Downwelling Shortwave Radiation in W/m²",
        sfcwind: "Near-Surface Wind Speed in m/s",
        spei12: "SPEI drought index",
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
    const increment = (range[1] - range[0]) / 8;

    const to_display = [
        { label: range[0].toFixed(2), color: tempColors.black },
        { label: (range[0] + increment * 1).toFixed(2), color: tempColors.pink },
        {
            label: (range[0] + increment * 2).toFixed(2),
            color: tempColors.cold_blue
        },
        { label: (range[0] + increment * 3).toFixed(2), color: tempColors.ice_blue },
        { label: (range[0] + increment * 4).toFixed(2), color: tempColors.green },
        { label: (range[0] + increment * 5).toFixed(2), color: tempColors.yellow },
        { label: (range[0] + increment * 6).toFixed(2), color: tempColors.orange },
        { label: (range[0] + increment * 7).toFixed(2), color: tempColors.red },
        { label: (range[0] + increment * 8).toFixed(2), color: tempColors.dark_red }
    ];
    const to_display_circles = [
        { label: "Timber Cutting", color: "green" },
        { label: "Forest and vegetation fire", color: "red" },
        { label: "Water damage", color: "blue" },
        { label: "Storm damage", color: "black" }
    ];

    return (
        <Box bg={"white"} p={2} borderRadius="md" boxShadow="md" mt="1em">
            <Text fontWeight="bold" mb={0}>
                {legend_text[variable]}
            </Text>
            <Box display="flex" justifyContent="center" alignItems="center">
                <div style={{ marginRight: "3em" }}>
                    {to_display.map((item, index) => (
                        <Box key={index} display="flex" alignItems="center" mb={1}>
                            <Box width="12px" height="12px" bg={item.color} mr={2} />
                            <Box>{item.label}</Box>
                        </Box>
                    ))}
                </div>
                <Box height="100%">
                    {to_display_circles.map((item, index) => (
                        <Box key={index} display="flex" alignItems="center" mb={1}>
                            <Box
                                width="15px"
                                height="15px"
                                bg={item.color}
                                color="white"
                                borderRadius={"50%"}
                                mr={2}
                            />
                            <Box>{item.label}</Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};
export default Legend;
