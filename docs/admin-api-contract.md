# MOSTLYVERS Owner API Contract

The dashboard uses `${VITE_API_URL}/admin`. IDs are opaque strings, timestamps are UTC ISO-8601, money uses integer minor units, collection results use `{ items, nextCursor, total }`, and errors use `{ error: { code, message, requestId, details? } }`.

## Session and authorization

- `POST /admin/auth/login`, `/refresh`, `/logout`, `/password-reset/request`, `/password-reset/confirm`.
- The refresh session is an HttpOnly Secure SameSite cookie. Login and refresh return a short-lived access token, expiry, CSRF token, owner profile, and capabilities.
- Mutations send `X-CSRF-Token`; consequential operations also send `Idempotency-Key`.
- Every endpoint verifies OWNER authority server-side. Reader credentials, modified URLs, or hidden navigation never grant access.

## Dashboard and catalogue

- `GET /admin/dashboard?from=&to=` returns KPIs, sales series, top books, recent transactions, and recent private feedback.
- `GET/POST /admin/books`; `GET/PATCH/DELETE /admin/books/{id}`.
- `POST /admin/books/{id}/publish`, `/archive`; `GET /admin/books/{id}/sales`.
- Book mutations include `version`; stale edits return `409 CONTENT_VERSION_CHANGED`.
- Publish is atomic and idempotent: validate content, synchronize the Play product, change status, start Latest, and convert verified pre-books. Asynchronous work returns an operation ID readable from `GET /admin/operations/{id}`.
- Only unused drafts may be permanently deleted. Published, archived, pre-booked, or purchased books must be retained.

## Private signed uploads

- `POST /admin/uploads` creates an upload from kind, filename, MIME type, size, and SHA-256 checksum.
- `POST /admin/uploads/{id}/parts` returns short-lived signed multipart URLs.
- Browser uploads go directly to private storage; `POST /admin/uploads/{id}/complete` supplies part ETags and final checksum. `DELETE /admin/uploads/{id}` aborts.
- Cover formats: JPG, PNG, WebP, maximum 5 MB. Book format: EPUB only. The server validates checksum, MIME signature, malware status, ZIP/EPUB structure, and ownership of the upload reference before accepting it on a book.

## Operational data

- Readers: `GET /admin/readers`, `GET /admin/readers/{id}`. Reader information is read-only in v1; impersonation is prohibited.
- Sales: `GET /admin/sales/summary`, `/timeseries`, `/admin/transactions`, `/admin/transactions/{id}`, `/admin/sales/export`.
- Feedback: `GET /admin/feedback`, `/admin/feedback/{id}`. Feedback remains private and has no publish mutation.
- YouTube: `GET /admin/youtube-assets`; `PUT/DELETE /admin/books/{id}/youtube-asset`. URLs must be HTTPS YouTube hosts and associations use immutable Book IDs.

## Content, business rules, and settlement

- `GET/PATCH /admin/content/author`, `/contact`, `/about-app`.
- `GET/PATCH /admin/settings/app`, `/settings/billing`.
- `GET /admin/payment-status`, `/admin/settlement`; `POST /admin/settlement/portal-session` returns a short-lived provider URL.
- The dashboard never collects or renders full bank credentials, payment secrets, card data, passwords, or PINs.
- Price, fee, discount, maximum-device, and Latest-duration changes affect future behavior only. Historical transactions and change-count audit records remain immutable.
