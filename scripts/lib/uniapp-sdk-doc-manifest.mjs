const frozenBaseline = Object.freeze({
  privateCommit: 'a00fb77d7037766c5526b92f9ec0ae7a5939f012',
  interfaceSha256: '8816bd7fdd27f4eff90171f42ceec9d340f8122cfb3a61bee0bc7b456b306224',
  responseSchemaSha256: '39ab81f893c01083fde975e4c57e31cea4d28e4086e45335d80f701ec9c2b2dc',
});

const expectedCounts = Object.freeze({
  constants: 109,
  types: 237,
  operations: 162,
  eventSubscriptions: 81,
  eventControls: 2,
  events: 81,
});

const forbiddenProvenance = [
  'openim-sdk-unix-harmony',
  'imsdk.har',
  '.aar',
  '.xcframework',
  '/users/',
  '/volumes/',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function validateUniAppSdkDocManifest(manifest) {
  assert(manifest?.schemaVersion === 1, 'Unsupported uni-app documentation manifest schema');
  assert(manifest?.sdkVersion === '0.2.0-rc.3', 'Unexpected uni-app SDK documentation version');
  assert(
    manifest?.baseline?.privateCommit === frozenBaseline.privateCommit,
    'Private commit baseline drifted',
  );
  assert(
    manifest?.baseline?.interfaceSha256 === frozenBaseline.interfaceSha256,
    'Consumer interface baseline drifted',
  );
  assert(
    manifest?.baseline?.responseSchemaSha256 === frozenBaseline.responseSchemaSha256,
    'Response schema baseline drifted',
  );
  assert(JSON.stringify(manifest.counts) === JSON.stringify(expectedCounts), 'Surface counts drifted');

  const serialized = JSON.stringify(manifest).toLowerCase();
  for (const forbidden of forbiddenProvenance) {
    assert(!serialized.includes(forbidden), `Manifest contains private native provenance: ${forbidden}`);
  }

  const commercialOperations = manifest.callables.filter(
    (item) => item.edition === 'commercial' && item.role === 'operation',
  ).length;
  const commercialEventSubscriptions = manifest.callables.filter(
    (item) => item.edition === 'commercial' && item.role === 'event-subscription',
  ).length;
  const commercialTypes = manifest.types.filter((item) => item.edition === 'commercial').length;
  const unsupportedHarmonyOperations = manifest.callables
    .filter((item) => item.role === 'operation' && item.platforms.harmony === 'platform-unsupported')
    .map((item) => item.name)
    .sort();
  const unsupportedHarmonyEvents = manifest.events
    .filter((item) => item.platforms.harmony === 'platform-unsupported')
    .map((item) => item.name)
    .sort();
  const syntheticEvents = manifest.events
    .filter((item) => item.synthetic)
    .map((item) => item.name)
    .sort();

  assert(commercialOperations === 51, 'Commercial operation count drifted');
  assert(commercialEventSubscriptions === 33, 'Commercial event subscription count drifted');
  assert(commercialTypes === 77, 'Commercial type count drifted');
  assert(manifest.typeExtensions.length === 6, 'Commercial type extension count drifted');
  assert(unsupportedHarmonyOperations.length === 4, 'Harmony unsupported operation count drifted');
  assert(unsupportedHarmonyEvents.length === 10, 'Harmony unsupported event count drifted');
  assert(
    !manifest.callables.some((item) => item.name === 'getArchivedConversationList'),
    'Retired getArchivedConversationList leaked into active documentation',
  );

  return {
    counts: manifest.counts,
    commercialOperations,
    commercialEventSubscriptions,
    commercialTypes,
    unsupportedHarmonyOperations,
    unsupportedHarmonyEvents,
    syntheticEvents,
    retiredCallables: manifest.retiredCallables,
  };
}

export const uniAppSdkDocumentationBaseline = frozenBaseline;
