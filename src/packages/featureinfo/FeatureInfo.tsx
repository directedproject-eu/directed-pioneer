// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from "react";
import { MapModel } from "@open-pioneer/map";
import { setupClickHandler } from "./FeatureService";
import {
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverCloseButton,
    PopoverHeader,
    Portal,
    PopoverArrow,
    Table,
    Tbody,
    Tr,
    Td,
    Th
} from "@open-pioneer/chakra-integration";

interface FeatureInfoProps {
    mapModel: MapModel;
    layerId: string;
    projection: string;
}

export function FeatureInfo({ mapModel, projection }: FeatureInfoProps) {
    const [featureInfo, setFeatureInfo] = useState<{
        layerName: string | null;
        data: Record<string, unknown> | null;
    }>({
        layerName: null,
        data: null
    });
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (mapModel && mapModel.olMap) {
            const handleClick = (event: MouseEvent) => {
                setClickPosition({ x: event.clientX, y: event.clientY });
            };

            mapModel.olMap.getViewport().addEventListener("click", handleClick);
            setupClickHandler(mapModel, projection, setFeatureInfo);

            return () => {
                mapModel.olMap.getViewport().removeEventListener("click", handleClick);
            };
        }
    }, [mapModel, projection]);

    //cut off to 3 decimal places
    const round = (num: number) => {
        return num.toFixed(3);
    };

    //display only the band number and put into a table
    const renderFeatureProperties = (featureCollection: Record<string, unknown>) => {
        const features = featureCollection?.features as Array<Record<string, unknown>> | undefined;
        if (!features || features.length === 0) return <p>No features available</p>;

        const properties = features[0]?.properties as Record<string, unknown> | undefined;
        if (!properties) return <p>No properties available</p>;

        return (
            <Table size="md" variant="simple">
                <Tbody>
                    {Object.entries(properties).map(([key, value]) => (
                        <Tr key={key}>
                            <Th
                                style={{
                                    textAlign: "left",
                                    whiteSpace: "nowrap",
                                    fontWeight: "bold",
                                    paddingRight: "10px"
                                }}
                            >
                                {key}
                            </Th>
                            <Td style={{ wordBreak: "break-word" }}>
                                {typeof value === "number" ? round(value) : String(value)}
                                {/* {typeof value === "object" && value !== null
                                    ? JSON.stringify(value, null, 2)
                                    : String(value)} */}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        );
    };

    return featureInfo.data && clickPosition ? (
        <Popover isOpen={true}>
            <Portal>
                <div
                    style={{
                        position: "absolute",
                        top: `${clickPosition.y}px`,
                        left: `${clickPosition.x}px`,
                        zIndex: 1000
                    }}
                >
                    <PopoverContent style={{ maxHeight: "300px", overflow: "auto" }}>
                        <PopoverArrow style={{ top: "-20px", left: "20px" }} />
                        <PopoverCloseButton
                            onClick={() => setFeatureInfo({ layerName: null, data: null })}
                        />
                        <PopoverHeader>
                            <div>
                                <strong>Layer: </strong>
                                {featureInfo.layerName}
                            </div>
                            <div>
                                <strong>Pixel Value at </strong> X: {clickPosition.x}, Y:{" "}
                                {clickPosition.y}
                            </div>
                        </PopoverHeader>
                        <PopoverBody>{renderFeatureProperties(featureInfo.data)}</PopoverBody>
                    </PopoverContent>
                </div>
            </Portal>
        </Popover>
    ) : null;
}

///original working for 1 layer to test
// interface FeatureInfoProps {
//     mapModel: MapModel;
//     layerId: string;
//     projection: string;
// }

// export function FeatureInfo({ mapModel, layerId, projection }: FeatureInfoProps) {
//     const [featureInfo, setFeatureInfo] = useState<Record<string, unknown> | null>(null);
//     const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

//     useEffect(() => {
//         if (mapModel && mapModel.olMap) {
//             const handleClick = (event: MouseEvent) => {
//                 setClickPosition({ x: event.clientX, y: event.clientY });
//             }; //set the feature info where clicked

//             mapModel.olMap.getViewport().addEventListener("click", handleClick);
//             setupClickHandler(mapModel, layerId, projection, setFeatureInfo); //feature info retrieval

//             return () => {
//                 mapModel.olMap.getViewport().removeEventListener("click", handleClick);
//             };
//         }
//     }, [mapModel, layerId, projection]);

//     const renderFeatureProperties = (featureCollection: Record<string, unknown>) => {
//         //check features array exists
//         const features = featureCollection?.features as Array<Record<string, unknown>> | undefined;
//         if (!features || features.length === 0) return <p>No features available</p>;
//         //access properties of the first feature
//         const properties = features[0]?.properties as Record<string, unknown> | undefined;
//         if (!properties) return <p>No properties available</p>;

//         return (
//             <Table size="sm" variant="simple">
//                 <Tbody>
//                     {/* change back to entries(data) for entire json response in a table. remove const(s) */}
//                     {Object.entries(properties).map(([key, value]) => (
//                         <Tr key={key}>
//                             <Th
//                                 style={{
//                                     textAlign: "left",
//                                     whiteSpace: "nowrap",
//                                     fontWeight: "bold",
//                                     paddingRight: "10px",
//                                 }}
//                             >
//                                 {key}
//                             </Th>
//                             <Td
//                                 style={{
//                                     wordBreak: "break-word",
//                                 }}>
//                                 {typeof value === "object" && value !== null
//                                     ? JSON.stringify(value, null, 2)
//                                     : String(value)}
//                             </Td>
//                         </Tr>
//                     ))}
//                 </Tbody>
//             </Table>
//         );
//     };

//     return featureInfo && clickPosition? (
//         <Popover isOpen={true}>
//             <Portal>
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: `${clickPosition.y}px`,
//                         left: `${clickPosition.x}px`,
//                         zIndex: 1000,
//                     }}
//                 >
//                     <PopoverContent style={{ maxHeight: "300px", overflow: "auto" }}>
//                         <PopoverArrow style={{ top: "-20px", left: "20px" }}/>
//                         <PopoverCloseButton onClick={() => setFeatureInfo(null)} />
//                         <PopoverHeader>
//                             Pixel Value at X: {clickPosition.x}, Y: {clickPosition.y}
//                         </PopoverHeader>
//                         <PopoverBody>
//                             {renderFeatureProperties(featureInfo)}
//                             {/* <pre>{JSON.stringify(featureInfo, null, 2)}</pre> */}
//                         </PopoverBody>
//                     </PopoverContent>
//                 </div>
//             </Portal>
//         </Popover>
//     ) : null;
// }
