// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import EnsembleCrops from "./EnsembleCrops";

// type ChartComponentProps = {

// }

const ChartComponentRhineErft = () => {
    const files = [
        // "/crop_yield_scenarios_rwl3+4/cysz_rwl4_CMIP5:RCP8.5.csv",
        "/crop_yield_scenarios_rwl3+4/cysz_rwl4_CMIP6:SSP370.csv",
        "/crop_yield_scenarios_rwl3+4/cysz_rwl4_CMIP6:SSP585.csv"
    ];
    return (
        <>
            <EnsembleCrops
                files={files}
                regionName={"Rhine - Erft"}
                regionCode="RWL4:Rhine-Erft"
            ></EnsembleCrops>
        </>
    );
};

export default ChartComponentRhineErft;
