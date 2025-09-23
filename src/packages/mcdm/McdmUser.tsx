// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useMemo, ChangeEvent } from "react";
import {
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormLabel,
    FormControl,
    useDisclosure,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Tooltip,
    Flex,
    Input, 
    Drawer, 
    DrawerOverlay, 
    DrawerContent, 
    DrawerHeader,
    DrawerBody,
    DrawerCloseButton
} from "@open-pioneer/chakra-integration";
import { ToolButton } from "@open-pioneer/map-ui-components";
import { FaBalanceScale, FaInfoCircle } from "react-icons/fa";
import { Spinner, Center, Text } from "@open-pioneer/chakra-integration";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useService } from "open-pioneer:react-hooks";
import { McdmService } from "./McdmService";
import type { ProcessExecution } from "./McdmService";

interface Weights {
    [key: string]: number;
    "measure net cost": number;
    "averted risk_aai": number;
    "approval": number;
    "feasability": number;
    "durability": number;
    "externalities": number;
    "implementation time": number;
}

interface UserWeightChartProps {
    chartOptions: Highcharts.Options | null;
}

interface SensitivityChartProps {
    chartOptions: Highcharts.Options | null;
}

const UserWeightChart: React.FC<UserWeightChartProps> = ({ chartOptions }) => {
    if (!chartOptions) {
        return (
            <Center height="300px">
                <Text>Please submit criteria weights to view the chart.</Text>
            </Center>
        );
    }
    return <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
};

const SensitivityChart: React.FC<SensitivityChartProps> = ({ chartOptions }) => {
    if (!chartOptions) {
        return (
            <Center height="300px">
                <Text>Please submit criteria weights to view the chart.</Text>
            </Center>
        );
    }
    return <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
};

const sensitivityData = {
    "Barrier": {
        "1.0": 0.0,
        "2.0": 0.35,
        "3.0": 0.65
    },
    "Building code": {
        "1.0": 0.9833333333,
        "2.0": 0.0166666667,
        "3.0": 0.0
    },
    "Relocate": {
        "1.0": 0.0194444444,
        "2.0": 0.6333333333,
        "3.0": 0.3472222222
    }
};

const processSensitivityData = (rawData: Record<string, Record<string, number>>) => {
    const measureNames = Object.keys(rawData);
    const sortedMeasures = measureNames.sort();

    const rankColors: Record<string, string> = {
        "1.0": "#82b366",
        "2.0": "#8cffdb",
        "3.0": "#800080"
    };

    const series: Highcharts.SeriesOptionsType[] = [];

    // Get all unique rank keys
    const rankKeys = new Set<string>();
    Object.values(rawData).forEach((ranks) => {
        Object.keys(ranks).forEach((key) => rankKeys.add(key));
    });

    const sortedRankKeys = Array.from(rankKeys).sort((a, b) => parseFloat(a) - parseFloat(b));

    // Create a series for each rank
    sortedRankKeys.forEach((rankKey) => {
        const dataForSeries: number[] = [];
        sortedMeasures.forEach((measureName) => {
            // Get the percentage for the current rank and measure
            const percentage = rawData[measureName]?.[rankKey] || 0;
            dataForSeries.push(percentage * 100);
        });

        series.push({
            type: "bar",
            name: `Rank ${rankKey}`,
            data: dataForSeries,
            color: rankColors[rankKey],
            dataLabels: {
                enabled: true,
                color: "white",
                formatter: function () {
                    const value = typeof this.y === "number" ? this.y : 0;
                    return value > 5 ? `${Math.round(value)}%` : "";
                },
                style: {
                    textOutline: "none"
                }
            }
        });
    });

    return { categories: sortedMeasures, series: series };
};

