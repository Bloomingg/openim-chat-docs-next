import type { TocItem } from '@/src/types/docs';

export function createHeadingIdGenerator() {
  const counts = new Map<string, number>();

  return (title: string) => {
    const base = headingId(title) || 'section';
    const count = (counts.get(base) ?? 0) + 1;
    counts.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
}

export function extractMarkdownHeadings(body: string): TocItem[] {
  const nextHeadingId = createHeadingIdGenerator();

  return body
    .split(/\r?\n/)
    .map((line) => line.match(/^(#{2,4})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => {
      const title = match[2].trim();
      return {
        depth: match[1].length,
        title,
        url: `#${nextHeadingId(title)}`,
      };
    });
}

export function headingId(value: string): string {
  return value
    .replace(/[>#*_`]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}
