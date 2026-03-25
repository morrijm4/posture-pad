FROM node:24-alpine AS base
WORKDIR /app

FROM base AS build
RUN corepack enable
COPY . .
RUN pnpm -F @pp/mqtt... install --frozen-lockfile
RUN pnpm -F @pp/mqtt build

FROM base
COPY --from=build /app/apps/mqtt/dist/listener.js .
COPY --from=build /app/apps/mqtt/keys/ca.crt .
ENTRYPOINT ["node", "./listener.js"]
