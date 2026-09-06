# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Client/Supplier Relationship Management: a MERN app where **Suppliers** publish articles (offers) and **Buyers** browse, rate, and transact with them. Two separate top-level apps, no root package.json — run each from its own directory.

## Commands

Backend (`backend/`, Express + MongoDB, port 8000):
```
npm install
npm run dev     # nodemon
npm start       # node server
```

Frontend (`frontend/`, CRA + Tailwind + Syncfusion, port 3000):
```
npm install
npm start
npm run build
npm test                      # react-scripts test (Jest); no tests exist yet
npm test -- MyComponent       # single test file by pattern
```

Note: `frontend/craco.config.js` exists but scripts call `react-scripts` directly — Tailwind runs through CRA's own PostCSS, so editing the craco config has no effect.

## Environment

`backend/.env` is not committed and is required. Needed vars, derived from usage:
`PORT`, `MONGO_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, plus SMTP credentials read by `config/mailer.js`.

## Backend architecture

`server.js` wires middleware (logger → cors → helmet → morgan → body-parser → cookie-parser) then mounts routers: `/auth`, `/suppliers`, `/buyers`, `/articles`, `/ratings`, `/reports`, `/transactions`. Layering is routes → controllers → Mongoose models; controllers wrap handlers in `express-async-handler` and `middleware/errorHandler.js` is the terminal handler.

Auth (`controllers/authController.js`) is the piece that spans the most files:
- **Suppliers and Buyers are two distinct collections, not one User model with roles.** `login` probes `Supplier.exists({username})` first, falls back to `Buyer`. Anything touching identity must handle both models.
- On login it issues three tokens: a 15m `accessToken`, a 1d `refreshToken` set as the httpOnly `jwt` cookie, and a 30d `longLivedToken` used for "remember me". Access and long-lived tokens both sign `UserInfo { username, roles, supplierId | buyerId }` with `ACCESS_TOKEN_SECRET`.
- `middleware/verifyJWT.js` decodes that payload and sets `req.supplierId` **or** `req.buyerId` plus `req.roles`. Only `reportRoutes` currently applies it (`router.use(verifyJWT)`) — supplier/buyer/article/rating/transaction routes are unprotected.
- Registration emails an 8-char confirmation code linking to `http://localhost:3000/email-confirmation?code=...`; password reset uses `otp-generator` via `/auth/generate-otp`, `/verify-otp`, `/check-reset-session`, `/reset-password`. These localhost URLs and the sender address are hardcoded.

Route-ordering caveat in `routes/supplierRoutes.js`: `/:supplierId` is declared before `/bydomain` and `/filter`, so those literal paths are shadowed by the param route.

Models: `Supplier`, `Buyer`, `Article` (belongs to a supplier, embeds a `reviews` subdocument array plus denormalized `rating`/`numReviews`), `Rating` (standalone supplier↔buyer rating — separate from article reviews), `Transaction` (buyer/supplier refs with `amountSpent`, `deadlineMet`, `qualityOfService`, the sole input to `/reports/generate-report`).

CORS is restricted by `config/allowedOrigins.js`; only `http://localhost:3000` is relevant locally (other entries are leftovers from the template this was built on).

## Frontend architecture

CRA app whose shell (Sidebar/Navbar/ThemeSettings, `src/data/dummy.js`, Syncfusion charts and Kanban) comes from a dashboard template — much of `pages/` (Calendar, Kanban, Ecommerce, Charts) is unmodified template code, while the real domain work lives in `Suppliers`, `Buyers`, `Articles*`, `AddArticle`, `UpdateSupplier`, and `pages/auth/`.

State is split across **three** mechanisms; match whichever the file you edit already uses:
1. **Context + useReducer per domain** — `contexts/{Auth,Suppliers,Buyers,Articles,Ratings}Context.js`, each consumed through a matching `hooks/use*Context.js`. This is the primary pattern for domain data.
2. **Redux** (`store.js`, `actions/articleActions.js`, `reducers/articleReducers.js`) — used only by the article list/details/review-create flow.
3. **`ContextProvider.js`** — UI-only state (theme color/mode, sidebar, popups), read via `useStateContext`.

Auth flow: `hooks/useLogin.js` POSTs to the backend, stores `{token, foundUser}` in `localStorage` under key `user` (session) or `rememberMe` (30-day token), and dispatches `LOGIN`. `App.js` rehydrates from `rememberMe` on mount only — the `user` key is not rehydrated, so a non-remembered session does not survive reload. `App.js` gates rendering of the sidebar and routes on `user`.

API calls are raw `fetch` with `http://localhost:8000` hardcoded in each component/hook — there is no API client or base-URL constant. Changing the backend host means a grep across `src/`.
