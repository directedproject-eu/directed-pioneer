// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { useService } from "open-pioneer:react-hooks";
import { LayerHandler } from "../services/LayerHandler";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";

const LineChart = () => {
    const modelRealizations = {
        "gfdl-esm4": 0,
        "ipsl-cm6a-lr": 1,
        "mpi-esm1-2-hr": 2,
        "mri-esm2-0": 3,
        "ukesm1-0-ll": 4,
        "canesm5": 5,
        "cnrm-cm6-1": 6,
        "cnrm-esm2-1": 7,
        "ec-earth3": 8,
        "miroc6": 9
    };

    const scenarioRealization = {
        "ssp585": 50,
        "ssp370": 40,
        "ssp126": 30
    };

    const prepSrvc = useService<LayerHandler>("app.LayerHandler");

    const { selectedModel, selectedScenario, selectedYear } = useReactiveSnapshot(
        () => ({
            selectedModel: prepSrvc.selectedModel,
            selectedScenario: prepSrvc.selectedScenario,
            selectedYear: prepSrvc.selectedYear
        }),
        [prepSrvc]
    );
    // const { selectedScenario } = useReactiveSnapshot(
    //     () => ({
    //         selectedScenario: prepSrvc.selectedScenario
    //     }),
    //     [prepSrvc]
    // );

    // const { selectedScenario } = useReactiveSnapshot(
    //     () => ({
    //         selectedScenario: prepSrvc.selectedScenario
    //     }),
    //     [prepSrvc]
    // );

    const [data, setData] = useState({});
    const [uniqueCrops, setUniqueCrops] = useState([]);
    const grouped = {};

    useEffect(() => {
        const files = [
            "/crop_yield_scenarios_rwl3+4/cysz_zala_CMIP6:SSP126.csv",
            "/crop_yield_scenarios_rwl3+4/cysz_zala_CMIP6:SSP370.csv",
            "/crop_yield_scenarios_rwl3+4/cysz_zala_CMIP6:SSP585.csv"
        ];

        Promise.all(
            files.map((file) =>
                fetch(file)
                    .then((res) => res.text())
                    .then(
                        (csvText) =>
                            new Promise((resolve) => {
                                Papa.parse(csvText, {
                                    header: true,
                                    skipEmptyLines: true,
                                    complete: (results) => resolve(results.data)
                                });
                            })
                    )
            )
        ).then((allCsvData) => {
            const dataGroups = {};
            const crops: string[] = [];

            allCsvData.flat().forEach((row) => {
                const key = `${row.Crop} | Real ${row.Real} | ${row.Scenario} | ${row.Region}`;

                if (!crops.includes(row.Crop)) {
                    crops.push(row.Crop);
                }

                if (!dataGroups[key]) {
                    dataGroups[key] = [];
                }

                dataGroups[key].push([Number(row.Year), parseFloat(row["Proj.Yd"])]);
            });

            setUniqueCrops(crops);
            setData(dataGroups);
        });
    }, []);

    const series = [];

    uniqueCrops.forEach((crop) => {
        series.push({
            name: crop,
            data: data[
                `${crop} | Real ${modelRealizations[selectedModel] + scenarioRealization[selectedScenario]} | CMIP6:${selectedScenario.toUpperCase()} | HU22`
            ],
            type: "line"
        });
    });

    const options = {
        title: {
            text: `Crops in the Zala region for Real ${modelRealizations[selectedModel] + scenarioRealization[selectedScenario]} CMIP6:${selectedScenario.toUpperCase()} HU22`
        },
        xAxis: {
            title: { text: "Year" },
            type: "linear",
            plotLines: [
                {
                    color: "grey",
                    width: 2,
                    value: selectedYear,
                    zIndex: 5,
                    dashStyle: "dash"
                }
            ]
        },
        yAxis: {
            title: { text: "Value" }
        },
        series: series
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default LineChart;
