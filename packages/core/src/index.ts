/**
 * PromptJS – index.ts
 * Entry point for the public API.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * - ESM: re-exports config, Modal, notify, question, confirm, alert, and types.
 * - UMD (when bundled): attaches a global `window.PromptJS` for Blade/vanilla usage.
 * - No side effects beyond optional global attach when `window` is present.
 */

import { config } from './config';
import * as Modal from './modal';
import { toast } from './toast';
import { question, confirm, alert, prompt } from './dialogs';
import * as i18n from './i18n';

declare const __PROMPTJS_VERSION__: string | undefined;

export const version =
  typeof __PROMPTJS_VERSION__ !== 'undefined'
    ? __PROMPTJS_VERSION__
    : 'dev';

export { config, Modal, toast, question, confirm, alert, prompt, i18n };
export type { 
  ModalOptions, 
  ModalInstance,
  AlertOptions,
  ConfirmOptions,
  PromptOptions,
  QuestionOptions,
  ToastOptions
} from "./types";

declare global { interface Window { PromptJS?: any } }

if (typeof window !== 'undefined') {
  const api = { config, Modal, toast, question, confirm, alert, prompt, i18n, version } as const;
  window.PromptJS = Object.freeze(api);
}
