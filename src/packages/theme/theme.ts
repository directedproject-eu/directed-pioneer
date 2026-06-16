// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { createSystem, defaultConfig, defineGlobalStyles } from "@chakra-ui/react";

const globalCss = defineGlobalStyles({
    // Target ONLY the trigger button by checking for aria-haspopup,
    // and ONLY when it is NOT open.
    ".toc-layer-item-details-button[aria-haspopup]:not([aria-expanded='true']):not([data-state='open'])": {
        // Hide ONLY the direct child SVG (the 3-dots), protecting nested Popover SVGs
        "& > svg": {
            display: "none !important",
        },

        // Create the "i" icon using a pseudo-element
        "&::before": {
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
        "&:hover::before": {
            transform: "scale(1.1)",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
        }
    }
});

export const system = createSystem(defaultConfig, {
    globalCss
});