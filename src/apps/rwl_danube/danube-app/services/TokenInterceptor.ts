// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { BeforeRequestParams, Interceptor } from "@open-pioneer/http";
import { AuthService } from "@open-pioneer/authentication";
import { ServiceOptions } from "@open-pioneer/runtime";

interface References {
    authService: AuthService;
}

/** Requests below this url get the keycloak bearer token attached, nothing else does. */
const PROTECTED_BASE_URL = new URL("https://directed.dev.52north.org/protected/");

/**
 * Attaches the keycloak access token to requests for the protected pygeoapi collections.
 *
 * Registered as `http.Interceptor` in `build.config.mjs`, which means the runtime calls
 * it for every request that goes through `@open-pioneer/http` -- including the ones the
 * `ogc-features` package makes internally, which is how the protected layers in
 * `MapApp.tsx` get authorized without passing a token around themselves.
 *
 * Two consequences of sitting in that path: it runs for requests to any host, so it has
 * to decide quickly that a request is none of its business; and anything it throws is
 * re-thrown by the http service as "Interceptor '...' failed with an error", failing the
 * request itself rather than just skipping the header. Hence the early returns -- a
 * missing session is a normal state here, not an error.
 */
export class TokenInterceptor implements Interceptor {
    private authService: AuthService;

    constructor(options: ServiceOptions<References>) {
        this.authService = options.references.authService;
    }

    beforeRequest({ target, options }: BeforeRequestParams): void {
        const matchesProtocol = target.protocol === "https:" || import.meta.env.DEV;
        const isProtectedTarget =
            matchesProtocol &&
            target.hostname === PROTECTED_BASE_URL.hostname &&
            target.pathname.startsWith(PROTECTED_BASE_URL.pathname);
        if (!isProtectedTarget) {
            return;
        }

        const authState = this.authService.getAuthState();
        if (authState.kind !== "authenticated") {
            return;
        }

        // `attributes` is a Record<string, unknown>, so the shape has to be asserted --
        // but as an optional one, so a session without keycloak data is simply skipped.
        const keycloak = authState.sessionInfo?.attributes?.keycloak as
            { token?: string } | undefined;
        if (!keycloak?.token) {
            return;
        }

        options.headers.set("Authorization", `Bearer ${keycloak.token}`);
    }
}
