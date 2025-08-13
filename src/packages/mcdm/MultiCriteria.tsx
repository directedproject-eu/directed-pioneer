// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormLabel,
    FormControl,
    Input,
    Select,
    useDisclosure, 
    Slider,
    SliderTrack, 
    SliderFilledTrack,
    SliderThumb, 
    Tooltip, 
    Flex
} from "@open-pioneer/chakra-integration";
import { ToolButton } from "@open-pioneer/map-ui-components";
import { FaBalanceScale } from "react-icons/fa";
import { Spinner, Center, Text } from "@open-pioneer/chakra-integration";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { MCDMInput } from "./Input";


// Define props for the RankDistributionChart component
interface RankDistributionChartProps {
    chartOptions: Highcharts.Options;
}

// RankDistributionChart component to render the Highcharts graph
const RankDistributionChart: React.FC<RankDistributionChartProps> = ({ chartOptions }) => {
    return <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
};

interface RawRankData {
    [rank: string]: number[]; 
}

interface ProcessedHighchartsData {
    categories: string[];
    series: Highcharts.SeriesOptionsType[];
}

interface Weights {
    "measure net cost": number;
    "averted risk_aai": number;
    "approval": number;
    "feasability": number;
    "durability": number;
    "externalities": number;
    "implementation time": number;
}

// Function to process raw data into Highcharts format
const processRawDataForHighcharts = (
    rawData: RawRankData,
    alternativeNames: string[] // Pass alternative names separately if not in rawData
): ProcessedHighchartsData => {
    const data = rawData;
    const index = alternativeNames;

    // Simulate sorting by a 'mean_rank'
    const calculateMeanRank = (row: number[], ranks: string[]) => {
        let sum = 0;
        let count = 0;
        ranks.forEach((rankStr, i) => {
            if (rankStr !== "null") {
                const rankNum = parseInt(rankStr);
                const value = row[i];
                if (typeof value === "number" && !isNaN(value)) {
                    sum += (value / 100) * rankNum; // Convert percentage back to fraction for mean
                    count += value / 100; // Sum up fractions
                }
            }
        });
        return count > 0 ? sum / count : Infinity; // Return Infinity if no ranked data
    };

    // Prepare for sorting: associate each alternative with its data and calculated mean rank
    const alternativesWithMeanRank = index.map((alt, altIndex) => {
        const altData = Object.values(data).map((rankData) => rankData[altIndex] ?? 0);
        const ranks = Object.keys(data);
        return {
            name: alt,
            data: altData,
            meanRank: calculateMeanRank(altData, ranks)
        };
    });

    // Sort based on mean rank
    alternativesWithMeanRank.sort((a, b) => a.meanRank - b.meanRank);

    const sortedCategories = alternativesWithMeanRank.map((alt) => alt.name);
    const sortedSeriesData: Highcharts.SeriesOptionsType[] = [];

    const rankColors: Record<string, string> = {
        "1": "#82b366", // Green for Rank 1
        "2": "#f7a35c", // Orange for Rank 2
        "3": "#800080", // Purple for Rank 3
        "4": "#008080", // Teal for Rank 4
        "null": "#cccccc" // Grey for 'Not Ranked'
    };

    // Reconstruct series data based on sorted categories
    Object.keys(data).forEach((rankKey) => {
        const currentRankArray = data[rankKey as keyof typeof data];
        if (!Array.isArray(currentRankArray)) {
            console.warn(
                `Skipping malformed data fo rankKey: ${rankKey}. Expected number[], got:`,
                currentRankArray
            );
            return; //skip rankKey if not in an array
        }
        const rankDataForSeries: number[] = [];
        alternativesWithMeanRank.forEach((alt) => {
            const originalAltIndex = index.indexOf(alt.name);
            const rankValue = currentRankArray[originalAltIndex] ?? 0;
            rankDataForSeries.push(rankValue);
        });
        sortedSeriesData.push({
            type: "bar", // Specify type for each series
            name: rankKey === "null" ? "Not Ranked" : `Rank ${rankKey}`,
            data: rankDataForSeries,
            color: rankColors[rankKey],
            dataLabels: {
                enabled: true,
                color: "white",
                formatter: function () {
                    // Only show label if the segment is large enough
                    const value = typeof this.y === "number" ? this.y : 0;
                    return value > 5 ? `${Math.round(value)}%` : "";
                },
                style: {
                    textOutline: "none"
                }
            }
        });
    });

    return {
        categories: sortedCategories,
        series: sortedSeriesData
    };
};

// Props for the main RankDistributionViewer component
interface RankDistributionViewerProps {
    // no props needed atm
}

