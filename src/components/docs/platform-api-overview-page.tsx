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
  visual: 'setup' | 'user-list' | 'create-user' | 'group' | 'message' | 'migration';
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
    intro:
      'OpenIM Platform API is organized for trusted backend services. Use these REST endpoints to manage authentication, users, relationships, groups, conversations, messages, third-party services, migration, and operational workflows.',
    mostPopular: 'Most popular',
    recommended: 'Recommended features',
    resources: 'Resources',
    popular: [
      {
        title: 'Prepare to use API',
        description:
          'Confirm the base API address, JSON headers, administrator token, and request body conventions.',
        href: '/docs/chat/platform-api/v3/prepare-to-use-api',
        visual: 'setup',
      },
      {
        title: 'List users',
        description: 'Retrieve registered OpenIM users from a trusted backend service.',
        href: '/docs/chat/platform-api/v3/user/listing-users/list-users',
        visual: 'user-list',
      },
      {
        title: 'Create a user',
        description: 'Register OpenIM users and keep business identity rules in your own system.',
        href: '/docs/chat/platform-api/v3/user/creating-users/create-a-user',
        visual: 'create-user',
      },
      {
        title: 'Create a group',
        description:
          'Provision an OpenIM group for conversations, membership, and server-side operations.',
        href: '/docs/chat/platform-api/v3/group/managing-groups/create-group',
        visual: 'group',
      },
      {
        title: 'Send a message',
        description:
          'Send server-side text, custom, and notification messages through OpenIM message APIs.',
        href: '/docs/chat/platform-api/v3/message/sending-messages/send-msg',
        visual: 'message',
      },
      {
        title: 'Migrate to OpenIM',
        description:
          'Import historical messages into OpenIM while preserving sender and conversation context.',
        href: '/docs/chat/platform-api/v3/migration-to-openim',
        visual: 'migration',
      },
    ],
    features: [
      {
        title: 'User lifecycle',
        description: 'Create users, update profiles, query user records, and issue user tokens.',
        href: '/docs/chat/platform-api/v3/user/listing-users/list-users',
      },
      {
        title: 'Groups',
        description:
          'Create groups, update group information, invite members, and manage membership changes.',
        href: '/docs/chat/platform-api/v3/group/managing-groups/create-group',
      },
      {
        title: 'Relationships',
        description: 'Manage friend relationships, friend requests, and user blacklists.',
        href: '/docs/chat/platform-api/v3/relation/overview',
      },
    ],
    links: [
      {
        title: 'Error codes',
        description: 'Handle OpenIM errCode, errMsg, and errDlt responses consistently.',
        href: '/docs/chat/platform-api/v3/error-codes',
      },
      {
        title: 'Issue a user token',
        description: 'Generate login tokens for clients from a trusted backend.',
        href: '/docs/chat/platform-api/v3/auth/tokens/get-user-token',
      },
      {
        title: 'OpenIM REST API introduction',
        description: 'Review the official OpenIM REST request and response conventions.',
        href: 'https://docs.openim.io/restapi/apis/introduction',
      },
    ],
  },
  zh: {
    intro:
      'OpenIM Platform API 面向服务端集成场景，提供认证、用户、关系、群组、会话、消息和第三方服务等管理能力。',
    mostPopular: '最常用',
    recommended: '推荐功能',
    resources: '资源',
    popular: [
      {
        title: '接入准备',
        description: '确认 API 基础地址、JSON 请求头、管理员 Token 和请求体约定。',
        href: '/docs/chat/platform-api/v3/prepare-to-use-api',
        visual: 'setup',
      },
      {
        title: '查询用户列表',
        description: '从可信后端查询已注册的 OpenIM 用户。',
        href: '/docs/chat/platform-api/v3/user/listing-users/list-users',
        visual: 'user-list',
      },
      {
        title: '创建用户',
        description: '注册 OpenIM 用户，并把业务身份、权限和风控逻辑保留在业务系统中。',
        href: '/docs/chat/platform-api/v3/user/creating-users/create-a-user',
        visual: 'create-user',
      },
      {
        title: '创建群组',
        description: '创建 OpenIM 群组，用于承载会话、成员管理和服务端运营动作。',
        href: '/docs/chat/platform-api/v3/group/managing-groups/create-group',
        visual: 'group',
      },
      {
        title: '发送消息',
        description: '通过 OpenIM 消息接口从服务端发送文本、自定义或通知类消息。',
        href: '/docs/chat/platform-api/v3/message/sending-messages/send-msg',
        visual: 'message',
      },
      {
        title: '迁移到 OpenIM',
        description: '从现有系统迁移到 OpenIM，并保留用户、会话和消息上下文。',
        href: '/docs/chat/platform-api/v3/migration-to-openim',
        visual: 'migration',
      },
    ],
    features: [
      {
        title: '用户生命周期',
        description: '创建用户、更新资料、查询用户记录，并为客户端签发用户 Token。',
        href: '/docs/chat/platform-api/v3/user/listing-users/list-users',
      },
      {
        title: '群组',
        description: '创建群组、更新群资料、邀请成员，并处理入群、退群和解散流程。',
        href: '/docs/chat/platform-api/v3/group/managing-groups/create-group',
      },
      {
        title: '关系',
        description: '维护好友关系、好友申请和黑名单数据。',
        href: '/docs/chat/platform-api/v3/relation/overview',
      },
    ],
    links: [
      {
        title: '错误码',
        description: '统一处理 OpenIM 的 errCode、errMsg 和 errDlt 响应。',
        href: '/docs/chat/platform-api/v3/error-codes',
      },
      {
        title: '获取用户 Token',
        description: '由可信后端为客户端生成登录 Token。',
        href: '/docs/chat/platform-api/v3/auth/tokens/get-user-token',
      },
      {
        title: 'OpenIM REST API 介绍',
        description: '查看 OpenIM 官方 REST 请求和响应约定。',
        href: 'https://docs.openim.io/restapi/apis/introduction',
      },
    ],
  },
} satisfies Record<
  Locale,
  {
    features: FeatureCard[];
    intro: string;
    links: ResourceLink[];
    mostPopular: string;
    popular: OverviewCard[];
    recommended: string;
    resources: string;
  }
