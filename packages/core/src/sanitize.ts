/**
 * PromptJS - sanitize.ts
 * Minimal, dependency-free HTML sanitizer for string content.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * - Strips dangerous tags (script, style, iframe, object, embed, form, etc.)
 * - Removes inline event handlers (on*)
 * - Removes inline styles
 * - Restricts attributes to an allow-list (with aria-* and data-* passthrough)
 * - Scrubs URLs on <a href> to allowed protocols (http, https, mailto, tel) or relative
 * - Unwraps disallowed elements but preserves their text content
 *
 * NOTE:
 * - If you need full control (e.g., custom HTML widgets), pass a DOM Node instead
 *   of an HTML string to the API OR set `unsafeHTML: true` (not recommended).
 */

export interface SanitizeOptions {
  allowedTags: Set<string>;
  allowedGlobalAttrs: Set<string>;
  allowedPerTagAttrs: Record<string, Set<string>>;
  allowDataAttrs: boolean; // data-*
  allowAriaAttrs: boolean; // aria-*
  allowClassAttr: boolean; // class
  allowIdAttr: boolean;    // id
  // Whether to unwrap a disallowed element (keep its children) or drop entirely
  unwrapDisallowed: boolean;
}

const DEFAULT_OPTIONS: SanitizeOptions = {
  // Conservative but practical allow-list for modal/notification body content
  allowedTags: new Set([
    // Text & inline
    'b', 'strong', 'i', 'em', 'u', 's', 'span', 'small', 'mark', 'code', 'kbd', 'samp', 'sup', 'sub', 'br',
    // Block
    'p', 'div', 'blockquote', 'pre', 'hr',
    // Lists
    'ul', 'ol', 'li',
    // Headings
    'h1','h2','h3','h4','h5','h6',
    // Links
    'a',
  ]),
  // Global attributes we consider safe
  allowedGlobalAttrs: new Set([
    'title', 'dir', 'lang', 'role',
  ]),
  // Per-tag attributes
  allowedPerTagAttrs: {
    a: new Set(['href', 'target', 'rel', 'name']),
    // Add more tag-specific attrs here if you later allow them (e.g., 'pre' could allow 'tabindex')
  },
  allowDataAttrs: true,
  allowAriaAttrs: true,
  allowClassAttr: true,
  allowIdAttr: false, // generally unnecessary in modal content; can cause collisions
  unwrapDisallowed: true,
};

// Tags we always drop (never unwrap to avoid weirdness) — feel free to extend
const DANGEROUS_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base',
  'form', 'input', 'button', 'textarea', 'select', 'option',
  'svg', 'math', // SVG/MathML can be abused; keep disabled by default
]);

const EVENT_ATTR = /^on/i;
const ARIA_ATTR = /^aria-/i;
const DATA_ATTR = /^data-/i;

function isAllowedUrl(url: string): boolean {
  // Allow relative URLs, hash links, and ?query links quickly
  const t = url.trim();
  if (!t) return true;
  if (t.startsWith('#') || t.startsWith('?') || t.startsWith('/')) return true;
  if (t.startsWith('./') || t.startsWith('../')) return true;

  try {
    const u = new URL(t, document.baseURI);
    const proto = u.protocol.toLowerCase();
    return proto === 'http:' || proto === 'https:' || proto === 'mailto:' || proto === 'tel:';
  } catch {
    // If URL parsing fails, treat as unsafe
    return false;
  }
}

