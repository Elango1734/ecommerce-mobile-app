This is a bare React Native CLI mobile application (migrated off Expo). Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Commands

```bash
npm start              # start the Metro dev server
npm run ios            # build and run on iOS Simulator
npm run android        # build and run on Android emulator
npm run pod-install    # cd ios && bundle exec pod install (after adding a package with native iOS code)
npm run typecheck      # tsc --noEmit
npm run lint           # eslint .
npm test               # jest
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Uses **React Navigation** (`@react-navigation/native` + `native-stack` + `bottom-tabs`), not Expo Router — there is no `src/app/` file-based routing.
- `src/navigation/types.ts` defines `RootStackParamList` and `TabParamList`, merged into one `AppParamList` and registered via the `ReactNavigation.RootParamList` global augmentation — this is what makes `useNavigation()`/`useRoute()` fully typed everywhere with no per-screen generics needed.
- `src/navigation/RootNavigator.tsx` is the root `NativeStack` (mirrors the old Expo Router root `_layout.tsx`: same screens, same modal presentations, same header options). `src/navigation/TabNavigator.tsx` is the bottom tab navigator nested under it as the `Tabs` screen.
- Screens live in `src/screens/` (e.g. `HomeScreen.tsx`, `ProductDetailScreen.tsx`), not `src/app/`. Each screen that needs route params reads them via `useRoute<RouteProp<AppParamList, 'ScreenName'>>()`; navigation calls use `useNavigation().navigate('ScreenName', params)` — this works for both sibling tab screens and root-stack screens, since React Navigation automatically delegates a `navigate()` call to the nearest ancestor navigator that owns a matching screen name.
- Entry point: `index.js` → `src/App.tsx` (sets up `GestureHandlerRootView` → `SafeAreaProvider` → `QueryClientProvider` → `ThemeProvider` → `NavigationContainer` → `RootNavigator`, gated on auth/guest-store hydration).

## Native modules (bare RN, no Expo Go)

- Keychain/Keystore storage: `react-native-keychain` (not `expo-secure-store`).
- UUIDs: `uuid` + `react-native-get-random-values` (imported once at the very top of `src/App.tsx` for the crypto polyfill) — not `expo-crypto`.
- Images: React Native's built-in `Image` (`resizeMode` prop, not `contentFit`) — not `expo-image`.
- Config constants: `src/config/appConfig.ts` — not `expo-constants`.

## iOS build notes

- This project's absolute path contains spaces, which breaks several of React Native's own bundled build scripts (unquoted `$VAR1 $VAR2` interpolations that word-split). `ios/Podfile`'s `post_install` hook patches the generated Xcode script-phases (both the Pods project and the app's own project) and a vendored `node_modules/react-native/scripts/xcode/with-environment.sh` fix on every `pod install` — if a *new* RN-bundled script phase ever breaks the same way after an RN upgrade, add another targeted patch there rather than renaming the project directory.
- The vendored `fmt` CocoaPod (11.0.2, pulled in transitively by RN 0.79) uses a `consteval` format-string check that this machine's Xcode/Clang rejects at compile time. The same `post_install` hook patches `Pods/fmt/include/fmt/base.h` to force `FMT_USE_CONSTEVAL` off after every `pod install`.
- First-time setup needs `bundle install` then `bundle exec pod install --project-directory=ios` (from `apps/mobile`) before `npm run ios`/Xcode will build.
- `react-native-svg` is pinned to an exact `15.11.2` (no caret) on purpose. 15.16 — what `@15`/`^15.11.2` resolves to — fails RN 0.79's codegen during `pod install` with `[Codegen] Error: Unknown prop type for "minX": "undefined"`, so `pod install` exits 1 and no pods are written. Keep the exact pin until RN itself is upgraded.
