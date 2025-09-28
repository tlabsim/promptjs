/**
 * PromptJS – config.ts
 * Central runtime configuration store and defaults.
 * Uses a simple event emitter to notify changes.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * Exposes:
 *   - config.get(): read the current configuration
 *   - config.update(partial): shallow-merge updates (with deep-merge for breakpoints/icons/toast)
 *   - config.onChange(fn): subscribe to changes (returns unsubscribe)
 *
 * Covers theme (light/dark/auto), container, z-index base, animation, i18n,
 * a11y hints, breakpoints, icon overrides, modal concurrency, and toast defaults.
 */

import { createNanoEvents } from "./utils";
import type {
  Theme,
  ModalConcurrency,
  ToastPosition,
  ToastBehavior,
  ToastAnimations,
} from "./types";

export interface PromptJSConfig {
  theme: Theme;
  container: HTMLElement | null;
  zIndexBase: number;
  animation: { enable: boolean; durationMs: number; easing?: string };  
  i18n: {
    locale: string;
    dir: "ltr" | "rtl" | "auto";
    ok: string;
    cancel: string;
    yes: string;
    no: string;
    close: string; // aria label for modal close button
    dismiss: string; // aria label for toast dismiss
    titles: {
      info: string;
      success: string;
      warning: string;
      error: string;
      question: string;
    };
  };
  a11y: { ariaModalLabel?: string };
  breakpoints: { sm: number; md: number; lg: number };
  icons: Partial<
    Record<
      "info" | "success" | "warning" | "error" | "question",
      string | HTMLElement
    >
  >;
  overlay: {
    fade: boolean;
    // surfaceRgb: string;
    surfaceAlpha: number;
    backdropBlurPx: number;
  };
  modal: {
    concurrency: ModalConcurrency;
    // surfaceRgb: string;
    surfaceAlpha?: number;   // 0 to 1, default 1.0 (opaque)
    dialogBlurPx?: number;   // backdrop-filter blur behind the modal (0 = none)
  };
  toast: {
    defaultPosition: ToastPosition; // default 'top-center'
    behavior: ToastBehavior; // 'stack' | 'queue' | 'replace'
    maxVisible: number; // cap per position for stack/queue
    spacingPx: number; // gap between toasts inside a slot
    margins: { top: number; bottom: number; left: number; right: number };
    zBoost: number; // z-index boost above overlays
    animations: ToastAnimations; // enter/exit + timeoutCue defaults (direction may be 'auto')
    defaultTimeoutMs: number; // e.g., 5000; 0 means sticky by default
    defaultDismissible: boolean; // show close button by default
  };
}

const defaults: PromptJSConfig = {
  theme: "auto",
  container: null,
  zIndexBase: 2000,
  animation: { enable: true, durationMs: 180, easing: "ease" },  
  i18n: {
    locale: "en",
    dir: "auto",
    ok: "OK",
    cancel: "Cancel",
    yes: "Yes",
    no: "No",
    close: "Close",
    dismiss: "Dismiss",
    titles: {
      info: "Information",
      success: "Success",
      warning: "Warning",
      error: "Error",
      question: "Question",
    },
  },
  a11y: {},
  breakpoints: { sm: 480, md: 640, lg: 800 },
  icons: {},
  overlay: {
    fade: true,    
    surfaceAlpha: 0.6,
    backdropBlurPx: 0,   
  },
  modal: {
    concurrency: "queue",
    surfaceAlpha: 1.0,
    dialogBlurPx: 0,
  },
  toast: {
    defaultPosition: "top-center",
    behavior: "stack",
    maxVisible: 3,
    spacingPx: 10,
    margins: { top: 16, bottom: 16, left: 16, right: 16 },
    zBoost: 100,
    animations: {
      // Final direction and distance are derived in toast.ts when direction === 'auto'
      // based on the chosen position. These are sensible global defaults.
      enter: { preset: "slide", direction: "auto" },
      exit: { preset: "slide", direction: "auto" },
      timeoutCue: { show: true, position: "bottom", direction: "shrink", thicknessPx: 3 },
    },
    defaultTimeoutMs: 4000,
    defaultDismissible: true,
  },
};

let current: PromptJSConfig = { ...defaults };
const ee = createNanoEvents();

export const config = {
  get: (): PromptJSConfig => current,

  update(partial: Partial<PromptJSConfig>) {
    current = {
      ...current,
      ...partial,
      breakpoints: {
        ...current.breakpoints,
        ...(partial.breakpoints || {}),
      },
      icons: {
        ...current.icons,
        ...(partial.icons || {}),
      },
      animation: { ...current.animation, ...(partial.animation || {}) },
      overlay: { ...current.overlay, ...(partial.overlay || {}) },      
      i18n: {
        ...current.i18n,
        ...(partial.i18n || {}),
        titles: {
          ...current.i18n.titles,
          ...(partial.i18n?.titles || {}),
        },
      },
      toast: {
        ...current.toast,
        ...(partial.toast || {}),
        margins: {
          ...current.toast.margins,
          ...(partial.toast?.margins || {}),
        },
        animations: {
          ...current.toast.animations,
          ...(partial.toast?.animations || {}),
          enter: partial.toast?.animations?.enter
            ? {
                ...current.toast.animations.enter,
                ...partial.toast.animations.enter,
              }
            : current.toast.animations.enter,
          exit: partial.toast?.animations?.exit
            ? {
                ...current.toast.animations.exit,
                ...partial.toast.animations.exit,
              }
            : current.toast.animations.exit,
          timeoutCue: partial.toast?.animations?.timeoutCue
            ? {
                ...current.toast.animations.timeoutCue,
                ...partial.toast.animations.timeoutCue,
              }
            : current.toast.animations.timeoutCue,
        },
      },
    };

    // Apply theme class to documentElement based on updated config
    if (current.theme === "auto") {
      document.documentElement.classList.add("pj-theme-auto");
      document.documentElement.classList.remove(
        "pj-theme-light",
        "pj-theme-dark"
      );      
    } else if (current.theme === "light") {
      document.documentElement.classList.add("pj-theme-light");
      document.documentElement.classList.remove(
        "pj-theme-dark",
        "pj-theme-auto"
      );
    } else if (current.theme === "dark") {
      document.documentElement.classList.add("pj-theme-dark");
      document.documentElement.classList.remove(
        "pj-theme-light",
        "pj-theme-auto"
      );
    }
    // Change theme class for pj-portal and pj-toasts if they exist
      const portal_grandcontainer = document.querySelector(".pj-portal");
      const toasts_grandcontainer = document.querySelector(".pj-toasts");
      if (portal_grandcontainer) {
        portal_grandcontainer.classList.remove("pj-theme-light", "pj-theme-dark", "pj-theme-auto");
        portal_grandcontainer.classList.add("pj-theme-" + (current.theme || "auto"));
      }
      if (toasts_grandcontainer) {
        toasts_grandcontainer.classList.remove("pj-theme-light", "pj-theme-dark", "pj-theme-auto");
        toasts_grandcontainer.classList.add("pj-theme-" + (current.theme || "auto"));
      }

    ee.emit("change");
  },

  onChange(fn: () => void) {
    ee.on("change", fn);
    return () => ee.off("change", fn);
  },
};
