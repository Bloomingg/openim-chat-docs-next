import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const routesPath = resolve(root, 'src/generated/routes.json');
const navigationPath = resolve(root, 'src/generated/navigation.json');
const routes = JSON.parse(await readFile(routesPath, 'utf8'));
const navigation = JSON.parse(await readFile(navigationPath, 'utf8'));
let changed = 0;

for (const route of routes) {
  const source = await readFile(resolve(root, route.contentFile), 'utf8');
  const data = parseFrontmatter(source);
  const next = {
    title: data.title ?? route.title,
    description: data.description ?? route.description,
    product: data.product ?? route.product,
    template: data.template ?? route.template,
    status: data.status ?? route.status,
    version: data.version ?? route.version,
    platform: data.platform ?? route.platform,
  };
  for (const [key, value] of Object.entries(next)) {
    if (route[key] !== value) {
      route[key] = value;
      changed += 1;
    }
  }
}

changed += applyWasmRetrievingUsersOrder(routes);

const routeMap = new Map(routes.map((route) => [route.path, route]));
for (const context of navigation.contexts) {
  changed += refreshNodes(context.nodes, routeMap);
  changed += applyWasmRetrievingUsersNavigationOrder(context);
  const overview = routeMap.get(context.overviewPath);
  if (overview && context.title !== overview.contextTitle && overview.contextTitle) {
    context.title = overview.contextTitle;
  }
}

await Promise.all([
  writeFile(routesPath, `${JSON.stringify(routes, null, 2)}\n`, 'utf8'),
  writeFile(navigationPath, `${JSON.stringify(navigation, null, 2)}\n`, 'utf8'),
]);
console.log(`Synchronized content metadata (${changed.toLocaleString()} changed fields).`);

function refreshNodes(nodes, routeMap) {
  let changed = 0;
  for (const node of nodes) {
    if (!Array.isArray(node.children)) {
      node.children = [];
      changed += 1;
    }

    changed += refreshNodes(node.children, routeMap);

    if (node.href) {
      const route = routeMap.get(node.href);
      if (route) {
        changed += setField(node, 'title', route.title);
        changed += setField(node, 'type', 'page');
        changed += setField(node, 'minIndex', route.navOrder);
      }
    } else {
      changed += setField(node, 'type', 'folder');
      const childIndexes = node.children
        .map((child) => child.minIndex)
        .filter((value) => Number.isFinite(value));
      if (childIndexes.length > 0) {
        changed += setField(node, 'minIndex', Math.min(...childIndexes));
      }
    }
  }
  return changed;
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    const raw = line.slice(separator + 1).trim();
    if (!raw) continue;
    try {
      result[key] = JSON.parse(raw);
    } catch {
      result[key] = raw.replace(/^['"]|['"]$/g, '');
    }
  }
  return result;
}

function setField(target, key, value) {
  if (target[key] === value) return 0;
  target[key] = value;
  return 1;
}

function applyWasmRetrievingUsersOrder(routes) {
  const order = wasmRetrievingUsersOrder();
  const overview = routes.find(
    (route) => route.path === '/docs/chat/sdk/v4/wasm/user/overview-user',
  );
  const baseOrder = Number.isFinite(overview?.navOrder) ? overview.navOrder : 506;
  let changed = 0;

  order.forEach((path, index) => {
    const route = routes.find((item) => item.path === path);
    if (!route) return;
    changed += setField(route, 'navOrder', Number((baseOrder + (index + 1) / 10).toFixed(1)));
  });

  return changed;
}

function applyWasmRetrievingUsersNavigationOrder(context) {
  if (context.key !== 'chat/sdk/v4/wasm') return 0;

  const group = findNode(context.nodes, 'user/retrieving-users');
  if (!group) return 0;

  const order = new Map(wasmRetrievingUsersOrder().map((path, index) => [path, index]));
  const before = group.children.map((child) => child.href ?? child.id).join('\n');
  group.children.sort((a, b) => {
    const first = order.get(a.href) ?? Number.POSITIVE_INFINITY;
    const second = order.get(b.href) ?? Number.POSITIVE_INFINITY;
    return (
      first - second ||
      (a.minIndex ?? Number.POSITIVE_INFINITY) - (b.minIndex ?? Number.POSITIVE_INFINITY) ||
      a.title.localeCompare(b.title)
    );
  });
  const after = group.children.map((child) => child.href ?? child.id).join('\n');
  return before === after ? 0 : 1;
}

function findNode(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children ?? [], id);
    if (found) return found;
  }
  return undefined;
}

function wasmRetrievingUsersOrder() {
  return [
    '/docs/chat/sdk/v4/wasm/user/retrieving-users/retrieve-a-list-of-users-in-an-application',
    '/docs/chat/sdk/v4/wasm/user/retrieving-users/retrieve-a-list-of-friends',
    '/docs/chat/sdk/v4/wasm/user/retrieving-users/retrieve-friend-information',
  ];
}
