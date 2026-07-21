import { buildClientSdkSidebar, getClientSdkSidebarPaths } from './client-sdk-sidebar.mjs';

export function getWasmSidebarPaths(config) {
  return getClientSdkSidebarPaths(config);
}

export function buildWasmSidebar(config, routes) {
  return buildClientSdkSidebar({ platform: 'wasm', config, routes });
}
