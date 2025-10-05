import * as React from 'react';
import { ReactNode } from 'react';
import * as _tlabsinc_promptjs_core from '@tlabsinc/promptjs-core';
import { config, Modal, toast, alert, confirm, question, prompt, i18n, version } from '@tlabsinc/promptjs-core';

type PromptTheme = "auto" | "light" | "dark";
/**
 * When `scope` is true, PromptJS mounts its portals inside the
 * provider’s wrapper instead of `document.body`.
 */
interface PromptProviderProps {
    children: ReactNode;
    theme?: PromptTheme;
    scope?: boolean;
    zIndexBase?: number;
}
interface PromptContextValue {
    config: typeof config;
    Modal: typeof Modal;
    toast: typeof toast;
    alert: typeof alert;
    confirm: typeof confirm;
    question: typeof question;
    prompt: typeof prompt;
    i18n: typeof i18n;
    version: typeof version;
}

declare const PromptProvider: React.FC<PromptProviderProps>;
declare function usePrompt(): PromptContextValue;

/** Stable toast callback for use in React components. */
declare function useToast(): (opts: Parameters<typeof toast>[0]) => {
    dismiss: () => void;
};
/** Handy helpers for dialogs in React event handlers. */
declare function useDialogs(): {
    alert: typeof alert;
    confirm: typeof confirm;
    question: typeof question;
    prompt: typeof prompt;
};
/**
 * Optional: open a modal from React with a stable callback,
 * returning the instance handle if you need to update/close it.
 */
declare function useModal(): (opts: Parameters<typeof Modal.open>[0]) => _tlabsinc_promptjs_core.ModalInstance;

export { type PromptContextValue, PromptProvider, type PromptProviderProps, type PromptTheme, useDialogs, useModal, usePrompt, useToast };
