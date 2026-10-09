# MOSTLYVERS Admin

Standalone owner dashboard for the MOSTLYVERS Android reading platform. The visual system follows pages 9–11 of the supplied reference PDF and uses the same official brand mark, Cormorant Garamond headings, Lato interface text, ivory canvas, espresso navigation, and antique-gold accents.

## Local preview

```bash
npm install
npm run dev
```

Development always connects to the real backend. Visit `http://localhost:5174` and sign in with the Owner account created by the backend seed command.

## Real API

For local development set `VITE_API_URL=http://localhost:5001/v1`. For Cloudflare Pages configure:

```env
VITE_API_URL=/v1
```

Set the Pages Function variable `API_ORIGIN` to the Render origin without `/v1`. The same-origin proxy preserves Secure HttpOnly refresh cookies and CSRF protection. Images upload through the API to Cloudinary; EPUBs upload directly to private Supabase Storage through its S3-compatible signed multipart interface.

Cloudflare Pages deployment settings:

```text
Production branch: main
Build command: npm run build
Build output directory: dist
Build variable: VITE_API_URL=/v1
Pages Function variable: API_ORIGIN=https://<your-render-service>.onrender.com
```

The repository intentionally does not commit a production Wrangler binding: Cloudflare treats such a file as configuration source-of-truth, and a local `API_ORIGIN` must never override the dashboard's deployed value.

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
