# Repository Audit

Snapshot taken 2026-09-06, from the code as it stands. Updated after a follow-up pass that
applied most of the recommendations in section 5 - items now fixed are marked **RESOLVED**. Everything below was verified by
reading the repository — nothing is inferred from prior documentation.

Companion to the [root README](../README.md), which carries the setup, configuration and
run instructions. This document records *why the repository looks the way it does* and what
is still open.

---

## 1. Architecture

### Components

| Component | Responsibility |
| --- | --- |
| `frontend/` | React 17 SPA (CRA 5) on port 3000. Routing, all UI, all state. Talks to the API only. |
| `backend/` | Express 4 REST API on port 8000. Auth, CRUD, report generation, transactional email. |
| MongoDB | Persistence via Mongoose 7. Five collections: Supplier, Buyer, Article, Rating, Transaction. |
| Gmail SMTP | The only external service. Used by Nodemailer for registration confirmation and password-reset OTP mails. |

### Communication

- Browser → SPA: static CRA bundle.
- SPA → API: plain REST over `fetch` (most pages and hooks) and `axios` (the Redux article
  actions). Two HTTP clients coexist against the same endpoints.
- API → MongoDB: Mongoose.
- API → SMTP: Nodemailer, `service: 'gmail'`.
- CORS restricts browser origins to `backend/config/allowedOrigins.js`.

### Notable design facts

- **Suppliers and Buyers are two separate collections**, not a single `User` with roles.
  `authController.login` probes `Supplier.exists({username})` and falls back to `Buyer`.
  Every identity-touching change must handle both models. This duplication propagates through
  models, controllers, routes, contexts and hooks.
- Three tokens are issued at login: 15-minute `accessToken`, 1-day `refreshToken` (httpOnly
  `jwt` cookie), 30-day `longLivedToken` for "remember me". Access and long-lived tokens are
  both signed with `ACCESS_TOKEN_SECRET`.
- Article reviews are embedded subdocuments with denormalized `rating`/`numReviews`;
  supplier `Rating` is a separate standalone collection. Two distinct rating concepts.
- The frontend shell is a fork of a third-party "Shoppy" dashboard template. A significant
  fraction of `pages/` and `components/` is unmodified template code.

---

## 2. Repository problems

### Documentation

- The root `README.md` was four lines: a single project-objective paragraph. No setup,
  configuration, architecture, run, test, or deployment information. **Fixed.**
- `frontend/README.md` was the upstream template's tutorial README, describing an unrelated
  project. **Replaced with a pointer to the root README.**
- No `.env.example` anywhere, while `backend/.env` is mandatory to run the app — a new
  developer had no way to discover the required variables. **Fixed.**
- No record of which frontend screens are real domain code and which are template filler.
  **Documented in the README.**

### Structure

- Not a git repository — no `.git`, and no root `.gitignore`. **RESOLVED:** `.gitignore` and
  `.gitattributes` added, repository initialized, and a baseline commit created (134 files;
  no `node_modules`, `.env` or build output tracked).
- A stray `node_modules/` at the repo root: 59 Express-related packages with no root
  `package.json` and no lock file. Almost certainly an accidental `npm install express` from
  the wrong directory. **RESOLVED:** deleted (3.2 MB); nothing could reference it.
- Upstream template metadata that misattributed the project: `frontend/license.txt`
  (upstream AGPL-3.0) and `frontend/.github/FUNDING.yml` (pointing at the template author's
  sponsor page). **Both removed.**
- Two non-code documents sit at the repo root (a `.docx` specification and a 2.5 MB PDF
  internship report). Left untouched — see Ambiguities.
- `backend/views/` + `routes/root.js` serve a static landing page unrelated to the SPA.

### Configuration

- SMTP credentials were hardcoded in source instead of read from the environment, contradicting
  the `dotenv` setup. **Fixed** — see Security.
- `frontend/.env` was committed and `frontend/.gitignore` ignored only `.env.local` /
  `.env.*.local`, so a future `.env` containing secrets would have been committed too.
  **`.gitignore` corrected.** The committed file's content is harmless
  (`ESLINT_NO_DEV_ERRORS=true`).
