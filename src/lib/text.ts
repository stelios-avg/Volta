import { toHTML } from '@portabletext/to-html';
import type { EventDescription, PortableBlock } from './types';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function textToBlocks(text: string): PortableBlock[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return (paragraphs.length ? paragraphs : ['']).map((paragraph, index) => ({
    _type: 'block',
    _key: `b${index}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `s${index}`, text: paragraph, marks: [] }],
  }));
}

export function plainText(description: EventDescription): string {
  if (typeof description === 'string') return description.trim();
  return description
    .map((block) => block.children?.map((child) => child.text).join('') ?? '')
    .join('\n\n')
    .trim();
}

export function renderDescription(description: EventDescription): string {
  if (typeof description === 'string') {
    return description
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
      .join('');
  }
  return toHTML(description, {
    onMissingComponent: false,
  });
}
