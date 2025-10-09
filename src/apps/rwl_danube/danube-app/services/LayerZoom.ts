// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { DeclaredService } from "@open-pioneer/runtime";
import { MapModel } from "@open-pioneer/map";
import { fromLonLat } from "ol/proj";

export interface LayerZoom extends DeclaredService<"app.LayerZoom"> {
    zoomToVienna(mapModel: MapModel): void;
    zoomToZala(mapModel: MapModel): void;
}

export class LayerZoomImpl implements LayerZoom {
    private MAP_ID = "main";

    zoomToVienna(mapModel: MapModel): void {
        this.zoomToLayer(mapModel, [16.37, 48.21], 12);
    }

    zoomToZala(mapModel: MapModel): void {
        this.zoomToLayer(mapModel, [16.9, 46.7], 10);
    }

    private zoomToLayer(mapModel: MapModel, lonLat: [number, number], zoom: number): void {
        const view = mapModel.olMap.getView();
        const center = fromLonLat(lonLat);
        view.animate({ center, zoom, duration: 1000 });
    }
}