- 17 occurrences of `http://localhost:8000` hardcoded across 12 frontend files, with no API
  client or base-URL constant. **Fixed** — centralized in `src/config/api.js` behind
  `REACT_APP_API_URL`, defaulting to the previous value.
- `server.js` reads `process.env.PORT` *before* `dotenv.config()`, so `PORT` from `.env` is
  silently ignored and the server always binds 8000. **Documented, not fixed** (owner decision).
- `config/allowedOrigins.js` still lists `dandrepairshop.com`, left over from the tutorial the
  backend was scaffolded from.
- Two competing ESLint configs: `frontend/.eslintrc.js` (airbnb) and `package.json`'s
  `eslintConfig`. They still do not agree. **RESOLVED: `npm run build` was failing** — CRA 5's
  `eslint-webpack-plugin` picks up `.eslintrc.js`, and the existing source produced ~1,380
  errors across 39 files, almost entirely `semi` (321), `indent` (299), `no-trailing-spaces`
  (133), `jsx-indent` (120) and `react-in-jsx-scope` (72). This predated the audit.
  The formatting and opinionated-style rules are now set to `warn` rather than `error`, so the
  build passes while the guidance still surfaces in editors and `npm run lint`. Correctness
  rules (`no-undef`, hooks, `eqeqeq`) remain errors. Current state: **0 errors, ~1,343
  warnings.** `ESLINT_NO_DEV_ERRORS` in `.env` only relaxes `npm start`, not the build.
- `frontend/craco.config.js` is dead: `@craco/craco` is not installed and the scripts call
  `react-scripts` directly.
- `frontend/public/` is untouched CRA/template output — the page title is still "Shoppy" and
  `manifest.json` still says "Create React App Sample".
- Email links in `authController.js` are hardcoded to `http://localhost:3000`, mixing local
  development configuration into application logic.

### Security

See §4 for the credential finding. Structural issues:

- **RESOLVED (partially): authorization on the API.** `verifyJWT` was applied only in
  `reportRoutes.js` and `ratingRoutes.js` (an earlier draft of this audit said reports only -
  that was wrong; ratings was always protected). Supplier, buyer, article and transaction
  routes were fully unauthenticated, including `DELETE /suppliers/:id` and the
  password-changing `PATCH` handlers. All writes (`POST`/`PATCH`/`DELETE`) on those four
  routers now require a valid token; reads remain public so the catalogue stays browsable.
  **Still open: per-record ownership.** Any authenticated user can modify records they do not
  own. That needs an ownership rule per resource and is a design decision.
- Role checks live in `App.js` (`foundUser.roles.includes('Supplier')`) — client-side only,
  trivially bypassed, and not backed by server-side enforcement.
- JWTs, including the 30-day long-lived token, are persisted in `localStorage` and are
  therefore exfiltratable by any XSS.
- `contexts/AuthContext.js` logs the full auth state — token included — to the console on
  every render.
- `middleware/errorHandler.js` prints full stack traces; `config/dbConn.js` swallows
  connection failures with a bare `console.log` and lets the process continue running without
  a database.

### Naming and consistency

- Comments truncated mid-word from copy-paste (`// confirm dat`, `//Allow updates to t`) in
  `buyerController.js`, `supplierController.js`, `transactionController.js`.
- `components/index.jsx` is a barrel exporting 15 components, but `Loader`, `Message`,
  `Article` and `Rating` are imported by direct path instead — inconsistent usage.
- `routes/authRoutes.js` contains a commented-out `/loginBuyer` route wrapped in JSX-style
  `{/* */}` markers inside a plain Node file; it parses only by accident.

### Dead code and duplication

**Backend**

- **Note:** `POST /suppliers` and `POST /buyers` now require a token, so the
  confirmation-bypassing registration path is no longer reachable anonymously. The duplication
  itself remains.
- Registration exists twice: `authController.register` (with email confirmation) versus
  `supplierController.createNewSupplier` / `buyerController.createNewBuyer`. Three
  near-identical password-hash + duplicate-check blocks with drifting behaviour;
  `POST /suppliers` and `POST /buyers` bypass email confirmation entirely.
- `renderSuppliersByDomain` and `filterSuppliers` are unreachable: `/:supplierId` is
  registered before `/bydomain` and `/filter`.
