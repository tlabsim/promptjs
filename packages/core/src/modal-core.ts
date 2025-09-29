/**
 * PromptJS – modal-core.ts
 * Core modal dialog surface creation and management.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 */ 

import { uid } from "./utils";
import { config } from "./config";
import { manager } from "./manager";
import { trapFocus, ariaHideSiblings } from "./a11y";
import type {
  ModalInstance,
  ModalDraggable,
  ModalConcurrency,
  NotifyKind,
  ButtonDef,
} from "./types";

/**
 * Use longhand translate when available so dragging composes with animations.
 * Optionally add this CSS once if you want a robust fallback:
 * .pj-modal{ --pj-dx:0px; --pj-dy:0px; transform: translate(var(--pj-dx),var(--pj-dy)); }
 */
function setDragOffset(el: HTMLElement, x: number, y: number) {
  if ("translate" in (el.style as any))
    (el.style as any).translate = `${x}px ${y}px`;
  else {
    el.style.setProperty("--pj-dx", `${x}px`);
    el.style.setProperty("--pj-dy", `${y}px`);
  }
}

type DragResolved = {
  axis: "x" | "y" | "both";
  withinViewport: boolean;
  cursor: string | null; // null => don't set
};

function enableDragging(
  surfaceEl: HTMLDivElement,
  handleEl: HTMLElement,
  spec: DragResolved
) {
  let startX = 0,
    startY = 0,
    baseX = 0,
    baseY = 0;
  let moving = false;

  const point = (e: MouseEvent | TouchEvent) => {
    const t = (e as TouchEvent).touches?.[0] ?? (e as MouseEvent);
    return { x: t.clientX, y: t.clientY };
  };

  const readTranslate = () => {
    const t = surfaceEl.style.translate || "";
    const m = t.match(/(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px/);
    if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
    const dx =
      parseFloat(getComputedStyle(surfaceEl).getPropertyValue("--pj-dx")) || 0;
    const dy =
      parseFloat(getComputedStyle(surfaceEl).getPropertyValue("--pj-dy")) || 0;
    return { x: dx, y: dy };
  };

  const clampViewport = (nx: number, ny: number) => {
    if (!spec.withinViewport) return { x: nx, y: ny };
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const r = surfaceEl.getBoundingClientRect();
    const minX = -r.left + r.width * -0.9;
    const maxX = vw - r.right + r.width * 0.9;
    const minY = -r.top + r.height * -0.9;
    const maxY = vh - r.bottom + r.height * 0.9;
    return {
      x: Math.min(Math.max(nx, minX), maxX),
      y: Math.min(Math.max(ny, minY), maxY),
    };
  };

  const onMove = (e: MouseEvent | TouchEvent) => {
    if (!moving) return;
    e.preventDefault();
    const p = point(e);
    let nx = baseX + (spec.axis === "y" ? 0 : p.x - startX);
    let ny = baseY + (spec.axis === "x" ? 0 : p.y - startY);
    ({ x: nx, y: ny } = clampViewport(nx, ny));
    setDragOffset(surfaceEl, nx, ny);
  };

  const onUp = () => {
    moving = false;
    document.removeEventListener("mousemove", onMove, true);
    document.removeEventListener("touchmove", onMove, true);
    handleEl.style.cursor = spec.cursor || "grab";
  };

  const onDown = (e: MouseEvent | TouchEvent) => {
    if (e instanceof MouseEvent && e.button !== 0) return;
    e.preventDefault();
    const p = point(e);
    startX = p.x;
    startY = p.y;
    const t = readTranslate();
    baseX = t.x;
    baseY = t.y;
    moving = true;
    handleEl.style.cursor = spec.cursor || "grabbing";
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("mouseup", onUp, { once: true, capture: true });
    document.addEventListener("touchmove", onMove, {
      passive: false,
      capture: true,
    });
    document.addEventListener("touchend", onUp, { once: true, capture: true });
    surfaceEl.classList.add("pj-modal-moved");
  };

  handleEl.addEventListener("mousedown", onDown);
  handleEl.addEventListener("touchstart", onDown, { passive: false });

  return () => {
    handleEl.removeEventListener("mousedown", onDown);
    handleEl.removeEventListener("touchstart", onDown);
  };
}

/* ---------------- Core contracts ---------------- */

export type CoreChrome = {
  windowed: boolean;
  bare?: boolean;
  size?:
    | "sm"
    | "md"
    | "lg"
    | "fit"
    | { w?: number | string; h?: number | string };
  surfaceClass?: string;
  contentClass?: string;
};

export type CoreBehavior = {
  animate?: boolean;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  trapFocus?: boolean;
  ariaLabel?: string;
  draggable?: ModalDraggable;
  onOpen?: (inst: ModalInstance) => void;
  onClose?: (result?: unknown) => void;
  concurrency?: ModalConcurrency;
};

export type CoreVisuals = {
  surfaceAlpha?: number;
  dialogBlurPx?: number; // blur on modal surface when translucent
  backdropBlurPx?: number; // blur on overlay
  kind?: NotifyKind;
};

export type CoreOptions = CoreChrome & CoreBehavior & CoreVisuals;

export type CoreRenderers = {
  renderHeader?: (inst: ModalInstance, headerHost: HTMLDivElement) => void;
  renderBody: (
    inst: ModalInstance,
    bodyHost: HTMLDivElement,
    setContentEl: (el: HTMLElement) => void
  ) => void;
  renderFooter?: (inst: ModalInstance, footerHost: HTMLDivElement) => void;
  setUpdater?: (
    inst: ModalInstance,
    refs: {
      header?: HTMLDivElement | null;
      body: HTMLDivElement;
      footer?: HTMLDivElement | null;
      setContentEl: (el: HTMLElement) => void;
    }
  ) => void;
};

export function createSurface(
  core: CoreOptions,
  r: CoreRenderers
): ModalInstance {
  const id = uid("modal");
  const cfg = config.get();
  const animEnabled = core.animate ?? cfg.animation?.enable ?? true;
  const animDur = cfg.animation?.durationMs ?? 180;
  const animEase = cfg.animation?.easing ?? "ease";
  const overlayFade = cfg.overlay?.fade ?? true;

  // roots
  manager.ensureRoots();

  // DOM refs
  let overlay!: HTMLDivElement;
  let modal!: HTMLDivElement;
  let headerEl: HTMLDivElement | null = null;
  let bodyEl!: HTMLDivElement;
  let footerEl: HTMLDivElement | null = null;

  // lifecycle
  let isClosing = false;
  let releaseTrap: (() => void) | null = null;
  let restoreAria: (() => void) | null = null;
  let cleanupDrag: (() => void) | null = null;

  // instance handles
  let _el!: HTMLDivElement;
  let _contentEl!: HTMLElement;
  const instance: ModalInstance = {
    id,
    close: (result?: unknown) => close(result),
    update: () => {
      /* Dialog-only update is implemented in modal.ts via wrapper */
    },
    get el() {
      return _el;
    },
    get contentEl() {
      return _contentEl;
    },
  };

  let onEsc: ((e: KeyboardEvent) => void) | null = null;

  const render = () => {
    // overlay
    overlay = document.createElement("div");
    overlay.className = "pj-overlay";
    overlay.setAttribute("role", "presentation");
    const alpha = cfg.overlay?.surfaceAlpha ?? 0.6;
    overlay.style.setProperty("--pj-overlay-alpha", String(alpha));
    const overlayBlur = core.backdropBlurPx ?? cfg.overlay?.backdropBlurPx ?? 0;
    if (overlayBlur > 0) {
      overlay.classList.add("pj-blur");
      overlay.style.setProperty("--pj-overlay-blur", `${overlayBlur}px`);
    }

    // modal surface
    modal = document.createElement("div");
    modal.className = core.windowed ? "pj-modal" : "pj-modal-no-window";
    if (core.bare)
      modal.classList.add(
        "pad-none"
      ); /* Add no padding if bare, content can add margin or padding */

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    if (core.ariaLabel) modal.setAttribute("aria-label", core.ariaLabel);
    if (core.kind) modal.classList.add(`pj-kind-${core.kind}`);
    // modal.classList.add(core.windowed ? "windowed" : "nonwindowed");

    // visuals (alpha + surface blur)
    const surfaceAlpha = core.surfaceAlpha ?? cfg.modal.surfaceAlpha ?? 1;
    const surfaceBlur = core.dialogBlurPx ?? cfg.modal.dialogBlurPx ?? 0;
    modal.style.setProperty("--pj-modal-alpha", String(surfaceAlpha));
    if (surfaceAlpha < 1 && surfaceBlur > 0) {
      modal.classList.add("pj-modal-translucent");
      modal.style.setProperty("--pj-modal-blur", `${surfaceBlur}px`);
    }

    // size presets when windowed and string size
    const sz = core.size ?? "md";
    if (core.windowed && typeof sz === "string") {
      modal.classList.add(`size-${sz}`);
    }

    // header/body/footer hosts
    if (r.renderHeader) {
      headerEl = document.createElement("div");
      headerEl.className = "pj-modal-header";
      modal.appendChild(headerEl);
    }

    bodyEl = document.createElement("div");
    bodyEl.className = "pj-modal-content";
    if (core.bare)
      bodyEl.classList.add(
        "pad-none"
      ); /* Add no padding if bare, content can add margin or padding */
    if (core.contentClass) bodyEl.classList.add(core.contentClass);
    modal.appendChild(bodyEl);

    if (r.renderFooter) {
      footerEl = document.createElement("div");
      footerEl.className = "pj-modal-footer";
      modal.appendChild(footerEl);
    }

    if (core.surfaceClass) modal.classList.add(core.surfaceClass);

    overlay.appendChild(modal);
    manager.portal.appendChild(overlay);

    // focus trap & aria hide
    const initial = footerEl?.querySelector("button") as HTMLElement | null;
    if (core.trapFocus !== false) {
      releaseTrap = trapFocus(modal, { initialFocus: initial }).release;
    }
    restoreAria = ariaHideSiblings(overlay);

    // instance element handles
    _el = modal;
    _contentEl = bodyEl;

    // renderers
    if (r.renderHeader && headerEl) r.renderHeader(instance, headerEl);
    r.renderBody(instance, bodyEl, (el) => {
      _contentEl = el;
    });
    if (r.renderFooter && footerEl) r.renderFooter(instance, footerEl);
    if (r.setUpdater) {
      r.setUpdater(instance, {
        header: headerEl,
        body: bodyEl,
        footer: footerEl,
        setContentEl: (el) => {
          _contentEl = el;
        }, 
      });
    }

    // dragging
    const drag = core.draggable;
    const prefersCoarse =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches;
    const isMobileUA = /Mobi|Android/i.test(navigator.userAgent);
    const disableOnMobile =
      typeof drag === "object" ? drag.disableOnMobile ?? true : true;

    if (drag && !prefersCoarse && !(isMobileUA && disableOnMobile)) {
      const spec = typeof drag === "object" ? drag : {};
      const axis = spec.axis ?? "both";
      const withinViewport = spec.withinViewport ?? true;
      const cursor = spec.cursor ?? null;

      // resolve handle: default header (if exists & windowed), else content/body
      let handleEl: HTMLElement | null = null;
      if (spec.handle instanceof HTMLElement) handleEl = spec.handle;
      else if (typeof spec.handle === "string") {
        if (spec.handle === "header") handleEl = headerEl ?? null;
        else if (spec.handle === "body") handleEl = bodyEl;
        else handleEl = modal.querySelector(spec.handle) as HTMLElement | null;
      } else {
        handleEl = core.windowed ? headerEl ?? modal : _contentEl ?? bodyEl;
      }

      if (handleEl) {
        cleanupDrag = enableDragging(modal, handleEl, {
          axis,
          withinViewport,
          cursor,
        });
        modal.classList.add("pj-modal-draggable");
        if (cursor) handleEl.style.cursor = cursor;
      }
    }

    bind();
    manager.scrollLock(true);

    // open animations
    if (animEnabled) {
      if (overlayFade) {
        overlay.classList.add("pj-overlay-in");
        overlay.style.setProperty("--pj-anim-duration", `${animDur}ms`);
        overlay.style.setProperty("--pj-anim-ease", animEase);
      }
      modal.classList.add("pj-modal-in");
      modal.style.setProperty("--pj-anim-duration", `${animDur}ms`);
      modal.style.setProperty("--pj-anim-ease", animEase);
    }

    core.onOpen?.(instance);
  };

  const bind = () => {
    if (core.closeOnBackdrop ?? true) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close("backdrop");
      });
    }
    if (core.closeOnEsc ?? true) {
      onEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          close("esc");
          document.removeEventListener("keydown", onEsc as any, true);
        }
      };
      document.addEventListener("keydown", onEsc, true);
    }
  };

  const teardown = (result?: unknown) => {
    overlay.remove();
    manager.onClose();
    manager.scrollLock(false);
    try {
      releaseTrap?.();
    } catch {}
    try {
      restoreAria?.();
    } catch {}
    try {
      cleanupDrag?.();
    } catch {}
    releaseTrap = restoreAria = cleanupDrag = null;
    try {
      document.removeEventListener("keydown", onEsc as any, true);
    } catch {}
    core.onClose?.(result);
  };

  const close = (result?: unknown) => {
    if (isClosing) return;
    isClosing = true;

    if (!animEnabled) {
      teardown(result);
      return;
    }

    modal.classList.remove("pj-modal-in");
    modal.classList.add("pj-modal-out");
    modal.style.setProperty("--pj-anim-duration", `${animDur}ms`);
    modal.style.setProperty("--pj-anim-ease", animEase);

    if (overlayFade) {
      overlay.classList.remove("pj-overlay-in");
      overlay.classList.add("pj-overlay-out");
      overlay.style.setProperty("--pj-anim-duration", `${animDur}ms`);
      overlay.style.setProperty("--pj-anim-ease", animEase);
    }

    let doneModal = false;
    let doneOverlay = !overlayFade;
    const tryDone = () => {
      if (doneModal && doneOverlay) teardown(result);
    };

    const onModalEnd = () => {
      doneModal = true;
      modal.removeEventListener("animationend", onModalEnd);
      tryDone();
    };
    modal.addEventListener("animationend", onModalEnd);

    if (overlayFade) {
      const onOverlayEnd = () => {
        doneOverlay = true;
        overlay.removeEventListener("animationend", onOverlayEnd);
        tryDone();
      };
      overlay.addEventListener("animationend", onOverlayEnd);
    }

    window.setTimeout(tryDone, (animDur ?? 0) + 50);
  };

  // Orchestrate via manager (queue/reject handled there already)
  manager.open(() => render());

  return instance;
}
