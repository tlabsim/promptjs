/**
 * PromptJS – question.ts
 * Promise-based dialogs built on the modal primitive.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * APIs:
 *   - question(opts): fully configurable buttons; resolves { id } of the chosen action
 *   - confirm(message, opts?): convenience wrapper resolving boolean
 *   - alert(message, opts?): convenience wrapper that resolves on acknowledge
 *
 * Extras:
 *   - Map ESC/backdrop to specific return IDs via `escReturns` / `backdropReturns`
 *   - Uses modal button plumbing; no direct DOM markup required by callers
 */

import { open } from './modal';
import { config } from './config';
import type { QuestionOptions, ConfirmOptions, AlertOptions } from './types';

export async function question(opts: {
  title?: string;
  message: string;
  buttons: Array<{ id: string; text: string; variant?: 'primary'|'neutral'|'danger' }>;
  defaultId?: string;
  escReturns?: string | null;
  backdropReturns?: string | null;
}): Promise<{ id: string }> {
  return new Promise((resolve) => {
    const m = open({
      title: opts.title,
      content: opts.message,
      buttons: opts.buttons.map(b => ({
        ...b,
        closeOnClick: true,
        onClick: () => resolve({ id: b.id }),
      })),
      closeOnEsc: opts.escReturns !== null,
      closeOnBackdrop: opts.backdropReturns !== null,
      onClose: (r) => {
        if (r === 'esc' && opts.escReturns) resolve({ id: opts.escReturns });
        else if (r === 'backdrop' && opts.backdropReturns) resolve({ id: opts.backdropReturns });
      }
    });
    // default focus can be added later
  });
}

export async function confirm(message: string, extra?: Partial<Parameters<typeof question>[0]>): Promise<boolean> {
  const { id } = await question({
    message,
    title: extra?.title,
    buttons: [
      { id: 'yes', text: (extra as any)?.yesText ?? 'Yes', variant: 'primary' },
      { id: 'no', text: (extra as any)?.noText ?? 'No', variant: 'neutral' },
      ...(extra && (extra as any).includeCancel ? [{ id: 'cancel', text: 'Cancel' as const }] : []),
    ] as any,
    escReturns: 'cancel',
    backdropReturns: 'cancel',
  });
  return id === 'yes';
}

export async function alert(message: string, opts?: { title?: string }): Promise<void> {
  await new Promise<void>((resolve)=> {
    open({
      title: opts?.title,
      content: message,
      buttons: [{ id:'ok', text: config.get().i18n.ok, variant:'primary', onClick: ()=>resolve() }],
      closeOnEsc: true,
      closeOnBackdrop: true,
    });
  });
}

export async function prompt(
  message: string,
  defaultValue?: string,
  opts?: Partial<import('./types').PromptOptions>
): Promise<string | null> {
  return new Promise((resolve) => {
    let inputValue = defaultValue ?? '';
    let errorEl: HTMLElement | null = null;

    const validateInput = (value: string): string | null => {
      if (opts?.required && !value.trim()) {
        return 'This field is required';
      }
      if (opts?.pattern) {
        const regex = new RegExp(opts.pattern);
        if (!regex.test(value)) {
          return 'Invalid format';
        }
      }
      if (opts?.validator) {
        const result = opts.validator(value);
        if (result === false) return 'Invalid input';
        if (typeof result === 'string') return result;
      }
      return null;
    };

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'pj-prompt-wrapper';
    
    const messageP = document.createElement('p');
    messageP.className = 'pj-prompt-message';
    messageP.textContent = message;
    contentWrapper.appendChild(messageP);

    const inputEl = document.createElement('input');
    inputEl.type = opts?.inputType ?? 'text';
    inputEl.className = 'pj-prompt-input';
    inputEl.value = inputValue;
    inputEl.setAttribute('autocomplete', 'off');
    inputEl.setAttribute('spellcheck', 'false');
    if (opts?.placeholder) inputEl.placeholder = opts.placeholder;
    if (opts?.maxLength) inputEl.maxLength = opts.maxLength;
    contentWrapper.appendChild(inputEl);

    errorEl = document.createElement('div');
    errorEl.className = 'pj-prompt-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.setAttribute('aria-live', 'polite');
    contentWrapper.appendChild(errorEl);

    inputEl.addEventListener('input', (e) => {
      inputValue = (e.target as HTMLInputElement).value;
      if (errorEl) errorEl.textContent = '';
      inputEl.classList.remove('error');
    });

    inputEl.addEventListener('focus', () => {
      // Focus styles handled by CSS
    });

    inputEl.addEventListener('blur', () => {
      // Blur styles handled by CSS
    });

    // Allow Enter to submit (if valid)
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const error = validateInput(inputValue);
        if (error) {
          if (errorEl) {
            errorEl.textContent = error;
            inputEl.classList.add('error');
          }
          return;
        }
        // Validation passed, resolve and close
        resolve(inputValue);
        modal.close('ok');
      }
    });

    const modal = open({
      title: opts?.title,
      content: contentWrapper,
      kind: opts?.kind,
      buttons: [
        { 
          id: 'cancel', 
          text: opts?.cancelText ?? config.get().i18n.cancel, 
          variant: 'neutral',
          closeOnClick: true,
          onClick: () => resolve(null)
        },
        { 
          id: 'ok', 
          text: opts?.okText ?? config.get().i18n.ok, 
          variant: 'primary',
          closeOnClick: false, // Don't auto-close, we'll handle it manually
          onClick: () => {
            const error = validateInput(inputValue);
            if (error) {
              if (errorEl) {
                errorEl.textContent = error;
                inputEl.classList.add('error');
              }
              // Don't close modal, just return
              return;
            }
            // Validation passed, resolve and close
            resolve(inputValue);
            modal.close('ok');
          }
        }
      ],
      closeOnEsc: true,
      closeOnBackdrop: false, // Don't lose input on accidental backdrop click
      onClose: (result) => {
        if (result === 'esc' || result === 'backdrop') {
          resolve(null);
        }
      },
      onOpen: () => {
        // Auto-focus the input after modal opens
        setTimeout(() => {
          inputEl.focus();
          if (defaultValue) {
            inputEl.select(); // Select default value if any
          }
        }, 100);
      }
    });
  });
}
