import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const ownership = JSON.parse(readFileSync('data/structure/wasm-api-ownership.json', 'utf8'));
const flutterAudit = JSON.parse(readFileSync('data/structure/flutter-content-audit.json', 'utf8'));
const iosAudit = JSON.parse(readFileSync('data/structure/ios-content-audit.json', 'utf8'));

const commercialMethods = [
  'speechToTextCapabilities',
  'speechToText',
  'getConversationGroupInfoWithConversations',
  'getConversationGroupIDsByConversationID',
  'removeConversationsFromGroups',
  'addConversationsToGroups',
  'setConversationGroupOrder',
  'getConversationGroups',
  'deleteConversationGroup',
  'updateConversationGroup',
  'createConversationGroup',
  'getConversationPinnedMsg',
  'setConversationPinnedMsg',
  'deleteMessages',
  'modifyMessage',
  'getSignalingInvitationInfoStartApp',
  'signalingGetTokenByRoomID',
  'signalingGetRoomByGroupID',
  'signalingHungUp',
  'signalingCancel',
  'signalingReject',
  'signalingAccept',
  'signalingInviteInGroup',
  'signalingInvite',
  'deleteGroupRequests',
  'deleteFriendRequests',
  'fetchSurroundingMessages',
  'getAdvancedHistoryMessageListReverse',
  'sendGroupMessageReadReceipt',
  'getGroupMessageReaderList',
];

const commercialEvents = [
  'OnChangedPinnedMsg',
  'OnConversationGroupAdded',
  'OnConversationGroupChanged',
  'OnConversationGroupDeleted',
  'OnConversationGroupMemberAdded',
  'OnConversationGroupMemberDeleted',
  'OnMsgDeleted',
  'OnMessageModified',
  'OnReceiveNewInvitation',
  'OnInviteeAccepted',
  'OnInviteeAcceptedByOtherDevice',
  'OnInviteeRejected',
  'OnInviteeRejectedByOtherDevice',
  'OnInvitationCancelled',
  'OnInvitationTimeout',
  'OnHangUp',
  'OnRoomParticipantConnected',
  'OnRoomParticipantDisconnected',
  'OnStreamChange',
  'OnFriendApplicationDeleted',
  'OnGroupApplicationDeleted',
  'OnRecvGroupReadReceipt',
];

const nonCommercialSamePageMethods = [
  'revokeMessage',
  'deleteMessageFromLocalStorage',
  'addFriend',
  'acceptFriendApplication',
  'acceptGroupApplication',
  'getAdvancedHistoryMessageList',
  'findMessageList',
];

const nonCommercialEvents = [
  'OnNewRecvMessageRevoked',
  'OnRecvMessageRevoked',
  'OnRecvC2CReadReceipt',
];

const platformSymbolAliases = {
  flutter: {
    getConversationGroupByConversationID: 'getConversationGroupIDsByConversationID',
    onHangup: 'OnHangUp',
  },
  ios: {
    getSignalingInvitationInfoStartAppWithOnSuccess: 'getSignalingInvitationInfoStartApp',
    getConversationPinnedMsgWithConversationID: 'getConversationPinnedMsg',
    modifyMessageWithConversationID: 'modifyMessage',
    onHunguUp: 'OnHangUp',
    Open_im_sdkAddConversationsToGroups: 'addConversationsToGroups',
    Open_im_sdkCreateConversationGroup: 'createConversationGroup',
    Open_im_sdkDeleteConversationGroup: 'deleteConversationGroup',
    Open_im_sdkGetConversationGroupByConversationID:
      'getConversationGroupIDsByConversationID',
    Open_im_sdkGetConversationGroupInfoWithConversations:
      'getConversationGroupInfoWithConversations',
    Open_im_sdkGetConversationGroups: 'getConversationGroups',
    Open_im_sdkRemoveConversationsFromGroups: 'removeConversationsFromGroups',
    Open_im_sdkSetConversationGroupOrder: 'setConversationGroupOrder',
    Open_im_sdkSpeechToText: 'speechToText',
    Open_im_sdkSpeechToTextCapabilities: 'speechToTextCapabilities',
    Open_im_sdkUpdateConversationGroup: 'updateConversationGroup',
    setConversationPinnedMsgWithConversationID: 'setConversationPinnedMsg',
  },
};

const partialCommercialConceptSources = {
  '/sdk/wasm/calling/overview-calling': [
    '/sdk/wasm/calling/managing-calls/start-or-handle-a-call',
    '/sdk/wasm/calling/retrieving-call-information/retrieve-call-information',
  ],
  '/sdk/flutter/calling/overview-calling': [
    '/sdk/flutter/calling/managing-calls/start-or-handle-a-call',
    '/sdk/flutter/calling/retrieving-call-information/retrieve-call-information',
  ],
  '/sdk/ios/calling/overview-calling': [
    '/sdk/ios/calling/managing-calls/start-or-handle-a-call',
    '/sdk/ios/calling/retrieving-call-information/retrieve-call-information',
  ],
};

