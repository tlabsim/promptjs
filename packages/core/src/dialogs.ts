/**
 * PromptJS – dialogs.ts
 * Promise-based dialogs built on the modal primitive.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * APIs:
 *   - question(opts): fully configurable buttons; resolves { id } of the chosen action
 *   - confirm(message, opts?): convenience wrapper resolving boolean
 *   - alert(message, opts?): convenience wrapper that resolves on acknowledge
 *   - prompt(message, defaultValue?, opts?): convenience wrapper for text input
 *
 * Features:
 *   - All dialogs support optional title via opts.title
 *   - question() supports onDismissal for handling ESC/backdrop/close button
 *   - Uses modal button plumbing; no direct DOM markup required by callers
 */

import { open } from './modal';
import { config } from './config';
import type { QuestionOptions, ConfirmOptions, AlertOptions } from './types';

export async function question(opts: QuestionOptions): Promise<{ id: string }> {
  const { message, buttons, onDismissal, title, ...modalOpts } = opts;
  
  // Validation
  if (!buttons || buttons.length === 0) {
    throw new Error('[PromptJS] question() requires at least one button');
  }
  
  return new Promise((resolve) => {
    const m = open({
      ...modalOpts,
      title,
      content: message,
      buttons: buttons.map(b => ({
        ...b,
        closeOnClick: true,
        onClick: () => resolve({ id: b.id }),
      })),
      onClose: (r) => {
        // Handle dismissal (ESC, backdrop, close button)
        // If onDismissal is not provided, modal won't resolve on dismissal
        // User must click a button to get a response
        if (['esc', 'backdrop', 'close'].includes(r as string) && onDismissal) {
          resolve({ id: onDismissal });
        }
      }
    });
  });
}

export async function confirm(message: string, opts?: ConfirmOptions): Promise<boolean> {
  const buttons: Array<{ id: string; text: string; variant: 'primary'|'neutral'|'danger' }> = [
    { id: 'yes', text: opts?.yesText ?? 'Yes', variant: 'primary' },
    { id: 'no', text: opts?.noText ?? 'No', variant: 'neutral' },
  ];
  
  if (opts?.includeCancel) {
    buttons.push({ id: 'cancel', text: opts?.cancelText ?? 'Cancel', variant: 'neutral' });
  }

  const { id } = await question({
    ...opts,
    title: opts?.title,
    message,
    buttons,
    onDismissal: 'cancel',  // Dismissal always maps to 'cancel' (returns false)
  });
  
  return id === 'yes';
}

export async function alert(message: string, opts?: AlertOptions): Promise<void> {
  await new Promise<void>((resolve)=> {
    open({
      ...opts,
      title: opts?.title,
      content: message,
      buttons: [{ 
        id:'ok', 
        text: opts?.okText ?? config.get().i18n.ok, 
        variant:'primary', 
        onClick: ()=>resolve() 
      }],
      closeOnEsc: true,
      closeOnBackdrop: true,
      onClose: () => resolve(), // Resolve on any dismissal (ESC, backdrop, close button)
    });
  });
}

export async function prompt(
  message: string,
  defaultValue?: string,
  opts?: import('./types').PromptOptions
): Promise<string | null> {
  return new Promise((resolve) => {
    let inputValue = defaultValue ?? '';
    let errorEl: HTMLElement | null = null;
    let resolved = false;

    // Prevent double resolution
    const safeResolve = (value: string | null) => {
      if (!resolved) {
        resolved = true;
        resolve(value);
      }
    };

    const validateInput = (value: string): string | null => {
      const trimmed = value.trim();
      
      if (opts?.required && !trimmed) {
        return 'This field is required';
      }
      if (opts?.minLength && trimmed.length < opts.minLength) {
        return `Minimum ${opts.minLength} characters required`;
      }
      if (opts?.pattern) {
        try {
          const regex = new RegExp(opts.pattern);
          if (!regex.test(value)) {
            return 'Invalid format';
          }
        } catch (e) {
          console.error('[PromptJS] Invalid regex pattern:', opts.pattern, e);
          return 'Invalid format pattern';
        }
      }
      if (opts?.validator) {
        try {
          const result = opts.validator(value);
          if (result === false) return 'Invalid input';
          if (typeof result === 'string') return result;
        } catch (e) {
          console.error('[PromptJS] Validator threw exception:', e);
          return 'Validation error';
        }
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
        safeResolve(inputValue);
        modal.close('ok');
      }
    });

    const modal = open({
      ...opts,
      title: opts?.title,
      content: contentWrapper,
      buttons: [
        { 
          id: 'cancel', 
          text: opts?.cancelText ?? config.get().i18n.cancel, 
          variant: 'neutral',
          closeOnClick: true,
          onClick: () => safeResolve(null)
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
            safeResolve(inputValue);
            modal.close('ok');
          }
        }
      ],
      closeOnEsc: true,
      closeOnBackdrop: false, // Don't lose input on accidental backdrop click
      onClose: (result) => {
        if (result === 'esc' || result === 'backdrop' || result === 'close') {
          safeResolve(null);
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
