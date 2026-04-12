// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0


import { MapRegistry } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { reactive, Reactive } from "@conterra/reactivity-core"; 

interface References {
    mapRegistry: MapRegistry;
}

interface NutsState {
    id: string | null;
}

export interface NutsSelector extends DeclaredService<"app.NutsSelector"> {
    selectedNutsId: string | null;
    clearSelection(): void;
}

export class NutsSelectorImpl implements NutsSelector {
    private MAP_ID = "main";
    private mapRegistry: MapRegistry;

    #NutsData: Reactive<NutsState> = reactive({ id: null });

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;

        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            const map = model?.olMap;
            if (!map) return;

            map.on("click", (event) => {
                let foundId: string | null = null;

                map.forEachFeatureAtPixel(event.pixel, (feature) => {
                    const nutsId = feature.get("NUTS_ID");
                    
                    if (nutsId) {

                        foundId = nutsId as string;
                        return true;
                    }
                });

                if (foundId) {
                    event.stopPropagation();
                    this.#NutsData.value = { id: foundId };
                }
            });
        });
    }

    get selectedNutsId(): string | null {
        return this.#NutsData.value?.id || null;
    }

    clearSelection(): void {
        this.#NutsData.value = { id: null };
    }
}
