# EYE10 Elga Cloud Deployment

This project now deploys to Elga Cloud shared/cPanel as a single Node app:

- `app.js` serves the built Vite frontend from `dist`
- `app.js` exposes `/api/send-coupon-email`
- `app.js` exposes `/api/b2-storage`
- SPA routes such as `/admin/login` and product detail URLs fall back to `dist/index.html`

## cPanel App Setup

In cPanel, create a Node.js app with:

- Application root: this project folder
- Startup file: `app.js`
- Node version: `18+` recommended
- Environment: `production`

Passenger/cPanel will provide the runtime port. The app already listens on `process.env.PORT`.

## Environment Variables

Use `elga.env.template` as the checklist for cPanel environment variables.

Important notes:

- `VITE_*` values are build-time values for the browser bundle
- `SUPABASE_SERVICE_ROLE_KEY`, `B2B_*`, and `EMAILJS_*` are server-only runtime secrets
- Keep `VITE_API_BASE_URL` and `VITE_B2_API_BASE_URL` empty when the frontend and API run on the same Elga app
- If you set only `SUPABASE_URL` and `SUPABASE_ANON_KEY`, `vite.config.js` maps them into the browser build during `npm run build`

## Build And Deploy

If building on the server:

```bash
npm install
npm run build
```

If uploading a prepared build from local:

```bash
npm install --omit=dev
```

The deployed app needs:

- `app.js`
- `api/`
- `lib/`
- `dist/`
- `package.json`
- `package-lock.json`
- any other runtime files referenced by the app

## Restart After Changes

After updating code or environment variables:

1. Run `npm install` if dependencies changed.
2. Run `npm run build` if any frontend or `VITE_*` value changed.
3. Restart the Node app from cPanel.

On Passenger-based hosting, a restart can also be triggered with:

```bash
mkdir -p tmp
touch tmp/restart.txt
```

## Route And API Expectations

Frontend refreshes should work for:

- `/`
- `/admin/login`
- product detail routes
- any other React Router URL

API endpoints stay same-origin:

- `POST /api/send-coupon-email`
- `GET|POST /api/b2-storage`

## Upload / Request Limits

`app.js` is configured for:

- coupon email JSON: `1mb`
- B2 JSON requests: `2mb`
- B2 upload proxy requests: `50mb`

Current B2 validation inside `api/b2-storage.js` additionally limits files by type:

- catalogue PDFs: `25 MB`
- banner images: `10 MB`
- banner videos: `42 MB`
- product images: `10 MB`
- product videos: `45 MB`

## Smoke Test Checklist

After deployment, verify:

1. Home page opens and assets load.
2. Refresh works on `/admin/login`.
3. Admin login succeeds with the production Supabase keys.
4. Scratch-card coupon email flow works.
5. Admin media upload/delete works for B2.
6. Catalogue PDF download still works.
