# iOS and Flutter WASM-Mirror Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Sendbird-derived iOS and Flutter SDK sections with reviewed Simplified Chinese OpenIM task guides that mirror the WASM information architecture while using the pinned native SDK APIs.

**Architecture:** Keep each platform as an independent documentation context, but drive its deterministic sidebar, publication state, localized content package, ownership checks, and redirects through a small shared client-SDK platform registry. English files are route skeletons only; every Chinese MDX page is read and rewritten by hand from its WASM counterpart and verified against the pinned Objective-C or Dart declarations. Generated JSON remains derived data and never becomes review evidence.

**Tech Stack:** Next.js, Fumadocs MDX, TypeScript, Node.js ESM validation scripts, `node:test`, Objective-C with selective Swift snippets, Dart, pnpm.

---

## Fixed Inputs And Page Set

Use these immutable evidence baselines throughout every task:

- OpenIM docs: `efd0f251b288167e1ca617504b10dd73986429f0`
- iOS SDK tag `3.8.3-hotfix.12`, commit `17fb969fd3a360f00fe65f476435b81857e274f8`
- Flutter SDK tag `3.8.3+hotfix.12`, commit `95889be7a26dce6fe896ef22096c9036cc25fc9b`
- Source docs checkout: `/Volumes/T7/Dev/docs/docs/docs/sdks/`
- iOS SDK checkout: `/Volumes/T7/Dev/Native/sdk/open-im-sdk-ios`
- Flutter SDK checkout: `/Volumes/T7/Dev/Flutter/sdk/open-im-sdk-flutter`
- Reviewed writing baseline: `content/zh/docs/chat/sdk/wasm/**`

Both platform trees initially use the following exact 58 route suffixes. A suffix may be removed from one platform only after its audit record cites pinned SDK evidence that the complete task has no native equivalent.

```text
overview
getting-started/before-you-start
getting-started/environment-specific-implementation
getting-started/authenticate-and-manage-session
getting-started/send-first-message
user/overview-user
user/retrieving-users/retrieve-users
user/retrieving-and-updating-user-information/update-user-profile
user/retrieving-and-updating-user-information/retrieve-the-online-status-of-a-user
user/retrieving-users/retrieve-a-list-of-friends
user/retrieving-users/retrieve-friend-information
user/managing-friends/manage-friend-requests
user/managing-friends/update-or-delete-friends
user/moderating-a-user/retrieve-a-list-of-blocked-users
user/moderating-a-user/block-and-unblock-other-members
conversation/overview-conversation
conversation/retrieving-conversations/retrieve-conversations
conversation/retrieving-conversations/retrieve-conversation-list
conversation/managing-conversations/set-conversation
conversation/managing-conversations/set-conversation-draft
conversation/managing-conversations/manage-read-status
conversation/managing-conversations/hide-or-archive-conversation
conversation/managing-conversations/delete-or-clear-conversation
conversation/managing-conversation-groups/manage-conversation-groups
group/overview-group
group/creating-and-updating-groups/create-or-update-a-group
group/retrieving-groups/retrieve-and-search-groups
group/joining-and-leaving-groups/join-leave-or-dismiss-a-group
group/managing-group-applications/manage-group-applications
group/retrieving-group-members/retrieve-group-members
group/managing-group-members/invite-or-remove-group-members
group/managing-group-members/update-group-member-info
group/managing-group-members/transfer-group-owner
group/moderating-groups/mute-a-group-or-member
message/overview-message
message/sending-messages/send-a-message
message/sending-messages/create-media-and-rich-messages
message/sending-messages/upload-files-and-track-progress
message/receiving-messages/receive-messages
message/retrieving-messages/retrieve-message-list
message/retrieving-messages/retrieve-messages
message/searching-messages/search-messages
message/composing-messages/add-extra-data-to-a-message
message/composing-messages/mention-users-in-a-message
message/composing-messages/manage-typing-status
message/composing-messages/transcribe-audio
message/managing-messages/forward-or-merge-a-message
message/managing-messages/delete-or-revoke-a-message
message/managing-messages/pin-conversation-messages
message/managing-messages/insert-a-local-message
message/managing-messages/clear-message-history
message/managing-read-status/manage-group-message-read-receipts
calling/overview-calling
calling/managing-calls/start-or-handle-a-call
calling/retrieving-call-information/retrieve-call-information
calling/sending-custom-signals/send-a-custom-signal
events/overview-events
logger
```

For every Chinese page step below, use this non-negotiable page review loop:

1. Read the complete WASM page and the complete target page before editing.
2. Locate every operation in the pinned platform declaration and record the exact method, model, enum, callback/listener, and source file.
3. Preserve the WASM scenario, heading order, parameter/result placement, and snapshot/event/requery distinctions; replace only platform-specific definitions and flows.
4. Use Objective-C as the iOS source of truth and primary example language. Add Swift only where bridging or invocation differs materially. Use Dart for Flutter.
5. Keep `operationID` out of public pages except `logger.mdx`.
6. Update the page's audit entry and API/event ownership in the same edit.
7. Read the finished page from top to bottom, verify every link and example, then run the platform page checks before continuing.

### Task 1: Add A Shared Client-SDK Platform Registry And Sidebar Builder

**Files:**

- Create: `scripts/lib/client-sdk-platforms.mjs`
- Create: `scripts/lib/client-sdk-sidebar.mjs`
- Create: `scripts/__tests__/client-sdk-sidebar.test.mjs`
- Create: `data/structure/ios-sidebar.json`
- Create: `data/structure/flutter-sidebar.json`
- Modify: `scripts/sync-content-metadata.mjs`
- Modify: `scripts/lib/wasm-sidebar.mjs`

- [ ] **Step 1: Write failing registry and sidebar tests**

Test that `ios`, `flutter`, and `wasm` resolve to exact context keys and data paths; test duplicate, unknown, and omitted route failures; test that replacing `/sdk/wasm/` with either platform produces the expected 58-path order.

