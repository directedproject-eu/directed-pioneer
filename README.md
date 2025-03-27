# Open Pioneer Trails based web app for Directed

## Quick start

Ensure that you have [Node](https://nodejs.org/en/) (Version 18 or later) and [pnpm](https://pnpm.io/) (Version 9.x) installed.

Then execute the following commands to get started:

```shell
git clone https://github.com/directedproject-eu/directed-pioneer # Clone this repository
cd directed-pioneer
corepack cache clean && corepack use pnpm@9.x                    # Install pnpm 9^
pnpm install                                                     # Install dependencies
pnpm run dev                                                     # Launch development server
```

Vite will print the project's local address (usually <http://localhost:5173/>).
Point your browser at it and start programming!

Additional in-depth information on OpenPioneer can be found in the [Documentation](https://open-pioneer.github.io/trails-demo/starter/docs/README.md).

### Configure Base URL

The variables `VITE_DEV_URL` and `VITE_PROD_URL` must be configured in the `<root>/.env` file. By default `pnpm dev` uses `VITE_DEV_URL` and `pnpm build` uses `VITE_PROD_URL`. If the development server does not run on `localhost:5137` the `VITE_DEV_URL` variable must be updated accordingly. The variable `VITE_PROD_URL` is the URL of the landing page in a production deployment (or preview with `pnpm preview`).
If the variables are not set correctly the application might not work as expected (e.g. hyperlinks in the navbar).

See Vite documentation for details: <https://vite.dev/guide/env-and-mode.html#html-constant-replacement>

## Docker

### Build

```shell
docker build -t 52north/directed-open-pioneer-trails:latest .
```

### Scan the image for vulnerabilities

```shell
docker run -ti --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /tmp/aquasec-trivy-cache:/root/.cache/ \
    aquasec/trivy:latest \
    image \
        --scanners vuln \
        --format table \
        --severity CRITICAL,HIGH \
        --ignore-unfixed \
        52north/directed-open-pioneer-trails:latest
```

### Run

```shell
docker run -p 80:8080 --rm --name open-pioneer-trails 52north/directed-open-pioneer-trails:latest
```

**Access** the application in your browser <http://localhost/>.

## Authentication

For local testing, start a Keycloak instance:

```shell
docker run --rm -it -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
```

A complete example can be found in the [keycloak-sample app](https://github.com/open-pioneer/trails-core-packages/tree/main/src/samples/keycloak-sample).

## License

Apache-2.0 (see `LICENSE` file)

## Open Pioneer Links

- [Open Pioneer::API Documentation](https://open-pioneer.github.io/trails-demo/core-packages/docs/)
- [Open Pioneer::User manual](https://github.com/open-pioneer/trails-starter/tree/main/docs#readme)
- [Open Pioneer::GitHub Organization](https://github.com/open-pioneer/)
- [Open Pioneer::Core packages](https://github.com/open-pioneer/trails-core-packages)
- [Open Pioneer::OpenLayers base packages](https://github.com/open-pioneer/trails-openlayers-base-packages)
- [Open Pioneer::Build tools](https://github.com/open-pioneer/trails-build-tools)
