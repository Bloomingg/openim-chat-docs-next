import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildClientSdkLocalizedFile,
  buildLocalizedSdkData as buildClientLocalizedSdkData,
  normalizeManualBody,
  parseMdx,
  resolveLocalizedRouteTitle,
} from './build-client-sdk-zh-content.mjs';

export { normalizeManualBody, parseMdx, resolveLocalizedRouteTitle };

export function buildLocalizedSdkData(options) {
  return buildClientLocalizedSdkData({ platform: 'wasm', ...options });
}

const isDirectExecution =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const output = await buildClientSdkLocalizedFile('wasm');
  console.log(
    `Packaged Chinese WASM SDK content (${output.manualPageCount} manual pages, ${output.pendingPaths.length} pending paths).`,
  );
}
