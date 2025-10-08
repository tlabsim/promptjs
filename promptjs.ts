/**
 * PromptJS Initialization & Configuration
 * 
 * This file initializes PromptJS with Qwizen branding and exports
 * React hooks for use throughout the creator dashboard.
 * 
 * Usage:
 * ```tsx
 * import { useDialogs, useToast } from '@/lib/promptjs';
 * 
 * function MyComponent() {
 *   const { alert, confirm, prompt } = useDialogs();
 *   const toast = useToast();
 *   
 *   const handleSave = async () => {
 *     const name = await prompt("Enter name:");
 *     if (name) {
 *       // Save logic
 *       toast({ kind: 'success', message: 'Saved!' });
 *     }
 *   };
 * }
 * ```
 */

// Type definitions for PromptJS global object
declare global {
  interface Window {
    PromptJS: {
      alert: (message: string, options?: AlertOptions) => Promise<void>;
      confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
      prompt: (message: string, defaultValue?: string, options?: PromptOptions) => Promise<string | null>;
      question: (message: string, options?: QuestionOptions) => Promise<boolean>;
      toast: (options: ToastOptions) => void;
      Modal: {
        open: (options: ModalOptions) => ModalInstance;
        bare: (options: BareModalOptions) => ModalInstance;
        mount: (options: BareModalOptions) => ModalInstance;
      };
      config: {
        update: (config: Partial<PromptJSConfig>) => void;
        get: () => PromptJSConfig;
        onChange: (callback: (config: PromptJSConfig) => void) => () => void;
      };
      i18n: {
        use: (locale: string, translations: I18nTranslations) => void;
      };
      version: string;
    };
    PJ: typeof window.PromptJS;
  }
}

// Type definitions
export interface AlertOptions {
  title?: string;
  kind?: 'info' | 'success' | 'warning' | 'error';
  okText?: string;
}

export interface ConfirmOptions extends AlertOptions {
  cancelText?: string;
}

export interface PromptOptions extends ConfirmOptions {
  inputType?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  required?: boolean;
  pattern?: string;
  maxLength?: number;
  minLength?: number;
  validator?: (value: string) => boolean | string;
  placeholder?: string;
}

export interface QuestionOptions extends ConfirmOptions {
  yesText?: string;
  noText?: string;
}

export interface ToastOptions {
  message: string;
  kind?: 'info' | 'success' | 'warning' | 'error';
  timeoutMs?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  dismissible?: boolean;
  actions?: Array<{
    text: string;
    onClick?: () => void;
  }>;
}

export interface ModalOptions {
  title?: string;
  content?: string | HTMLElement;
  buttons?: Array<{
    text: string;
    variant?: 'primary' | 'secondary' | 'danger';
    onClick?: () => void | Promise<void>;
  }>;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  onClose?: (reason: string) => void;
}

export interface BareModalOptions {
  content: HTMLElement;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  animate?: boolean;
}

export interface ModalInstance {
  id: string;
  update: (options: Partial<ModalOptions>) => void;
  close: (reason?: string) => void;
  contentEl: HTMLElement;
}

export interface PromptJSConfig {
  theme: 'light' | 'dark' | 'auto';
  animation: {
    enable: boolean;
    durationMs: number;
  };
  modal: {
    closeOnEsc: boolean;
    closeOnBackdrop: boolean;
    concurrency: 'allow' | 'queue' | 'reject';
  };
  toast: {
    defaultPosition: ToastOptions['position'];
    timeoutMs: number;
    behavior: 'stack' | 'queue' | 'replace';
  };
  i18n: I18nTranslations;
  zIndexBase: number;
  container: HTMLElement | null;
}

export interface I18nTranslations {
  locale: string;
  dir?: 'ltr' | 'rtl';
  ok: string;
  cancel: string;
  yes: string;
  no: string;
  titles?: {
    info?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
}

/**
 * Initialize PromptJS with Qwizen branding
 * This runs once when the module is imported
 */
function initializePromptJS() {
  if (typeof window === 'undefined' || !window.PromptJS) {
    console.warn('PromptJS not found. Make sure prompt.js is loaded before importing this module.');
    return;
  }

  // Apply Qwizen branding and defaults
  window.PromptJS.config.update({
    theme: 'auto', // Follow system preference
    animation: {
      enable: true,
      durationMs: 200, // Smooth but fast
    },
    modal: {
      closeOnEsc: true,
      closeOnBackdrop: true,
      concurrency: 'allow', // Allow multiple modals
    },
    toast: {
      defaultPosition: 'top-right',
      timeoutMs: 3000, // 3 seconds
      behavior: 'stack', // Stack multiple toasts
    },
    i18n: {
      locale: 'en',
      ok: 'OK',
      cancel: 'Cancel',
      yes: 'Yes',
      no: 'No',
      titles: {
        info: 'Information',
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
      },
    },
  });

  // Create global shorthand
  window.PJ = window.PromptJS;

  console.log('✅ PromptJS initialized for Qwizen');
}

// Initialize on module load
initializePromptJS();

/**
 * Re-export React hooks from react.js
 * 
 * Note: These hooks come from public/js/promptjs/react.js
 * They work with the global window.PromptJS object
 */

// Import React hooks (these should be exported from react.js)
// Since react.js is a compiled file, we'll create our own hooks that use the global object

import { useCallback, useMemo } from 'react';

/**
 * Hook for using dialog functions (alert, confirm, prompt, question)
 */
export function useDialogs() {
  return useMemo(() => {
    if (typeof window === 'undefined' || !window.PromptJS) {
      throw new Error('PromptJS not loaded');
    }

    return {
      alert: window.PromptJS.alert,
      confirm: window.PromptJS.confirm,
      question: window.PromptJS.question,
      prompt: window.PromptJS.prompt,
    };
  }, []);
}

/**
 * Hook for showing toast notifications
 */
export function useToast() {
  return useCallback((options: ToastOptions) => {
    if (typeof window === 'undefined' || !window.PromptJS) {
      throw new Error('PromptJS not loaded');
    }

    return window.PromptJS.toast(options);
  }, []);
}

/**
 * Hook for opening custom modals
 */
export function useModal() {
  return useCallback((options: ModalOptions) => {
    if (typeof window === 'undefined' || !window.PromptJS) {
      throw new Error('PromptJS not loaded');
    }

    return window.PromptJS.Modal.open(options);
  }, []);
}

/**
 * Hook for mounting custom content in a bare modal
 */
export function useBareModal() {
  return useMemo(() => {
    if (typeof window === 'undefined' || !window.PromptJS) {
      throw new Error('PromptJS not loaded');
    }

    return {
      bare: (options: BareModalOptions) => window.PromptJS.Modal.bare(options),
      mount: (options: BareModalOptions) => window.PromptJS.Modal.mount(options),
    };
  }, []);
}

/**
 * Hook for accessing the full PromptJS API
 */
export function usePromptJS() {
  return useMemo(() => {
    if (typeof window === 'undefined' || !window.PromptJS) {
      throw new Error('PromptJS not loaded');
    }

    return window.PromptJS;
  }, []);
}

/**
 * Convenience functions for common toast patterns
 */
export const showSuccess = (message: string) => {
  window.PromptJS?.toast({ kind: 'success', message });
};

export const showError = (message: string) => {
  window.PromptJS?.toast({ kind: 'error', message });
};

export const showWarning = (message: string) => {
  window.PromptJS?.toast({ kind: 'warning', message });
};

export const showInfo = (message: string) => {
  window.PromptJS?.toast({ kind: 'info', message });
};

// Export everything
export default window.PromptJS;
