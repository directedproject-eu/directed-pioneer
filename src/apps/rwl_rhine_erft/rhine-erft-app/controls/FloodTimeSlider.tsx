// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { Box, Slider, Text } from "@chakra-ui/react";
import { unByKey } from "ol/Observable";
import { useService, useIntl } from "open-pioneer:react-hooks";
import { FloodDepthService } from "../services/FloodDepthService";
import { FlowVelocityService } from "../services/FlowVelocityService";
import { DamBreakService } from "../services/DamBreakService";
import {
    TIMESTEPS,
    FIRST_TIME,
    LAST_TIME,
    buildLayerName,
    formatSeconds
} from "../config/floodDepth";
import { buildVelocityLayerName } from "../config/flowVelocity";

/**
 * Shared time slider for the two time-varying WMS layers (HRB Eicherscheid): water
 * depth and flow velocity run on the same time axis ({@link TIMESTEPS}). Every change
 * points *both* layers at the WMS layer of the selected time so they stay in sync.
 * The slider is shown as soon as at least one of the two layers is visible. MapApp renders
 * it only while the user is logged in, i.e. while the Eicherscheid group is on the map.
 */
export const FloodTimeSlider = () => {
    const intl = useIntl();
    const [sliderValue, setSliderValue] = useState(0);
    const [depthVisible, setDepthVisible] = useState(false);
    const [velocityVisible, setVelocityVisible] = useState(false);

    const depthSrvc = useService<FloodDepthService>("app.FloodDepthService");
    const velocitySrvc = useService<FlowVelocityService>("app.FlowVelocityService");
    const damBreakSrvc = useService<DamBreakService>("app.DamBreakService");

    useEffect(() => {
        const group = damBreakSrvc.getGroupLayer().olLayer;
        const depth = depthSrvc.getLayer().olLayer;
        const velocity = velocitySrvc.getLayer().olLayer;
        // A layer counts as visible only while its group is visible too.
        const updateVisibility = () => {
            const groupVisible = group.getVisible();
            setDepthVisible(groupVisible && depth.getVisible());
            setVelocityVisible(groupVisible && velocity.getVisible());
        };
        updateVisibility();
        const keys = [group, depth, velocity].map((layer) =>
            layer.on("change:visible", updateVisibility)
        );

        // The slider starts at FIRST_TIME on every mount (e.g. after logging in again),
        // while the layers keep the time of the last session; put them back in line.
        depthSrvc.setLayerName(buildLayerName(FIRST_TIME));
        velocitySrvc.setLayerName(buildVelocityLayerName(FIRST_TIME));

        return () => unByKey(keys);
    }, [depthSrvc, velocitySrvc, damBreakSrvc]);

    // While dragging only the thumb and the time label follow; the layers are updated once
    // the slider stops (onChangeEnd), so dragging does not fire a WMS request per step.
    const onChange = (details: { value: number[] }) => {
        const val = details.value[0];
        if (val === undefined) return;
        setSliderValue(val);
    };

    const onChangeEnd = (details: { value: number[] }) => {
        const val = details.value[0];
        if (val === undefined) return;
        const timeValue = TIMESTEPS[val];
        if (timeValue !== undefined) {
            // Keep both layers in sync, including the one currently hidden.
            depthSrvc.setLayerName(buildLayerName(timeValue));
            velocitySrvc.setLayerName(buildVelocityLayerName(timeValue));
        }
    };

    if (!depthVisible && !velocityVisible) return null;

    const selectedSeconds = TIMESTEPS[sliderValue] ?? FIRST_TIME;

    return (
        <div
            style={{
                // Centred by its top-center MapAnchor; no side margins, which would widen
                // the anchor across the whole map and swallow clicks there.
                width: "40vw",
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
                    onValueChangeEnd={onChangeEnd}
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