```js
assert.deepEqual(getClientSdkPlatform('ios'), {
  id: 'ios',
  contextKey: 'chat/sdk/ios',
  routePrefix: '/sdk/ios',
  manualRoot: 'content/zh/docs/chat/sdk/ios',
  auditPath: 'data/structure/ios-content-audit.json',
  labelsPath: 'data/structure/ios-navigation-labels.json',
  sidebarPath: 'data/structure/ios-sidebar.json',
  localizedOutputPath: 'src/generated/ios-sdk-zh-content.json',
});
assert.equal(getClientSdkSidebarPaths(iosSidebar).length, 58);
assert.equal(getClientSdkSidebarPaths(flutterSidebar).length, 58);
```

- [ ] **Step 2: Run the test and verify the missing modules fail**

Run: `node --test scripts/__tests__/client-sdk-sidebar.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `client-sdk-platforms.mjs` or `client-sdk-sidebar.mjs`.

- [ ] **Step 3: Implement the registry and generic sidebar builder**

Export `clientSdkPlatformIds`, `getClientSdkPlatform(id)`, `getClientSdkSidebarPaths(config)`, and `buildClientSdkSidebar({ platform, config, routes })`. Preserve the existing sidebar node shape, derive node IDs from each route's `relativePath`, and include the platform name in all validation errors. Make `wasm-sidebar.mjs` a compatibility wrapper around the generic functions so existing imports and WASM tests continue to pass.

- [ ] **Step 4: Add exact iOS and Flutter sidebar manifests**

Create both manifests by manually reviewing `data/structure/wasm-sidebar.json`, preserving its folders and route suffix order, and changing only the `/sdk/{platform}` prefix. Keep `sidebarExpansion` equal to `active-path`.

- [ ] **Step 5: Generalize metadata synchronization**

Load all three platform sidebar manifests and loop over the registry. Apply deterministic `navOrder`, `nodes`, `pageCount`, and `sidebarExpansion` for `chat/sdk/ios`, `chat/sdk/flutter`, and `chat/sdk/wasm`; continue using `refreshNodes` for unrelated contexts.

- [ ] **Step 6: Run focused tests**

Run: `node --test scripts/__tests__/client-sdk-sidebar.test.mjs scripts/__tests__/wasm-full-capability-structure.test.mjs scripts/__tests__/chat-route-prefix.test.mjs`

Expected: all tests PASS; each new platform sidebar contains 58 unique active paths.

- [ ] **Step 7: Commit the deterministic sidebar foundation**

```bash
git add scripts/lib/client-sdk-platforms.mjs scripts/lib/client-sdk-sidebar.mjs scripts/lib/wasm-sidebar.mjs scripts/sync-content-metadata.mjs scripts/__tests__/client-sdk-sidebar.test.mjs data/structure/ios-sidebar.json data/structure/flutter-sidebar.json
git commit -m "feat(docs): add native SDK sidebar foundation"
```

### Task 2: Generalize Chinese Packaging, Publication, And Search Visibility

**Files:**

- Create: `scripts/build-client-sdk-zh-content.mjs`
- Create: `scripts/__tests__/build-client-sdk-zh-content.test.mjs`
- Create: `src/generated/ios-sdk-zh-content.json`
- Create: `src/generated/flutter-sdk-zh-content.json`
- Create: `data/structure/ios-content-audit.json`
- Create: `data/structure/flutter-content-audit.json`
- Create: `data/structure/ios-navigation-labels.json`
- Create: `data/structure/flutter-navigation-labels.json`
- Create: `src/lib/client-sdk-publication.ts`
- Create: `scripts/__tests__/client-sdk-publication.test.mjs`
- Modify: `scripts/build-wasm-sdk-zh-content.mjs`
- Modify: `scripts/check-localized-sdk-content.mjs`
- Modify: `src/lib/localized-docs.ts`
- Modify: `src/lib/wasm-publication.ts`
- Modify: `src/components/docs/documentation-page.tsx`
- Modify: `scripts/build-search-index.mjs`
- Modify: `scripts/lib/search-index-contract.mjs`
- Modify: `scripts/__tests__/build-search-index.test.mjs`
- Modify: `scripts/__tests__/search-index-contract.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing packaging and publication tests**

Cover all three contexts with table-driven cases. A Chinese page is available only when a manual MDX file exists and its audit state is `published`; an English SDK page is hidden while its state is `deferred`; a pending Chinese route gets the platform-specific review notice rather than English Sendbird prose.

```js
for (const platform of ['ios', 'flutter', 'wasm']) {
  assert.equal(isClientSdkLocalePublished(`/sdk/${platform}/overview`, 'zh', audits), true);
  assert.equal(isClientSdkLocalePublished(`/sdk/${platform}/overview`, 'en', audits), false);
}
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test scripts/__tests__/build-client-sdk-zh-content.test.mjs scripts/__tests__/client-sdk-publication.test.mjs scripts/__tests__/build-search-index.test.mjs scripts/__tests__/search-index-contract.test.mjs`

Expected: FAIL because iOS and Flutter are not registered as localized publication contexts.

- [ ] **Step 3: Seed the structure-only audit and navigation inputs**

Create 58 route records per platform with the fixed docs/platform commits, `zh.reviewStatus: "structure-only"`, `en.reviewStatus: "deferred"`, and pending example verification. Create platform navigation labels from the reviewed WASM vocabulary. These files are inputs to packaging; Task 3 adds strict validation and complete API/event evidence rules.

- [ ] **Step 4: Extract a platform-parameterized content packager**

Move the pure build logic into `build-client-sdk-zh-content.mjs`. It must read only existing manual MDX files, normalize them, attach headings, and write one JSON file per requested platform. Keep `build-wasm-sdk-zh-content.mjs` as a thin WASM entry point so existing commands remain valid. Do not create or modify any MDX file in this builder.

