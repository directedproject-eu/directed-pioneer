// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { BeforeRequestParams, Interceptor } from "@open-pioneer/http";
import { AuthService } from "@open-pioneer/authentication";
import { ServiceOptions } from "@open-pioneer/runtime";

interface References {
    authService: AuthService;
}

export class TokenInterceptor implements Interceptor {
    private authService: AuthService;

    constructor(options: ServiceOptions<References>) {
        this.authService = options.references.authService;
    }

    beforeRequest({ target, options }: BeforeRequestParams): void {
        const authState = this.authService.getAuthState();
        const sessionInfo = authState.kind == "authenticated" ? authState.sessionInfo : undefined;
        const keycloak = sessionInfo?.attributes?.keycloak;
        const token = (keycloak as { token: string }).token;
        const baseUrl = new URL("https://directed.dev.52north.org/protected/");
        const matchesProtocol = target.protocol === "https:" || import.meta.env.DEV;
        if (
            matchesProtocol &&
            target.hostname === baseUrl.hostname &&
            token &&
            target.pathname.startsWith(baseUrl.pathname)
        ) {
            options.headers.set("Authorization", `Bearer ${token}`);
        }
    }
}
