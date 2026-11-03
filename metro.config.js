const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('node:path');
const fs = require('node:fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/**
 * Bare React Native's Metro config has no built-in monorepo auto-detection
 * (unlike Expo SDK 52+'s `expo/metro-config`, which this app used before
 * migrating off Expo) — watch sibling packages and let Metro find their
 * hoisted deps at the workspace root.
 */
const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [path.resolve(projectRoot, 'node_modules'), path.resolve(workspaceRoot, 'node_modules')]
  }
};

const merged = mergeConfig(getDefaultConfig(projectRoot), config);

/**
 * The shared `@shopsphere/*` packages are authored with explicit `.js`
 * extensions on relative imports pointing at `.ts` source files (e.g.
 * `export * from './common.js'` where only `common.ts` exists) — the
 * standard Node16/NodeNext ESM convention the backend's `tsc`/`tsx`/`ts-jest`
 * already resolve correctly. Metro has no equivalent built-in remapping, so
 * without this override it fails with "Unable to resolve './common.js'" for
 * every such import. This only intercepts that one specific case — a `.js`
 * specifier with no matching real `.js` file — and falls back to Metro's own
 * resolver for everything else.
 */
const defaultResolveRequest = (context, moduleName, platform) => context.resolveRequest(context, moduleName, platform);
const originalResolveRequest = merged.resolver.resolveRequest ?? defaultResolveRequest;

const srcRoot = path.resolve(projectRoot, 'src');

merged.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/')) {
    // Mirrors tsconfig.json's `paths: { "@/*": ["src/*"] } — Expo's metro config
    // read tsconfig path aliases automatically; `@react-native/metro-config` has
    // no equivalent, so this app's `@/*` imports need resolving by hand here.
    return originalResolveRequest(context, path.join(srcRoot, moduleName.slice(2)), platform);
  }
  if (moduleName.startsWith('.') && moduleName.endsWith('.js') && context.originModulePath) {
    const basePath = path.resolve(path.dirname(context.originModulePath), moduleName.slice(0, -3));
    for (const ext of ['.ts', '.tsx']) {
      if (fs.existsSync(`${basePath}${ext}`) && !fs.existsSync(`${basePath}.js`)) {
        return originalResolveRequest(context, `${basePath}${ext}`, platform);
      }
    }
  }
  return originalResolveRequest(context, moduleName, platform);
};

module.exports = merged;
