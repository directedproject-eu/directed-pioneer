// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { Box, Slider, Text } from "@chakra-ui/react";
import { SimpleLayer } from "@open-pioneer/map";
import { useService, useIntl } from "open-pioneer:react-hooks";
import { FloodDepthService } from "../services/FloodDepthService";
import { FlowVelocityService } from "../services/FlowVelocityService";
import { TIMESTEPS, FIRST_TIME, LAST_TIME, buildUrl, formatSeconds } from "../config/floodDepth";
import { buildVelocityUrl } from "../config/flowVelocity";

/**
 * Gemeinsamer Timeslider für die beiden zeitvariablen GeoTIFF-Layer (HRB Eicherscheid):
 * Wassertiefe und Fließgeschwindigkeit teilen sich dieselbe Zeitachse ({@link TIMESTEPS}).
 * Bei jeder Änderung wird die GeoTIFF-Quelle *beider* Layer auf den gewählten Zeitpunkt
 * getauscht, damit sie synchron bleiben. Der Slider wird angezeigt, sobald mindestens
 * einer der beiden Layer sichtbar ist.
 */
export const FloodTimeSlider = () => {
    const intl = useIntl();
    const [sliderValue, setSliderValue] = useState(0);
    const [depthVisible, setDepthVisible] = useState(false);
    const [velocityVisible, setVelocityVisible] = useState(false);

    const depthSrvc = useService<FloodDepthService>("app.FloodDepthService");
    const velocitySrvc = useService<FlowVelocityService>("app.FlowVelocityService");

    useEffect(() => {
        const init = async () => {
            const model = await depthSrvc.getMapModel();
            const bindVisibility = (
                layerId: string,
                setVisible: (visible: boolean) => void
            ) => {
                const layer = model?.layers.getLayerById(layerId) as SimpleLayer | undefined;
                if (layer) {
                    setVisible(layer.olLayer.getVisible());
                    layer.olLayer.on("change:visible", () =>
                        setVisible(layer.olLayer.getVisible())
                    );
                }
            };
            bindVisibility("flood_depth", setDepthVisible);
            bindVisibility("flow_velocity", setVelocityVisible);
        };
        init();
    }, [depthSrvc]);

    const onChange = (details: { value: number[] }) => {
        const val = details.value[0];
        if (val === undefined) return;
        setSliderValue(val);
        const timeValue = TIMESTEPS[val];
        if (timeValue !== undefined) {
            // Beide Layer synchron halten (auch den gerade unsichtbaren).
            depthSrvc.setFileUrl(buildUrl(timeValue));
            velocitySrvc.setFileUrl(buildVelocityUrl(timeValue));
        }
    };

    if (!depthVisible && !velocityVisible) return null;

    const selectedSeconds = TIMESTEPS[sliderValue] ?? FIRST_TIME;

    return (
        <div
            style={{
                width: window.innerWidth * 0.4,
                marginLeft: window.innerWidth * 0.3,
                marginRight: window.innerWidth * 0.3,
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                marginTop: "5px"
            }}
        >
            <Box padding={4} mb={8}>
                <Text fontWeight="semibold">
                    {intl.formatMessage({ id: "map.slider.time.title" })}
                </Text>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px"
                    }}
                >
                    <span>
                        {intl.formatMessage({ id: "map.slider.time.start" })}{" "}
                        {formatSeconds(FIRST_TIME)}
                    </span>
                    <span>
                        {intl.formatMessage({ id: "map.slider.time.end" })}{" "}
                        {formatSeconds(LAST_TIME)}
                    </span>
                </div>
                <Slider.Root
                    aria-label={["flood-time-slider"]}
                    defaultValue={[0]}
                    min={0}
                    max={TIMESTEPS.length - 1}
                    value={[sliderValue]}
                    onValueChange={onChange}
                    step={1}
                >
                    <Slider.Control>
                        <Slider.Track>
                            <Slider.Range />
                        </Slider.Track>
                        <Slider.Thumb index={0} />
                    </Slider.Control>
                </Slider.Root>
                <Text>
                    {intl.formatMessage({ id: "map.slider.time.selected_time" })}{" "}
                    <Text as="span" fontWeight="normal" color="black">
                        {formatSeconds(selectedSeconds)}
                    </Text>
                </Text>
            </Box>
        </div>
    );
};

export default FloodTimeSlider;
