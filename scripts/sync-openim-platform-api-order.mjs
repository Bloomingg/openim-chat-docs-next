import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
const localRoot = '/docs/chat/platform-api/v3';
const contextKey = 'chat/platform-api/v3';
const contentRoot = 'content/docs/chat/platform-api/v3';
const zhContentRoot = 'content/zh/docs/chat/platform-api/v3';

const routesPath = resolve(root, 'src/generated/routes.json');
const navigationPath = resolve(root, 'src/generated/navigation.json');
const platformApiZhPath = resolve(root, 'src/generated/platform-api-zh-content.json');
const structurePath = resolve(root, 'data/structure/chat-pages.json');

const desiredPlatformOrder = [
  'overview',
  'prepare-to-use-api',
  'user',
  'auth',
  'friend',
  'group',
  'conversation',
  'message',
  'third',
];

const removedPlatformRoots = [
  'channel',
  'migration',
  'moderation',
  'user/creating-users',
  'user/listing-users',
  'user/managing-users',
  'user/managing-session-tokens',
  'message/messaging-basics',
];
const removedRoutePrefixes = removedPlatformRoots.map((segment) => `${localRoot}/${segment}`);

const moduleOverviews = [
  {
    id: 'user',
    title: '用户概览',
    navLabel: '用户',
    description:
      'OpenIM Platform API 用户模块概览，覆盖用户注册、资料维护、在线状态、订阅状态和通知账号。',
    intro:
      '用户模块面向可信后端服务，用于把业务系统账号映射为 OpenIM 用户，并维护用户资料、在线状态和系统通知账号。管理员 Token 只能保存在后端，客户端不应直接调用这些管理端接口。',
    capabilities: [
      ['用户注册', '注册业务用户 ID，并写入昵称、头像和扩展字段。'],
      ['资料维护', '更新用户基础资料、扩展资料和全局消息接收选项。'],
      ['用户查询', '分页读取用户、批量获取用户资料、校验账号是否存在。'],
      ['在线状态', '查询用户在线状态、订阅状态和在线 Token 详情。'],
      ['通知账号', '创建、更新和搜索系统通知账号。'],
    ],
    commonLinks: [
      ['注册用户', '/docs/chat/platform-api/v3/user/user-register'],
      ['更新用户信息', '/docs/chat/platform-api/v3/user/update-user-info'],
      ['分页获取用户列表', '/docs/chat/platform-api/v3/user/get-users'],
      ['获取用户在线状态', '/docs/chat/platform-api/v3/user/get-users-online-status'],
      ['新增系统通知账号', '/docs/chat/platform-api/v3/user/add-notification-account'],
    ],
    advice: [
      '用户 ID 应以业务系统为权威来源。创建 OpenIM 用户前，先确认业务账号已经完成注册、风控和权限校验。',
      '客户端登录时，应先向业务后端请求登录凭证，再由后端调用认证接口签发用户 Token。',
    ],
  },
  {
    id: 'auth',
    title: '认证概览',
    navLabel: '认证',
    description: 'OpenIM Platform API 认证模块概览，覆盖管理员 Token、用户 Token、Token 解析和强制下线。',
    intro:
      '认证模块用于后端获取管理端调用凭证、为客户端签发用户 Token，并在安全场景下解析 Token 或强制用户下线。',
    capabilities: [
      ['管理员 Token', '通过管理员凭据获取后端调用管理端 API 所需的 Token。'],
      ['用户 Token', '为指定用户和平台签发客户端登录 Token。'],
      ['Token 解析', '校验 Token 并解析用户、平台等上下文信息。'],
      ['强制下线', '让指定用户端会话失效，适用于封禁、改密和风险处置。'],
    ],
    commonLinks: [
      ['获取管理员 Token', '/docs/chat/platform-api/v3/auth/get-admin-token'],
      ['获取用户 Token', '/docs/chat/platform-api/v3/auth/get-user-token'],
      ['解析 Token', '/docs/chat/platform-api/v3/auth/parse-token'],
      ['强制用户下线', '/docs/chat/platform-api/v3/auth/force-logout'],
    ],
    advice: [
      '管理员 Token 只应保存在可信后端服务中，不要写入前端环境变量、移动端包体或浏览器代码。',
      '用户 Token 的签发应绑定业务登录态，并结合业务侧风控、封禁和权限校验。',
    ],
  },
  {
    id: 'friend',
    title: '好友概览',
    navLabel: '好友',
    description: 'OpenIM Platform API 好友模块概览，覆盖好友关系、好友申请、黑名单和好友资料维护。',
    intro:
      '好友模块用于维护用户之间的好友关系、好友申请流程和黑名单数据。所有接口都应由可信后端根据业务规则调用。',
    capabilities: [
      ['好友关系', '添加、删除、导入、校验好友关系，并读取好友 ID 或好友资料。'],
      ['好友申请', '查询收到或发出的申请，处理好友申请和查询指定申请。'],
      ['黑名单', '加入黑名单、移除黑名单，以及分页或批量查询黑名单数据。'],
      ['资料维护', '设置好友备注、更新好友扩展信息。'],
      ['未处理计数', '获取当前用户未处理好友申请数量。'],
    ],
    commonLinks: [
      ['发送好友申请', '/docs/chat/platform-api/v3/friend/add-friend'],
      ['处理好友申请', '/docs/chat/platform-api/v3/friend/respond-friend-application'],
      ['获取好友列表', '/docs/chat/platform-api/v3/friend/get-friend-list'],
      ['加入黑名单', '/docs/chat/platform-api/v3/friend/add-black'],
      ['获取未处理好友申请数量', '/docs/chat/platform-api/v3/friend/get-self-unhandled-apply-count'],
    ],
    advice: [
      '好友关系通常需要结合业务侧隐私、风控和通知策略处理，后端应在调用前完成权限校验。',
      '黑名单会影响用户间互动能力，建议记录操作来源和操作人，便于审计。',
    ],
  },
  {
    id: 'group',
    title: '群组概览',
    navLabel: '群组',
    description: 'OpenIM Platform API 群组模块概览，覆盖建群、入群申请、成员管理、禁言和群资料维护。',
    intro:
      '群组模块用于由后端创建和管理群聊，包括群资料、群成员、入群申请、群主转让、禁言和全量数据读取。',
    capabilities: [
      ['群组管理', '创建群组、更新群资料、解散群组和转让群主。'],
      ['入群流程', '申请入群、处理入群申请、查询收到或发出的申请。'],
      ['成员管理', '邀请成员、移除成员、查询成员资料和成员列表。'],
      ['禁言控制', '禁言群成员、取消成员禁言、禁言群组和取消群组禁言。'],
      ['全量读取', '读取群成员用户 ID、用户加入群组 ID 和未处理申请数量。'],
    ],
    commonLinks: [
      ['创建群组', '/docs/chat/platform-api/v3/group/create-group'],
      ['邀请用户进群', '/docs/chat/platform-api/v3/group/invite-users-to-group'],
      ['获取群成员列表', '/docs/chat/platform-api/v3/group/get-group-member-list'],
      ['禁言群成员', '/docs/chat/platform-api/v3/group/mute-group-member'],
      ['获取未处理入群申请数量', '/docs/chat/platform-api/v3/group/get-group-application-unhandled-count'],
    ],
    advice: [
      '群组操作通常影响多个用户，建议后端记录 `operationID`、操作人、目标群组和成员列表。',
      '禁言、踢人和解散群组属于高影响操作，应结合业务权限和审计流程使用。',
    ],
  },
  {
    id: 'conversation',
    title: '会话概览',
    navLabel: '会话',
    description: 'OpenIM Platform API 会话模块概览，覆盖会话读取、批量设置、置顶、免打扰和离线推送用户。',
    intro:
      '会话模块用于后端读取和维护用户会话数据，包括排序会话、批量会话、置顶会话、免打扰会话和离线推送关联用户。',
    capabilities: [
      ['会话读取', '获取排序会话列表、全部会话、单个会话或批量会话。'],
      ['会话设置', '批量设置会话属性和扩展数据。'],
      ['离线推送', '读取会话离线推送关联的用户 ID。'],
      ['全量同步', '全量获取用户会话 ID。'],
      ['状态筛选', '读取置顶会话 ID 和免打扰会话 ID。'],
    ],
    commonLinks: [
      ['获取排序会话列表', '/docs/chat/platform-api/v3/conversation/get-sorted-conversation-list'],
      ['获取全部会话', '/docs/chat/platform-api/v3/conversation/get-all-conversations'],
      ['批量获取会话', '/docs/chat/platform-api/v3/conversation/get-conversations'],
      ['批量设置会话', '/docs/chat/platform-api/v3/conversation/set-conversations'],
      ['获取置顶会话 ID', '/docs/chat/platform-api/v3/conversation/get-pinned-conversation-ids'],
    ],
    advice: [
      '会话数据通常用于后台管理、数据修复和多端同步辅助，不建议由客户端直接调用管理端接口。',
      '批量设置会话前应确认目标用户和会话 ID 的归属关系，避免误改其他用户会话。',
    ],
  },
  {
    id: 'message',
    title: '消息概览',
    navLabel: '消息',
    description: 'OpenIM Platform API 消息模块概览，覆盖后端发送消息、系统通知、消息查询、已读标记和消息删除。',
    intro:
      '消息模块用于让可信后端发送消息、发送业务通知、查询消息、维护已读序列号，并在管理场景中撤回、清理或删除消息。',
    capabilities: [
      ['后端发送', '发送单条消息、批量发送消息或发送业务通知。'],
      ['消息查询', '按条件搜索消息，或按序列号拉取消息。'],
      ['已读维护', '标记消息或会话已读，设置会话已读序列号。'],
      ['消息删除', '清空会话消息、清空用户全部消息、逻辑删除或物理删除消息。'],
      ['状态辅助', '获取最新序列号、检查发送结果和获取服务器时间。'],
    ],
    commonLinks: [
      ['发送单条消息', '/docs/chat/platform-api/v3/message/send-msg'],
      ['批量发送消息', '/docs/chat/platform-api/v3/message/batch-send-msg'],
      ['搜索消息', '/docs/chat/platform-api/v3/message/search-msg'],
      ['撤回消息', '/docs/chat/platform-api/v3/message/revoke-msg'],
      ['获取服务器时间', '/docs/chat/platform-api/v3/message/get-server-time'],
    ],
    advice: [
      '后端发送消息前，应确认发送身份、目标会话和消息内容都来自可信业务流程。',
      '删除和物理删除消息属于高影响操作，建议先记录审计日志，并限制在后台管理或合规场景使用。',
    ],
  },
  {
    id: 'third',
    title: '第三方服务概览',
    navLabel: '第三方服务',
    description: 'OpenIM Platform API 第三方服务模块概览，覆盖监控、FCM、应用角标、日志和对象存储。',
    intro:
      '第三方服务模块连接 OpenIM 周边能力，包括监控面板、推送 Token、应用角标、客户端日志和对象存储上传。',
    capabilities: [
      ['监控', '跳转 Prometheus 或 Grafana 监控面板。'],
      ['推送辅助', '更新 FCM Token，设置应用角标。'],
      ['日志管理', '上传、删除和搜索客户端日志。'],
      ['对象上传', '获取分片上传限制、初始化上传、刷新签名并完成上传。'],
      ['访问地址', '获取对象访问 URL 或通过对象路径重定向访问。'],
    ],
    commonLinks: [
      ['跳转监控面板', '/docs/chat/platform-api/v3/third/prometheus'],
      ['更新 FCM Token', '/docs/chat/platform-api/v3/third/fcm-update-token'],
      ['上传日志记录', '/docs/chat/platform-api/v3/third/upload-logs'],
      ['初始化分片上传', '/docs/chat/platform-api/v3/third/initiate-multipart-upload'],
      ['获取对象访问地址', '/docs/chat/platform-api/v3/third/access-url'],
    ],
    advice: [
      '对象存储签名和日志接口通常需要结合业务侧权限校验，避免任意用户上传或读取非授权资源。',
      '监控入口和日志查询适合后台使用，不应直接暴露给普通客户端。',
    ],
  },
];

