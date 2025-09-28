/**
 * PromptJS – a11y.ts
 * Accessibility utilities shared by modal/notify.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * Features:
 *  - getTabbables(root): robust tabbable element query
 *  - focusFirst(root, fallback?): focus management helper
 *  - trapFocus(container, opts?): keep Tab/Shift+Tab within container; returns { release() }
 *  - ariaHideSiblings(target): hide everything except target; returns restore()
 *  - createLiveRegion(kind): get/create polite/assertive live region for toasts
 *
 * No external deps. No async/await. Works with ES2019 + DOM libs.
 */

export type LiveKind = 'polite' | 'assertive';

export interface TrapOptions {
  initialFocus?: HTMLElement | null;   // element to focus on activate
  restoreFocus?: HTMLElement | null;   // element to restore on release (default: previously focused)
}

/** Return all tabbable descendants within root (in DOM order). */
export function getTabbables(root: ParentNode): HTMLElement[] {
  const selector = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'summary', // details/summary is focusable
    '[tabindex]',
    '[contenteditable="true"]',
  ].join(',');

  const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector));
  return nodes.filter(isTabbable);
}

function isTabbable(el: HTMLElement): boolean {
  if (!isFocusable(el)) return false;
  const tabindex = getTabIndex(el);
  return tabindex >= 0;
}

function isFocusable(el: HTMLElement): boolean {
  if (!isVisible(el)) return false;
  // Disabled form controls already filtered by selector, but keep guard:
  // @ts-ignore — HTML*Element may not have disabled
  if ((el as any).disabled) return false;
  return true;
}

function isVisible(el: HTMLElement): boolean {
  // Quick visibility heuristic
  const style = window.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none') return false;

  // Hidden via details element
  const details = el.closest('details');
  if (details && !details.open && !details.querySelector('summary')?.contains(el)) return false;

  // Not in document or clipped out
  if (!el.ownerDocument || !el.getClientRects().length) {
    // Fallback: if it's the root of the trap, allow focusing via tabindex -1 later
    return !!el.ownerDocument;
  }
  return true;
}

function getTabIndex(el: HTMLElement): number {
  const attr = el.getAttribute('tabindex');
  if (attr !== null) {
    const n = Number(attr);
    return Number.isNaN(n) ? 0 : n;
  }
  // Certain elements are naturally tabbable
  const tag = el.tagName.toLowerCase();
  const naturallyTabbable = /^(a|area|input|select|textarea|button|summary)$/i.test(tag);
  if (naturallyTabbable) {
    // anchors without href are not tabbable
    if ((tag === 'a' || tag === 'area') && !el.hasAttribute('href')) return -1;
    return 0;
  }
  return -1;
}

/** Focus the first tabbable in root, or fallback element, or root (with temp tabindex). */
export function focusFirst(root: HTMLElement, fallback?: HTMLElement | null): void {
  const tabbables = getTabbables(root);
  const target = tabbables[0] || fallback || root;

  // Ensure focusability if root is used
  let removeTabIndex = false;
  if (target === root && getTabIndex(root) < 0) {
    root.setAttribute('tabindex', '-1');
    removeTabIndex = true;
  }

  try {
    target.focus({ preventScroll: true } as any);
  } catch {
    // ignore
  } finally {
    if (removeTabIndex) root.removeAttribute('tabindex');
  }
}

/** Trap keyboard Tab/Shift+Tab inside the container. Returns { release() }. */
export function trapFocus(container: HTMLElement, opts?: TrapOptions): { release: () => void } {
  const previouslyFocused = (document.activeElement as HTMLElement) || null;

  // Initial focus
  if (opts?.initialFocus) {
    try { opts.initialFocus.focus({ preventScroll: true } as any); } catch {}
  } else {
    focusFirst(container, container);
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const tabbables = getTabbables(container);
    if (tabbables.length === 0) {
      // Keep focus on container
      e.preventDefault();
      focusFirst(container, container);
      return;
    }
    const first = tabbables[0];
    const last = tabbables[tabbables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (!active || active === first || !container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (!active || active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  document.addEventListener('keydown', onKeyDown, true);

  const release = () => {
    document.removeEventListener('keydown', onKeyDown, true);
    const restore = opts?.restoreFocus === undefined ? previouslyFocused : opts.restoreFocus;
    if (restore && document.contains(restore)) {
      try { restore.focus({ preventScroll: true } as any); } catch {}
    }
  };

  return { release };
}

/**
 * Hide everything except the target from assistive tech by toggling aria-hidden.
 * Returns a restore() function that reverts previous values.
 */
export function ariaHideSiblings(target: HTMLElement): () => void {
  const doc = target.ownerDocument || document;
  const root = doc.body;
  const stack: Array<{ el: Element; prev: string | null }> = [];

  // Walk direct children of <body>
  Array.from(root.children).forEach((el) => {
    if (el === target || el.contains(target)) return; // keep target branch visible
    const prev = el.getAttribute('aria-hidden');
    stack.push({ el, prev });
    el.setAttribute('aria-hidden', 'true');

    // If supported, also mark inert to block focus/pointer
    // try { (el as any).inert = true; } catch { /* inert may not exist */ }
  });

  return () => {
    for (const { el, prev } of stack) {
      if (prev === null) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', prev);
      // try { delete (el as any).inert; } catch { /* ignore */ }
    }
  };
}

/** Create (or return) a shared live region for toasts. */
export function createLiveRegion(kind: LiveKind = 'polite'): HTMLElement {
  const id = kind === 'assertive' ? 'pj-live-assertive' : 'pj-live-polite';
  const existing = document.getElementById(id) as HTMLElement | null;
  if (existing) return existing;

  const region = document.createElement('div');
  region.id = id;
  region.setAttribute('aria-live', kind);
  region.setAttribute('role', kind === 'assertive' ? 'alert' : 'status');
  region.setAttribute('aria-atomic', 'true');
  region.style.position = 'absolute';
  region.style.width = '1px';
  region.style.height = '1px';
  region.style.margin = '-1px';
  region.style.border = '0';
  region.style.padding = '0';
  region.style.clip = 'rect(0 0 0 0)';
  region.style.overflow = 'hidden';

  document.body.appendChild(region);
  return region;
}