export function MCDM(props: RankDistributionViewerProps) {
    const [highchartsData, setHighchartsData] = useState<ProcessedHighchartsData | null>(null);
    const [ranksData, setRanksData] = useState<Record<string, number> | null>(null); //state var for output ranks
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    // const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
    const [mode, setMode] = useState<"ranks" | "sensitivity">("ranks"); // Mode for rank output option

    const [weights, setWeights] = useState<Weights>({
        "measure net cost": 0.25,
        "averted risk_aai": 0.5,
        "approval": 0.8,
        "feasability": 0.1,
        "durability": 0.3,
        "externalities": 0.4,
        "implementation time": 0.15
    }); //state var for weights
    
    const handleWeightChange = (criteria: keyof Weights, newValue: string) => {
        setWeights(prevWeights => ({
            ...prevWeights,
            [criteria]: parseFloat(newValue)
        }));
    };

    const createAndSendPayload = async () => {
        setLoading(true);
        setError(null);
    
    
        const payload = {
            "config": {
                "mode": mode, 
                "metrics": MCDMInput.metrics,
                "criterias_to_consider": MCDMInput.criterias_to_consider,
                "custom_criterias": MCDMInput.custom_criterias,
                "weights": weights, // Dynamic state object
                "constraints": MCDMInput.constraints,
                "group_cols": MCDMInput.group_cols
            }
        };
    
        try {
            const response = await fetch("YOUR_PYGEOAPI_ENDPOINT/processes/mcdm-analysis/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const result = await response.json();
            // Process the result to update charts
            // Need to fetch the job status to get the final result
            console.log("Process job submitted:", result);
        } catch (err) {
            console.error("Failed to send data to pygeoapi:", err);
            setError("Failed to run MCDM analysis.");
        } finally {
            setLoading(false);
        }
    };
    

    const fetchRanksData = async () => {
        // Placeholder for actual API call with post request at pygeoapi endpoint
    
        // Dummy JSON data for now
        const dummyRanksData = {
            "Barrier": 2,
            "Coastal Retreat": 3,
            "Building Codes": 1,
            "Improved Filtration": 4
        };
    
        return new Promise<Record<string, number>>((resolve) => {
            setTimeout(() => resolve(dummyRanksData), 500); // Simulate network delay
        });
    };

    // Simulate fetching JSON data for sensitivity analysis
    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setLoading(true);
                setError(null);

                // --- SIMULATED JSON FETCH ---
                // Replace this with actual fetch call
                // const response = await fetch('/api/rank-data');
                // if (!response.ok) {
                //     throw new Error(`HTTP error! status: ${response.status}`);
                // }
                // const rawJsonData: RawRankData = await response.json();

                // Dummy JSON data for sensitivity analysis
                const dummyRawJsonData: RawRankData = {
                    "1": [30, 20, 50, 10],
                    "2": [40, 30, 20, 60],
                    "3": [20, 40, 10, 20],
                    "null": [10, 10, 20, 10]
                };
                const dummyAlternativeNames = [
                    "Barrier",
                    "Coastal Retreat",
                    "Building Codes",
                    "Improved Filtration"
                ];
                // --- END SIMULATED JSON FETCH ---

                const processedData = processRawDataForHighcharts(
                    dummyRawJsonData,
                    dummyAlternativeNames
                );
                setHighchartsData(processedData);

                // Fetch and set ranks data 
                const ranksResult = await fetchRanksData();
                setRanksData(ranksResult);
            } catch (err) {
                console.error("Failed to fetch or process chart data:", err);
                setError("Failed to load chart data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, []); // Empty dependency array means this runs once on mount


    // Memoize chart options to prevent unnecessary re-renders of Highcharts chart
    const chartOptions: Highcharts.Options | null = useMemo(() => {
        if (!highchartsData) return null;

        // const seriesColors = highchartsData.series.map(s => {
        //     if (typeof s === 'object' && s !== null && 'color' in s) {
        //       return s.color;
        //     }
        //     return '#cccccc'; // A safe fallback color
        //   });

        return {
            chart: {
                type: "column",
                height: 400
            },
            title: {
                text: "Measure Ranking Result: Sensitivity Analysis",
                align: "left"
            },
            // colors: seriesColors,
            xAxis: {
                categories: highchartsData.categories,
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
                // headerFormat: "<b>{point.x}</b><br/>",
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
            series: highchartsData.series
        };
    }, [highchartsData]); // Recalculate options only when highchartsData changes

    const ranksChartOptions: Highcharts.Options | null = useMemo(() => {
        if (!ranksData) return null;
    
        const categories = Object.keys(ranksData);
        // const seriesData = Object.values(ranksData);
        const seriesData = categories.map((measure) => {
            const rank = ranksData[measure];
            let color = "#2f7ed8"; // Default color blue
    
            // Assign different colors based on the rank
            if (rank === 1) {
                color = "#82b366"; // Green
            } else if (rank === 2) {
                color = "#f7a35c"; // Orange 
            } else if (rank === 3) {
                color = "#800080"; // Purple
            } else if (rank === 4) {
                color = "#008080"; // Teal
            }
            
            return {
                name: measure, // The name for the tooltip
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
            tooltip: {
                headerFormat: "<b>{point.x}</b><br/>",
                pointFormat: "Rank: <b>{point.y}</b>"
            },
            plotOptions: {
                column: { 
                    dataLabels: {
                        enabled: true,
                        // Position the label inside the bar
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
        };
    }, [ranksData]);

    if (loading) {
        return (
            <Center height="400px">
                <Spinner size="xl" />
                <Text ml={4}>Loading chart data...</Text>
            </Center>
        );
    }

    if (error) {
        return (
            <Center height="400px">
                <Text color="red.500">{error}</Text>
            </Center>
        );
    }

    if (!chartOptions) {
        return (
            <Center height="400px">
                <Text>No chart data available.</Text>
            </Center>
        );
    }

    return (
        <Box>
            <ToolButton label="Multi-Criteria Decision Making (MCDM)" icon={<FaBalanceScale />} onClick={onOpen} />
            <Modal closeOnOverlayClick={true} isOpen={isOpen} onClose={onClose} size='xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>CLIMADA Multi-Criteria Decision Making (MCDM)</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontWeight="semibold" padding={1}> Please select an Analysis Mode and rate each criteria. </Text>
                        <FormControl mb={4}>
                            <FormLabel>Analysis Mode</FormLabel>
                            <Select value={mode} onChange={(e) => setMode(e.target.value as "ranks" | "sensitivity")}>
                                <option value="ranks">Ranks</option>
                                <option value="sensitivity">Sensitivity Analysis</option>
                            </Select>
                        </FormControl>

                        {Object.keys(weights).map((criteria) => {
                            const typedCriteria = criteria as keyof Weights;
                            // const marks = [
                            //     { value: 0, label: "0%" },
                            //     { value: 0.5, label: "50%" },
                            //     { value: 1, label: "100%" },
                            //   ]
                            const criterionDisplayNames: Record<keyof Weights, string> = {
                                "measure net cost": "Cost: How important is the cost of implementing the measure?",
                                "averted risk_aai": "Averted Risk: How important is it that the measure helps to avert risk to people?",
                                "approval": "Approval: How important is it that the public approves of the measure?",
                                "feasability": "Feasibility: How important is it that the measure be feasible to implement?",
                                "durability": "Durability: How important is it that the measure is durable?",
                                "externalities": "Externalities: How important is it that the measure is future-proof?",
                                "implementation time": "Implementation Time: How important is the time it takes to implement the measure?"
                            };
                            return (
                        
                                <FormControl key={typedCriteria} mb={4}>
                                    <FormLabel>{criterionDisplayNames[typedCriteria]}</FormLabel>
                                    <Box padding={2}>
                                        <Flex justify="space-between" mb={1}>
                                            <Text fontSize="sm">Not important</Text>
                                            <Text fontSize="sm">Somewhat important</Text>
                                            <Text fontSize="sm">Highly important</Text>
                                        </Flex>
                                        <Slider
                                            value={weights[typedCriteria]}
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            onChange={(newValue) => handleWeightChange(typedCriteria, newValue.toString())}
                                            defaultValue={0}
                                        >
                                            <SliderTrack>
                                                <SliderFilledTrack />
                                            </SliderTrack>
                                            {/* <SliderMarks marks={marks} /> */}
                                            <SliderThumb/>
                                            <Tooltip
                                                hasArrow
                                                // bg='teal.500'
                                                color='white'
                                                placement='top'
                                                isOpen
                                                label={weights[typedCriteria]}
                                            >
                                                <SliderThumb />
                                            </Tooltip>
                                        </Slider>
                                    </Box>
                                </FormControl>
                            );
                        })}
                        <Button size="md">Submit Criteria Weights</Button>
                        <hr style={{ margin: "20px 0" }} />
                        <RankDistributionChart chartOptions={chartOptions} />
                        <hr style={{ margin: "20px 0" }} />
                        {ranksChartOptions && <RankDistributionChart chartOptions={ranksChartOptions} />}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default MCDM;