const linkReplacements = [
  [
    '/docs/chat/platform-api/v3/channel/creating-a-channel/create-a-group-channel',
    '/docs/chat/platform-api/v3/group/create-group',
  ],
  [
    '/docs/chat/platform-api/v3/channel/inviting-a-user/invite-as-members-channel',
    '/docs/chat/platform-api/v3/group/invite-users-to-group',
  ],
  [
    '/docs/chat/platform-api/v3/channel/managing-a-channel/update-a-group-channel',
    '/docs/chat/platform-api/v3/group/set-group-info',
  ],
  [
    '/docs/chat/platform-api/v3/channel/managing-a-channel/delete-a-group-channel',
    '/docs/chat/platform-api/v3/group/dismiss-group',
  ],
  [
    '/docs/chat/platform-api/v3/channel/managing-a-channel/join-a-channel',
    '/docs/chat/platform-api/v3/group/join-group',
  ],
  [
    '/docs/chat/platform-api/v3/channel/managing-a-channel/leave-a-channel',
    '/docs/chat/platform-api/v3/group/quit-group',
  ],
  [
    '/docs/chat/platform-api/v3/channel/listing-users/list-members-of-a-group-channel',
    '/docs/chat/platform-api/v3/group/get-group-member-list',
  ],
  ['/docs/chat/platform-api/v3/channel/overview', '/docs/chat/platform-api/v3/group/create-group'],
  [
    '/docs/chat/platform-api/v3/user/creating-users/create-a-user',
    '/docs/chat/platform-api/v3/user/user-register',
  ],
  [
    '/docs/chat/platform-api/v3/user/listing-users/list-users',
    '/docs/chat/platform-api/v3/user/get-users',
  ],
  [
    '/docs/chat/platform-api/v3/user/listing-users/get-a-user',
    '/docs/chat/platform-api/v3/user/get-users-info',
  ],
  [
    '/docs/chat/platform-api/v3/user/managing-users/update-a-user',
    '/docs/chat/platform-api/v3/user/update-user-info',
  ],
  [
    '/docs/chat/platform-api/v3/user/managing-session-tokens/issue-a-session-token',
    '/docs/chat/platform-api/v3/auth/get-user-token',
  ],
  [
    '/docs/chat/platform-api/v3/user/managing-session-tokens/revoke-all-session-tokens',
    '/docs/chat/platform-api/v3/auth/force-logout',
  ],
  [
    '/docs/chat/platform-api/v3/message/messaging-basics/send-a-message',
    '/docs/chat/platform-api/v3/message/send-msg',
  ],
  [
    '/docs/chat/platform-api/v3/migration/migrate-messages',
    '/docs/chat/platform-api/v3/message/send-msg',
  ],
  [
    '/docs/chat/platform-api/v3/migration/overview',
    '/docs/chat/platform-api/v3/message/overview',
  ],
  [
    '/docs/chat/platform-api/v3/moderation/blocking-users/block-users',
    '/docs/chat/platform-api/v3/friend/add-black',
  ],
  [
    '/docs/chat/platform-api/v3/moderation/blocking-users/unblock-a-user',
    '/docs/chat/platform-api/v3/friend/remove-black',
  ],
  [
    '/docs/chat/platform-api/v3/moderation/muting-a-user/mute-a-member-in-a-group-channel',
    '/docs/chat/platform-api/v3/group/mute-group-member',
  ],
  [
    '/docs/chat/platform-api/v3/moderation/muting-a-user/unmute-a-member-in-a-group-channel',
    '/docs/chat/platform-api/v3/group/cancel-mute-group-member',
  ],
  [
    '/docs/chat/platform-api/v3/moderation/overview',
    '/docs/chat/platform-api/v3/group/mute-group-member',
  ],
];

