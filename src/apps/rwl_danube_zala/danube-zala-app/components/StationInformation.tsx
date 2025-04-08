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

const StationInformation = (data: StationData) => {
    const stationData: StationData = data.data;
    if (Object.keys(stationData).length == 0) {
        return <>Select an event on the map</>;
    }
    return (
        <>
            <div>Cím: {stationData.adress}</div>
            <div>Település: {stationData.settlement}</div>
            <div>Beavatkozás típusa: {stationData.type}</div>
            <div>Esemény típus: {stationData.eventType}</div>
            <div>Helyszín típusa: {stationData.locationType}</div>
            <div>Jelzés dátuma: {stationData.date}</div>
            <div>Káreset fajtája: {stationData.damageType}</div>
            <div>Megye (mk.): {stationData.county}</div>
        </>
    );
};

export default StationInformation;
