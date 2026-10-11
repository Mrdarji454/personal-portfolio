# Mukesh Darji — restored MERN portfolio & private studio

React / Vite / Tailwind CSS with GSAP + ScrollTrigger, an Express API, MongoDB / Mongoose, and a protected `/admin` dashboard. The restored portfolio now includes four admin-selected themes and responsive public/admin layouts.

## Recovery details

The workspace’s `src/`, `server/`, and `public/` directories were empty, package/configuration files were missing, and README was blank. Git contained one commit with compiled output but no application source; reflog and unreachable-object checks found no source history to recover.

The surviving compiled build was backed up to `.recovery/original-dist/` before building. Application components were extracted from those bundles and their JSX restored, retaining public pages, admin forms, UI behavior, GSAP hooks, and content states. Authored CSS was recovered from the surviving stylesheet, and the favicon and SVG portrait placeholder were recovered byte-for-byte. The recovery helper is `scripts/recover-frontend.mjs` (it skips existing source files).

The Express routes, MongoDB models, validators, storage adapter, setup scripts, seed content, tests, and configuration were reconstructed from this conversation’s previous implementation. **Original source comments, some local variable names, exact formatting, and the old lockfile could not be recovered exactly.** The lockfile was regenerated against the surviving dependencies. Source changes or database edits made after the conversation that were absent from the built assets cannot be recovered from Git.

Your surviving `.env`, existing Git history, installed dependencies, and `uploads/` image were preserved. The configured database was not seeded or reset, no permanent administrator was created/replaced, and tests use an isolated temporary MongoDB. Uploaded-file metadata lives in MongoDB; preserving a file does not reconstruct missing database records. The sibling older `portfolio` directory was inspected but not copied or modified because it is a different project.

## Local setup

Use Node.js 22.12+ (tested with Node 24) and MongoDB 7+ locally or MongoDB Atlas.

1. Run `npm install` (already performed during recovery).
2. Keep your surviving `.env`. For a new installation, copy `.env.example` to `.env`, set `MONGODB_URI`, and replace the secret placeholder with a private random value from `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. No new secret was invented during recovery.
3. Ensure MongoDB is reachable. If the existing database already has your content and administrator, keep them. Run `npm run seed` only if initialization is needed; it inserts missing original content and preserves existing records.
4. If no administrator exists, run `npm run admin:create` in an interactive terminal. Enter your email and a 12–72 UTF-8 byte password; password entry is hidden and bcrypt cost 12 hashes it. The fixed administrator ID prevents a second account. There is no registration API.
5. Run `npm run dev:server` in one terminal and `npm run dev` in another. Visit `http://127.0.0.1:5173`, and `/admin` to sign in.

Vite proxies `/api` to port 4000. Use a consistent hostname and include the exact browser origin in `CLIENT_ORIGINS`. Secure cookies are disabled only for local HTTP development and enabled in production.

| Command                | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | React development server                            |
| `npm run dev:server`   | Express API with watching                           |
| `npm run build`        | Production frontend into `dist/`                    |
| `npm start`            | API; also serves `dist/` when `NODE_ENV=production` |
| `npm run seed`         | Explicit repeat-safe original-content seed          |
| `npm run admin:create` | Interactive single-admin setup                      |
| `npm test`             | MongoDB integration and DOM behavior checks         |

`npm run preview` serves the frontend alone, not the complete MERN application. The build uses Vite's native config loader for this JavaScript ESM config, avoiding restricted Windows parent-directory reads during config bundling. For production builds, ensure `NODE_ENV=production` in the build environment; the preserved development `.env` may otherwise select React’s development runtime.

## Pages and editing

Home, About, searchable/filterable Projects, unique `/projects/:slug` case studies, Resume, and Contact load their content from backend APIs. Hero entrances, section reveals, desktop project parallax, skill orbit, timeline progress, and page entrances use scoped GSAP contexts with cleanup. Reduced-motion visitors retain content and functionality without unnecessary animation. The About orbit rotates continuously on desktop, tablets, and phones without hover/focus pauses. Named icon labels counter-rotate with the icons to remain horizontal; reduced-motion visitors get a still layout. Shared body text is about 17px, UI labels/metadata about 15px, and compact orbit labels 14px on phones.

The dashboard restores profile/biography/contact/availability editing, portrait and PDF replacement, skill/education/timeline entry management, project CRUD, ordering and featuring, screenshots, video URLs, private previews, publish/unpublish, inquiries with read/archive status, and a media library. The SVG stays the portrait fallback. The Resume page shows the uploaded PDF with Open PDF and Download resume actions, followed by a short editorial summary drawn from the Biography field. There is no duplicate HTML resume; if no PDF is attached, it shows a clear coming-soon message. Upload the PDF in Admin ? Profile & content, and edit Biography there to update the summary below it. Destructive actions require confirmation. Failed save requests preserve input; reauthentication preserves edits, while forced refresh or closing a tab does not.

