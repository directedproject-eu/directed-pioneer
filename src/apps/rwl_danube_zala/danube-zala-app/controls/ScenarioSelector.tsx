// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useService } from "open-pioneer:react-hooks";
import { LayerHandler } from "../services/LayerHandler";
import Selector from "./Selector";
import ExpandleBox from "./ExpandleBox";

export function ScenarioSelector() {
    const prepSrvc = useService<LayerHandler>("app.LayerHandler");

    const setSelected = (option: string) => {
        prepSrvc.setScenario(option);
    };

    return (
        <ExpandleBox title="Select a scenario" marginBottom="10px">
            <Selector
                options={["ssp585", "ssp370"]}
                heading="Select a scenario"
                setSelected={setSelected}
            ></Selector>
        </ExpandleBox>
    );
}
