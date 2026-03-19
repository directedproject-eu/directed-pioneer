// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import {IconButton} from "@chakra-ui/react";
import { Tooltip } from "@open-pioneer/chakra-snippets/tooltip";
import { FaInfo } from "react-icons/fa";

interface Props{
    children?: React.ReactNode;
}

const Disclaimer: React.FC<Props> = ({ children }) => {
    
    return (
        <Tooltip
            content={children}
            openDelay={250}
            closeDelay={100}
            positioning={{placement: "top"}}
        >
            <IconButton
                marginLeft={"0.5em"}
                size={"xs"}
                aria-label="Info"
                variant="ghost"
                color={"black"}
            >
                <FaInfo />
            </IconButton>
        </Tooltip>
    );
};

export default Disclaimer;