Profile saves publish immediately. Project edits publish on save only when Published is checked; uncheck it and save first to edit privately. Public APIs expose only published projects. Existing visitors see newly saved content after reload. Contact inquiries are saved in MongoDB; success is shown only after saving. Email notifications are not included.

## Changing the default theme

1. Sign in at `/admin`. On phones, open the dashboard menu in the compact header.
2. Open **Appearance**. Select Dark Ember, Clean White, Midnight Navy, or Warm Ivory using the four visual cards (keyboard arrow keys also work for the radio group).
3. Choose **Preview theme** to temporarily apply your selection to the dashboard and open a homepage preview with your published content. Close the preview to continue editing. **Reset preview** returns to the saved default; leaving Appearance or refreshing discards an unsaved preview.
4. Choose **Save default theme** to publish the choice. The dashboard updates immediately, and all public pages/new visits use the saved theme. Existing open public tabs pick it up when reloaded. Failed saves retain the selection and preview for retry; saving is disabled while a request is pending. An expired session opens the existing reauthentication dialog without losing the choice.

Appearance lives in `Site.appearance.theme` in MongoDB, separately from profile content. The existing database needs no reset or migration: records without appearance use **Dark Ember** until you save another choice. Profile saves and the repeat-safe seed do not overwrite appearance. Do not seed or recreate your admin just to enable themes.

`GET /api/appearance` exposes only the saved theme. `GET /api/admin/appearance` and `PUT /api/admin/appearance` require the existing admin session; mutations also require the trusted Origin and CSRF token. Only the four theme IDs are accepted.

The shared theme IDs are in `shared/themes.js`; all palette values and semantic tokens are in `public/themes.css`. Public pages, forms, states, project concept previews, navigation, admin editors, and dialogs use those tokens. The portrait SVG is rendered inline with theme tokens while uploaded portraits remain unchanged. Skin colors remain illustration details.

Vite injects a **classic parser-blocking** `/api/theme.js` script into the document head. This applies the MongoDB default before the body is painted, followed by a client recheck. It uses no visitor theme storage or OS color preference. Keep `/api/theme.js` on the same origin as the frontend and do not cache it (the API sends `Cache-Control: no-store`). Include this route in API forwarding rules on split deployments. Start the API alongside Vite; a frontend-only static preview cannot read a database theme. If the API is unreachable, the bundled Dark Ember palette is the fallback; Appearance shows the load failure and Retry instead of saving a guessed default.

Mobile drawers provide an explicit close button, Escape, focus trapping/restoration, background inertness, body scroll locking, active links, and automatic closing when switching sections or widening the viewport. Public layouts use natural vertical sections on phones/tablets. Mobile GSAP reveals are shorter with small movement; parallax and scrubbed timeline progress are desktop-only. The labelled About orbit also rotates on mobile as requested. Reduced-motion mode suppresses animation. Phone admin forms stack fields/cards and keep save bars in document flow so fields and the on-screen keyboard stay usable; dialogs scroll within the viewport.

## Storage

`STORAGE_DRIVER=local` selects the filesystem adapter in `server/storage.js`. `UPLOAD_DIR` stores UUID-named files; MongoDB holds metadata and references. Images are decoded, auto-rotated, resized within 1920×1920, stripped of metadata, and converted to WebP. JPEG, PNG, and WebP uploads have an 8 MB limit and a 25 million input-pixel limit. PDFs require PDF MIME type, header, and end marker, with the same size limit. Uploaded SVGs are rejected; the trusted SVG fallback is bundled.

Files are served through `/api/media/:id`, not a public static uploads folder. Only profile files and screenshots referenced by published projects are publicly accessible; administrators can preview private/unused files. Referenced files cannot be deleted. Removing an attachment does not delete its physical file; unused media can be explicitly deleted. PDF responses include sandbox headers and optional attachment disposition.

Production requires an absolute `UPLOAD_DIR` on a mounted, backed-up persistent volume, for example `/var/lib/portfolio/uploads`. Do not use ephemeral serverless storage. Back up and restore MongoDB and the volume together. The adapter supports one instance or instances sharing the same durable filesystem. No object-storage adapter was added during restoration.

## Security and deployment

Set `NODE_ENV=production`, a private strong `SESSION_SECRET`, production `MONGODB_URI`, HTTPS-only `CLIENT_ORIGINS`, `PUBLIC_ORIGIN`, `PORT`, and a durable `UPLOAD_DIR`. Install with `npm ci`, initialize content/admin only as needed, build with a production environment, and run `npm start` under a process manager behind an HTTPS reverse proxy. Route frontend and API through the same origin. Set `TRUST_PROXY=1` only for exactly one trusted proxy hop; otherwise use `0`. Restrict the upstream port. Configure proxy upload limits slightly above 8 MB for multipart overhead. Monitor `/api/health` and retain backups.

