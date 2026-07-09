import Link from 'next/link';
import { Breadcrumbs } from '@/src/components/docs/breadcrumbs';
import { ChevronRightIcon } from '@/src/components/ui/icons';
import type { Locale } from '@/src/lib/i18n';
import { toLocalizedPath } from '@/src/lib/i18n';
import type { BreadcrumbItem, RouteRecord } from '@/src/types/docs';

type OverviewCard = {
  description: string;
  href: string;
  title: string;
  visual: 'migration' | 'unread' | 'receipt' | 'message' | 'events' | 'history';
};

type FeatureCard = {
  description: string;
  href: string;
  title: string;
};

type ResourceLink = {
  description: string;
  href: string;
  title: string;
};

const copy = {
  en: {
    eyebrow: 'Version 4',
    intro:
      'With OpenIM Chat for WASM, you can build browser-based messaging with WebAssembly-powered local storage, realtime events, groups, conversations, unread counts, and message status. Electron and Mini Program integrations share the same core API model, with runtime-specific setup handled in their platform entries.',
    mostPopular: 'Most popular',
    recommended: 'Recommended features',
    resources: 'Resources',
    popular: [
      {
        title: 'SDK overview',
        description:
          'Review the OpenIM users, conversations, groups, messages, and event model.',
        href: '/docs/chat/sdk/v4/wasm/overview',
        visual: 'migration',
      },
      {
        title: 'Unread message count',
        description: 'Keep conversation lists and app badges in sync with unread counts.',
        href: '/docs/chat/sdk/v4/wasm/message/conversation-state/get-total-unread-msg-count',
        visual: 'unread',
      },
      {
        title: 'Read status',
        description: 'Mark conversations or selected messages as read and keep state in sync.',
        href: '/docs/chat/sdk/v4/wasm/message/read-status/mark-conversation-message-as-read',
        visual: 'receipt',
      },
      {
        title: 'Send a message',
        description: 'Create text, file, and custom messages, then send them to users or groups.',
        href: '/docs/chat/sdk/v4/wasm/message/sending-messages/send-message',
        visual: 'message',
      },
      {
        title: 'Receive messages',
        description: 'Subscribe to message events and merge new messages into your UI state.',
        href: '/docs/chat/sdk/v4/wasm/event-handler/methods/set-advanced-msg-listener',
        visual: 'events',
      },
      {
        title: 'Message history',
        description: 'Page through local and synced history with stable message cursors.',
        href: '/docs/chat/sdk/v4/wasm/message/retrieving-messages/get-advanced-history-message-list',
        visual: 'history',
      },
    ],
    features: [
      {
        title: 'Authentication',
        description: 'Sign in with backend-issued tokens and handle connection lifecycle events.',
        href: '/docs/chat/sdk/v4/wasm/application/authenticating-a-user/authentication',
      },
      {
        title: 'Groups',
        description:
          'Create OpenIM groups for group conversations and maintain conversation state.',
        href: '/docs/chat/sdk/v4/wasm/group/managing-groups/create-group',
      },
      {
        title: 'Event handlers',
        description: 'Register connection, group, message, relationship, and user event handlers in one place.',
        href: '/docs/chat/sdk/v4/wasm/event-handler/overview',
      },
    ],
    links: [
      {
        title: 'Send your first message',
        description: 'Install, initialize, sign in, choose a target, and send a message.',
        href: '/docs/chat/sdk/v4/wasm/getting-started/send-first-message',
      },
      {
        title: 'SDK lifecycle',
        description: 'Initialize, log in, manage foreground state, and release SDK resources.',
        href: '/docs/chat/sdk/v4/wasm/application/overview',
      },
      {
        title: 'Error codes and logging',
        description: 'Capture errCode, errMsg, and operationID for client and server diagnostics.',
        href: '/docs/chat/sdk/v4/wasm/error-codes',
      },
    ],
  },
  zh: {
    eyebrow: 'Version 4',
    intro:
      '使用 OpenIM Chat WASM SDK，你可以在浏览器应用中构建聊天体验：通过 WebAssembly 支持本地存储、实时事件、群组会话、未读数、消息已读回执和历史消息同步。Electron 和小程序入口沿用同一套核心 API 模型，只在运行环境和资源配置上区分。',
    mostPopular: '热门主题',
    recommended: '推荐功能',
    resources: '资源',
    popular: [
      {
        title: 'SDK 概览',
        description: '了解 OpenIM 的用户、会话、群组、消息和事件模型。',
        href: '/docs/chat/sdk/v4/wasm/overview',
        visual: 'migration',
      },
      {
        title: '未读消息数',
        description: '读取会话未读数，并同步聊天列表、角标和全局未读状态。',
        href: '/docs/chat/sdk/v4/wasm/message/conversation-state/get-total-unread-msg-count',
        visual: 'unread',
      },
      {
        title: '已读状态',
        description: '标记会话或指定消息为已读，并同步消息状态。',
        href: '/docs/chat/sdk/v4/wasm/message/read-status/mark-conversation-message-as-read',
        visual: 'receipt',
      },
      {
        title: '发送消息',
        description: '创建文本、文件或自定义消息，并发送给单聊用户或群组。',
        href: '/docs/chat/sdk/v4/wasm/message/sending-messages/send-message',
        visual: 'message',
      },
      {
        title: '接收消息',
        description: '订阅新消息事件，把增量消息稳定合并到应用状态。',
        href: '/docs/chat/sdk/v4/wasm/event-handler/methods/set-advanced-msg-listener',
        visual: 'events',
      },
      {
        title: '历史消息',
        description: '使用会话 ID 和消息游标读取本地及同步后的历史消息。',
        href: '/docs/chat/sdk/v4/wasm/message/retrieving-messages/get-advanced-history-message-list',
        visual: 'history',
      },
    ],
    features: [
      {
        title: '用户认证',
        description: '使用后端签发的 token 登录，并处理连接、过期和被踢下线事件。',
        href: '/docs/chat/sdk/v4/wasm/application/authenticating-a-user/authentication',
      },
      {
        title: '群组',
        description: '用 OpenIM 群组承载群聊场景，并维护会话列表状态。',
        href: '/docs/chat/sdk/v4/wasm/group/managing-groups/create-group',
      },
      {
        title: '事件处理器',
        description: '统一注册连接、群组、关系、消息和用户事件，驱动实时 UI。',
        href: '/docs/chat/sdk/v4/wasm/event-handler/overview',
      },
    ],
    links: [
      {
        title: '发送第一条消息',
        description: '完成安装、初始化、登录、选择目标并发送消息。',
        href: '/docs/chat/sdk/v4/wasm/getting-started/send-first-message',
      },
      {
        title: 'SDK 生命周期',
        description: '初始化、登录、前后台状态和资源释放的调用边界。',
        href: '/docs/chat/sdk/v4/wasm/application/overview',
      },
      {
        title: '错误码与日志',
        description: '记录 errCode、errMsg 和 operationID，串联客户端与服务端诊断。',
        href: '/docs/chat/sdk/v4/wasm/error-codes',
      },
    ],
  },
} satisfies Record<
  Locale,
  {
    eyebrow: string;
    features: FeatureCard[];
    intro: string;
    links: ResourceLink[];
    mostPopular: string;
    popular: OverviewCard[];
    recommended: string;
    resources: string;
  }
