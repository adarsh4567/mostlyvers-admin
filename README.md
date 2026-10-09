# MOSTLYVERS Admin

Standalone owner dashboard for the MOSTLYVERS Android reading platform. The visual system follows pages 9–11 of the supplied reference PDF and uses the same official brand mark, Cormorant Garamond headings, Lato interface text, ivory canvas, espresso navigation, and antique-gold accents.

## Local preview

```bash
npm install
npm run dev
```

Development always connects to the real backend. Visit `http://localhost:5174` and sign in with the Owner account created by the backend seed command.

## Real API

For local development set `VITE_API_URL=http://localhost:5001/v1`. For Cloudflare Workers configure:

```env
VITE_API_URL=/v1
```

The public Render origin is committed as the non-secret `API_ORIGIN` variable in `wrangler.json`. The same-origin proxy preserves Secure HttpOnly refresh cookies and CSRF protection. Images upload through the API to Cloudinary; EPUBs upload directly to private Supabase Storage through its S3-compatible signed multipart interface.

Cloudflare Workers deployment settings:

```text
Production branch: main
Build command: npm run build
Deploy command: npx wrangler deploy
Build variable: VITE_API_URL=/v1
Worker configuration: API_ORIGIN=https://mostlyvers-api.onrender.com
```

`wrangler.json` sends `/v1/*` through the Worker before the SPA asset fallback. `API_ORIGIN` is safe to commit because it is a public HTTPS endpoint and contains no credential.

For the guided production setup, run:

```bash
./scripts/deploy-cloudflare-pages-wizard.sh
```

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Playwright browsers must be installed before the first end-to-end run with `npx playwright install chromium`.