Authentication uses random opaque tokens in HttpOnly, SameSite Strict cookies; MongoDB stores keyed session-token hashes. Sessions expire after eight hours, logout revokes them, and TTL indexes clean up expired records. All admin API routes authenticate on the server. Synchronizer CSRF tokens and exact Origin checks protect mutations, including login/contact. CORS restricts origins, Helmet sets security headers, Zod validates strict request shapes and HTTPS URLs, and centralized errors do not disclose stack traces or credentials. Login, contact, token initialization, and uploads are rate limited. React renders content as text instead of raw HTML.

Rate-limit counters are process-local; use one API process or enforce shared limits at a trusted gateway before scaling. Rotating `SESSION_SECRET` invalidates sessions. Account recovery is an operator task through trusted database administration; no public password-reset/replacement endpoint exists.

The surviving Git commit already tracks `.env`; recovery did not rewrite that history or untrack your file. Before publishing the repository, remove private configuration from version control while retaining the local file. `.gitignore` now excludes secrets, uploads, build output, dependencies, caches, and the recovery backup.

## Structure and content

Home project covers cycle through the screenshots saved in the admin project editor, in their configured order, when two or more are available. Covers include pause/play and previous/next controls. Autoplay stops on hover, keyboard focus, when offscreen or the tab is hidden, and for reduced-motion preferences. Manual navigation pauses autoplay until Play is selected. One screenshot stays static; missing or failed screenshots fall back to the existing labelled concept preview. Project descriptions reveal in sequence on scroll.

`src/App.jsx` composes routes; `src/site.jsx` loads backend content; `src/ui.jsx`, `src/blocks.jsx`, and `src/project-visual.jsx` contain recovered reusable components. `src/pages/PublicPages.jsx` and `src/pages/Admin.jsx` contain public pages and dashboard. `src/motion.js` contains GSAP/SEO hooks; styling is in `src/styles.css` and `src/upgrade.css`.

`server/app.js` defines APIs, `server/models.js` persistence, `validation.js` input constraints, `storage.js` durable media handling, and `server/scripts/` setup. `src/data.js` is used only by the explicit seed via `server/seed-content.js`.

School ERP remains a solo project in development, with unverified feature completion. ShramSetu remains a team SIH online-round submission; booking, verification, assignment, payments, and AI-assisted features remain planned scope. Weather App remains described only as a known React project. No new achievements, metrics, dates, project links, or contributions were invented. CSS previews remain labelled concepts. No real resume PDF, project screenshots, or reference recording was recoverable; the surviving uploaded image was kept without changing content references.

Page titles, descriptions, Open Graph metadata, favicon, lazy-loaded pages/images, focus styles, print styling, and responsive breakpoints are restored. Add canonical/social-image URLs after configuring a deployment domain; client-side metadata requires JavaScript-aware crawlers.

## Verification

The production build passes and all **21 automated checks** pass. Nine isolated MongoDB integration checks cover repeat-safe seeding, authentication/logout, CSRF/origin enforcement, protected APIs, project CRUD/order/publishing, upload validation/limits/conversion, draft-media privacy, PDF download, contact persistence/status, rate limits, and appearance validation/persistence/bootstrap across all four themes. Appearance tests also verify that content saves/seeding preserve the selection and anonymous or CSRF-free mutations fail.

Ten DOM checks cover navigation focus trapping/Escape/scroll restoration, reduced-motion visibility, project search, contact failure/success, failed admin saves, all four saved themes across Home/About/Projects/Resume/Contact/project details and every admin section, theme refresh persistence, temporary previews, load/save failure and retry, duplicate-save prevention, the admin drawer, and phone/tablet GSAP behavior without pinning, scrub or parallax, plus continuous labelled orbit motion, level counter-rotation, and no hover/focus pause. Two token/config checks verify complete palettes, at least 4.5:1 text/button contrast, at least 3:1 focus/field-border contrast, the blocking bootstrap, and mobile responsive rules.

Tests use temporary MongoDB and upload directories, not the surviving `.env` database. `mongodb-memory-server` uses an official MongoDB binary cached in `.cache/mongodb`; use `MONGOMS_SYSTEM_BINARY` if downloading is restricted. DOM checks use jsdom and mocked requests; they do not verify real layout.

Browser tooling reported no available browser. Actual visual behavior in all four themes at 360/390/768/tablet/desktop widths, horizontal overflow, touch/virtual-keyboard behavior, video playback, and PDF/print preview remain unverified in a browser. DOM tests do not substitute for rendered viewport inspection. The existing `.env` passed configuration validation without exposing its values. Actual configured-database availability and persisted content were not changed or validated by these isolated checks.