function sanitizeAttributes(el: Element, opts: SanitizeOptions) {
  // Copy attribute list first—live NamedNodeMap changes while iterating
  const toRemove: string[] = [];
  const toSet: Array<{ name: string; value: string }> = [];

  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    const name = attr.name;
    const value = attr.value;

    // Strip inline event handlers and inline styles immediately
    if (EVENT_ATTR.test(name) || name === 'style') { toRemove.push(name); continue; }

    // Allow class/id based on options
    if (name === 'class') { if (!opts.allowClassAttr) { toRemove.push(name); } continue; }
    if (name === 'id')    { if (!opts.allowIdAttr)    { toRemove.push(name); } continue; }

    // data-* and aria-* passthrough
    if (opts.allowDataAttrs && DATA_ATTR.test(name)) continue;
    if (opts.allowAriaAttrs && ARIA_ATTR.test(name)) continue;

    // Is this a globally allowed attribute?
    if (opts.allowedGlobalAttrs.has(name)) continue;

    // Is this attribute allowed for this specific tag?
    const tag = el.tagName.toLowerCase();
    const perTag = opts.allowedPerTagAttrs[tag];
    if (perTag && perTag.has(name)) {
      // Special handling for <a href>
      if (tag === 'a' && name === 'href') {
        if (!isAllowedUrl(value)) {
          toRemove.push(name);
          continue;
        }
        // If target=_blank, enforce rel safety
        const target = el.getAttribute('target');
        if (target === '_blank') {
          const existingRel = el.getAttribute('rel') || '';
          const needed = new Set(['noopener', 'noreferrer']);
          existingRel.split(/\s+/).forEach((r) => r && needed.delete(r.toLowerCase()));
          if (needed.size) {
            toSet.push({ name: 'rel', value: (existingRel ? existingRel + ' ' : '') + Array.from(needed).join(' ') });
          }
        }
      }
      continue;
    }

    // Otherwise, drop it
    toRemove.push(name);
  }

  toRemove.forEach((n) => el.removeAttribute(n));
  toSet.forEach(({ name, value }) => el.setAttribute(name, value));
}

function unwrapElement(el: Element) {
  const parent = el.parentNode;
  if (!parent) { el.remove(); return; }
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

function cleanNode(node: Node, opts: SanitizeOptions) {
  // Remove comments
  if (node.nodeType === Node.COMMENT_NODE) {
    node.parentNode?.removeChild(node);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  // Hard drop dangerous tags and their contents
  if (DANGEROUS_TAGS.has(tag)) {
    el.parentNode?.removeChild(el);
    return;
  }

  // If not allowed, either unwrap or drop
  if (!opts.allowedTags.has(tag)) {
    if (opts.unwrapDisallowed) unwrapElement(el);
    else el.parentNode?.removeChild(el);
    return;
  }

  // Allowed element → sanitize its attributes
  sanitizeAttributes(el, opts);

  // Recurse into children (convert NodeList to array first)
  const children = Array.from(el.childNodes);
  for (const child of children) cleanNode(child, opts);
}

/**
 * Sanitize an HTML string and return a safe HTML string.
 * If you need a DocumentFragment, you can create one from the returned string.
 */
export function sanitize(html: string, options?: Partial<SanitizeOptions>): string {
  if (!html) return '';

  const opts: SanitizeOptions = {
    ...DEFAULT_OPTIONS,
    ...(options || {}),
    // Deep-merge perTagAttrs/sets if caller provided them
    allowedTags: options?.allowedTags ? new Set(options.allowedTags) : DEFAULT_OPTIONS.allowedTags,
    allowedGlobalAttrs: options?.allowedGlobalAttrs ? new Set(options.allowedGlobalAttrs) : DEFAULT_OPTIONS.allowedGlobalAttrs,
    allowedPerTagAttrs: options?.allowedPerTagAttrs
      ? Object.fromEntries(Object.entries(options.allowedPerTagAttrs).map(([k, v]) => [k, new Set(v)]))
      : DEFAULT_OPTIONS.allowedPerTagAttrs,
  };

  // Use <template> to avoid immediate reflow and keep markup isolated
  const tpl = document.createElement('template');
  tpl.innerHTML = html;

  const nodes = Array.from(tpl.content.childNodes);
  for (const n of nodes) cleanNode(n, opts);

  // Return sanitized HTML string
  const out = document.createElement('div');
  out.appendChild(tpl.content.cloneNode(true));
  return out.innerHTML;
}
