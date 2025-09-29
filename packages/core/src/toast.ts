/**
 * PromptJS – toast.ts
 * Edge notifications with per-position slots, behavior (stack|queue|replace),
 * enter/exit animations, and a timeout progress cue.
 *
 * Uses Manager's toast slots/queues; does not affect modals.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 */

import { manager } from "./manager";
import { config } from "./config";
import { sanitize } from "./sanitize";
import type {
  ToastOptions,
  ToastPosition,
  ToastBehavior,
  ToastAnimations,
  ToastAnimSpec,
} from "./types";

type Phase = "enter" | "exit";

function px(v: number | string): string {
  return typeof v === "number" ? `${v}px` : v;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function removeMatchingClasses(el: Element, re: RegExp) {
  el.classList.forEach((cls) => {
    if (re.test(cls)) el.classList.remove(cls);
  });
}

/** Wait for a CSS animation to end; falls back to a timer. Returns a canceller. */
function onceAnimationEnd(
  el: HTMLElement,
  expectedMs: number,
  done: () => void
): () => void {
  let called = false;
  const onEnd = (ev: AnimationEvent) => {
    if (ev.target === el && !called) {
      called = true;
      el.removeEventListener("animationend", onEnd);
      clearTimeout(timer);
      done();
    }
  };
  const timer = window.setTimeout(() => {
    if (!called) {
      called = true;
      el.removeEventListener("animationend", onEnd);
      done();
    }
  }, Math.max(0, expectedMs) + 50);
  el.addEventListener("animationend", onEnd);
  return () => {
    if (!called) {
      called = true;
      clearTimeout(timer);
      el.removeEventListener("animationend", onEnd);
      done();
    }
  };
}

/**
 * Resolve an animation spec against a position:
 * - direction: 'auto' becomes a concrete edge
 * - distance: 'edge' becomes '120%' (off-screen enough)
 * - duration/easing: from spec or global config.animation
 */
function resolveAnim(
  position: ToastPosition,
  phase: Phase,
  spec?: ToastAnimSpec
): {
  preset: "fade" | "slide" | "scale";
  direction?: "up" | "down" | "left" | "right";
  distance?: string;
  durationMs: number;
  easing: string;
} {
  const cfg = config.get();
  const baseDur = cfg.animation?.durationMs ?? 180;
  const baseEase = cfg.animation?.easing ?? "ease";

  if (!spec) {
    const def =
      phase === "enter"
        ? {
            preset: "slide" as "slide",
            direction: autoDirection(position, phase),
            distance: defaultDistance(position, phase),
          }
        : { preset: "fade" as "fade" };
    return {
      preset: def.preset,
      direction: (def as any).direction,
      distance: (def as any).distance,
      durationMs: baseDur,
      easing: baseEase,
    };
  }

  const preset = spec.preset;
  const dir =
    preset === "slide"
      ? spec.direction && spec.direction !== "auto"
        ? spec.direction
        : autoDirection(position, phase)
      : undefined;

  let distance: string | undefined;
  if (preset === "slide") {
    if (spec.distance === "edge" || spec.distance === undefined) {
      distance = defaultDistance(position, phase);
    } else {
      distance = px(spec.distance);
    }
  }

  return {
    preset,
    direction: dir,
    distance,
    durationMs: spec.durationMs ?? baseDur,
    easing: spec.easing ?? baseEase,
  };
}

/** Direction denotes the edge the toast comes from (enter) or goes to (exit). */
function autoDirection(
  position: ToastPosition,
  phase: Phase
): "up" | "down" | "left" | "right" {
  switch (position) {
    case "top-center":
      return phase === "enter" ? "up" : "up";
    case "bottom-center":
      return phase === "enter" ? "down" : "down";
    case "top-left":
    case "bottom-left":
      return "left";
    case "top-right":
    case "bottom-right":
      return "right";
  }
}

/** Default movement distance: centers use subtle on enter and off-screen on exit; corners off-screen both. */
function defaultDistance(position: ToastPosition, phase: Phase): string {
  const offscreen = "120%";
  const subtle = "16px";
  if (position === "top-center") return phase === "enter" ? subtle : offscreen;
  if (position === "bottom-center")
    return phase === "enter" ? subtle : offscreen;
  return offscreen;
}

function applyAnim(
  el: HTMLElement,
  phase: Phase,
  resolved: ReturnType<typeof resolveAnim>
) {
  // Always set base vars for consistency
  el.style.setProperty("--pj-anim-duration", `${resolved.durationMs}ms`);
  el.style.setProperty("--pj-anim-ease", resolved.easing);

  if (resolved.preset === "fade") {
    el.classList.add(phase === "enter" ? "pj-enter-fade" : "pj-exit-fade");
    return;
  }

  if (resolved.preset === "scale") {
    el.classList.add(phase === "enter" ? "pj-enter-scale" : "pj-exit-scale");
    return;
  }

  if (resolved.preset === "slide" && resolved.direction) {
    if (phase === "enter" && resolved.distance) {
      // Only enter uses the variable distance (exit generally heads to edge)
      el.style.setProperty("--pj-enter-distance", resolved.distance);
    }
    const cls = `pj-${phase}-slide-${resolved.direction}`;
    el.classList.add(cls);
  }
}

function addTimeoutCue(
  el: HTMLElement,
  animations: ToastAnimations,
  timeoutMs?: number
) {
  if (!timeoutMs || timeoutMs <= 0) return;

  const cue = animations.timeoutCue || {};
  const show = cue.show !== false;
  if (!show) return;

  const pos = cue.position || "bottom";
  const thickness = cue.thicknessPx ?? 3;

  // Cover mode
  if (pos === "cover") {
    const cover = document.createElement("div");
    cover.className = "pj-timeout-cover";
    cover.style.setProperty("--pj-timeout-ms", `${timeoutMs}ms`);
    if (cue.direction === "shrink") cover.style.animationDirection = "reverse";
    el.appendChild(cover);
    return;
  }

  // Edge bar mode
  const bar = document.createElement("div");
  bar.className = `pj-timeout-bar pj-${pos}`;
  bar.style.setProperty("--pj-timeout-ms", `${timeoutMs}ms`);
  if (pos === "top" || pos === "bottom") {
    bar.style.height = `${thickness}px`;
  } else {
    bar.style.width = `${thickness}px`;
  }
  if (cue.direction === "shrink") bar.style.animationDirection = "reverse";
  el.appendChild(bar);
}

/* ------------------------------------------------------------------
   Container collapse (post-exit) to avoid stack "jump"
-------------------------------------------------------------------*/

function collapseAndRemove(
  container: HTMLElement,
  position: ToastPosition,
  durationMs: number,
  easing: string
) {
  // If animations disabled or reduced motion, just remove container
  if (
    prefersReducedMotion() ||
    durationMs <= 0 ||
    !config.get().animation?.enable
  ) {
    container.remove();
    manager.onToastRemoved(position);
    return;
  }

  const startH = container.offsetHeight;
  container.style.overflow = "hidden";
  container.style.height = `${startH}px`;
  container.style.marginTop = getComputedStyle(container).marginTop;
  container.style.marginBottom = getComputedStyle(container).marginBottom;
  container.style.paddingTop = getComputedStyle(container).paddingTop;
  container.style.paddingBottom = getComputedStyle(container).paddingBottom;

  // Force reflow to lock the starting values
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  (container as any).offsetWidth;

  container.style.transition = [
    `height ${durationMs}ms ${easing}`,
    `margin ${durationMs}ms ${easing}`,
    `padding ${durationMs}ms ${easing}`,
    `opacity ${durationMs}ms ${easing}`,
  ].join(", ");
  container.style.height = "0px";
  container.style.marginTop = "0px";
  container.style.marginBottom = "0px";
  container.style.paddingTop = "0px";
  container.style.paddingBottom = "0px";
  container.style.opacity = "0";

  const done = () => {
    container.removeEventListener("transitionend", done);
    container.remove();
    manager.onToastRemoved(position);
  };
  container.addEventListener("transitionend", done);
  // Safety in case transitionend is swallowed
  window.setTimeout(done, durationMs + 50);
}

/* ------------------------------------------------------------------
   Unified exit (timeout & button) -> then container collapse
-------------------------------------------------------------------*/

function beginExit(
  toastEl: HTMLElement,
  container: HTMLElement,
  position: ToastPosition,
  userExitSpec?: ToastAnimSpec
) {
  if ((toastEl as any)._pjExiting) return;
  (toastEl as any)._pjExiting = true;

  // Remove any lingering enter-* so exit can trigger
  removeMatchingClasses(toastEl, /^pj-enter-/);

  const cfg = config.get();
  const animEnabled = !!cfg.animation?.enable;
  const exitResolved = resolveAnim(
    position,
    "exit",
    userExitSpec ?? cfg.toast.animations.exit
  );

  if (!animEnabled || prefersReducedMotion() || exitResolved.durationMs <= 0) {
    // No motion: collapse container immediately
    collapseAndRemove(container, position, 0, exitResolved.easing);
    return;
  }

  // Apply exit animation to the toast element
  applyAnim(toastEl, "exit", exitResolved);

  // Force a reflow so class changes are recognized as a new animation
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  (toastEl as any).offsetWidth;

  // Wait for exit anim to complete, then collapse the container
  onceAnimationEnd(toastEl, exitResolved.durationMs, () => {
    collapseAndRemove(
      container,
      position,
      exitResolved.durationMs,
      exitResolved.easing
    );
  });
}

/* ------------------------------------------------------------
   Public API
-------------------------------------------------------------*/

export function toast(opts: ToastOptions): { dismiss: () => void } {
  manager.ensureRoots();

  const cfg = config.get();
  const pos: ToastPosition = opts.position || cfg.toast.defaultPosition;
  const behavior: ToastBehavior = opts.behavior || cfg.toast.behavior;
  const maxVisible = opts.maxVisible || cfg.toast.maxVisible;

  const timeoutMs = opts.timeoutMs ?? cfg.toast.defaultTimeoutMs;

  // ── Container (floats in the slot; collapses after exit) ─────────
  const container = document.createElement("div");
  container.className = "pj-toast-item";

  // Base toast element (animates in/out inside the container)
  const el = document.createElement("div");
  el.className = `pj-toast pj-${opts.kind || "neutral"} ${
    opts.dismissible ?? cfg.toast.defaultDismissible ? "dismissible" : ""
  }`;
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");

  // Title (optional)
  let contentContainer = el;
  let titleId: string | undefined;
  if (opts.title) {
    const h = document.createElement("div");
    h.className = "pj-toast-title";
    h.innerHTML = sanitize(opts.title);
    titleId = `pj-title-${Math.random().toString(36).slice(2, 9)}`;
    h.id = titleId;
    el.appendChild(h);
    el.classList.add("has-title");

    // Wrap body+actions in a container for layout, body and actions appear side by side
    contentContainer = document.createElement("div");
    contentContainer.style.cssText = "display: flex; align-items: center; gap: 6px;";
    el.appendChild(contentContainer);
  }

  // Content
  const body = document.createElement("div");
  body.className = "pj-toast-body";
  body.innerHTML = sanitize(opts.message);
  const bodyId = `pj-body-${Math.random().toString(36).slice(2, 9)}`;
  body.id = bodyId;
  contentContainer.appendChild(body);

  // ARIA: prefer labelled-by (title) + described-by (body) if available
  if (titleId) {
    el.setAttribute("aria-labelledby", titleId);
    el.setAttribute("aria-describedby", bodyId);
  }

  // Actions (optional)
  if (opts.actions?.length) {
    const bar = document.createElement("div");
    bar.className = "pj-toast-actions";
    for (const a of opts.actions) {
      const btn = document.createElement("button");
      btn.className = "pj-toast-btn ghost";
      btn.textContent = a.text;
      // Clicking any action also dismisses the toast
      btn.addEventListener("click", () =>
        beginExit(el, container, pos, opts.animations?.exit)
      );
      btn.addEventListener("click", () => {
        try {
          a.onClick?.();
        } catch {}
      });
      bar.appendChild(btn);
    }
    contentContainer.appendChild(bar);
  }

  // Dismiss button
  const dismissible = opts.dismissible ?? cfg.toast.defaultDismissible;
  if (dismissible) {
    const x = document.createElement("button");
    x.className = "pj-toast-close";
    x.setAttribute("aria-label", cfg.i18n.dismiss);
    x.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="4" aria-hidden="true">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>';
    x.addEventListener("click", () =>
      beginExit(el, container, pos, opts.animations?.exit)
    );
    el.appendChild(x);
  }

  // Timeout auto-dismiss and visual cue
  let timer: number | undefined;
  if (timeoutMs && timeoutMs > 0) {
    addTimeoutCue(el, opts.animations || cfg.toast.animations, timeoutMs);
    timer = window.setTimeout(
      () => beginExit(el, container, pos, opts.animations?.exit),
      timeoutMs
    );
  }

  // Enter animation on the toast element
  const enterResolved = resolveAnim(
    pos,
    "enter",
    (opts.animations && opts.animations.enter) || cfg.toast.animations.enter
  );
  const animEnabled = !!cfg.animation?.enable;

  if (!prefersReducedMotion() && animEnabled && enterResolved.durationMs > 0) {
    applyAnim(el, "enter", enterResolved);
    // Clean enter classes after they complete, so exit always re-triggers
    onceAnimationEnd(el, enterResolved.durationMs, () => {
      removeMatchingClasses(el, /^pj-enter-/);
    });
  }

  // Compose container
  container.appendChild(el);

  // Mount through Manager (container is the unit in the slot)
  manager.showToast(container, pos, behavior, maxVisible);

  // Controller
  return {
    dismiss: () => {
      if (timer) window.clearTimeout(timer);
      beginExit(el, container, pos, opts.animations?.exit);
    },
  };
}

// Temporary alias to ease migration; document toast() as the primary API
export const notify = toast;
