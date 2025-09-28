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