const textReplacements = [
  ['### 群组频道', '### 群组'],
  [
    'OpenIM 使用群组能力承载群聊场景。文档中的“群组频道”概念在这里映射为 OpenIM 群组、群成员和入群申请。',
    'OpenIM 使用群组能力承载群聊场景。服务端可通过群组接口创建群组、邀请成员和处理入群流程。',
  ],
  [
    '[创建群组频道](/docs/chat/platform-api/v3/group/create-group)',
    '[创建群组](/docs/chat/platform-api/v3/group/create-group)',
  ],
  [
    '[频道概览](/docs/chat/platform-api/v3/group/create-group)',
    '[群组接口](/docs/chat/platform-api/v3/group/create-group)',
  ],
  [
    '[创建用户](/docs/chat/platform-api/v3/user/user-register)',
    '[注册用户](/docs/chat/platform-api/v3/user/user-register)',
  ],
  [
    '[查询用户列表](/docs/chat/platform-api/v3/user/get-users)',
    '[分页获取用户列表](/docs/chat/platform-api/v3/user/get-users)',
  ],
  [
    '[获取用户](/docs/chat/platform-api/v3/user/get-users-info)',
    '[获取指定用户信息](/docs/chat/platform-api/v3/user/get-users-info)',
  ],
  [
    '[更新用户](/docs/chat/platform-api/v3/user/update-user-info)',
    '[更新用户信息](/docs/chat/platform-api/v3/user/update-user-info)',
  ],
  [
    '[签发会话 Token](/docs/chat/platform-api/v3/auth/get-user-token)',
    '[获取用户 Token](/docs/chat/platform-api/v3/auth/get-user-token)',
  ],
  [
    '[注销全部会话 Token](/docs/chat/platform-api/v3/auth/force-logout)',
    '[强制用户下线](/docs/chat/platform-api/v3/auth/force-logout)',
  ],
  [
    '[发送消息](/docs/chat/platform-api/v3/message/send-msg)',
    '[发送单条消息](/docs/chat/platform-api/v3/message/send-msg)',
  ],
  [
    '[迁移消息](/docs/chat/platform-api/v3/message/send-msg)',
    '[发送单条消息](/docs/chat/platform-api/v3/message/send-msg)',
  ],
  [
    '[迁移概览](/docs/chat/platform-api/v3/message/overview)',
    '[消息概览](/docs/chat/platform-api/v3/message/overview)',
  ],
  [
    '[屏蔽用户](/docs/chat/platform-api/v3/friend/add-black)',
    '[加入黑名单](/docs/chat/platform-api/v3/friend/add-black)',
  ],
  [
    '[取消屏蔽用户](/docs/chat/platform-api/v3/friend/remove-black)',
    '[移除黑名单](/docs/chat/platform-api/v3/friend/remove-black)',
  ],
  [
    '[禁言群组成员](/docs/chat/platform-api/v3/group/mute-group-member)',
    '[禁言群成员](/docs/chat/platform-api/v3/group/mute-group-member)',
  ],
  [
    '[禁言群组频道成员](/docs/chat/platform-api/v3/group/mute-group-member)',
    '[禁言群成员](/docs/chat/platform-api/v3/group/mute-group-member)',
  ],
  [
    '[解除群组成员禁言](/docs/chat/platform-api/v3/group/cancel-mute-group-member)',
    '[取消禁言群成员](/docs/chat/platform-api/v3/group/cancel-mute-group-member)',
  ],
  [
    '[解除群组频道成员禁言](/docs/chat/platform-api/v3/group/cancel-mute-group-member)',
    '[取消禁言群成员](/docs/chat/platform-api/v3/group/cancel-mute-group-member)',
  ],
  [
    '[内容审核概览](/docs/chat/platform-api/v3/group/mute-group-member)',
    '[禁言群成员](/docs/chat/platform-api/v3/group/mute-group-member)',
  ],
];

