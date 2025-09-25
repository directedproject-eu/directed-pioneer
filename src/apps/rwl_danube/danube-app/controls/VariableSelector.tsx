// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { useService } from "open-pioneer:react-hooks";
import { IsimipHandler } from "../services/IsimipHandler";
import Selector from "./Selector";
import ExpandableBox from "../components/ExpandableBox";

export function VariableSelector() {
    const prepSrvc = useService<IsimipHandler>("app.IsimipHandler");

    const setSelected = (option: string) => {
        prepSrvc.setVariable(option);
    };

    return (
        <ExpandableBox title="Select a variable" marginBottom="10px">
            <Selector
                options={["hurs", "pr", "rsds", "sfcwind", "spei12", "tasmax", "tasmin", "tas"]}
                setSelected={setSelected}
            ></Selector>
        </ExpandableBox>
    );
}
