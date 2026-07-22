import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  buildClientSdkSkeleton,
  isGeneratedClientSdkSkeleton,
  replaceClientSdkRouteRecords,
  resolveClientSdkSkeletonRoutes,
} from '../sync-client-sdk-route-skeletons.mjs';

test('renders a deferred platform route without copying WASM prose', () => {
  const source = buildClientSdkSkeleton({
    path: '/sdk/ios/user/overview-user',
    platformId: 'ios',
    title: 'User overview',
  });
  assert.match(source, /context: 'chat\/sdk\/ios'/);
  assert.match(source, /template: 'guide'/);
  assert.match(source, /generatedBy: 'sync-client-sdk-route-skeletons'/);
  assert.match(source, /English version.*deferred/);
  assert.doesNotMatch(source, /OpenIM\.on|operationID/);
});

test('recognizes only generator-owned deferred English skeletons', () => {
  const generated = buildClientSdkSkeleton({
    path: '/sdk/flutter/overview',
    platformId: 'flutter',
    title: 'OpenIM SDK for Flutter',
  });
  assert.equal(isGeneratedClientSdkSkeleton(generated), true);
  assert.equal(
    isGeneratedClientSdkSkeleton(
      "---\nstatus: 'published'\ncontext: 'chat/sdk/flutter'\n---\n\n## Overview\n\nReviewed English content.\n",
    ),
    false,
  );
});

test('replaces legacy platform route records with the reviewed active tree', () => {
  const original = readJson('src/generated/routes.json');
  const sidebar = readJson('data/structure/ios-sidebar.json');
  const next = replaceClientSdkRouteRecords({ platformId: 'ios', sidebar, routes: original });
  const ios = next.filter((route) => route.contextKey === 'chat/sdk/ios');
  assert.equal(ios.length, 60);
  assert.deepEqual(
    ios.map((route) => route.path),
    resolveClientSdkSkeletonRoutes({ platformId: 'ios', sidebar, routes: original }).map(
      (route) => route.path,
    ),
  );
  assert.ok(ios.every((route) => route.contentFile.startsWith('content/docs/chat/sdk/ios/')));
  assert.ok(!ios.some((route) => route.path.includes('/channel/')));
  assert.equal(new Set(ios.map((route) => route.id)).size, ios.length);
  assert.equal(new Set(ios.map((route) => route.sourceIndex)).size, ios.length);
  const nonIos = next.filter((route) => route.contextKey !== 'chat/sdk/ios');
  const nonIosIds = new Set(nonIos.map((route) => route.id));
  const nonIosSourceIndexes = new Set(nonIos.map((route) => route.sourceIndex));
  assert.ok(ios.every((route) => !nonIosIds.has(route.id)));
  assert.ok(ios.every((route) => !nonIosSourceIndexes.has(route.sourceIndex)));
});

test('resolves every active native suffix against the current WASM routes', () => {
  const routes = readJson('src/generated/routes.json');
  for (const platformId of ['ios', 'flutter']) {
    const sidebar = readJson(`data/structure/${platformId}-sidebar.json`);
    const resolved = resolveClientSdkSkeletonRoutes({ platformId, sidebar, routes });
    assert.equal(resolved.length, 60);
    assert.equal(resolved[0].path, `/sdk/${platformId}/overview`);
    assert.equal(resolved[0].title, `OpenIM SDK for ${platformId === 'ios' ? 'iOS' : 'Flutter'}`);
  }
});

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
