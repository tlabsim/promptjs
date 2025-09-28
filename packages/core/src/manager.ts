/**
 * PromptJS – manager.ts
 * Singleton DOM manager that coordinates shared UI infrastructure.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * Responsibilities:
 *   - Create and maintain root containers:
 *       .pj-portal   (modals/dialog overlays)
 *       .pj-toasts   (overlaying toast layer with per-position slots)
 *   - Enforce modal concurrency (queue or reject new opens)
 *   - Body scroll lock + scrollbar compensation
 *   - Z-index base coordination (toasts sit above overlays)
 *   - Toast slots and per-position behavior/queues
 *
 * No external deps. Works with ES2019 + DOM libs.
 */

import { config } from './config';
import type { ToastBehavior, ToastPosition } from './types';

type Job = () => void;

class Manager {
  portal!: HTMLElement;     // overlay mount (modals/dialogs)
  toastsRoot!: HTMLElement; // root layer for toast slots

  // Modal state
  private activeModal = 0;
  private modalQueue: Job[] = [];

  // Toast state
  private toastSlots = new Map<ToastPosition, HTMLElement>();
  private toastQueues = new Map<ToastPosition, Array<{ mount: () => void; maxVisible: number }>>();

  ensureRoots() {
    const parent = config.get().container ?? document.body;

    const existing = document.querySelector('.pj-portal') as HTMLElement;
    if (existing && this.portal && existing !== this.portal) {
      existing.remove();
      this.portal = undefined!;
    }   

    if (!this.portal) {
      this.portal = document.createElement('div');
      this.portal.className = 'pj-portal pj-theme-' + (config.get().theme || 'auto');
      this.portal.style.position = 'relative';
      this.portal.style.zIndex = String(config.get().zIndexBase || 2000);
      parent.appendChild(this.portal);
    }
    else {
      this.portal.style.zIndex = String(config.get().zIndexBase || 2000);
    }     

    if (!this.toastsRoot) {
      this.toastsRoot = document.createElement('div');
      this.toastsRoot.className = 'pj-toasts pj-theme-' + (config.get().theme || 'auto');
      // Above overlays: base + zBoost
      const z = (config.get().zIndexBase || 2000) + (config.get().toast.zBoost || 100);
      Object.assign(this.toastsRoot.style, {
        position: 'fixed',
        inset: '0',
        zIndex: String(z),
        pointerEvents: 'none',
      } as CSSStyleDeclaration);
      parent.appendChild(this.toastsRoot);
    }
  }

  // -------- Modal orchestration --------

  open(job: Job) {
    this.ensureRoots();
    const mode = config.get().modal.concurrency;
    if (this.activeModal > 0 && mode === 'reject') {
      throw new Error('PromptJS: modal already open');
    }
    if (this.activeModal > 0 && mode === 'queue') {
      this.modalQueue.push(job);
      return;
    }
    this.activeModal++;
    job();
  }

  onClose() {
    this.activeModal = Math.max(0, this.activeModal - 1);
    if (this.modalQueue.length) {
      const next = this.modalQueue.shift()!;
      this.open(next);
    }
  }

  scrollLock(lock: boolean) {
    const body = document.body;
    if (lock) {
      if (!body.style.getPropertyValue('--pj-scrollbar')) {
        const sbw = window.innerWidth - document.documentElement.clientWidth;
        body.style.setProperty('--pj-scrollbar', `${sbw}px`);
      }
      body.classList.add('pj-lock');
    } else {
      body.classList.remove('pj-lock');
      body.style.removeProperty('--pj-scrollbar');
    }
  }

  // -------- Toast infrastructure --------

  private getToastSlot(pos: ToastPosition): HTMLElement {
    this.ensureRoots();
    const existing = this.toastSlots.get(pos);
    if (existing) return existing;

    const slot = document.createElement('div');
    slot.className = `pj-toast-slot pj-${pos}`;
    slot.style.position = 'fixed';
    slot.style.display = 'flex';
    slot.style.flexDirection = 'column';
    slot.style.pointerEvents = 'none';

    const { margins, spacingPx } = config.get().toast;
    slot.style.gap = `${spacingPx}px`;

    const top = `${margins.top}px`;
    const bottom = `${margins.bottom}px`;
    const left = `${margins.left}px`;
    const right = `${margins.right}px`;

    // Anchor by position
    switch (pos) {
      case 'top-left':
        slot.style.top = top; slot.style.left = left; break;
      case 'top-center':
        slot.style.top = top; slot.style.left = '50%'; slot.style.transform = 'translateX(-50%)'; break;
      case 'top-right':
        slot.style.top = top; slot.style.right = right; break;
      case 'bottom-left':
        slot.style.bottom = bottom; slot.style.left = left; break;
      case 'bottom-center':
        slot.style.bottom = bottom; slot.style.left = '50%'; slot.style.transform = 'translateX(-50%)'; break;
      case 'bottom-right':
        slot.style.bottom = bottom; slot.style.right = right; break;
    }

    this.toastsRoot.appendChild(slot);
    this.toastSlots.set(pos, slot);
    return slot;
  }

  /**
   * Mount a toast into its position slot honoring behavior.
   * - stack: append; if full, drop oldest to keep UI responsive
   * - queue: enqueue if full; mount when a slot frees
   * - replace: clear slot and show only the new toast
   */
  showToast(el: HTMLElement, pos: ToastPosition, behavior: ToastBehavior, maxVisible: number) {
    const slot = this.getToastSlot(pos);
    const visible = slot.children.length;

    // Allow interactions inside toast
    el.style.pointerEvents = 'auto';

    if (behavior === 'replace') {
      while (slot.firstElementChild) slot.removeChild(slot.firstElementChild);
      slot.appendChild(el);
      return;
    }

    if (behavior === 'stack') {
      if (visible >= maxVisible) {
        slot.firstElementChild?.remove();
      }
      slot.appendChild(el);
      return;
    }

    // queue
    if (visible >= maxVisible) {
      const q = this.toastQueues.get(pos) || [];
      q.push({ mount: () => slot.appendChild(el), maxVisible });
      this.toastQueues.set(pos, q);
    } else {
      slot.appendChild(el);
    }
  }

  /**
   * Notify manager that a toast at a position was removed.
   * Used to advance queued toasts for that position.
   */
  onToastRemoved(pos: ToastPosition) {
    const slot = this.getToastSlot(pos);
    const q = this.toastQueues.get(pos);
    if (!q || q.length === 0) return;

    if (slot.children.length < q[0].maxVisible) {
      const next = q.shift()!;
      next.mount();
    }
  }
}

export const manager = new Manager();