>;

export function PlatformApiOverviewPage({
  breadcrumbs,
  locale = 'en',
  route,
}: {
  breadcrumbs: BreadcrumbItem[];
  locale?: Locale;
  route: RouteRecord;
}) {
  const text = copy[locale];

  return (
    <div className="sdk-overview-page platform-api-overview-page">
      <header className="sdk-overview-header">
        <Breadcrumbs items={breadcrumbs} />
        <h1>{route.title}</h1>
        <p>{text.intro}</p>
      </header>

      <section className="sdk-overview-section" aria-labelledby="platform-api-overview-popular">
        <h2 id="platform-api-overview-popular">{text.mostPopular}</h2>
        <div className="sdk-overview-popular-grid">
          {text.popular.map((item) => (
            <PopularCard item={item} key={item.href} locale={locale} />
          ))}
        </div>
      </section>

      <section className="sdk-overview-section" aria-labelledby="platform-api-overview-recommended">
        <h2 id="platform-api-overview-recommended">{text.recommended}</h2>
        <div className="sdk-overview-feature-grid">
          {text.features.map((item) => (
            <FeatureCardView item={item} key={item.href} locale={locale} />
          ))}
        </div>
      </section>

      <section className="sdk-overview-section" aria-labelledby="platform-api-overview-resources">
        <h2 id="platform-api-overview-resources">{text.resources}</h2>
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
      <span className="platform-api-card-visual" data-visual={item.visual} aria-hidden="true">
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
  const content = (
    <>
      <span>
        <strong>{item.title}</strong>
        <small>{item.description}</small>
      </span>
      <ChevronRightIcon />
    </>
  );

  if (item.href.startsWith('http')) {
    return (
      <a className="sdk-overview-resource-link" href={item.href} rel="noreferrer" target="_blank">
        {content}
      </a>
    );
  }

  return (
    <Link className="sdk-overview-resource-link" href={toLocalizedPath(item.href, locale)}>
      {content}
    </Link>
  );
}