- [ ] **Step 5: Generalize publication helpers and localized loading**

Replace single-WASM branching with the registry and import the three generated JSON packages. Preserve manual-file precedence. Return a platform-specific pending-review body only for registered SDK contexts. In `documentation-page.tsx`, make language availability and publication warnings use `isClientSdkRoute` and `isClientSdkLocalePublished`; keep the custom WASM overview renderer scoped to WASM until a platform-neutral overview renderer is explicitly implemented.

- [ ] **Step 6: Generalize search indexing**

For registered SDK contexts, consult that platform's audit manifest per locale. Require a manual Chinese MDX file for every published Chinese record, and exclude deferred English records. Leave non-client-SDK routes unchanged.

- [ ] **Step 7: Update package scripts without changing the WASM baseline commands**

Add `sdk:native:zh` and `sdk:native:zh:check`. Make `content:sync`, `precheck`, and `prebuild` package all three SDK contexts before rebuilding search indexes. Task 3 adds audit and example commands when their implementations exist.

- [ ] **Step 8: Run focused tests and generated-data checks**

Run: `pnpm sdk:zh && pnpm sdk:native:zh && node --test scripts/__tests__/build-client-sdk-zh-content.test.mjs scripts/__tests__/client-sdk-publication.test.mjs scripts/__tests__/build-search-index.test.mjs scripts/__tests__/search-index-contract.test.mjs`

Expected: all tests PASS; generated iOS and Flutter files identify the correct `sourceContext` and contain no page bodies until manual Chinese pages are added.

- [ ] **Step 9: Commit publication infrastructure**

```bash
git add package.json scripts/build-client-sdk-zh-content.mjs scripts/build-wasm-sdk-zh-content.mjs scripts/check-localized-sdk-content.mjs scripts/build-search-index.mjs scripts/lib/search-index-contract.mjs scripts/__tests__/build-client-sdk-zh-content.test.mjs scripts/__tests__/client-sdk-publication.test.mjs scripts/__tests__/build-search-index.test.mjs scripts/__tests__/search-index-contract.test.mjs src/lib/client-sdk-publication.ts src/lib/wasm-publication.ts src/lib/localized-docs.ts src/components/docs/documentation-page.tsx src/generated/ios-sdk-zh-content.json src/generated/flutter-sdk-zh-content.json data/structure/ios-content-audit.json data/structure/flutter-content-audit.json data/structure/ios-navigation-labels.json data/structure/flutter-navigation-labels.json
git commit -m "feat(docs): support localized native SDK publication"
```

### Task 3: Add Native SDK Audit, Ownership, And Example Validation

**Files:**

