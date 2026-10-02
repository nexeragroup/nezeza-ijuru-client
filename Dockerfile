FROM node:24.21-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG BUILD_CONFIGURATION=prod
RUN pnpm run build:${BUILD_CONFIGURATION}

FROM node:24.21-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4200

ARG BUILD_CONFIGURATION=prod
COPY --from=build /app/dist/client/${BUILD_CONFIGURATION}/ssr ./

USER node

EXPOSE 4200

CMD ["node", "server/server.mjs"]
