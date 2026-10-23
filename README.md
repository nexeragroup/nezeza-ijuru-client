# Nezeza Ijuru Client

Client is the public, server-rendered Angular website for Nezeza Ijuru. It presents the ministry, programmes, conferences, media, giving, and contact journeys, and consumes the public API surface exposed by [`../server`](../server).

## What it provides

- Public home, about, giving, contact, programme, conference, and media experiences
- Conference-programme detail pages and published media/livestream views
- Server-side rendering (SSR) for fast first render and discoverable public pages
- Environment-specific SEO assets and metadata
- A same-origin development API proxy

## Prerequisites

- Node.js `>=24.15.0 <25` (enforced by `package.json` and the Docker image)
- pnpm 12.3.4
- A running NestJS API, normally `../server`, on `http://localhost:3300`

If pnpm is unavailable:

```bash
corepack enable
corepack prepare pnpm@12.3.4 --activate
```

## Local development

Run the API first:

```bash
cd ../server
pnpm install --frozen-lockfile
pnpm run start:dev
```

Then run the client:

```bash
cd ../client
pnpm install --frozen-lockfile
pnpm run start:dev
```

Visit `http://localhost:4200`. Browser requests to `/api/v1/*` are forwarded to the local API by `proxy/proxy.dev.mjs`.

If Control is also running, choose a separate port for one app:

```bash
pnpm ng serve --configuration dev --port 4300
```

## Configuration

The application deliberately separates public build-time configuration from development proxy configuration.

| Location | Purpose | Keep secret? |
| --- | --- | --- |
| `src/environments/environment.*.ts` | Site URL, API base URL, indexing behavior | No—these values are bundled for browsers. |
| `.env.dev`, `.env.staging`, `.env.prod` | CLI proxy target and timeout settings | No secrets; proxy destination is operational configuration. |
| Server environment files | Authentication, database, storage, mail, and server CORS | Yes—manage through the deployment secret store. |

For development, keep the client API base URL as `/api/v1` and set the proxy target as an origin only:

```dotenv
API_PROXY_TARGET=http://localhost:3300
```

For staging and production, keep `siteUrl`, `apiBaseUrl`, the server's `APP_URL`, and `CORS_ORIGIN` aligned to the same environment. Do not point a production browser build at a different brand, domain, or deployment tier.

## Architecture

```text
src/app/
├── core/       HTTP client, auth/session, state, interceptors, SEO, theme
├── layout/     public shell, header, and footer
├── shared/     reusable controls and feedback components
└── features/   lazily loaded public routes and page-specific services
```

SSR begins at `src/server.ts`. The Angular build produces both browser and server bundles under `dist/client/<configuration>/ssr/`.

## Commands

```bash
# Local development
pnpm run start:dev

# Development SSR build and server
pnpm run build:dev:ssr
pnpm run serve:dev:ssr

# Staging SSR build and server
pnpm run build:staging:ssr
pnpm run serve:staging:ssr

# Production SSR build and server
pnpm run build:prod:ssr
pnpm run serve:prod:ssr

# Unit tests
pnpm run test

# Proxy checks
pnpm run test:proxy
pnpm run test:proxy:integration
```

## Container build

The supplied Dockerfile creates an SSR runtime image. Build the desired configuration explicitly:

```bash
docker build --build-arg BUILD_CONFIGURATION=prod -t nezeza-client:prod .
docker run --rm -p 4200:4200 nezeza-client:prod
```

`BUILD_CONFIGURATION` may be `dev`, `staging`, or `prod`. Pass runtime configuration through the hosting platform; do not bake secrets into the image.

## Security and reliability

- Public environment files must never contain credentials or private endpoints.
- The API client rejects arbitrary absolute API paths; feature services should stay on the configured API base URL.
- For cookie-based sessions, preserve a same-origin proxy where possible. A cross-origin deployment needs credentialed CORS plus a tested CSRF-token exchange.
- Production deployments should terminate TLS before public traffic reaches the SSR process.
- The `ng serve` development warning is expected and does not describe a production-capable web server.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Browser API requests fail locally | Confirm `../server` is running on port 3300 and `API_PROXY_TARGET` is an origin without `/api/v1`. |
| SSR server cannot find output | Build the same configuration you are serving, then use the matching `serve:*:ssr` command. |
| CORS or CSRF failure in a deployed build | Compare the client `apiBaseUrl` to server `APP_URL`, `CORS_ORIGIN`, cookie policy, and reverse-proxy host. |
| SEO files look wrong per environment | Check the selected Angular build configuration and matching `src/seo/<environment>/` assets. |
| `pnpm` fails before scripts run | Repair Corepack and activate pnpm 12.3.4. |

## Delivery checklist

Before merging or deploying:

```bash
pnpm run build:prod
pnpm run test
pnpm run test:proxy
pnpm run test:proxy:integration
```

Verify one rendered public route and one API-backed route against the intended environment before promoting the image.