function getWasmPageCommercialInfo(pagePath) {
  const documentedMethods = ownership.methods.filter(
    (entry) => entry.page === pagePath && entry.status === 'documented',
  );
  const methods = documentedMethods
    .filter((entry) => entry.commercial)
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  const openSourceMethods = documentedMethods
    .filter((entry) => !entry.commercial)
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  const events = ownership.events
    .filter((entry) => entry.page === pagePath && entry.commercial)
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  if (methods.length === 0 && events.length === 0) {
    return { kind: 'none', methods, openSourceMethods, events };
  }

  return {
    kind:
      documentedMethods.length > 0 && methods.length === documentedMethods.length
        ? 'full'
        : 'partial',
    methods,
    openSourceMethods,
    events,
  };
}

function normalizePlatformSymbol(platform, symbol, type) {
  const selectorBase = symbol.split(':', 1)[0];
  const alias = platformSymbolAliases[platform][selectorBase];
  if (alias) return alias;
  if (type === 'event' && selectorBase.startsWith('on')) return `On${selectorBase.slice(2)}`;
  return selectorBase;
}

function getPageCommercialInfo(pagePath) {
  const conceptSources = partialCommercialConceptSources[pagePath];
  if (conceptSources) {
    const sourceInfo = conceptSources.map((sourcePath) => getPageCommercialInfo(sourcePath));
    return {
      kind: 'partial',
      methods: [...new Set(sourceInfo.flatMap((info) => info.methods))].sort((left, right) =>
        left.localeCompare(right),
      ),
      openSourceMethods: [],
      events: [...new Set(sourceInfo.flatMap((info) => info.events))].sort((left, right) =>
        left.localeCompare(right),
      ),
    };
  }

  const match = pagePath.match(/^\/sdk\/(wasm|flutter|ios)(\/.*)$/);
  if (!match) return { kind: 'none', methods: [], openSourceMethods: [], events: [] };

  const platform = match[1];
  const wasmPath = `/sdk/wasm${match[2]}`;
  if (platform === 'wasm') return getWasmPageCommercialInfo(wasmPath);

  const audit = platform === 'flutter' ? flutterAudit : iosAudit;
  const page = audit.pages.find(
    (entry) => entry.currentPath === pagePath && entry.disposition !== 'omit',
  );
  if (!page) return { kind: 'none', methods: [], openSourceMethods: [], events: [] };

  const commercialMethodSet = new Set(commercialMethods);
  const commercialEventSet = new Set(commercialEvents);
  const methods = page.sdkMethods.filter((name) =>
    commercialMethodSet.has(normalizePlatformSymbol(platform, name, 'method')),
  );
  const openSourceMethods = page.sdkMethods.filter((name) => !methods.includes(name));
  const events = page.sdkEvents.filter((name) =>
    commercialEventSet.has(normalizePlatformSymbol(platform, name, 'event')),
  );

  if (methods.length === 0 && events.length === 0) {
    return { kind: 'none', methods: [], openSourceMethods, events: [] };
  }

  return {
    kind: getWasmPageCommercialInfo(wasmPath).kind === 'full' ? 'full' : 'partial',
    methods: methods.sort((left, right) => left.localeCompare(right)),
    openSourceMethods: openSourceMethods.sort((left, right) => left.localeCompare(right)),
    events: events.sort((left, right) => left.localeCompare(right)),
  };
}

test('marks the commercial method inventory', () => {
  for (const name of commercialMethods) {
    const entry = ownership.methods.find((method) => method.name === name);
    assert.ok(entry, `missing method ${name}`);
    assert.equal(entry.commercial, true, `${name} must be commercial`);
  }
});

test('marks the commercial event inventory', () => {
  for (const name of commercialEvents) {
    const entry = ownership.events.find((event) => event.name === name);
    assert.ok(entry, `missing event ${name}`);
    assert.equal(entry.commercial, true, `${name} must be commercial`);
  }
});

test('does not mark open-source methods on mixed pages as commercial', () => {
  for (const name of nonCommercialSamePageMethods) {
    const entry = ownership.methods.find((method) => method.name === name);
    assert.ok(entry, `missing method ${name}`);
    assert.equal(entry.commercial, undefined, `${name} must not be commercial`);
  }
});