- Create: `scripts/lib/client-sdk-content-audit.mjs`
- Create: `scripts/check-client-sdk-content-audit.mjs`
- Create: `scripts/build-client-sdk-api-ownership.mjs`
- Create: `scripts/check-client-sdk-examples.mjs`
- Create: `scripts/__tests__/client-sdk-content-audit.test.mjs`
- Create: `scripts/__tests__/client-sdk-ownership.test.mjs`
- Create: `scripts/__tests__/client-sdk-examples.test.mjs`
- Modify: `data/structure/ios-content-audit.json`
- Modify: `data/structure/flutter-content-audit.json`
- Create: `data/structure/ios-api-ownership.json`
- Create: `data/structure/flutter-api-ownership.json`
- Modify: `data/structure/ios-navigation-labels.json`
- Modify: `data/structure/flutter-navigation-labels.json`
- Modify: `scripts/lib/wasm-content-audit.mjs`
- Modify: `scripts/check-wasm-content-audit.mjs`
- Modify: `scripts/build-wasm-api-ownership.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing audit schema tests**

Require platform-specific pinned sources, a route with both locale states, immutable source URLs, exact SDK method/event arrays, example verification evidence at `example-verified` or `published`, and a redirect disposition for every removed old route. Assert iOS rejects Dart evidence and Flutter rejects Objective-C-only evidence.

```js
assert.deepEqual(validateClientSdkSources(iosManifest.sources, 'ios'), []);
assert.deepEqual(validateClientSdkSources(flutterManifest.sources, 'flutter'), []);
assert.match(iosManifest.sources.platformSdk.commit, /^[a-f0-9]{40}$/);
assert.equal(iosManifest.sources.platformSdk.commit, '17fb969fd3a360f00fe65f476435b81857e274f8');
assert.equal(
  flutterManifest.sources.platformSdk.commit,
  '95889be7a26dce6fe896ef22096c9036cc25fc9b',
);
```

- [ ] **Step 2: Write failing ownership and example tests**

Require each documented method and event to have one owner page, reject ownership of inactive routes, reject complete listener examples outside their event owner page, and enforce primary fenced languages: `objective-c` for iOS, `dart` for Flutter. Permit `swift` only when the same iOS operation has an Objective-C primary example. Reject `operationID` outside `logger.mdx`.

- [ ] **Step 3: Run tests and verify missing implementations fail**

Run: `node --test scripts/__tests__/client-sdk-content-audit.test.mjs scripts/__tests__/client-sdk-ownership.test.mjs scripts/__tests__/client-sdk-examples.test.mjs`

Expected: FAIL with missing client SDK audit, ownership, and example modules.

- [ ] **Step 4: Implement generic validators while preserving WASM wrappers**

Extract shared review ranks, locale rules, immutable-source checks, ownership uniqueness, and event-owner checks. Keep WASM package integrity validation in its wrapper; validate iOS repository/tag/commit and Flutter repository/tag/commit in the native platform path. Example validation must parse fenced blocks and identifiers but must never rewrite MDX.

- [ ] **Step 5: Validate and complete the 58 seeded audit records per platform**

Confirm every seed uses `zh.reviewStatus: structure-only`, `en.reviewStatus: deferred`, `disposition: adapt`, pending example verification, and the fixed docs and SDK commits. Add every field required by the strict validator. Seed empty ownership arrays; they are populated page by page from pinned declarations.

- [ ] **Step 6: Add localized navigation labels**

Start from the reviewed WASM label vocabulary, then add platform-only terms actually used by native pages, including `Objective-C`, `Swift`, `Dart`, `APNs`, application lifecycle, and local storage. Labels are deterministic UI data, not MDX prose.

- [ ] **Step 7: Run validators**

Add `sdk:native:audit:check` and `sdk:native:examples:check` to `package.json`, pointing to the implementations created in this task.

Run: `pnpm sdk:native:audit:check && pnpm sdk:native:examples:check && node --test scripts/__tests__/client-sdk-content-audit.test.mjs scripts/__tests__/client-sdk-ownership.test.mjs scripts/__tests__/client-sdk-examples.test.mjs`

Expected: PASS with 58 structure-only Chinese records and 58 deferred English records per platform; ownership arrays may be empty only while pages remain below `api-verified`.

- [ ] **Step 8: Commit validation infrastructure**

```bash
git add scripts/lib/client-sdk-content-audit.mjs scripts/check-client-sdk-content-audit.mjs scripts/build-client-sdk-api-ownership.mjs scripts/check-client-sdk-examples.mjs scripts/lib/wasm-content-audit.mjs scripts/check-wasm-content-audit.mjs scripts/build-wasm-api-ownership.mjs scripts/__tests__/client-sdk-content-audit.test.mjs scripts/__tests__/client-sdk-ownership.test.mjs scripts/__tests__/client-sdk-examples.test.mjs data/structure/ios-content-audit.json data/structure/flutter-content-audit.json data/structure/ios-api-ownership.json data/structure/flutter-api-ownership.json data/structure/ios-navigation-labels.json data/structure/flutter-navigation-labels.json
git commit -m "feat(docs): validate native SDK content evidence"
```

### Task 4: Replace Sendbird Route Trees With Deferred OpenIM Skeletons

**Files:**

- Create: `scripts/migrate-native-sdk-structure.mjs`
- Create: `scripts/__tests__/native-sdk-route-structure.test.mjs`
- Create: `data/structure/ios-legacy-redirects.json`
- Create: `data/structure/flutter-legacy-redirects.json`
- Create: `scripts/lib/client-sdk-legacy-redirects.mjs`
- Modify: `next.config.ts`
- Modify: `scripts/sync-content-metadata.mjs`
- Replace: `content/docs/chat/sdk/ios/**`
- Replace: `content/docs/chat/sdk/flutter/**`
- Modify generated outputs: `src/generated/routes.json`, `src/generated/navigation.json`

- [ ] **Step 1: Write failing route migration tests**

Assert that each platform has exactly the 58 active suffixes, no active route contains Sendbird-only domains (`application`, `channel`, `poll`, `scheduled-message`, `report`, `translation`), every active English file has `status: "deferred"`, and every old route is either a permanent redirect or an explicit audit removal record.

- [ ] **Step 2: Run the route test and confirm current Sendbird routes fail**

Run: `node --test scripts/__tests__/native-sdk-route-structure.test.mjs`

Expected: FAIL listing current Sendbird-derived paths and missing native manifests.

- [ ] **Step 3: Implement a structure-only migration command**

The command may create/delete English skeleton files, route metadata, sidebar data, and redirect data. It must refuse any path under `content/zh/`, render only fixed deferred frontmatter plus `<DocScaffold>`, support `--dry-run`, and print every removed and created English path before writing.

- [ ] **Step 4: Dry-run and manually inspect the complete path report**

Run: `node scripts/migrate-native-sdk-structure.mjs --dry-run > /tmp/openim-native-sdk-route-plan.txt`

Expected: reports 126 current iOS files, 121 current Flutter files, 58 target files for each platform, and zero Chinese writes. Read the full report and verify all target suffixes against the fixed page set above.

- [ ] **Step 5: Classify legacy routes by real successor**

For each old route, add one of these explicit outcomes to the platform redirect manifest:

- OpenIM task equivalent: permanent redirect to the closest active `/sdk/{platform}/...` task page.
- Platform setup topic: redirect to `/sdk/{platform}/getting-started/environment-specific-implementation`.
- Event handler/delegate topic: redirect to `/sdk/{platform}/events/overview-events`.
- Logger topic: redirect to `/sdk/{platform}/logger`.
- Sendbird-only capability with no OpenIM equivalent: no redirect; retain an audit record with `disposition: remove`, pinned evidence, and an explanatory note.

Do not redirect unsupported polls, scheduled messages, translation, reporting, Application objects, channel metadata/counters, or rate limits to a misleading OpenIM page.

- [ ] **Step 6: Execute the reviewed structure migration and regenerate routes**

Run: `node scripts/migrate-native-sdk-structure.mjs && pnpm source:generate && node scripts/sync-content-metadata.mjs`

Expected: 58 deferred English skeletons per platform; navigation contexts use the new sidebar trees.

- [ ] **Step 7: Add permanent redirects to Next.js**

Load all three redirect manifests and return the combined result from `next.config.ts`. The generic builder must emit base and `/zh` sources, set `permanent: true`, reject duplicate sources, and reject destinations outside active routes.

- [ ] **Step 8: Run structure and redirect tests**

Run: `node --test scripts/__tests__/native-sdk-route-structure.test.mjs scripts/__tests__/client-sdk-sidebar.test.mjs scripts/__tests__/chat-route-prefix.test.mjs`

Expected: PASS; all active iOS/Flutter routes are OpenIM tasks, all redirects are permanent and unique, unsupported routes remain unpublished.

- [ ] **Step 9: Commit route replacement**

```bash
git add scripts/migrate-native-sdk-structure.mjs scripts/lib/client-sdk-legacy-redirects.mjs scripts/__tests__/native-sdk-route-structure.test.mjs data/structure/ios-legacy-redirects.json data/structure/flutter-legacy-redirects.json content/docs/chat/sdk/ios content/docs/chat/sdk/flutter src/generated/routes.json src/generated/navigation.json next.config.ts scripts/sync-content-metadata.mjs
git commit -m "docs: replace native SDK Sendbird route trees"
```

### Task 5: Write And Verify iOS Overview, Setup, And User Pages

**Files:**

- Create/modify: `content/zh/docs/chat/sdk/ios/overview.mdx`
- Create/modify: `content/zh/docs/chat/sdk/ios/getting-started/{before-you-start,environment-specific-implementation,authenticate-and-manage-session,send-first-message}.mdx`
- Create/modify: `content/zh/docs/chat/sdk/ios/user/overview-user.mdx`
- Create/modify: `content/zh/docs/chat/sdk/ios/user/retrieving-users/{retrieve-users,retrieve-a-list-of-friends,retrieve-friend-information}.mdx`
- Create/modify: `content/zh/docs/chat/sdk/ios/user/retrieving-and-updating-user-information/{update-user-profile,retrieve-the-online-status-of-a-user}.mdx`
- Create/modify: `content/zh/docs/chat/sdk/ios/user/managing-friends/{manage-friend-requests,update-or-delete-friends}.mdx`
- Create/modify: `content/zh/docs/chat/sdk/ios/user/moderating-a-user/{retrieve-a-list-of-blocked-users,block-and-unblock-other-members}.mdx`
- Modify: `data/structure/ios-content-audit.json`
- Modify: `data/structure/ios-api-ownership.json`
- Modify: `src/generated/ios-sdk-zh-content.json`

- [ ] **Step 1: Inventory pinned Objective-C declarations for these 15 pages**

Read the matching WASM pages, `/Volumes/T7/Dev/docs/docs/docs/sdks/` sources, public Objective-C headers at commit `17fb969fd3a360f00fe65f476435b81857e274f8`, and relevant native implementation/delegate declarations. Record exact selectors, nullability, models, enums, callbacks, and events in the audit entries before writing prose.

- [ ] **Step 2: Write the five overview/setup pages by hand**

Preserve WASM task progression but replace browser setup with CocoaPods/SPM evidence, SDK initialization, native storage path and lifecycle, APNs token registration and foreground/background handling. Keep Objective-C primary. Put any Swift bridging example immediately after its Objective-C operation and explain only the bridging difference.

- [ ] **Step 3: Write the ten user/friend/blacklist pages by hand**

Use actual Objective-C pagination and model types. Keep snapshot queries and delegate changes distinct. Do not document non-paginated friend APIs, `Login`, or `UnUsedEvent`. Assign complete delegate registration/cleanup code only to the event owner page selected in `ios-api-ownership.json`.

- [ ] **Step 4: Update audit and ownership after each page**

For a completed page, set Chinese review state through `written`, `api-verified`, `example-verified`, then `published` only after all checks pass. Keep English `deferred`. Add exact immutable docs/header links, selectors, delegate events, example evidence, reviewer, date, and platform limitations.

- [ ] **Step 5: Run focused iOS checks**

Run: `pnpm sdk:native:zh && node scripts/check-client-sdk-content-audit.mjs --platform ios && node scripts/check-client-sdk-examples.mjs --platform ios && node --test scripts/__tests__/client-sdk-ownership.test.mjs`

Expected: PASS; 15 iOS Chinese pages are published, all other iOS Chinese routes remain structure-only, English remains deferred.

- [ ] **Step 6: Commit the reviewed iOS setup and user batch**

```bash
git add content/zh/docs/chat/sdk/ios data/structure/ios-content-audit.json data/structure/ios-api-ownership.json src/generated/ios-sdk-zh-content.json
git commit -m "docs(ios): add setup and user guides"
```

### Task 6: Write And Verify iOS Conversation And Group Pages

**Files:**

- Create/modify: `content/zh/docs/chat/sdk/ios/conversation/**`
- Create/modify: `content/zh/docs/chat/sdk/ios/group/**`
- Modify: `data/structure/ios-content-audit.json`
- Modify: `data/structure/ios-api-ownership.json`
- Modify: `src/generated/ios-sdk-zh-content.json`

- [ ] **Step 1: Review all 19 WASM conversation/group pages and pinned iOS declarations**

Cover the exact conversation suffixes 16-24 and group suffixes 25-34 from the fixed page set. Verify selector signatures, `OIMConversationInfo`, group/member/application models, pagination inputs, group roles, mute units, and delegate callbacks.

- [ ] **Step 2: Write nine conversation pages by hand**

Retain `conversationID` as the merge key. Use only paginated conversation-list APIs. Keep draft as a supported independent capability. Clearly separate callback success, delegate delivery, and query reconciliation for pinning, read state, hiding, clearing, deletion, and conversation groups.

- [ ] **Step 3: Write ten group pages by hand**

Retain `groupID` and `groupID:userID` merge keys. Explain create/update, retrieval/search, join/leave/dismiss, applications, members, ownership transfer, and mute behavior only where verified by native declarations. Keep all full delegate examples on their assigned owner pages.

- [ ] **Step 4: Update each page's audit and ownership record immediately**

Record Objective-C selectors verbatim. If a WASM operation is absent, omit that operation and document the pinned evidence and limitation in the audit; remove the entire route from the sidebar only if no real operation remains.

- [ ] **Step 5: Run focused iOS checks**

Run: `pnpm sdk:native:zh && node scripts/check-client-sdk-content-audit.mjs --platform ios && node scripts/check-client-sdk-examples.mjs --platform ios && node --test scripts/__tests__/client-sdk-ownership.test.mjs scripts/__tests__/native-sdk-route-structure.test.mjs`

Expected: PASS; setup/user/conversation/group iOS pages are published and event ownership is unique.

- [ ] **Step 6: Commit the reviewed iOS conversation and group batch**

```bash
git add content/zh/docs/chat/sdk/ios/conversation content/zh/docs/chat/sdk/ios/group data/structure/ios-content-audit.json data/structure/ios-api-ownership.json src/generated/ios-sdk-zh-content.json data/structure/ios-sidebar.json
git commit -m "docs(ios): add conversation and group guides"
```

### Task 7: Write And Verify iOS Message Pages

**Files:**

- Create/modify: `content/zh/docs/chat/sdk/ios/message/**`
- Modify: `data/structure/ios-content-audit.json`
- Modify: `data/structure/ios-api-ownership.json`
- Modify: `data/structure/ios-sidebar.json`
- Modify: `src/generated/ios-sdk-zh-content.json`

- [ ] **Step 1: Review all 18 WASM message pages and pinned iOS declarations**

Cover exact suffixes 35-52. Verify every message factory selector, media input model, progress callback, send callback, message status enum, receipt API, search/history pagination, revoke/delete scope, and message delegate payload.

- [ ] **Step 2: Write overview, send, receive, retrieve, and search pages by hand**

Preserve “create then send” boundaries and use `clientMsgID` plus `conversationID` where needed. Explain native file URLs/data and progress behavior instead of browser `File`/WASM assets. Do not claim a local create/query operation emits a shared event.

- [ ] **Step 3: Write compose, manage, and receipt pages by hand**

Use verified Objective-C models/enums for extra data, mentions, typing, transcription, forward/merge, revoke/delete, pinning, local insertion, history clearing, and group receipts. Omit any unsupported operation and record why; keep the task page if at least one verified operation remains.

- [ ] **Step 4: Update audit and ownership page by page**

Assign the full new-message and receipt delegate examples once. All other pages link to those owners. Ensure callbacks, delegate delivery, and reconciliation are described as separate stages.

- [ ] **Step 5: Run focused iOS checks**

Run: `pnpm sdk:native:zh && node scripts/check-client-sdk-content-audit.mjs --platform ios && node scripts/check-client-sdk-examples.mjs --platform ios && node --test scripts/__tests__/client-sdk-ownership.test.mjs`

Expected: PASS with every retained iOS message selector and event owned exactly once.

- [ ] **Step 6: Commit the reviewed iOS message batch**

```bash
git add content/zh/docs/chat/sdk/ios/message data/structure/ios-content-audit.json data/structure/ios-api-ownership.json data/structure/ios-sidebar.json src/generated/ios-sdk-zh-content.json
git commit -m "docs(ios): add message guides"
```

### Task 8: Complete iOS Calling, Events, Logger, And Platform Publication

**Files:**

- Create/modify: `content/zh/docs/chat/sdk/ios/calling/**`
- Create/modify: `content/zh/docs/chat/sdk/ios/events/overview-events.mdx`
- Create/modify: `content/zh/docs/chat/sdk/ios/logger.mdx`
- Modify: `data/structure/ios-content-audit.json`
- Modify: `data/structure/ios-api-ownership.json`
- Modify: `data/structure/ios-sidebar.json`
- Modify: `src/generated/ios-sdk-zh-content.json`

- [ ] **Step 1: Review calling, signaling, delegate, and logger declarations**

Read exact suffixes 53-58 and verify `roomID`, participant identifiers, signaling models, callback/delegate lifecycle, log level enum, log file behavior, and `operationID` generation/trace rules.

- [ ] **Step 2: Write four calling pages by hand**

Preserve WASM calling tasks but use native selectors, callbacks, and delegates. State verified limits if the iOS wrapper exposes signaling rather than a complete RTC media engine. Use `roomID` for call-state merging.

- [ ] **Step 3: Write the event owner index and logger page by hand**

The event page lists every public delegate event and links to its single owner, with stable delegate lifetime/removal examples where supported. The logger page is the only page that explains `operationID`; use actual Objective-C log configuration and native file/console behavior.

- [ ] **Step 4: Finish iOS audit, ownership, and sidebar disposition review**

Every active route must be `published` in Chinese and `deferred` in English. Every removed route must retain an audit record. Every documented selector/event must have exactly one owner; every unsupported WASM operation must have pinned evidence.

- [ ] **Step 5: Run full iOS validation**

Run: `pnpm sdk:native:zh && node scripts/check-client-sdk-content-audit.mjs --platform ios && node scripts/check-client-sdk-examples.mjs --platform ios && node --test scripts/__tests__/client-sdk-ownership.test.mjs scripts/__tests__/native-sdk-route-structure.test.mjs`

Expected: PASS; all active iOS Chinese pages are published, no iOS English page is published, no Sendbird capability appears in active body text.

- [ ] **Step 6: Commit completed iOS publication**

```bash
git add content/zh/docs/chat/sdk/ios/calling content/zh/docs/chat/sdk/ios/events content/zh/docs/chat/sdk/ios/logger.mdx data/structure/ios-content-audit.json data/structure/ios-api-ownership.json data/structure/ios-sidebar.json src/generated/ios-sdk-zh-content.json
git commit -m "docs(ios): complete native SDK guide publication"
```

### Task 9: Write And Verify Flutter Overview, Setup, And User Pages

**Files:**

- Create/modify: `content/zh/docs/chat/sdk/flutter/overview.mdx`
- Create/modify: `content/zh/docs/chat/sdk/flutter/getting-started/{before-you-start,environment-specific-implementation,authenticate-and-manage-session,send-first-message}.mdx`
- Create/modify: `content/zh/docs/chat/sdk/flutter/user/overview-user.mdx`
- Create/modify: `content/zh/docs/chat/sdk/flutter/user/retrieving-users/{retrieve-users,retrieve-a-list-of-friends,retrieve-friend-information}.mdx`
- Create/modify: `content/zh/docs/chat/sdk/flutter/user/retrieving-and-updating-user-information/{update-user-profile,retrieve-the-online-status-of-a-user}.mdx`
- Create/modify: `content/zh/docs/chat/sdk/flutter/user/managing-friends/{manage-friend-requests,update-or-delete-friends}.mdx`
- Create/modify: `content/zh/docs/chat/sdk/flutter/user/moderating-a-user/{retrieve-a-list-of-blocked-users,block-and-unblock-other-members}.mdx`
- Modify: `data/structure/flutter-content-audit.json`
- Modify: `data/structure/flutter-api-ownership.json`
- Modify: `src/generated/flutter-sdk-zh-content.json`

- [ ] **Step 1: Inventory pinned Dart declarations for these 15 pages**

Read every matching WASM page, the fixed source docs, the Flutter public managers/models/listeners at commit `95889be7a26dce6fe896ef22096c9036cc25fc9b`, and the native bridge where the Dart surface is ambiguous. Record exact methods, named parameters, nullable types, `Future` results, models, enums, and listeners.

- [ ] **Step 2: Write the five overview/setup pages by hand**

Replace browser setup with package installation, initialization, platform channel/native setup, application lifecycle, storage, and push/token handling actually exposed by Flutter. Use Dart throughout and show listener cleanup using the SDK's real registration API.

- [ ] **Step 3: Write the ten user/friend/blacklist pages by hand**

Use actual Dart pagination and response models. Do not publish non-paginated friend APIs, `Login`, or `UnUsedEvent`. Keep `Future` completion separate from listener delivery and requery reconciliation.

- [ ] **Step 4: Update audit and ownership after each page and run focused checks**

Run: `pnpm sdk:native:zh && node scripts/check-client-sdk-content-audit.mjs --platform flutter && node scripts/check-client-sdk-examples.mjs --platform flutter && node --test scripts/__tests__/client-sdk-ownership.test.mjs`

Expected: PASS; 15 Flutter pages are Chinese-published with verified Dart evidence; remaining Flutter pages are structure-only and English remains deferred.

- [ ] **Step 5: Commit the reviewed Flutter setup and user batch**

```bash
git add content/zh/docs/chat/sdk/flutter data/structure/flutter-content-audit.json data/structure/flutter-api-ownership.json src/generated/flutter-sdk-zh-content.json
git commit -m "docs(flutter): add setup and user guides"
```

### Task 10: Write And Verify Flutter Conversation And Group Pages

**Files:**

- Create/modify: `content/zh/docs/chat/sdk/flutter/conversation/**`
- Create/modify: `content/zh/docs/chat/sdk/flutter/group/**`
- Modify: `data/structure/flutter-content-audit.json`
- Modify: `data/structure/flutter-api-ownership.json`
- Modify: `data/structure/flutter-sidebar.json`
- Modify: `src/generated/flutter-sdk-zh-content.json`

- [ ] **Step 1: Review exact suffixes 16-34 against pinned Dart managers, models, and listeners**

Verify conversation and group methods, `Future` result types, pagination, role/mute enums and units, listener payloads, and native bridge limitations before editing.

- [ ] **Step 2: Write nine conversation pages by hand**

Use `conversationID` for merging and only paginated list APIs. Preserve the independent draft task. Explain `Future` success, listener delivery, and requery reconciliation separately for every state-changing operation.

- [ ] **Step 3: Write ten group pages by hand**

Use `groupID` and `groupID:userID`; cover only verified create/update, retrieval/search, membership, applications, transfer, and mute flows. Assign full listener registration and cleanup to one owner page per event.

- [ ] **Step 4: Update audits/ownership page by page and run checks**

Run: `pnpm sdk:native:zh && node scripts/check-client-sdk-content-audit.mjs --platform flutter && node scripts/check-client-sdk-examples.mjs --platform flutter && node --test scripts/__tests__/client-sdk-ownership.test.mjs scripts/__tests__/native-sdk-route-structure.test.mjs`

Expected: PASS; all retained methods/events have pinned evidence and unique ownership.

- [ ] **Step 5: Commit the reviewed Flutter conversation and group batch**

```bash
git add content/zh/docs/chat/sdk/flutter/conversation content/zh/docs/chat/sdk/flutter/group data/structure/flutter-content-audit.json data/structure/flutter-api-ownership.json data/structure/flutter-sidebar.json src/generated/flutter-sdk-zh-content.json
git commit -m "docs(flutter): add conversation and group guides"
```

### Task 11: Write And Verify Flutter Message Pages

**Files:**

- Create/modify: `content/zh/docs/chat/sdk/flutter/message/**`
- Modify: `data/structure/flutter-content-audit.json`
- Modify: `data/structure/flutter-api-ownership.json`
- Modify: `data/structure/flutter-sidebar.json`
- Modify: `src/generated/flutter-sdk-zh-content.json`

- [ ] **Step 1: Review exact suffixes 35-52 against pinned Dart declarations**

Verify factory methods, input/output models, named arguments, upload progress, message status enums, receipt methods, history/search pagination, listener payloads, and bridge constraints.

- [ ] **Step 2: Write send/receive/retrieve/search pages by hand**

Keep message creation distinct from sending and describe native file paths/bytes and progress callbacks actually accepted by Flutter. Merge with `clientMsgID` and `conversationID`; do not claim local creation or queries emit shared events.

- [ ] **Step 3: Write compose/manage/receipt pages by hand**

Use verified Dart models and enums. For absent transcription, pinning, or other WASM operations, remove only the unsupported operation and preserve any supported task; remove a route only when its complete task is absent.

- [ ] **Step 4: Update audit and event ownership, then run checks**

Run: `pnpm sdk:native:zh && node scripts/check-client-sdk-content-audit.mjs --platform flutter && node scripts/check-client-sdk-examples.mjs --platform flutter && node --test scripts/__tests__/client-sdk-ownership.test.mjs`

Expected: PASS; all retained Dart message methods and listeners are owned exactly once.

- [ ] **Step 5: Commit the reviewed Flutter message batch**

```bash
git add content/zh/docs/chat/sdk/flutter/message data/structure/flutter-content-audit.json data/structure/flutter-api-ownership.json data/structure/flutter-sidebar.json src/generated/flutter-sdk-zh-content.json
git commit -m "docs(flutter): add message guides"
```

### Task 12: Complete Flutter Calling, Events, Logger, And Platform Publication

**Files:**

- Create/modify: `content/zh/docs/chat/sdk/flutter/calling/**`
- Create/modify: `content/zh/docs/chat/sdk/flutter/events/overview-events.mdx`
- Create/modify: `content/zh/docs/chat/sdk/flutter/logger.mdx`
- Modify: `data/structure/flutter-content-audit.json`
- Modify: `data/structure/flutter-api-ownership.json`
- Modify: `data/structure/flutter-sidebar.json`
- Modify: `src/generated/flutter-sdk-zh-content.json`

- [ ] **Step 1: Review exact suffixes 53-58 against signaling, listener, and logger declarations**

Verify `roomID`, participant identifiers, signaling models, `Future` results, listener lifecycle, log levels and outputs, and `operationID` rules.

- [ ] **Step 2: Write calling, event, and logger pages by hand**

State verified signaling-versus-media-engine boundaries. Use stable listener instances and the real cleanup API. Put each full listener flow on its event owner page; make logger the sole `operationID` explanation.

- [ ] **Step 3: Finish Flutter audit, ownership, and route disposition review**

Every active Chinese route must be published, every English route deferred, every removed route traceable, and every retained API/event pinned and uniquely owned.

- [ ] **Step 4: Run full Flutter validation**

Run: `pnpm sdk:native:zh && node scripts/check-client-sdk-content-audit.mjs --platform flutter && node scripts/check-client-sdk-examples.mjs --platform flutter && node --test scripts/__tests__/client-sdk-ownership.test.mjs scripts/__tests__/native-sdk-route-structure.test.mjs`

Expected: PASS; all active Flutter Chinese pages are published, English remains unpublished, and active body text contains no unsupported Sendbird feature.

- [ ] **Step 5: Commit completed Flutter publication**

```bash
git add content/zh/docs/chat/sdk/flutter/calling content/zh/docs/chat/sdk/flutter/events content/zh/docs/chat/sdk/flutter/logger.mdx data/structure/flutter-content-audit.json data/structure/flutter-api-ownership.json data/structure/flutter-sidebar.json src/generated/flutter-sdk-zh-content.json
git commit -m "docs(flutter): complete native SDK guide publication"
```

### Task 13: Integrate Navigation, Search, Redirects, And Release Validation

**Files:**

- Modify: `src/config/docs.ts`
- Modify: `src/components/mdx/landing.tsx`
- Modify: `scripts/check-content.mjs`
- Modify: `scripts/__tests__/chat-route-prefix.test.mjs`
- Modify: `src/generated/search-index.json`
- Modify: `src/generated/search-index-zh.json`
- Modify: `src/generated/routes.json`
- Modify: `src/generated/navigation.json`
- Verify/restore if changed: `next-env.d.ts`

- [ ] **Step 1: Add failing release-contract assertions**

Assert iOS and Flutter selectors link to their new overviews, landing-page native links resolve, Chinese search contains every published native route once, English search contains no deferred native route, old redirect sources do not appear in navigation, and all active links resolve.

- [ ] **Step 2: Run release-contract tests and inspect failures**

Run: `node --test scripts/__tests__/chat-route-prefix.test.mjs scripts/__tests__/build-search-index.test.mjs scripts/__tests__/search-index-contract.test.mjs scripts/__tests__/native-sdk-route-structure.test.mjs`

Expected: only integration gaps fail; content/audit/example tests remain green.

- [ ] **Step 3: Update navigation, landing links, and content checks**

Keep `/sdk/ios/overview` and `/sdk/flutter/overview` as platform entry points. Make content checks iterate all registered client SDK audits, reject visible Sendbird terms and deferred English search records for iOS/Flutter, and validate each native redirect destination.

- [ ] **Step 4: Regenerate all deterministic outputs**

Run: `pnpm source:generate && node scripts/sync-content-metadata.mjs && pnpm content:sync`

Expected: routes, navigation, localized packages, and both search indexes regenerate without changing any hand-authored Chinese MDX body.

- [ ] **Step 5: Run the required repository check**

Run: `pnpm check`

Expected: exit 0 with ESLint, TypeScript, audit, content, ownership, localization, and example checks passing.

- [ ] **Step 6: Run the production build**

Run: `pnpm build`

Expected: exit 0 and a successful Next.js production build.

- [ ] **Step 7: Restore the repository-required Next.js type import if build changed it**

Verify `next-env.d.ts` contains exactly:

```ts
import './.next/dev/types/routes.d.ts';
```

Use `apply_patch` to restore that import if needed; do not revert unrelated user changes.

- [ ] **Step 8: Perform final integrity checks**

Run:

```bash
git diff --check
rg -n "Sendbird|group channel|open channel" content/zh/docs/chat/sdk/ios content/zh/docs/chat/sdk/flutter
rg -n "operationID" content/zh/docs/chat/sdk/ios content/zh/docs/chat/sdk/flutter
git status --short
```

Expected: `git diff --check` is clean; Sendbird/channel terms have no unsupported hits; `operationID` appears only in the two logger pages; status contains only intentional implementation files and generated outputs.

- [ ] **Step 9: Commit release integration**

```bash
git add package.json next.config.ts next-env.d.ts src/config/docs.ts src/components/mdx/landing.tsx scripts/check-content.mjs scripts/__tests__/chat-route-prefix.test.mjs src/generated
git commit -m "docs: publish iOS and Flutter OpenIM SDK guides"
```

- [ ] **Step 10: Inspect final commit range**

Run: `git log --oneline a848d67..HEAD && git status --short`

Expected: focused commits for infrastructure, structure, each reviewed domain batch, and release integration; no uncommitted implementation changes.
