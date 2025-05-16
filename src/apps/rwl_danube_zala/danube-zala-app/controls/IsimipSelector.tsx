// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useService } from "open-pioneer:react-hooks";
import { LayerHandler } from "../services/LayerHandler";
import Selector from "./Selector";
import ExpandableBox from "../components/ExpandableBox";

export function IsimipSelector() {
    const prepSrvc = useService<LayerHandler>("app.LayerHandler");

    const setModel = (option: string) => {
        prepSrvc.setModel(option);
    };

    const setVariable = (option: string) => {
        prepSrvc.setVariable(option);
    };

    const setScenario = (option: string) => {
        prepSrvc.setScenario(option);
    };

    return (
        <ExpandableBox title="Select a Layer" marginBottom="10px" overflowY="auto">
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
                setSelected={setModel}
                marginBottom="5px"
                title="Model"
            ></Selector>
            <Selector
                options={["ssp585", "ssp370", "ssp126"]}
                setSelected={setScenario}
                marginBottom="5px"
                title="Scenario"
            ></Selector>
            <Selector
                options={["hurs", "pr", "rsds", "sfcwind", "spei12", "tasmax", "tasmin", "tas"]}
                setSelected={setVariable}
                title="Variable"
            ></Selector>
        </ExpandableBox>
    );
}
