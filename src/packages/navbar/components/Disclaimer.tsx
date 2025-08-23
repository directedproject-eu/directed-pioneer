// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import {IconButton, Tooltip} from "@open-pioneer/chakra-integration";
import { FaInfo } from "react-icons/fa";

interface Props{
    children?: React.ReactNode;
}

const Disclaimer: React.FC<Props> = ({ children }) => {
    
    return (
        <Tooltip
            label={children}
            openDelay={250}
            closeDelay={100}
            placement="top"
        >
            <IconButton
                marginLeft={"0.5em"}
                size={"s"}
                aria-label="Info"
                icon={<FaInfo />}
                variant="ghost"
                color={"black"}
            />
        </Tooltip>
    );
};

export default Disclaimer;