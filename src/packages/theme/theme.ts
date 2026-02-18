// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
    styles: {
        global: {
            // Target the specific button class from the Trails TOC package
            ".toc-layer-item-details-button": {
                // Hide the existing 3-dots SVG
                "& svg": {
                    display: "none !important",
                },
        
                // Create the "i" icon using a pseudo-element
                "& .chakra-button__icon::before": {
                    content: '"i"',
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
          
                    // Create a circle
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: "1.5px solid currentColor",
          
                    // "i" icon typography
                    fontFamily: "serif",
                    fontWeight: "bold",
                    fontStyle: "normal",
                    fontSize: "12px",
                    lineHeight: "1",
          
                    // Center the i
                    paddingBottom: "1px", 
                    transition: "transform 0.2s ease",
                },

                // Hover effect for new icon
                "&:hover .chakra-button__icon::before": {
                    transform: "scale(1.1)",
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                }
            }
        }
    }
});