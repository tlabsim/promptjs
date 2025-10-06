import * as React from "react";
import { toast as coreToast, Modal, alert, confirm, question, prompt } from "@tlabsinc/promptjs-core";
import type { PromptContextValue } from "./types";
import { usePrompt } from "./provider";

/** Stable toast callback for use in React components. */
export function useToast() {
  // Use context when available; fall back to core
  const ctx = usePrompt() as PromptContextValue;
  return React.useCallback((opts: Parameters<typeof coreToast>[0]) => {
    return ctx.toast(opts);
  }, [ctx]);
}

/** Handy helpers for dialogs in React event handlers. */
export function useDialogs() {
  const ctx = usePrompt();
  return React.useMemo(() => {
    return {
      alert: ctx.alert,
      confirm: ctx.confirm,
      question: ctx.question,
      prompt: ctx.prompt
    };
  }, [ctx]);
}

/**
 * Optional: open a modal from React with a stable callback,
 * returning the instance handle if you need to update/close it.
 */
export function useModal() {
  const ctx = usePrompt();
  return React.useCallback((opts: Parameters<typeof Modal.open>[0]) => {
    return ctx.Modal.open(opts);
  }, [ctx]);
}

/**
 * Hook for mounting custom content in a minimal modal wrapper.
 * Returns stable callbacks for both bare() and mount() (they're aliases).
 */
export function useBareModal() {
  const ctx = usePrompt();
  return React.useMemo(() => ({
    bare: (opts: Parameters<typeof Modal.bare>[0]) => ctx.Modal.bare(opts),
    mount: (opts: Parameters<typeof Modal.bare>[0]) => ctx.Modal.mount(opts)
  }), [ctx]);
}
