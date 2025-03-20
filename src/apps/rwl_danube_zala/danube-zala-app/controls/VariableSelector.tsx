// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { useService } from "open-pioneer:react-hooks";
import { LayerHandler } from "../services/LayerHandler";
import Selector from "./Selector";
import ExpandleBox from "./ExpandleBox";

export function VariableSelector() {
    const prepSrvc = useService<LayerHandler>("app.LayerHandler");

    const setSelected = (option: string) => {
        prepSrvc.setVariable(option);
    };

    return (
        <ExpandleBox title="Select a variable" marginBottom="10px">
            <Selector
                options={["hurs", "pr", "rsds", "sfcwind", "tasmax", "tasmin", "tas"]}
                setSelected={setSelected}
            ></Selector>
        </ExpandleBox>
    );
}