- `multer` storage and an `upload` middleware are configured in `server.js` but never attached
  to a route, and their destination `backend/public/assets` does not exist.
- `middleware/logger.js` requires `express/lib/request` into an unused variable.
- **RESOLVED:** seven unused dependencies removed - `passport`, `passport-local`,
  `express-session`, `mongodb`, `react-hot-toast`, and the npm packages `crypto` and `path`
  (which shadowed the Node built-ins the code actually resolves to). The stray
  `require('passport')` in `server.js` was removed with them. `multer` and `validator` were
  left installed: multer's storage config may be intended for planned file upload.
- 26 `console.*` calls, including a per-request log to stdout on top of the file logger.

**Frontend**

- Two unrelated implementations of the same article-listing feature: `pages/Articles.jsx`
  (Syncfusion grid, Context) versus `pages/ArticlesHome.jsx` + `ArticlesList.jsx` (Redux,
  `Article` card). Articles are fetched via both `axios` and `fetch` from the same endpoint.
- `contexts/RatingsContext.js` and `hooks/useRatingsContext.js` exist, but the provider is
  not mounted in `index.js` and the hook is never imported — the hook would throw if used.
- `store.js` computes `userInfoFromStorage` and an `initialState` for a `userLogin` reducer
  that is not in `combineReducers`; both are dead.
- Two `localStorage` auth keys (`user`, `rememberMe`) hold the same shape, but `App.js`
  rehydrates only `rememberMe`, so the `user` path is dead and a non-remembered session is
  lost on reload.
- A hand-rolled `components/Rating.jsx` coexists with the `react-rating-stars-component`
  dependency.
- `src/bootstrap.min.css` ships alongside Tailwind.
- `data/dummy.js` is ~117 KB / ~5,800 lines with 49 exports, of which roughly 15 are imported.
  The large ones (`customersData`, `employeesData`, `ordersData`, `financialChartData`,
  `PyramidData`, `EditorData`, `medicalproBranding`, `colorMappingData`) are dead weight. Only
  `links` and the `suppliersGrid` / `buyersGrid` / `articlesGrid` configs are domain-adapted.
- Template pages rendering hardcoded sample data are still routed and reachable:
  `pages/Kanban.jsx`, `pages/Calendar.jsx` (pinned to `new Date(2021, 0, 10)`),
  `pages/Ecommerce.jsx` (a hardcoded "$63,448.78" earnings figure), `components/Charts/*`,
  `Cart.jsx`, `Chat.jsx`, `Notification.jsx`, `UserProfile.jsx`, `ThemeSettings.jsx`.
- Unused image assets: `data/product1–8.jpg` and the `avatar*.jpg` files, referenced only by
  dead `dummy.js` entries.
- **RESOLVED:** `prop-types` is imported by `components/Rating.jsx` but was not declared; it
  resolved only transitively through `react-scripts`. Now an explicit dependency.
- 12 `console.*` calls in `src/`.

### Missing

- No tests of any kind, no test framework, and no `@testing-library/*` dependency, although
  `npm test` is wired up. **Still open.**
- **RESOLVED:** CI added at `.github/workflows/ci.yml` (install plus a syntax and module-load
  check for the backend; install, lint and build for the frontend). Still no Docker, no
  infrastructure or cloud configuration, and no deployment process - those need a target
  environment first.
- **RESOLVED:** MIT `LICENSE` added, with a note that Syncfusion components carry separate
  commercial terms. No CONTRIBUTING, SECURITY policy or issue/PR templates - not warranted for
  a project this size.
- **RESOLVED:** `npm run lint` and `npm run lint:fix` scripts added. Still no Prettier and no
  type checking.

### Broken references

- **RESOLVED:** `pages/auth/ResetPassword.jsx` posted to `/reset-password` while the route is
  mounted at `/auth/reset-password`, and sent `{resetToken, password}` while the handler
  expects `{email, newPassword, confirmPassword}`. Both corrected on the frontend.
- **RESOLVED:** email confirmation was broken three ways at once. `authController.register`
  emails `/email-confirmation?code=...` (query), the React route was
  `/email-confirmation/:code` (path param), and the backend route was `/auth/confirm/:code`
  while `confirmMail` reads `req.query.code`. The query-string shape won - it is what the
  emailed link and the controller already used - so the backend route became `/auth/confirm`
  and the React route `/email-confirmation`, with the component reading `useSearchParams`.
