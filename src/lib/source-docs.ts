import 'server-only';

import { existsSync, readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { extractMarkdownHeadings } from '@/src/lib/heading-ids';
import type { TocItem } from '@/src/types/docs';

export type SourceDocPage = {
  body: string;
  description: string;
  headings: TocItem[];
  sourcePath: string;
  title: string;
};

export function getSourceDocPage(contentFile: string | undefined): SourceDocPage | undefined {
  if (!contentFile) return undefined;

  const relativePath = contentFile.replace(/^\/+/, '');
  if (!relativePath.startsWith('content/')) return undefined;

  const contentRoot = resolve(process.cwd(), 'content');
  const absolutePath = resolve(contentRoot, relativePath.slice('content/'.length));
  if (!absolutePath.startsWith(`${contentRoot}${sep}`)) return undefined;
  if (!existsSync(absolutePath)) return undefined;

  const source = readFileSync(absolutePath, 'utf8');
  const { body, frontmatter } = parseMdx(source);
  return {
    body,
    description: frontmatter.description ?? '',
    headings: extractMarkdownHeadings(body),
    sourcePath: frontmatter.sourcePath ?? contentFile,
    title: frontmatter.title ?? '',
  };
}

export function parseMdx(source: string): {
  body: string;
  frontmatter: Record<string, string>;
} {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { body: source.trim(), frontmatter: {} };

  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    const raw = line.slice(separator + 1).trim();
    if (!key || !raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string') {
        frontmatter[key] = parsed;
        continue;
      }
    } catch {
      // Fall back to plain YAML-ish strings below.
    }

    frontmatter[key] = raw.replace(/^['"]|['"]$/g, '');
  }

  return {
    body: source.slice(match[0].length).trim(),
    frontmatter,
  };
}
