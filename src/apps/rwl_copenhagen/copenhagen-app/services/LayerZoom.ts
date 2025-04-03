// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { DeclaredService } from "@open-pioneer/runtime";
import { MapModel } from "@open-pioneer/map";
import { fromLonLat } from "ol/proj";

export interface LayerZoom extends DeclaredService<"app.LayerZoom"> {
    zoomToFrederikssund(mapModel: MapModel): void;
    zoomToEgedal(mapModel: MapModel): void;
    zoomToHalsnaes(mapModel: MapModel): void;
    zoomToLejre(mapModel: MapModel): void;
    zoomToRoskilde(mapModel: MapModel): void;
}

export class LayerZoomImpl implements LayerZoom {
    private MAP_ID = "main";

    zoomToFrederikssund(mapModel: MapModel): void {
        this.zoomToLayer(mapModel, [12.0683, 55.8367], 12);
    }

    zoomToEgedal(mapModel: MapModel): void {
        this.zoomToLayer(mapModel, [12.1839, 55.7689], 12);
    }

    zoomToHalsnaes(mapModel: MapModel): void {
        this.zoomToLayer(mapModel, [11.9489, 55.9706], 12);
    }

    zoomToLejre(mapModel: MapModel): void {
        this.zoomToLayer(mapModel, [11.9435, 55.6048], 12);
    }

    zoomToRoskilde(mapModel: MapModel): void {
        this.zoomToLayer(mapModel, [12.0767, 55.6415], 12);
    }

    private zoomToLayer(mapModel: MapModel, lonLat: [number, number], zoom: number): void {
        const view = mapModel.olMap.getView();
        const center = fromLonLat(lonLat);
        view.animate({ center, zoom, duration: 1000 });
    }
}

//old working//
// export interface LayerZoom extends DeclaredService<"app.LayerZoom"> {
//     zoomToLayer(mapModel: MapModel): void;
// }
// export class LayerZoomImpl implements LayerZoom {
//     private MAP_ID = "main";

//     zoomToLayer(mapModel: MapModel): void {
//         const view = mapModel.olMap.getView();
//         const center = fromLonLat([12.0683, 55.8367]); //Frederikssund Municipality
//         view.animate({ center, zoom: 11, duration: 1000 });
//     }
// }

//end old working//

// OLD //

// export class LayerZoomImpl implements LayerZoom {
//     private MAP_ID = "main";

//     zoomToLayer(mapModel: MapModel): void {
//         const view = mapModel.olMap.getView();
//         // console.log("available layer IDs:", mapModel.layers.getOperationalLayers());
//         const frederikssund_municipality = mapModel.layers.getLayerById("Frederikssund Municipality");

//         //@ts-expect-error OpenLayers typing issue
//         const extent = frederikssund_municipality.olLayer.getSource().getExtent();
//         view?.fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
//     }
// }