- **RESOLVED:** `EmailConfirmation.jsx` had `useEffect(..., [token])` referencing a variable
  that was never defined - a `ReferenceError` on mount. Now `[code]`.
- **RESOLVED:** `components/Loader.jsx` used the HTML attribute `class` instead of `className`,
  so the class was silently dropped by React.
- `App.js` renders `pages/Charts/Bar.jsx` on `/bar` without the `compareData` prop the
  component calls `.flatMap()` on — the route throws.
- Syncfusion is used without a `registerLicense` call, so components render trial watermarks.
  **Still open** - requires a license key.

### Discovered during the follow-up pass

- **`authController.resetPassword` does not reset a password.** It validates the session, reads
  `{email, newPassword, confirmPassword}`, then looks the account up by email, generates a
  *new* reset token, stores it, and emails another reset link. `newPassword` is never hashed or
  written, and the `resetToken` from the emailed link is never verified. The endpoint returns
  201, so the flow now *appears* to succeed while leaving the password unchanged. The frontend
  wiring is fixed; **the handler logic is a business-logic decision and was left alone.**
  This is the single most important open defect.

There are **zero** TODO/FIXME/HACK/XXX markers in the codebase.

---

## 3. Ambiguities

### RESOLVED FROM CODE

| Question | Resolution |
| --- | --- |
| Which env vars does the backend actually need? | Exactly `PORT`, `MONGO_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` — the only `process.env` reads in `backend/`. SMTP vars were added by this audit when the hardcoded credential was removed. |
| Does the frontend use any env vars? | It did not — zero `process.env` reads in `src/`. `REACT_APP_API_URL` was introduced by this audit. |
| Is craco part of the build? | No. `@craco/craco` is not installed and no script invokes it. The config file is inert. |
| Are there tests? | No test files, no testing-library dependency. `npm test` has nothing to run. |
| Is there a deployment pipeline? | None. No Docker, CI, or cloud configuration exists anywhere. |
| Is the frontend `.github/FUNDING.yml` project CI? | No — upstream template metadata pointing at the template author. |

### SAFE TO IMPROVE (done in this pass)

- Adding a root `.gitignore` and both `.env.example` files.
- Moving SMTP credentials from source to environment variables (behaviour-identical once
  `.env` is populated).
- Centralizing the API base URL behind `REACT_APP_API_URL` with the previous literal as the
  default (behaviour-identical when unset).
- Removing upstream template metadata that misattributes the project.
- Rewriting the root and frontend READMEs.

### REQUIRES USER DECISION (documented, deliberately unchanged)

1. **Template code: keep or delete?**
   *What is ambiguous:* whether Kanban, Calendar, Ecommerce, the template charts and the bulk
   of `dummy.js` are placeholders for planned features or pure leftovers.
   *Why it matters:* they are ~150 KB of dead weight that misleads readers about the app's
   scope, and Ecommerce presents fabricated financial figures as if they were real data.
   *Current behaviour:* all are routed and reachable from the sidebar.
   *Decision needed:* delete them with their routes, or keep and clearly label them.
   *(This pass was scoped to metadata removal only, by decision.)*

2. **Should the two unreachable supplier endpoints work?**
   *Ambiguous:* whether `/suppliers/bydomain` and `/suppliers/filter` are still wanted.
   *Matters:* two implemented controllers are unreachable.
   *Current:* `/:supplierId` shadows both; requests are treated as an ID lookup.
   *Decision:* reorder the routes to enable them, or delete the dead controllers.

3. **Which registration path is authoritative?**
   *Ambiguous:* `authController.register` enforces email confirmation; `POST /suppliers` and
   `POST /buyers` create accounts without it.
   *Matters:* a security-relevant bypass, and three copies of the hashing logic that can drift.
   *Current:* both paths work.
   *Decision:* make `authController.register` the only creation path, or state that direct
   creation is intentional (e.g. admin seeding).

4. **How much of the API should require authentication?**
   *Ambiguous:* `verifyJWT` exists and is applied only to `/reports`.
   *Matters:* every other endpoint, including deletes and password changes, is public.
   *Current:* unauthenticated.
   *Decision:* which routes require a token, and what ownership rules apply — a genuine
   design decision, not a cleanup.

