// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import EnsembleCrops from "./EnsembleCrops";

// type ChartComponentProps = {

// }

const ChartComponentZala = () => {
    const files = [
        "/crop_yield_scenarios_rwl3and4/cysz_zala_CMIP6_SSP126.csv",
        "/crop_yield_scenarios_rwl3and4/cysz_zala_CMIP6_SSP370.csv",
        "/crop_yield_scenarios_rwl3and4/cysz_zala_CMIP6_SSP585.csv"
    ];
    return (
        <>
            <EnsembleCrops files={files} regionName={"Zala"} regionCode="HU22"></EnsembleCrops>
        </>
    );
};

export default ChartComponentZala;