test('does not mark open-source events as commercial', () => {
  for (const name of nonCommercialEvents) {
    const entry = ownership.events.find((event) => event.name === name);
    assert.ok(entry, `missing event ${name}`);
    assert.equal(entry.commercial, undefined, `${name} must not be commercial`);
  }
});

test('classifies full commercial pages', () => {
  assert.equal(
    getPageCommercialInfo(
      '/sdk/wasm/conversation/managing-conversation-groups/manage-conversation-groups',
    ).kind,
    'full',
  );
  assert.equal(
    getPageCommercialInfo('/sdk/wasm/message/managing-messages/pin-conversation-messages').kind,
    'full',
  );
  assert.equal(
    getPageCommercialInfo('/sdk/wasm/calling/managing-calls/start-or-handle-a-call').kind,
    'full',
  );
});

test('applies the WASM commercial presentation to verified Flutter and iOS capabilities', () => {
  const flutterGroups = getPageCommercialInfo(
    '/sdk/flutter/conversation/managing-conversation-groups/manage-conversation-groups',
  );
  assert.equal(flutterGroups.kind, 'full');
  assert.ok(flutterGroups.methods.includes('createConversationGroup'));
  assert.ok(flutterGroups.methods.includes('getConversationGroupByConversationID'));
  assert.ok(flutterGroups.events.includes('onConversationGroupAdded'));

  const flutterCalls = getPageCommercialInfo(
    '/sdk/flutter/calling/managing-calls/start-or-handle-a-call',
  );
  assert.equal(flutterCalls.kind, 'full');
  assert.ok(flutterCalls.events.includes('onHangup'));

  const iosCalls = getPageCommercialInfo('/sdk/ios/calling/managing-calls/start-or-handle-a-call');
  assert.equal(iosCalls.kind, 'full');
  assert.ok(iosCalls.methods.includes('signalingInvite:offlinePushInfo:onSuccess:onFailure:'));
  assert.ok(iosCalls.events.includes('onHunguUp:'));

  const iosCallInfo = getPageCommercialInfo(
    '/sdk/ios/calling/retrieving-call-information/retrieve-call-information',
  );
  assert.equal(iosCallInfo.kind, 'full');
  assert.ok(
    iosCallInfo.methods.includes('getSignalingInvitationInfoStartAppWithOnSuccess:onFailure:'),
  );

  const iosGroups = getPageCommercialInfo(
    '/sdk/ios/conversation/managing-conversation-groups/manage-conversation-groups',
  );
  assert.equal(iosGroups.kind, 'full');
  assert.ok(iosGroups.methods.includes('Open_im_sdkCreateConversationGroup'));
  assert.ok(iosGroups.events.includes('onConversationGroupAdded:'));

  const iosModify = getPageCommercialInfo(
    '/sdk/ios/message/managing-messages/modify-a-message',
  );
  assert.equal(iosModify.kind, 'full');
  assert.ok(
    iosModify.methods.includes('modifyMessageWithConversationID:message:onSuccess:onFailure:'),
  );

  const iosPinned = getPageCommercialInfo(
    '/sdk/ios/message/managing-messages/pin-conversation-messages',
  );
  assert.equal(iosPinned.kind, 'full');
  assert.ok(iosPinned.events.includes('onChangedPinnedMsg:'));

  const iosTranscription = getPageCommercialInfo(
    '/sdk/ios/message/composing-messages/transcribe-audio',
  );
  assert.equal(iosTranscription.kind, 'partial');
  assert.ok(iosTranscription.methods.includes('Open_im_sdkSpeechToText'));
  assert.ok(
    iosTranscription.openSourceMethods.includes(
      'setMessageLocalEx:clientMsgID:localEx:onSuccess:onFailure:',
    ),
  );

  const flutterModify = getPageCommercialInfo(
    '/sdk/flutter/message/managing-messages/modify-a-message',
  );
  assert.equal(flutterModify.kind, 'full');
  assert.ok(flutterModify.methods.includes('modifyMessage'));
  assert.ok(flutterModify.events.includes('onMessageModified'));

  const flutterPinned = getPageCommercialInfo(
    '/sdk/flutter/message/managing-messages/pin-conversation-messages',
  );
  assert.equal(flutterPinned.kind, 'full');
  assert.ok(flutterPinned.methods.includes('setConversationPinnedMsg'));
  assert.ok(flutterPinned.events.includes('onChangedPinnedMsg'));

  const flutterTranscription = getPageCommercialInfo(
    '/sdk/flutter/message/composing-messages/transcribe-audio',
  );
  assert.equal(flutterTranscription.kind, 'partial');
  assert.ok(flutterTranscription.methods.includes('speechToText'));
  assert.ok(flutterTranscription.openSourceMethods.includes('setMessageLocalContent'));
});