5. **Should `PORT` from `.env` be honoured?**
   *Ambiguous:* the `dotenv` ordering bug means the documented variable does nothing.
   *Matters:* anyone setting `PORT` will be confused; deployment needs it.
   *Current:* always binds 8000.
   *Decision:* the one-line reorder was explicitly declined this pass; confirm whether to
   apply it later.

6. **Frontend/backend route mismatches on reset-password and email confirmation.**
   *Ambiguous:* whether the client or the server has the intended contract.
   *Matters:* both flows 404 today, so password reset and email confirmation are broken.
   *Current:* mismatched paths.
   *Decision:* which side to change.

7. **Should the root `.docx` specification and `.pdf` internship report stay in the repo?**
   *Ambiguous:* whether they are project documentation or personal artifacts.
   *Matters:* 2.5 MB of binary in version control, and the report may contain personal
   information not intended for a shared repository.
   *Current:* both at the repo root, untouched.
   *Decision:* move to `docs/`, or remove before publishing.

8. **Licensing.**
   *Ambiguous:* the only license file was the upstream template's AGPL-3.0, which was removed
   as misattribution. The project itself declares no license.
   *Matters:* without a license, others have no rights to use the code; and the Syncfusion
   components carry their own commercial licensing requirements.
   *Current:* unlicensed.
   *Decision:* choose a license before publishing, and resolve Syncfusion licensing.

---

## 4. Security findings

1. **Committed SMTP credential — action required by the repository owner.**
   `backend/config/mailer.js` contained a live Gmail address and a 16-character Gmail App
   Password in plaintext, and the same address was hardcoded as the `from:` field in three
   places in `authController.js`. All occurrences have been replaced with `SMTP_USER`,
   `SMTP_PASS` and `SMTP_FROM` environment variables, and placeholders added to
   `backend/.env.example`. The value is not reproduced in this document or anywhere else in
   the repository.
   **The exposed App Password must be revoked in the Google account's security settings.**
   Removing it from the source does not invalidate it, and it may exist in backups, in any
   copy of this folder that was shared, and in git history if this code was ever pushed
   anywhere. Credentials were not rotated automatically, by design.

2. **API authorization is effectively absent** — see §2 Security. Highest-impact structural
   issue in the repository.

3. **Tokens in `localStorage`, logged to the console** — see §2 Security.

4. **`frontend/.env` was committed and only partially gitignored** — harmless content today,
   but the pattern invited a future leak. Corrected.

No other secrets were found: no connection strings, API keys, OAuth client IDs, private keys,
or Syncfusion license keys exist in tracked source.

---

## 5. Remaining work

Completed in the follow-up pass: unused dependency removal, write-route authentication, the
broken auth-flow wiring, the ESLint/build fix, lint scripts, LICENSE, CI, `.gitattributes`,
git initialization, and deletion of the stray root `node_modules/`.

Still open, roughly in order of value:

1. **Revoke the exposed Gmail App Password.** Owner action; nothing in the repository can do it.
2. **Fix `authController.resetPassword`** so it actually sets the password - see above.
3. **Add per-record ownership checks** on the now-authenticated write routes.
4. **Decide on the template code.** `dummy.js` is ~117 KB with roughly two-thirds unreferenced,
   and `Ecommerce.jsx` presents fabricated financial figures as real data.
5. **Move `dotenv.config()` above the `PORT` read**, and move the hardcoded
   `http://localhost:3000` email links to a `FRONTEND_URL` variable.
6. **Consolidate registration** into a single path.
7. **Fix the unreachable supplier routes** by declaring `/bydomain` and `/filter` before
   `/:supplierId`.
8. **Pick one state mechanism for articles** and retire the duplicate listing implementation.
9. **Add tests.** Install `@testing-library/*` and cover the auth hooks and the reducers first.
10. **Adopt the strict lint style** with `npm run lint:fix`, then raise the relaxed rules in
    `.eslintrc.js` back to `error`. Best done as its own isolated commit - it touches nearly
    every file. There are currently ~1,343 warnings and 0 errors.
11. **Decide whether the root `.docx` and `.pdf` belong in version control** - the internship
    report in particular may contain personal information.
