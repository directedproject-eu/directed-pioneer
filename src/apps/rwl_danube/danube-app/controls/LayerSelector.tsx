// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from "react";
import { HStack } from "@open-pioneer/chakra-integration";
import { SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";
import { IsimipHandler } from "../services/IsimipHandler";
import { YearSlider } from "./YearSlider";
import { MonthSlider } from "./MonthSlider";

export function LayerSelector() {
    const [layerVisible, setLayerVisible] = useState(false);

    const prepSrvc = useService<IsimipHandler>("app.IsimipHandler");

    useEffect(() => {
        const init = async () => {
            const model = await prepSrvc.getMapModel();

            const layer = model?.layers.getLayerById("isimip") as SimpleLayer;

            if (layer) {
                setLayerVisible(layer.olLayer.getVisible());
                layer.olLayer.on("change:visible", () =>
                    setLayerVisible(layer.olLayer.getVisible())
                );
            }
        };
        init();
    }, [prepSrvc]);

    return (
        <div style={{ marginBottom: "30px" }}>
            {layerVisible && (
                <div
                    style={{
                        width: window.innerWidth * 0.4,
                        marginLeft: window.innerWidth * 0.3,
                        marginRight: window.innerWidth * 0.3,
                        borderRadius: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                        marginTop: "5px"
                    }}
                >
                    <span style={{ marginTop: "0.5em" }}>
                        <HStack>
                            <YearSlider></YearSlider>
                            <MonthSlider></MonthSlider>
                        </HStack>
                    </span>
                </div>
            )}
        </div>
    );
}
