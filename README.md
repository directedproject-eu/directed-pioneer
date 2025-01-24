# Open Pioneer Trails based web app for Directed

## Quick start

Ensure that you have [Node](https://nodejs.org/en/) (Version 18 or later) and [pnpm](https://pnpm.io/) (Version 9.x) installed.

Then execute the following commands to get started:

```shell
git clone https://github.com/directedproject-eu/directed-pioneer # Clone this repository
cd directed-pioneer
pnpm install                                          # Install dependencies
pnpm run dev                                          # Launch development server
```

Vite will print the project's local address (usually <http://localhost:5173/>).
Point your browser at it and start programming!

Additional in-depth information on OpenPioneer can be found in the [Documentation](https://open-pioneer.github.io/trails-demo/starter/docs/README.md).

## Docker

**Build** the image with:

```shell
docker build -t 52north/directed-open-pioneer-trails:latest .
```

**Run** the image with:

```shell
docker run -p 80:8080 --rm --name open-pioneer-trails 52north/directed-open-pioneer-trails:latest
```

**Access** the application in your browser <http://localhost/>.

## License

Apache-2.0 (see `LICENSE` file)

## Open Pioneer Links

-   [Open Pioneer::API Documentation](https://open-pioneer.github.io/trails-demo/core-packages/docs/)
-   [Open Pioneer::User manual](https://github.com/open-pioneer/trails-starter/tree/main/docs#readme)
-   [Open Pioneer::GitHub Organization](https://github.com/open-pioneer/)
-   [Open Pioneer::Core packages](https://github.com/open-pioneer/trails-core-packages)
-   [Open Pioneer::OpenLayers base packages](https://github.com/open-pioneer/trails-openlayers-base-packages)
-   [Open Pioneer::Build tools](https://github.com/open-pioneer/trails-build-tools)