test('marks calling overviews as mixed while preserving verified platform symbols', () => {
  const wasmOverview = getPageCommercialInfo('/sdk/wasm/calling/overview-calling');
  assert.equal(wasmOverview.kind, 'partial');
  assert.ok(wasmOverview.methods.includes('signalingInvite'));
  assert.ok(wasmOverview.events.includes('OnReceiveNewInvitation'));

  const flutterOverview = getPageCommercialInfo('/sdk/flutter/calling/overview-calling');
  assert.equal(flutterOverview.kind, 'partial');
  assert.ok(flutterOverview.methods.includes('signalingInvite'));
  assert.ok(flutterOverview.events.includes('onReceiveNewInvitation'));

  const iosOverview = getPageCommercialInfo('/sdk/ios/calling/overview-calling');
  assert.equal(iosOverview.kind, 'partial');
  assert.ok(
    iosOverview.methods.includes('signalingInvite:offlinePushInfo:onSuccess:onFailure:'),
  );
  assert.ok(iosOverview.events.includes('onReceiveNewInvitation:'));
});

test('does not infer commercial presentation for absent or open-source native capabilities', () => {
  assert.equal(
    getPageCommercialInfo('/sdk/flutter/calling/sending-custom-signals/send-a-custom-signal').kind,
    'none',
  );
  assert.equal(
    getPageCommercialInfo('/sdk/ios/calling/sending-custom-signals/send-a-custom-signal').kind,
    'none',
  );
  assert.equal(
    getPageCommercialInfo('/sdk/flutter/message/managing-read-status/manage-message-read-receipts')
      .kind,
    'none',
  );
});

test('classifies mixed commercial pages', () => {
  const deletePage = getPageCommercialInfo('/sdk/wasm/message/managing-messages/delete-a-message');
  assert.equal(deletePage.kind, 'partial');
  assert.deepEqual(deletePage.methods, ['deleteMessages']);
  assert.ok(deletePage.openSourceMethods.includes('revokeMessage') === false);
  assert.ok(deletePage.openSourceMethods.includes('deleteMessageFromLocalStorage'));

  assert.equal(
    getPageCommercialInfo('/sdk/wasm/message/managing-messages/revoke-a-message').kind,
    'none',
  );

  assert.equal(
    getPageCommercialInfo('/sdk/wasm/message/managing-messages/modify-a-message').kind,
    'full',
  );

  const history = getPageCommercialInfo(
    '/sdk/wasm/message/retrieving-messages/retrieve-message-history',
  );
  assert.equal(history.kind, 'partial');
  assert.deepEqual(history.methods, ['getAdvancedHistoryMessageListReverse']);
  assert.ok(history.openSourceMethods.includes('getAdvancedHistoryMessageList'));

  assert.equal(
    getPageCommercialInfo('/sdk/wasm/user/managing-friends/manage-friend-requests').kind,
    'partial',
  );
  assert.equal(
    getPageCommercialInfo('/sdk/wasm/group/managing-group-applications/manage-group-applications')
      .kind,
    'partial',
  );
});

test('matches commercial symbols in inline code text', () => {
  function matchCommercialSymbol(codeText, commercialNames) {
    if (commercialNames.size === 0) return null;
    const trimmed = codeText.trim();
    const withoutCall = trimmed.replace(/\(\s*\)$/, '');
    const candidates = [
      withoutCall,
      withoutCall.replace(/^OpenIM\./, ''),
      withoutCall.replace(/^CbEvents\./, ''),
      withoutCall.includes('.') ? (withoutCall.split('.').at(-1) ?? withoutCall) : withoutCall,
    ];
    for (const candidate of candidates) {
      if (commercialNames.has(candidate)) return candidate;
    }
    return null;
  }

  const names = new Set(['getAdvancedHistoryMessageListReverse', 'OnMsgDeleted']);
  assert.equal(
    matchCommercialSymbol('getAdvancedHistoryMessageListReverse()', names),
    'getAdvancedHistoryMessageListReverse',
  );
  assert.equal(
    matchCommercialSymbol('OpenIM.getAdvancedHistoryMessageListReverse', names),
    matchCommercialSymbol('openimsdk.getAdvancedHistoryMessageListReverse', names),
    'getAdvancedHistoryMessageListReverse',
  );
  assert.equal(matchCommercialSymbol('CbEvents.OnMsgDeleted', names), 'OnMsgDeleted');
  assert.equal(matchCommercialSymbol('getAdvancedHistoryMessageList()', names), null);
});

test('leaves non-commercial pages unmarked', () => {
  assert.equal(
    getPageCommercialInfo('/sdk/wasm/getting-started/authenticate-and-manage-session').kind,
    'none',
  );
});
