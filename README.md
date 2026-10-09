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

Set the Pages Function variable `API_ORIGIN` to the Render origin without `/v1`. The same-origin proxy preserves Secure HttpOnly refresh cookies and CSRF protection. Images upload through the API to Cloudinary; EPUBs upload directly to private R2 using short-lived signed parts.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Playwright browsers must be installed before the first end-to-end run with `npx playwright install chromium`.
