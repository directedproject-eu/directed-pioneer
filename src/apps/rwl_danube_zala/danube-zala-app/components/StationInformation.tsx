// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

interface StationData {
    settlement: string;
    adress: string;
    type: string;
    eventType: string;
    locationType: string;
    date: string;
    damageType: string;
    county: string;
}

import { useIntl } from "open-pioneer:react-hooks";

const StationInformation = (data: StationData) => {
    const intl = useIntl();
    const stationData: StationData = data.data;
    if (Object.keys(stationData).length == 0) {
        return <>{intl.formatRichMessage({ id: "map.station_information.description" })}</>;
    }
    return (
        <>
            <div>
                {intl.formatMessage({ id: "map.station_information.attributes.address" })}:{" "}
                {stationData.adress}
            </div>
            <div>
                {intl.formatMessage({ id: "map.station_information.attributes.settlement" })}:{" "}
                {stationData.settlement}
            </div>
            <div>
                {intl.formatMessage({
                    id: "map.station_information.attributes.type_of_intervention"
                })}
                : {stationData.type}
            </div>
            <div>
                {intl.formatMessage({ id: "map.station_information.attributes.event_type" })}:{" "}
                {stationData.eventType}
            </div>
            <div>
                {intl.formatMessage({ id: "map.station_information.attributes.location_type" })}:{" "}
                {stationData.locationType}
            </div>
            <div>
                {intl.formatMessage({ id: "map.station_information.attributes.date_reported" })}:{" "}
                {stationData.date}
            </div>
            <div>
                {intl.formatMessage({ id: "map.station_information.attributes.damage_type" })}:{" "}
                {stationData.damageType}
            </div>
            <div>
                {intl.formatMessage({ id: "map.station_information.attributes.county" })}:{" "}
                {stationData.county}
            </div>
        </>
    );
};

export default StationInformation;