>;

export function SdkOverviewPage({
  breadcrumbs,
  locale = 'en',
  route,
  showVersion,
}: {
  breadcrumbs: BreadcrumbItem[];
  locale?: Locale;
  route: RouteRecord;
  showVersion: boolean;
}) {
  const text = copy[locale];

  return (
    <div className="sdk-overview-page">
      <header className="sdk-overview-header">
        {showVersion ? <span className="sdk-overview-version">{text.eyebrow}</span> : null}
        <Breadcrumbs items={breadcrumbs} />
        <h1>{route.title}</h1>
        <p>{text.intro}</p>
      </header>

      <section className="sdk-overview-section" aria-labelledby="sdk-overview-popular">
        <h2 id="sdk-overview-popular">{text.mostPopular}</h2>
        <div className="sdk-overview-popular-grid">
          {text.popular.map((item) => (
            <PopularCard item={item} key={item.href} locale={locale} />
          ))}
        </div>
      </section>

      <section className="sdk-overview-section" aria-labelledby="sdk-overview-recommended">
        <h2 id="sdk-overview-recommended">{text.recommended}</h2>
        <div className="sdk-overview-feature-grid">
          {text.features.map((item) => (
            <FeatureCardView item={item} key={item.href} locale={locale} />
          ))}
        </div>
      </section>

      <section className="sdk-overview-section" aria-labelledby="sdk-overview-resources">
        <h2 id="sdk-overview-resources">{text.resources}</h2>
        <div className="sdk-overview-resource-list">
          {text.links.map((item) => (
            <ResourceLinkView item={item} key={item.href} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PopularCard({ item, locale }: { item: OverviewCard; locale: Locale }) {
  return (
    <Link className="sdk-overview-popular-card" href={toLocalizedPath(item.href, locale)}>
      <span className="sdk-overview-card-visual" data-visual={item.visual} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <strong>{item.title}</strong>
      <span>{item.description}</span>
    </Link>
  );
}

function FeatureCardView({ item, locale }: { item: FeatureCard; locale: Locale }) {
  return (
    <Link className="sdk-overview-feature-card" href={toLocalizedPath(item.href, locale)}>
      <strong>{item.title}</strong>
      <span>{item.description}</span>
    </Link>
  );
}

function ResourceLinkView({ item, locale }: { item: ResourceLink; locale: Locale }) {
  return (
    <Link className="sdk-overview-resource-link" href={toLocalizedPath(item.href, locale)}>
      <span>
        <strong>{item.title}</strong>
        <small>{item.description}</small>
      </span>
      <ChevronRightIcon />
    </Link>
  );
}
