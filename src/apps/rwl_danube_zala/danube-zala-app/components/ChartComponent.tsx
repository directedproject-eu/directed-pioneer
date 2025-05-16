// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import EnsembleCrops from "./EnsembleCrops";

// type ChartComponentProps = {

// }

const ChartComponent = () => {
    return (
        <>
            {/* <Span></Span> */}
            <div>
                {/* <Select.Root collection={frameworks} size="sm" width="320px">
                    <Select.HiddenSelect />
                    <Select.Label>Select framework</Select.Label>
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder="Select framework" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content>
                                {frameworks.items.map((framework) => (
                                    <Select.Item item={framework} key={framework.value}>
                                        {framework.label}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root> */}
            </div>
            <EnsembleCrops></EnsembleCrops>
        </>
    );
};

export default ChartComponent;
