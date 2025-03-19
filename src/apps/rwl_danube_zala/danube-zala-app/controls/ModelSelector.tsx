// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useService } from "open-pioneer:react-hooks";
import { LayerHandler } from "../services/LayerHandler";
import Selector from "./Selector";

export function ModelSelector() {
    const prepSrvc = useService<LayerHandler>("app.LayerHandler");

    const setSelected = (option: string) => {
        prepSrvc.setModel(option);
    };

    return (
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
            heading={"Select a model"}
        ></Selector>
    );
}