await Promise.all([
  ...removedPlatformRoots.map((segment) =>
    rm(resolve(root, `${contentRoot}/${segment}`), { force: true, recursive: true }),
  ),
  ...removedPlatformRoots.map((segment) =>
    rm(resolve(root, `${zhContentRoot}/${segment}`), { force: true, recursive: true }),
  ),
]);
await writeModuleOverviewFiles();

const routes = JSON.parse(await readFile(routesPath, 'utf8'));
const navigation = JSON.parse(await readFile(navigationPath, 'utf8'));
const platformApiZh = JSON.parse(await readFile(platformApiZhPath, 'utf8'));

const nextRoutes = upsertModuleOverviewRoutes(routes.filter((route) => !isRemovedPlatformPath(route.path)))
  .map((route, index) => ({ ...route, id: index + 1 }));

const platformContext = navigation.contexts.find((context) => context.key === contextKey);
if (!platformContext) {
  throw new Error(`Missing navigation context: ${contextKey}`);
}

platformContext.nodes = reorderPlatformNodes(
  ensureModuleOverviewNodes(removeRemovedNodes(platformContext.nodes), nextRoutes),
);
platformContext.pageCount = nextRoutes.filter((route) => route.contextKey === contextKey).length;

platformApiZh.generatedAt = today;
for (const label of ['channel', 'migration', 'moderation']) {
  delete platformApiZh.navigationLabels?.[label];
}
for (const overview of moduleOverviews) {
  platformApiZh.navigationLabels = {
    ...platformApiZh.navigationLabels,
    [overview.id]: overview.navLabel,
  };
}

