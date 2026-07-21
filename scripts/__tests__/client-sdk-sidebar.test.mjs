import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { clientSdkPlatformIds, getClientSdkPlatform } from '../lib/client-sdk-platforms.mjs';
import {
  buildClientSdkSidebar,
  decideClientSdkSidebarApplication,
  getClientSdkSidebarPaths,
} from '../lib/client-sdk-sidebar.mjs';

const wasmSidebar = readJson('data/structure/wasm-sidebar.json');

test('registers the supported client SDK platforms and their structure paths', () => {
  assert.deepEqual(clientSdkPlatformIds, ['ios', 'flutter', 'wasm']);
  assert.deepEqual(getClientSdkPlatform('ios'), {
    id: 'ios',
    contextKey: 'chat/sdk/ios',
    routePrefix: '/sdk/ios',
    manualRoot: 'content/zh/docs/chat/sdk/ios',
    auditPath: 'data/structure/ios-content-audit.json',
    labelsPath: 'data/structure/ios-navigation-labels.json',
    sidebarPath: 'data/structure/ios-sidebar.json',
    localizedOutputPath: 'src/generated/ios-sdk-zh-content.json',
    sdkSourceKey: 'iosSdk',
    sdkTag: '3.8.3-hotfix.12',
    sdkCommit: '17fb969fd3a360f00fe65f476435b81857e274f8',
  });
  assert.equal(getClientSdkPlatform('flutter').contextKey, 'chat/sdk/flutter');
  assert.equal(getClientSdkPlatform('wasm').contextKey, 'chat/sdk/wasm');
  assert.throws(() => getClientSdkPlatform('android'), /Unknown client SDK platform: android/);
});

test('native sidebars preserve supported WASM route suffixes in order', () => {
  const wasmPaths = getClientSdkSidebarPaths(wasmSidebar);

  for (const platform of ['ios', 'flutter']) {
    const sidebar = readJson(`data/structure/${platform}-sidebar.json`);
    const paths = getClientSdkSidebarPaths(sidebar);
    assert.equal(paths.length, 52, platform);
    assert.equal(new Set(paths).size, paths.length, platform);
    const wasmSuffixes = new Set(wasmPaths.map((path) => path.replace('/sdk/wasm/', '')));
    assert.ok(
      paths.every((path) => wasmSuffixes.has(path.replace(`/sdk/${platform}/`, ''))),
      platform,
    );
  }
});

test('builds the existing navigation node shape and derives page ids from relativePath', () => {
  const config = readJson('data/structure/ios-sidebar.json');
  const paths = getClientSdkSidebarPaths(config);
  const result = buildClientSdkSidebar({
    platform: 'ios',
    config,
    routes: createRoutes('ios', paths),
  });

  assert.equal(result.pageCount, paths.length);
  assert.equal(result.sidebarExpansion, 'active-path');
  assert.deepEqual(result.nodes[0], {
    id: 'overview',
    segment: 'overview',
    title: 'Title 1',
    href: '/sdk/ios/overview',
    type: 'page',
    children: [],
    minIndex: 1,
    navigationTitle: 'Overview',
  });
});

test('skips an incomplete native route tree without partially applying its sidebar', () => {
  const config = readJson('data/structure/ios-sidebar.json');
  const paths = getClientSdkSidebarPaths(config);

  assert.deepEqual(
    decideClientSdkSidebarApplication({
      platform: 'ios',
      config,
      routes: createRoutes('ios', paths.slice(0, -1)),
    }),
    { mode: 'skip', reason: 'native-route-tree-not-migrated' },
  );
});

test('applies a native sidebar after its complete reviewed route tree is present', () => {
  const config = readJson('data/structure/flutter-sidebar.json');
  const paths = getClientSdkSidebarPaths(config);

  assert.deepEqual(
    decideClientSdkSidebarApplication({
      platform: 'flutter',
      config,
      routes: createRoutes('flutter', paths),
    }),
    { mode: 'apply', reason: 'complete-native-structure' },
  );
});

test('keeps WASM sidebar validation strict when its route tree is incomplete', () => {
  const config = readJson('data/structure/wasm-sidebar.json');
  const paths = getClientSdkSidebarPaths(config);
  const routes = createRoutes('wasm', paths.slice(0, -1));

  assert.deepEqual(decideClientSdkSidebarApplication({ platform: 'wasm', config, routes }), {
    mode: 'apply',
    reason: 'strict',
  });
  assert.throws(
    () => buildClientSdkSidebar({ platform: 'wasm', config, routes }),
    /\[wasm\].*unknown route/i,
  );
});

test('rejects duplicate sidebar paths with the platform in the error', () => {
  const config = { nodes: ['/sdk/ios/overview', '/sdk/ios/overview'] };
  assert.throws(
    () =>
      buildClientSdkSidebar({
        platform: 'ios',
        config,
        routes: createRoutes('ios', ['/sdk/ios/overview']),
      }),
    /\[ios\].*duplicate/i,
  );
});

test('rejects unknown sidebar paths with the platform in the error', () => {
  const config = { nodes: ['/sdk/flutter/overview', '/sdk/flutter/unknown'] };
  assert.throws(
    () =>
      buildClientSdkSidebar({
        platform: 'flutter',
        config,
        routes: createRoutes('flutter', ['/sdk/flutter/overview']),
      }),
    /\[flutter\].*unknown route.*\/sdk\/flutter\/unknown/i,
  );
});

test('rejects omitted active routes with the platform in the error', () => {
  const config = { nodes: ['/sdk/wasm/overview'] };
  const routes = createRoutes('wasm', ['/sdk/wasm/overview', '/sdk/wasm/logger']);
  assert.throws(
    () => buildClientSdkSidebar({ platform: 'wasm', config, routes }),
    /\[wasm\].*omits active routes.*\/sdk\/wasm\/logger/i,
  );
});

function createRoutes(platform, paths) {
  return paths.map((path, index) => ({
    path,
    relativePath: path.slice(1),
    contextKey: `chat/sdk/${platform}`,
    title: `Title ${index + 1}`,
    navOrder: index + 1,
  }));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