export function ModelClient() {
    // Use the `useService` hook to get the MCDM service instance
    const clientService = useService<McdmService>("app.McdmService");
    const [tokenInput, setTokenInput] = useState<string>("");
    const [tokenSubmitted, setTokenSubmitted] = useState(false);
    const [ranksData, setRanksData] = useState<Record<string, number> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const [customCriteria, setCustomCriteria] = useState<string>(""); // State for custom criteria name input
    // const [mode, setMode] = useState<"ranks" | "sensitivity">("ranks"); // Default mode ranks

    const [weights, setWeights] = useState<Weights>({
        "measure net cost": 0,
        "averted risk_aai": 0,
        "approval": 0,
        "feasability": 0,
        "durability": 0,
        "externalities": 0,
        "implementation time": 0
    });

    const [customCriteriaWeights, setCustomCriteriaWeights] = useState<Record<string, number>>({}); // State for custom criteria weight input
    
    const allWeights = { ...weights, ...customCriteriaWeights};

    // Handles changes to slider values for each criteria
    // const handleWeightChange = (criteria: keyof Weights, newValue: number) => {
    //     setWeights((prevWeights) => ({
    //         ...prevWeights,
    //         [criteria]: newValue
    //     }));
    // };

    const handleAddCustomCriteria = () => {
        const trimmedName = customCriteria.trim();
        // Check for a non-empty string and if the key already exists
        if (trimmedName && !Object.hasOwn(allWeights, trimmedName)) {
            setCustomCriteriaWeights((prevCustomWeights) => ({
                ...prevCustomWeights,
                [trimmedName]: 0
            }));
            setCustomCriteria("");
            onModalClose();
        }
    };

    const handleTokenInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTokenInput(event.target.value);
    };

    // Submits the job to the backend API via the McdmService
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setRanksData(null); // Clear previous results

        const processId = "climada-mca-roskilde";

        // Create the inputs map for the service
        const inputs = new Map<string, unknown>();
        inputs.set("token", tokenInput);
        inputs.set("weights", allWeights); // Send all weights, including custom criteria, to API
        // inputs.set("weights", weights);

        // Construct the process execution payload
        const jobDescription: ProcessExecution = {
            inputs: inputs,
            synchronous: true,
            processId: processId,
            response: "document"
        };

        try {
            // Submit the job and await the final outcome
            const finalResult = await clientService.submitJob(jobDescription);

            if (finalResult.status === "successful") {
                // The 'value' property is at the top level of the final result object
                if (finalResult.value) {
                    setRanksData(finalResult.value);
                } else {
                    throw new Error("Invalid response format: 'value' field missing.");
                }
            } else {
                throw new Error(
                    finalResult.message || `Job finished with status: ${finalResult.status}`
                );
            }
        } catch (err: unknown) {
            // Changed 'any' to 'unknown'
            console.error("Job execution failed:", err);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                        ? err
                        : "Unknown error";
            setError(`Failed to run MCDM analysis. Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // Memoize the chart options for the ranks chart to prevent unnecessary re-renders
    const UserWeightChartOptions: Highcharts.Options | null = useMemo(() => {
        if (!ranksData) return null;

        const categories = Object.keys(ranksData);
        const seriesData = categories.map((measure) => {
            const rank = ranksData[measure];
            let color = "#2f7ed8";

            if (rank === 1) {
                color = "#82b366";
            } else if (rank === 2) {
                color = "#8cffdb";
            } else if (rank === 3) {
                color = "#800080";
            } else if (rank === 4) {
                color = "#008080";
            }

            return {
                name: measure,
                y: rank,
                color: color
            };
        });

        return {
            chart: {
                type: "column"
            },
            title: {
                text: "Measure Ranking Result: User-Defined Criteria Weightings",
                align: "left"
            },
            xAxis: {
                categories: categories,
                title: {
                    text: "Measure"
                }
            },
            yAxis: {
                title: {
                    text: "Rank"
                },
                reversed: false,
                tickInterval: 1,
                allowDecimals: false
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        inside: false,
                        format: "Rank {point.y}",
                        style: {
                            color: "black",
                            fontSize: "12px",
                            textOutline: "none"
                        }
                    }
                }
            },
            series: [
                {
                    name: "Rank",
                    type: "column",
                    data: seriesData
                }
            ]
            // exporting: {
            //     enabled: true
            // }
        };
    }, [ranksData]);

    const sensitivityChartOptions: Highcharts.Options | null = useMemo(() => {
        const processedData = processSensitivityData(sensitivityData);

        return {
            chart: {
                type: "column",
                height: 400
            },
            title: {
                text: "Measure Ranking Result: Sensitivity Analysis",
                align: "left"
            },
            xAxis: {
                categories: processedData.categories,
                title: {
                    text: "Measure"
                },
                labels: {
                    rotation: 0,
                    style: {
                        fontSize: "12px"
                    }
                }
            },
            yAxis: {
                min: 0,
                max: 100,
                title: {
                    text: "Percentage of Total Samples"
                },
                stackLabels: {
                    enabled: true,
                    formatter: function () {
                        return Highcharts.numberFormat(this.total, 0) + "%";
                    },
                    style: {
                        fontWeight: "bold",
                        color: "black",
                        textOutline: "none"
                    }
                }
            },
            legend: {
                align: "right",
                verticalAlign: "middle",
                layout: "vertical",
                itemMarginTop: 5,
                itemMarginBottom: 5,
                title: {
                    text: "Rank",
                    style: {
                        fontWeight: "bold"
                    }
                }
            },
            tooltip: {
                headerFormat: "<b>Distribution</b><br/>",
                pointFormat:
                    '<span style="color:{series.color}">\u25CF</span> {series.name}: {point.y}%<br/>Total: {point.stackTotal}%'
            },
            plotOptions: {
                series: {
                    stacking: "percent",
                    borderWidth: 0.5,
                    borderColor: "#CCC"
                }
            },
            series: processedData.series
            // exporting: {
            //     enabled: true
            // }
        };
    }, []);

    if (error) {
        return (
            <Center height="400px">
                <Text color="red.500">{error}</Text>
            </Center>
        );
    }

    return (
        <Box>
            <ToolButton
                label="Multi-Criteria Decision Making (MCDM)"
                icon={<FaBalanceScale />}
                onClick={onDrawerOpen}
            />
            <Drawer closeOnOverlayClick={false} isOpen={isDrawerOpen} onClose={onDrawerClose} size="xl">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader>CLIMADA Multi-Criteria Decision Making (MCDM)</DrawerHeader>
                    <DrawerCloseButton isDisabled={loading} />
                    <DrawerBody>
                        {!tokenSubmitted ? (
                            <FormControl>
                                <FormLabel padding={2} htmlFor="token">
                                    Please enter a token to access the MCDM Dialog{" "}
                                </FormLabel>
                                <Input
                                    type="text"
                                    id="token"
                                    value={tokenInput}
                                    onChange={handleTokenInputChange}
                                    placeholder="Enter your token here and press 'continue'"
                                    variant="outline"
                                />
                                <Button
                                    mt={4}
                                    onClick={() => {
                                        if (tokenInput.trim()) {
                                            setTokenSubmitted(true); // Move on to criteria weightings
                                        }
                                    }}
                                    isDisabled={!tokenInput.trim()}
                                >
                                    Continue
                                </Button>
                            </FormControl>
                        ) : (
                            <>
                                {loading ? (
                                    <Center flexDirection="column" py={10}>
                                        <Spinner size="md" />
                                        <Text mt={4}>Calculating MCDM analysis...</Text>
                                    </Center>
                                ) : (
                                    <>
                                        <Flex justify="space-between" align="center" mb={4}>
                                            <Text fontWeight="semibold">
                                                ⚖️ Please weight each criteria and press submit to
                                                view results.
                                            </Text>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setTokenSubmitted(false); // Go back to token input
                                                    // setTokenInput(""); // Optional to clear token on going back
                                                }}
                                            >
                                                ← Back
                                            </Button>
                                        </Flex>
                                        {/* optionally uncomment this and the mode state to have input for modes */}
                                        {/* <Text fontWeight="semibold" padding={1}>
                                            Please select an Analysis Mode and rate each criteria.
                                        </Text>
                                        <FormControl mb={4}>
                                            <FormLabel>Analysis Mode</FormLabel>
                                            <Select
                                                value={mode}
                                                onChange={(e) =>
                                                    setMode(e.target.value as "ranks" | "sensitivity")
                                                }
                                            >
                                                <option value="ranks">Ranks</option>
                                                <option value="sensitivity">Sensitivity Analysis</option>
                                            </Select>
                                        </FormControl> */}

                                        {Object.keys(allWeights).map((criteria) => {
                                            // const typedCriteria = criteria as keyof Weights;
                                            const criterionDisplayNames: Record<string, string> = {                                           
                                                "measure net cost":
                                                    "Cost: How important is the cost of implementing the measure?",
                                                "averted risk_aai":
                                                    "Averted Risk: How important is it that the measure helps to avert risk to people?",
                                                "approval":
                                                    "Approval: How important is it that the public approves of the measure?",
                                                "feasability":
                                                    "Feasibility: How important is it that the measure be feasible to implement?",
                                                "durability":
                                                    "Durability: How important is it that the measure is durable?",
                                                "externalities":
                                                    "Externalities: How important is it that the measure is future-proof?",
                                                "implementation time":
                                                    "Implementation Time: How important is the time it takes to implement the measure?"
                                            };
                                            const criteriaLabel = criterionDisplayNames[criteria] || criteria;
                                            return (
                                                <FormControl key={criteria} mb={4}>
                                                    <FormLabel>
                                                        {criteriaLabel}
                                                    </FormLabel>
                                                    <Box padding={2}>
                                                        <Flex justify="space-between" mb={1}>
                                                            <Text fontSize="sm">Not important</Text>
                                                            <Text fontSize="sm">
                                                                Somewhat important
                                                            </Text>
                                                            <Text fontSize="sm">
                                                                Highly important
                                                            </Text>
                                                        </Flex>
                                                        <Slider
                                                            value={allWeights[criteria]}
                                                            min={0}
                                                            max={1}
                                                            step={0.01}
                                                            onChange={(newValue) => {
                                                                // Check which state to update based on the criteria name
                                                                if (Object.hasOwn(weights, criteria)) {
                                                                    setWeights(prev => ({ ...prev, [criteria]: newValue as number }));
                                                                } else {
                                                                    setCustomCriteriaWeights(prev => ({ ...prev, [criteria]: newValue as number }));
                                                                }
                                                            }}
                                                            defaultValue={0}
                                                        >
                                                            <SliderTrack>
                                                                <SliderFilledTrack />
                                                            </SliderTrack>
                                                            <Tooltip
                                                                hasArrow
                                                                color="white"
                                                                placement="top"
                                                                isOpen
                                                                label={allWeights[criteria]}
                                                            >
                                                                <SliderThumb />
                                                            </Tooltip>
                                                        </Slider>
                                                    </Box>
                                                </FormControl>
                                            );
                                        })}

                                        <Button mt={4} onClick={onModalOpen}>
                                            Add Custom Criteria
                                        </Button>

                                        <Button
                                            type="button"
                                            size="md"
                                            onClick={handleSubmit}
                                            isDisabled={loading}
                                        >
                                            Submit Criteria Weights
                                        </Button>

                                        <Flex paddingY={4} />
                                        <Flex justifyContent="space-between" alignItems="center">
                                            <Tooltip
                                                label="This chart shows the ranking of measures in all possible combinations of criteria weightings; it shows how robust the measure is. For example, we could say 'measure X' falls into Rank 1 50% of the time."
                                                aria-label="A tooltip"
                                            >
                                                <FaInfoCircle color="gray" cursor="pointer" />
                                            </Tooltip>
                                        </Flex>
                                        <SensitivityChart chartOptions={sensitivityChartOptions} />
                                        {/* <hr style={{ margin: "20px 0" }} /> */}
                                        <Flex paddingY={4} />
                                        {UserWeightChartOptions && (
                                            <Flex
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >
                                                <Tooltip
                                                    label="This chart shows the ranking of measures based on the criteria weightings which were submitted. For example, if cost was weighted as highly important to you, this chart shows which measures align best with this, with 1 being the best possible rank."
                                                    aria-label="A tooltip"
                                                >
                                                    <FaInfoCircle color="gray" cursor="pointer" />
                                                </Tooltip>
                                            </Flex>
                                        )}
                                        {UserWeightChartOptions && (
                                            <UserWeightChart
                                                chartOptions={UserWeightChartOptions}
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
            {/* Modal for adding new criteria */}
            <Modal isOpen={isModalOpen} onClose={onModalClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Custom Criteria</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Criteria Name</FormLabel>
                            <Input
                                placeholder="e.g., 'environmental impact'"
                                value={customCriteria}
                                onChange={(e) => setCustomCriteria(e.target.value)}
                            />
                        </FormControl>
                        <Button
                            mt={4}
                            onClick={handleAddCustomCriteria}
                            isDisabled={!customCriteria.trim()}
                        >
                            Add Criteria
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}
