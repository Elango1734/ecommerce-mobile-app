# Mobile

React Native (Expo SDK 53, Expo Router, TypeScript) customer-facing app: discovery, cart, checkout, orders, reviews, support, and Sphere AI — talking to the real `apps/api` backend through `@shopsphere/api-client`, never directly to MongoDB.

## Prerequisites

- Node.js 20 or 22 (this environment used 20.20.0 — Expo SDK 53 supports it despite the `engines` field elsewhere pinning 22; see root `package.json`'s `overrides`), Xcode + an iOS Simulator (or Android Studio + emulator).
- The backend running locally — see `apps/api/README.md`. Point the app at it via `app.json`'s `expo.extra.apiBaseUrl` (defaults to `http://localhost:4000/api/v1`, which works from the iOS Simulator; a physical device needs your machine's LAN IP instead).

## Run

```bash
npm install                 # from the repo root
cd apps/api && npm run dev  # backend must be running first
cd apps/mobile && npx expo start --ios   # or --android / --web
```

First run installs Expo Go on the simulator automatically. Shake the device (or `Cmd+D` in the simulator) for the dev menu; fast refresh applies most edits without a reload.

## Commands

| Command | Purpose |
| --- | --- |
| `npx expo start` | Dev server; `--ios`/`--android`/`--web` picks a target. |
| `npm run typecheck` | TypeScript strict typecheck. |
| `npm test` | Jest + React Native Testing Library. |
| `npx expo-doctor` | Diagnoses dependency/config issues. |

## Architecture

```text
src/
  app/                 Expo Router file-based routes (every file here is a screen)
    _layout.tsx          Root providers (QueryClient, Theme, GestureHandler, SafeArea) + hydration gate
    (tabs)/              Home, Search, Cart, Orders, Account — always reachable, even signed out
    auth/, product/, order/, addresses/, support/, returns/   Pushed/modal screens
    checkout.tsx, ai-chat.tsx, wishlist.tsx, recently-viewed.tsx, settings.tsx
  api/
    client.ts             The ONE shared @shopsphere/api-client instance — wires access/guest tokens from
                           the stores, never holds a credential itself
    queryClient.ts         TanStack Query client + the query-key registry every hook shares
  stores/
    authStore.ts           Access token in memory only; refresh token in Keychain/Keystore via
                           expo-secure-store (security.md) — never AsyncStorage
    guestStore.ts          Guest identifier sent as the X-Guest-Token header (native apps don't keep
                           cookies across restarts the way a browser does — see apps/api's guestToken
                           middleware, extended this stage to support this)
  hooks/                  One file per domain, each a thin TanStack Query wrapper over the api client
  components/             Themed primitives (Button, Card, StatusBadge, ControlledTextInput, ...) +
                           ProductCard/ProductImage
  theme/ThemeProvider.tsx  Wraps @shopsphere/config's tokens; light/dark/system, persisted locally
  utils/                  money.ts (Money -> display string), variants.ts (variant-selection resolution)
metro.config.js          Custom resolver: the @shopsphere/* packages use Node-ESM-style `.js`-extension
                          imports pointing at `.ts` source; Metro has no built-in remapping for that.
```

## What's implemented

The full golden path — browse → search/filter → product detail → variant selection → add to cart → guest
cart persists across sign-in (merged server-side) → register/login → address → checkout with a coupon →
sandbox payment → order confirmation → order history → order detail with tracking/status/cancel/return —
plus wishlist, recently-viewed, verified-purchase reviews, product Q&A, Sphere AI chat (grounded in real
catalog data, with history deletion), AI-assisted order support from the order detail screen, AI product
comparison and AI review summaries on the product detail screen, AI related-product suggestions, support
tickets, in-app notifications, and light/dark/system theming.

Verified end-to-end on a real iOS Simulator against the real local backend (not mocked) — see the
project's final summary for the specifics, including a real bug this caught and fixed (variant-selection
resolving to an arbitrary variant before the customer picked anything — now a regression test in
`tests/unit/variants.test.ts`).

## Test results

```text
Test Suites: 5 passed, 5 total
Tests:       19 passed, 19 total
```

Unit: `formatMoney`, variant-resolution (including the regression above), `authStore` (session
persistence, hydration, reuse-detection fallout). Component (RNTL): `Button` (duplicate-tap/disabled
protection), `QuantityStepper` (bounds).

## Known limitations

- **No on-device simulator *tap* automation was available in this environment** (no assistive-access
  permission for `osascript`'s UI-element introspection, no `idb`, no `cliclick`) — golden-path
  verification combined real rendering/screenshot checks (`xcrun simctl io ... screenshot`, with
  `simctl terminate`/`openurl` to force clean relaunches) with the already-exhaustive backend HTTP test
  suite (104 tests) that exercises the same business logic. Manual tap-through on a real device/simulator
  is still recommended before shipping.
- **Real product images** are now seeded (`apps/api/src/db/seed/run.ts`) as specific, hand-picked, verified
  photos from Wikimedia Commons/Pexels matching each demo product — not a real upload (the backend still
  has no upload/object-storage endpoint; see `apps/api`'s known limitations), just resolvable `https://`
  URLs so `ProductImage` renders a real photo instead of its placeholder-initial fallback.
- **Fixed a real runtime crash**: `query-string@9.5.1` (pure ESM, no CommonJS entry point) was declared as
  this app's own dependency, and since nothing else in the dependency tree declares `query-string` at all,
  that was the only copy available for `expo-router`'s forked `getPathFromState.js` (`require("query-string")`,
  no corresponding dependency in `expo-router`'s own `package.json` — a phantom-dependency gap on their
  side) to resolve to. The version mismatch surfaced as `queryString.stringify is not a function` inside
  the bottom tab bar's navigation-state-to-path logic, crashing the whole tab layout. Pinned to
  `query-string@7.1.3` (the last CJS-compatible major version — verified via a standalone `require()` test
  before and after) resolves it; confirmed via a real rebuild + simulator screenshot showing the tab bar
  and catalog rendering correctly.
- **No offline write queue.** TanStack Query's cache gives read-through staleness tolerance, but there is
  no queued-mutation sync for actions taken while offline (cart adds, etc.) — see product-requirements.md's
  offline-behavior section for the fuller spec this would need.
- **No SQLite-backed persistent cache** — architecture.md allows it "where useful"; this stage relies on
  TanStack Query's in-memory cache plus AsyncStorage/SecureStore for the specific small values (theme
  preference, guest token, refresh token) that need to survive a restart.
- **Accessibility**: semantic labels and roles are present on custom controls, but a full screen-reader/
  dynamic-type/reduced-motion pass has not been done.
- **Android and physical-device testing were not performed** in this environment (no Android emulator
  booted, no physical device attached) — only the iOS Simulator was exercised.
- **`metro.config.js` no longer manually sets `watchFolders`/`nodeModulesPaths`** — Expo SDK 52+ auto-configures
  Metro for npm/yarn/pnpm monorepos, and the manual override was *replacing* that auto-detection rather than
  extending it (exactly what `npx expo-doctor` flags). Verified via a real `npx expo export --platform ios`
  (1174 modules, including every `@shopsphere/*` workspace package) after removing it. The one override still
  kept is unrelated: a custom `resolveRequest` for the `.js`-extension-pointing-at-`.ts`-source convention every
  `@shopsphere/*` package uses, which Metro has no built-in equivalent for.
- Built/tested on Node 20.20.0; `apps/api`'s own `engines` field pins 22 LTS (see its README's equivalent
  note).
