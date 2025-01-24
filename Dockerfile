FROM node:20-slim AS build

ARG BASE_PATH=/

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN corepack use pnpm@9.x

COPY . /app
WORKDIR /app
#make sure dist and modules do not exist before building
RUN rm -f -R node_modules && rm -f -R dist
RUN pnpm install
# option disabled as build is failing atm
# should be enabled in production deployment image build
# RUN pnpm install --frozen-lockfile
RUN pnpm build --base ${BASE_PATH}

FROM nginxinc/nginx-unprivileged:stable-alpine-slim

# copy application from build stage to run stage
COPY --from=build /app/dist/www /usr/share/nginx/html

COPY nginx_default.conf /etc/nginx/conf.d/default.conf