await Promise.all([
  writeFile(routesPath, `${JSON.stringify(nextRoutes, null, 2)}\n`, 'utf8'),
  writeFile(navigationPath, `${JSON.stringify(navigation, null, 2)}\n`, 'utf8'),
  writeFile(platformApiZhPath, `${JSON.stringify(platformApiZh, null, 2)}\n`, 'utf8'),
  writeFile(
    structurePath,
    `${JSON.stringify(
      nextRoutes.map((route) => ({
        sourcePath: route.sourcePath,
        openimPath: route.path,
        title: route.title,
        context: route.contextKey,
        template: route.template,
        contentFile: route.contentFile,
      })),
      null,
      2,
    )}\n`,
    'utf8',
  ),
]);

await rewritePlatformContent(resolve(root, contentRoot));
await rewritePlatformContent(resolve(root, zhContentRoot));

console.log('Removed legacy OpenIM Platform API demo pages and reordered platform navigation.');

function isRemovedPlatformPath(path) {
  return removedRoutePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function removeRemovedNodes(nodes) {
  return nodes
    .filter((node) => !isRemovedNavigationNode(node))
    .map((node) => ({
      ...node,
      children: removeRemovedNodes(node.children ?? []),
    }));
}

function isRemovedNavigationNode(node) {
  if (node.href && isRemovedPlatformPath(node.href)) return true;
  return removedPlatformRoots.some(
    (segment) => node.id === segment || node.id.startsWith(`${segment}/`),
  );
}

async function writeModuleOverviewFiles() {
  await Promise.all(
    moduleOverviews.flatMap((overview) => [
      writeOverviewMdx(`${contentRoot}/${overview.id}/overview.mdx`, overview),
      writeOverviewMdx(`${zhContentRoot}/${overview.id}/overview.mdx`, overview),
    ]),
  );
}

async function writeOverviewMdx(file, overview) {
  await mkdir(dirname(resolve(root, file)), { recursive: true });
  await writeFile(resolve(root, file), renderOverviewMdx(overview), 'utf8');
}

function renderOverviewMdx(overview) {
  const path = `${localRoot}/${overview.id}/overview`;
  const frontmatter = {
    title: overview.title,
    description: overview.description,
    product: 'platform-api',
    context: contextKey,
    template: 'overview',
    status: 'published',
    lastUpdated: today,
    version: 'v3',
    sourcePath: path,
  };

  return `---\n${renderFrontmatter(frontmatter)}\n---\n\n${renderOverviewBody(overview)}\n`;
}

function renderOverviewBody(overview) {
  return `${overview.intro}

## 能力范围

| 能力 | 说明 |
| ---- | ---- |
${overview.capabilities.map(([capability, detail]) => `| ${capability} | ${detail} |`).join('\n')}

## 常用接口

${renderLinks(overview.commonLinks)}

## 接入建议

${overview.advice.join('\n\n')}

## 相关页面

${renderLinks([
  ['接入准备', '/docs/chat/platform-api/v3/prepare-to-use-api'],
  ['错误码', '/docs/chat/platform-api/v3/error-codes'],
])}`;
}

function renderLinks(links) {
  return links.map(([label, href]) => `- [${label}](${href})`).join('\n');
}

function renderFrontmatter(data) {
  return Object.entries(data)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');
}

function upsertModuleOverviewRoutes(routes) {
  const next = [...routes];
  for (const overview of moduleOverviews) {
    const path = `${localRoot}/${overview.id}/overview`;
    const contentFile = `${contentRoot}/${overview.id}/overview.mdx`;
    const existingIndex = next.findIndex((route) => route.path === path);
    const existing = existingIndex >= 0 ? next[existingIndex] : undefined;
    const firstModuleIndex = next.findIndex(
      (route) => route.path !== path && route.path.startsWith(`${localRoot}/${overview.id}/`),
    );
    const firstModuleRoute = firstModuleIndex >= 0 ? next[firstModuleIndex] : undefined;
    const maxSourceIndex = Math.max(...next.map((route) => route.sourceIndex ?? 0));
    const maxNavOrder = Math.max(...next.map((route) => route.navOrder ?? 0));
    const sourceIndex =
      existing?.sourceIndex ??
      (Number.isFinite(firstModuleRoute?.sourceIndex)
        ? firstModuleRoute.sourceIndex - 0.1
        : maxSourceIndex + 1);
    const navOrder =
      existing?.navOrder ??
      (Number.isFinite(firstModuleRoute?.navOrder)
        ? firstModuleRoute.navOrder - 0.1
        : maxNavOrder + 1);
    const record = {
      ...(existing ?? {}),
      id: 0,
      path,
      relativePath: path.replace(/^\/docs\//, ''),
      sourcePath: path,
      title: overview.title,
      description: overview.description,
      product: 'platform-api',
      version: 'v3',
      platform: null,
      contextKey,
      contextTitle: 'Platform API',
      template: 'overview',
      status: 'published',
      sourceIndex,
      contentFile,
      navOrder,
    };

    if (existingIndex >= 0) {
      next[existingIndex] = record;
    } else if (firstModuleIndex >= 0) {
      next.splice(firstModuleIndex, 0, record);
    } else {
      next.push(record);
    }
  }
  return next;
}

function ensureModuleOverviewNodes(nodes, routes) {
  const routeByPath = new Map(routes.map((route) => [route.path, route]));
  const next = [...nodes];

  for (const overview of moduleOverviews) {
    const path = `${localRoot}/${overview.id}/overview`;
    const route = routeByPath.get(path);
    if (!route) continue;

    let moduleNode = next.find((node) => node.id === overview.id);
    if (!moduleNode) {
      moduleNode = {
        id: overview.id,
        segment: overview.id,
        title: overview.navLabel,
        href: null,
        type: 'folder',
        children: [],
        minIndex: route.navOrder,
      };
      next.push(moduleNode);
    }

    moduleNode.children = (moduleNode.children ?? []).filter(
      (node) => node.href !== path && node.id !== `${overview.id}/overview`,
    );
    moduleNode.children.unshift({
      id: `${overview.id}/overview`,
      segment: 'overview',
      title: route.title,
      href: path,
      type: 'page',
      children: [],
      minIndex: route.navOrder,
    });
    const childIndexes = moduleNode.children
      .map((child) => child.minIndex)
      .filter((value) => Number.isFinite(value));
    moduleNode.minIndex = childIndexes.length > 0 ? Math.min(...childIndexes) : route.navOrder;
  }

  return next;
}

function reorderPlatformNodes(nodes) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const ordered = desiredPlatformOrder.map((id) => byId.get(id)).filter(Boolean);
  const orderedIDs = new Set(desiredPlatformOrder);
  const remainder = nodes.filter((node) => !orderedIDs.has(node.id));
  return [...ordered, ...remainder];
}

async function rewritePlatformContent(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  await Promise.all(
    entries.map(async (entry) => {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) {
        await rewritePlatformContent(file);
        return;
      }
      if (!entry.isFile() || !entry.name.endsWith('.mdx')) return;

      const original = await readFile(file, 'utf8');
      let next = original;
      for (const [from, to] of linkReplacements) {
        next = next.split(from).join(to);
      }
      for (const [from, to] of textReplacements) {
        next = next.split(from).join(to);
      }
      if (next !== original) {
        await writeFile(file, next, 'utf8');
      }
    }),
  );
}
