/**
 * PromptJS – i18n.ts
 * Locale registry and helpers so apps can switch language with one call.
 * This updates config.i18n and deep-merges default dialog titles.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 */

import { config } from './config';
import type { I18nBundle } from './types';

const registry = new Map<string, I18nBundle>();

export function register(bundle: I18nBundle) {
  registry.set(bundle.locale, bundle);
}

export function getAvailable(): string[] {
  return Array.from(registry.keys());
}

/**
 * Set the active language. The bundle must be registered first
 * (or pass the bundle via use()).
 */
export function set(locale: string) {
  const pack = registry.get(locale);
  if (!pack) throw new Error(`PromptJS: no i18n pack registered for "${locale}"`);
  // Let config.update handle deep merge of i18n and i18n.titles
  config.update({ i18n: pack });
}

/**
 * Convenience: register and set in one call.
 */
export function use(locale: string, bundle?: I18nBundle) {
  if (bundle) register(bundle);
  set(locale);
}

/**
 * Load a locale asynchronously (for JSON or code-split modules),
 * then register and set it. Returns the loaded bundle.
 */
export function load(locale: string, loader: () => Promise<I18nBundle>) {
  return loader().then(bundle => {
    register(bundle);
    set(locale);
    return bundle;
  });
}

// Optional: pre-register English so you can switch back explicitly.
register({
  locale: 'en',
  dir: 'auto',
  ok: 'OK',
  cancel: 'Cancel',
  yes: 'Yes',
  no: 'No',
  close: 'Close',
  dismiss: 'Dismiss',
  titles: {
    info: 'Information',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
    question: 'Question',
  },
});
