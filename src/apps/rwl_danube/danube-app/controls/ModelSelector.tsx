// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useService } from "open-pioneer:react-hooks";
import { IsimipHandler } from "../services/IsimipHandler";
import Selector from "./Selector";
import ExpandableBox from "../components/ExpandableBox";

export function ModelSelector() {
    const prepSrvc = useService<IsimipHandler>("app.IsimipHandler");

    const setSelected = (option: string) => {
        prepSrvc.setModel(option);
    };

    return (
        <ExpandableBox title="Select a model" marginBottom="10px">
            <Selector
                options={[
                    "canesm5",
                    "cnrm-cm6-1",
                    "cnrm-esm2-1",
                    "ec-earth3",
                    "gfdl-esm4",
                    "ipsl-cm6a-lr",
                    "miroc6",
                    "mpi-esm1-2-hr",
                    "mri-esm2-0",
                    "ukesm1-0-ll"
                ]}
                setSelected={setSelected}
            ></Selector>
        </ExpandableBox>
    );
}
