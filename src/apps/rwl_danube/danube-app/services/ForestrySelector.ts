// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { MapRegistry } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { reactive, Reactive } from "@conterra/reactivity-core"; // Richtiges Paket!

interface References {
    mapRegistry: MapRegistry;
}

interface ForestryState {
    id: string | null;
}

export interface ForestrySelector extends DeclaredService<"app.ForestrySelector"> {
    selectedLocationId: string | null;
    clearSelection(): void;
}

export class ForestrySelectorImpl implements ForestrySelector {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;

    #forestryData: Reactive<ForestryState> = reactive({ id: null });

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            const map = model?.olMap;
            if (!map) return;

            map.on("click", (event) => {
                let foundId: string | null = null;
                
                map.forEachFeatureAtPixel(event.pixel, (feature) => {
                    const locId = feature.get("locationId");
                    if (locId) {
                        foundId = locId as string;
                        return true; 
                    }
                });

                if (foundId) {
                    event.stopPropagation(); 
                    this.#forestryData.value = { id: foundId };
                }            
            });
        });
    }

    get selectedLocationId(): string | null {
        return this.#forestryData.value?.id || null;
    }

    clearSelection(): void {
        this.#forestryData.value = { id: null };
    }
}