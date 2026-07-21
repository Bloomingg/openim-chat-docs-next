import { getClientSdkPlatform } from './client-sdk-platforms.mjs';

export function getClientSdkSidebarPaths(config) {
  return flattenEntries(config.nodes);
}

export function decideClientSdkSidebarApplication({ platform, config, routes }) {
  const platformConfig = typeof platform === 'string' ? getClientSdkPlatform(platform) : platform;

  if (platformConfig.id === 'wasm') {
    return { mode: 'apply', reason: 'strict' };
  }

  const sidebarPaths = getClientSdkSidebarPaths(config);
  const sidebarPathSet = new Set(sidebarPaths);
  const routePaths = routes
    .filter((route) => route.contextKey === platformConfig.contextKey)
    .map((route) => route.path);
  const routePathSet = new Set(routePaths);
  const hasCompleteNativeStructure =
    sidebarPathSet.size === sidebarPaths.length &&
    routePathSet.size === routePaths.length &&
    routePaths.length === sidebarPaths.length &&
    routePaths.every((path) => sidebarPathSet.has(path));

  return hasCompleteNativeStructure
    ? { mode: 'apply', reason: 'complete-native-structure' }
    : { mode: 'skip', reason: 'native-route-tree-not-migrated' };
}

export function getClientSdkSidebarApplicationScope({ routes, sidebars }) {
  const activePaths = new Set();
  const managedContexts = new Set();

  for (const { platform, config } of sidebars) {
    const platformConfig = typeof platform === 'string' ? getClientSdkPlatform(platform) : platform;
    const decision = decideClientSdkSidebarApplication({
      platform: platformConfig,
      config,
      routes,
    });
    managedContexts.add(platformConfig.contextKey);
    if (decision.mode === 'skip') continue;
    for (const path of getClientSdkSidebarPaths(config)) activePaths.add(path);
  }

  return { activePaths, managedContexts };
}

export function buildClientSdkSidebar({ platform, config, routes }) {
  const platformConfig = typeof platform === 'string' ? getClientSdkPlatform(platform) : platform;
  const platformName = platformConfig?.id ?? String(platform);
  const platformRoutes = routes.filter((route) => route.contextKey === platformConfig?.contextKey);
  const routeByPath = new Map(platformRoutes.map((route) => [route.path, route]));
  const paths = getClientSdkSidebarPaths(config);
  const uniquePaths = new Set(paths);

  if (uniquePaths.size !== paths.length) {
    throw new Error(`[${platformName}] sidebar contains duplicate route paths.`);
  }

  for (const path of paths) {
    if (!routeByPath.has(path)) {
      throw new Error(`[${platformName}] sidebar references an unknown route: ${path}`);
    }
  }

  const missingPaths = platformRoutes
    .map((route) => route.path)
    .filter((path) => !uniquePaths.has(path));
  if (missingPaths.length > 0) {
    throw new Error(`[${platformName}] sidebar omits active routes: ${missingPaths.join(', ')}`);
  }

  return {
    nodes: config.nodes.map((entry) => buildNode(entry, routeByPath, platformConfig, platformName)),
    pageCount: paths.length,
    sidebarExpansion: config.sidebarExpansion,
  };
}

function flattenEntries(entries) {
  return entries.flatMap((entry) =>
    typeof entry === 'string'
      ? [entry]
      : entry.path
        ? [entry.path]
        : flattenEntries(entry.children),
  );
}

function buildNode(entry, routeByPath, platform, platformName) {
  if (typeof entry === 'string' || entry.path) {
    const path = typeof entry === 'string' ? entry : entry.path;
    const route = routeByPath.get(path);
    const relativePrefix = `sdk/${platform.id}/`;
    return {
      id: route.relativePath.startsWith(relativePrefix)
        ? route.relativePath.slice(relativePrefix.length)
        : route.relativePath,
      segment: route.path.split('/').at(-1),
      title: route.title,
      href: route.path,
      type: 'page',
      children: [],
      minIndex: route.navOrder,
      ...(typeof entry === 'string' ? {} : { navigationTitle: entry.navigationTitle }),
    };
  }

  if (!Array.isArray(entry.children) || entry.children.length < 2) {
    throw new Error(
      `[${platformName}] sidebar folder must contain at least two entries: ${entry.id}`,
    );
  }

  const children = entry.children.map((child) =>
    buildNode(child, routeByPath, platform, platformName),
  );
  return {
    id: entry.id,
    segment: entry.id.split('/').at(-1),
    title: entry.title,
    href: null,
    type: 'folder',
    children,
    minIndex: Math.min(...children.map((child) => child.minIndex)),
  };
}
