# Web service — Angular build → nginx for Railway.
# Built from the repo root: `docker build -f docker/web.Dockerfile .`
#
# Two build args:
#   BUILD_CONFIG  Angular configuration (production | development)
#   API_HOST      Public hostname of the API service, no scheme,
#                 e.g. "rns-api-production.up.railway.app".
#                 Set as a Railway env var on the Web service AFTER
#                 the API service has a generated domain. Until then
#                 the placeholder value will leave /api/ broken but
#                 the SPA itself will still load.
FROM node:22-alpine AS build
WORKDIR /app

# Lockfile-aware install for layer caching.
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

COPY frontend/ .

ARG BUILD_CONFIG=production
RUN npx ng build --configuration ${BUILD_CONFIG}

# ---- runtime ----
FROM nginx:1.27-alpine

# Angular project name is "rns" (see frontend/angular.json) so the
# build output sits at dist/rns/browser.
COPY --from=build /app/dist/rns/browser /usr/share/nginx/html

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Substitute the API host into nginx.conf at build time. Railway
# rebuilds whenever this build arg changes, so updating API_HOST in
# the Web service variables is enough to repoint the proxy.
ARG API_HOST=__API_DOMAIN__
RUN sed -i "s|__API_DOMAIN__|${API_HOST}|g" /etc/nginx/conf.d/default.conf

EXPOSE 80
