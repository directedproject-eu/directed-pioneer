// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { ChevronRightIcon } from "@chakra-ui/icons";

interface SelectorItemProps {
    selected: boolean;
    children?: React.ReactNode; // Allow children
    onClick: () => void;
}

const SelectorItem: React.FC<SelectorItemProps> = ({ selected, children, onClick }) => {
    return (
        <>
            <div
                style={{
                    marginLeft: selected ? "0em" : "1em",
                    cursor: "pointer",
                    color: selected ? "black" : "grey",
                    fontSize: "1.1em",
                    fontWeight: selected ? "bold" : "normal"
                }}
                onClick={onClick}
            >
                {selected && <ChevronRightIcon />}
                {children}
            </div>
        </>
    );
};

export default SelectorItem;
