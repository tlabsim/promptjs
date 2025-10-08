/**
 * PromptJS React - Complete Type Definitions & Hooks
 * 
 * This file provides comprehensive TypeScript definitions for using PromptJS with React.
 * It exports all types, interfaces, hooks, and utilities needed for full customization.
 * 
 * @package @tlabsinc/promptjs-react
 * @author TLabs (tlabs.im@gmail.com)
 * @version 1.0.0
 * 
 * Usage:
 * ```tsx
 * import { useDialogs, useToast, useBareModal, type ModalOptions } from './promptjs-react';
 * 
 * function MyComponent() {
 *   const { alert, confirm, prompt } = useDialogs();
 *   const toast = useToast();
 *   const { mount } = useBareModal();
 *   
 *   const handleAction = async () => {
 *     const confirmed = await confirm("Are you sure?", {
 *       kind: 'warning',
 *       yesText: 'Delete',
 *       noText: 'Keep'
 *     });
 *     
 *     if (confirmed) {
 *       toast({ kind: 'success', message: 'Deleted!' });
 *     }
 *   };
 * }
 * ```
 */

import { useCallback, useMemo, useEffect } from 'react';

// ============================================================================
// GLOBAL TYPE DECLARATIONS
// ============================================================================

declare global {
  interface Window {
    PromptJS?: any;
    PJ?: any;
  }
}

// ============================================================================
// CORE TYPE EXPORTS
// ============================================================================

/**
 * Theme modes supported by PromptJS
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Text direction for internationalization
 */
export type Dir = 'ltr' | 'rtl' | 'auto';

/**
 * Visual notification/dialog types for styling
 */
export type NotifyKind = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'question';

/**
 * Button style variants
 */
export type ButtonVariant = 'primary' | 'neutral' | 'danger' | 'ghost';

/**
 * Modal sizes
 */
export type ModalSize = 'sm' | 'md' | 'lg';

/**
 * Toast positions on screen
 */
export type ToastPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

/**
 * Toast stacking behaviors
 */
export type ToastBehavior = 'stack' | 'queue' | 'replace';

/**
 * Toast animation presets
 */
export type ToastAnimPreset = 'fade' | 'slide' | 'scale';

/**
 * Toast animation directions
 */
export type ToastDirection = 'up' | 'down' | 'left' | 'right' | 'auto';

/**
 * Toast progress indicator position
 */
export type ToastProgressPosition = 'cover' | 'top' | 'bottom' | 'left' | 'right';

/**
 * Modal concurrency handling strategies
 */
export type ModalConcurrency = 'queue' | 'reject';

/**
 * Toast distance for slide animations
 */
export type ToastDistance = 'edge' | number | string;

/**
 * Input types for prompt dialogs
 */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

// ============================================================================
// BUTTON DEFINITIONS
// ============================================================================

/**
 * Button definition for modals
 */
export interface ButtonDef {
  /** Unique button identifier */
  id: string;
  /** Button text */
  text: string;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Close modal on click (default: true) */
  closeOnClick?: boolean;
  /** Click handler with modal instance context */
  onClick?: (ctx: ModalInstance) => void | Promise<void>;
}

/**
 * Simple button definition for question dialogs
 */
export interface QuestionButton {
  /** Button identifier */
  id: string;
  /** Button text */
  text: string;
  /** Visual variant */
  variant?: ButtonVariant;
}

// ============================================================================
// DRAGGABLE CONFIGURATION
// ============================================================================

/**
 * Modal draggable configuration
 */
export type ModalDraggable =
  | boolean
  | {
      /** Drag handle selector or element (default: "header") */
      handle?: "header" | string | HTMLElement;
      /** Drag axis constraint (default: "both") */
      axis?: "x" | "y" | "both";
      /** Constrain within viewport (default: true) */
      withinViewport?: boolean;
      /** Disable on mobile devices (default: true) */
      disableOnMobile?: boolean;
      /** Cursor style during drag (default: "grab") */
      cursor?: string | null;
    };

// ============================================================================
// MODAL OPTIONS & INSTANCES
// ============================================================================

/**
 * Base options shared by all modal types
 */
export interface BaseModalOptions {
  // Content
  /** Modal title (optional) */
  title?: string;

  // Visual & sizing
  /** Modal size or custom dimensions */
  size?: ModalSize | { w?: number | string; h?: number | string };

  // Animation & behavior
  /** Enable/disable animation for this modal */
  animate?: boolean;
  /** Close on ESC key */
  closeOnEsc?: boolean;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Trap focus within modal */
  trapFocus?: boolean;
  /** ARIA label for accessibility */
  ariaLabel?: string;

  // Lifecycle & concurrency
  /** Modal concurrency behavior */
  concurrency?: ModalConcurrency;
  /** Called when modal opens */
  onOpen?: (ctx: ModalInstance) => void;
  /** Called when modal closes */
  onClose?: (result?: unknown) => void;

  // Chrome (UI elements)
  /** Show close button (default: true) */
  showClose?: boolean;
  /** ARIA label for close button */
  closeAriaLabel?: string;
  /** Button ID to focus on modal open */
  defaultButtonId?: string;

  // Accent styling
  /** Visual kind/type for styling */
  kind?: NotifyKind;

  // Surface visuals
  /** Surface opacity (0-1) */
  surfaceAlpha?: number;
  /** Dialog blur in pixels */
  dialogBlurPx?: number;
  /** Backdrop blur in pixels */
  backdropBlurPx?: number;

  // Draggable (desktop only)
  /** Enable dragging */
  draggable?: ModalDraggable;
}

/**
 * Full-featured modal with header, content, and buttons
 */
export interface ModalOptions extends BaseModalOptions {
  /** Modal content (HTML string or DOM element) - required */
  content: string | Node;
  /** Allow unsafe HTML (bypasses sanitization) */
  unsafeHTML?: boolean;
  /** Modal buttons */
  buttons?: ButtonDef[];
}

/**
 * Minimal modal wrapper (no header/footer chrome)
 */
export interface BareModalOptions extends Omit<BaseModalOptions, "title"> {
  /** Show window chrome (default: true) */
  windowed?: boolean;
  /** Optional initial content */
  content?: string | Node;
  /** Allow unsafe HTML */
  unsafeHTML?: boolean;
  /** Custom surface CSS class */
  surfaceClass?: string;
  /** Custom content CSS class */
  contentClass?: string;
}

/**
 * Modal instance returned by Modal.open() and Modal.bare()/mount()
 */
export interface ModalInstance {
  /** Unique modal identifier */
  readonly id: string;
  /** Close the modal */
  close: (result?: unknown) => void;
  /** Update modal content (for Modal.open() only) */
  update: (partial: Partial<Pick<ModalOptions, "title" | "content" | "unsafeHTML" | "buttons">>) => void;
  /** Modal surface element */
  readonly el: HTMLDivElement;
  /** Modal content element */
  readonly contentEl: HTMLElement;
}

// ============================================================================
// DIALOG OPTIONS (alert, confirm, prompt, question)
// ============================================================================

/**
 * Alert dialog options
 * Extends BaseModalOptions for full modal configuration (showClose, draggable, animate, etc.)
 * 
 * @remarks
 * Alert resolves when the user clicks OK, presses ESC, clicks backdrop, or clicks the close button.
 * All dismissal methods simply resolve the promise (no return value).
 */
export interface AlertOptions extends BaseModalOptions {
  /** OK button text (default: from i18n) */
  okText?: string;
}

/**
 * Confirm dialog options (Yes/No)
 * Extends BaseModalOptions for full modal configuration (showClose, draggable, animate, etc.)
 * 
 * @remarks
 * Returns `true` if user clicks Yes, `false` if user clicks No or Cancel.
 * ESC, backdrop, and close button are treated as "Cancel" (returns `false`).
 */
export interface ConfirmOptions extends BaseModalOptions {
  /** Yes button text (default: "Yes") */
  yesText?: string;
  /** No button text (default: "No") */
  noText?: string;
  /** Include Cancel button */
  includeCancel?: boolean;
  /** Cancel button text (default: "Cancel") */
  cancelText?: string;
}

/**
 * Prompt dialog options (text input)
 * Extends BaseModalOptions for full modal configuration (showClose, draggable, animate, etc.)
 * 
 * @remarks
 * Returns the input value if user clicks OK, or `null` if cancelled/dismissed.
 * ESC, backdrop, close button, and Cancel button all return `null`.
 * 
 * Validation is performed on both Enter key and OK button click.
 * Invalid input displays error message and prevents submission.
 * Both `required` and `minLength` use trimmed values for consistency.
 */
export interface PromptOptions extends BaseModalOptions {
  /** OK button text (default: from i18n) */
  okText?: string;
  /** Cancel button text (default: from i18n) */
  cancelText?: string;
  /** Input placeholder text */
  placeholder?: string;
  /** Input type */
  inputType?: InputType;
  /** Input is required (validates trimmed value) */
  required?: boolean;
  /** Maximum input length */
  maxLength?: number;
  /** Minimum input length (validates trimmed value) */
  minLength?: number;
  /** Regex pattern for validation (errors are caught gracefully) */
  pattern?: string;
  /** Custom validator function (exceptions are caught gracefully) */
  validator?: (value: string) => boolean | string;
}

/**
 * Question dialog options (custom buttons)
 * Extends BaseModalOptions for full modal configuration (showClose, draggable, animate, etc.)
 * 
 * @remarks
 * Returns `{ id: string }` when any button is clicked.
 * 
 * **Dismissal Behavior:**
 * - If `onDismissal` is provided, ESC/backdrop/close button will resolve with that button ID
 * - If `onDismissal` is not provided, ESC/backdrop/close button will NOT close the dialog
 *   (useful for critical dialogs that require explicit button selection)
 * 
 * **Button Validation:**
 * - At least one button is required (throws error if buttons array is empty)
 * - Each button must have a unique `id` for proper event handling
 */
export interface QuestionOptions extends BaseModalOptions {
  /** Question message */
  message: string;
  /** Custom buttons (at least one required) */
  buttons: QuestionButton[];
  /** Value returned when dismissed (ESC, backdrop, or close button clicked) */
  onDismissal?: string;
}

/**
 * Notification options (overlay-style)
 */
export interface NotifyOptions {
  /** Visual kind */
  kind?: NotifyKind;
  /** Notification title */
  title?: string;
  /** Notification message */
  message: string;
  /** OK button text */
  okText?: string;
}

// ============================================================================
// TOAST OPTIONS
// ============================================================================

/**
 * Toast timeout visual cue configuration
 */
export interface ToastTimeoutCue {
  /** Show timeout progress indicator */
  show?: boolean;
  /** Progress indicator position */
  position?: ToastProgressPosition;
  /** Progress animation direction */
  direction?: 'grow' | 'shrink';
  /** Progress bar thickness in pixels */
  thicknessPx?: number;
}

/**
 * Toast animation specification
 */
export interface ToastAnimSpec {
  /** Animation preset */
  preset: ToastAnimPreset;
  /** Animation direction (for slide) */
  direction?: ToastDirection;
  /** Animation distance (for slide) */
  distance?: ToastDistance;
  /** Animation duration in milliseconds */
  durationMs?: number;
  /** CSS easing function */
  easing?: string;
}

/**
 * Toast animations configuration
 */
export interface ToastAnimations {
  /** Enter/appear animation */
  enter?: ToastAnimSpec;
  /** Exit/disappear animation */
  exit?: ToastAnimSpec;
  /** Timeout progress cue */
  timeoutCue?: ToastTimeoutCue;
}

/**
 * Toast action button
 */
export interface ToastAction {
  /** Action identifier */
  id: string;
  /** Action button text */
  text: string;
  /** Action click handler */
  onClick?: () => void | Promise<void>;
}

/**
 * Toast notification options
 */
export interface ToastOptions {
  /** Visual kind */
  kind?: NotifyKind;
  /** Toast title (optional) */
  title?: string;
  /** Toast message */
  message: string;
  /** Auto-dismiss timeout in milliseconds (0 = sticky) */
  timeoutMs?: number;
  /** Show close button */
  dismissible?: boolean;
  /** Action buttons */
  actions?: ToastAction[];
  /** Toast position */
  position?: ToastPosition;
  /** Toast behavior (stack/queue/replace) */
  behavior?: ToastBehavior;
  /** Maximum visible toasts */
  maxVisible?: number;
  /** Animation configuration */
  animations?: ToastAnimations;
}

// ============================================================================
// INTERNATIONALIZATION
// ============================================================================

/**
 * Internationalization bundle
 */
export interface I18nBundle {
  /** Locale code (e.g., 'en', 'es', 'bn') */
  locale: string;
  /** Text direction */
  dir: Dir;
  /** "OK" button text */
  ok: string;
  /** "Cancel" button text */
  cancel: string;
  /** "Yes" button text */
  yes: string;
  /** "No" button text */
  no: string;
  /** Close button ARIA label */
  close: string;
  /** Dismiss button ARIA label */
  dismiss: string;
  /** Dialog title translations */
  titles: {
    info: string;
    success: string;
    warning: string;
    error: string;
    question: string;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Animation configuration
 */
export interface AnimationConfig {
  /** Enable/disable animations globally */
  enable: boolean;
  /** Default animation duration in milliseconds */
  durationMs: number;
  /** CSS easing function */
  easing: string;
}

/**
 * Overlay/backdrop configuration
 */
export interface OverlayConfig {
  /** Enable backdrop fade animation */
  fade: boolean;
  /** Backdrop opacity (0-1) */
  surfaceAlpha: number;
  /** Backdrop blur in pixels */
  backdropBlurPx: number;
}

/**
 * Modal-specific configuration
 */
export interface ModalConfig {
  /** Modal concurrency handling */
  concurrency: ModalConcurrency;
  /** Modal surface opacity */
  surfaceAlpha: number;
  /** Modal blur in pixels */
  dialogBlurPx: number;
  /** Close on ESC key */
  closeOnEsc: boolean;
  /** Close on backdrop click */
  closeOnBackdrop: boolean;
  /** Trap focus in modal */
  trapFocus: boolean;
  /** Show close button */
  showClose: boolean;
  /** Enable dragging */
  draggable: boolean | ModalDraggable;
}

/**
 * Toast margins configuration
 */
export interface ToastMargins {
  /** Top margin in pixels */
  top: number;
  /** Bottom margin in pixels */
  bottom: number;
  /** Left margin in pixels */
  left: number;
  /** Right margin in pixels */
  right: number;
}

/**
 * Toast-specific configuration
 */
export interface ToastConfig {
  /** Default toast position */
  defaultPosition: ToastPosition;
  /** Toast stacking behavior */
  behavior: ToastBehavior;
  /** Maximum visible toasts per position */
  maxVisible: number;
  /** Default timeout in milliseconds */
  defaultTimeoutMs: number;
  /** Show close button by default */
  defaultDismissible: boolean;
  /** Spacing between toasts in pixels */
  spacingPx: number;
  /** Z-index boost above modals */
  zBoost: number;
  /** Toast margins */
  margins: ToastMargins;
  /** Toast animations */
  animations: ToastAnimations;
}

/**
 * Accessibility configuration
 */
export interface A11yConfig {
  /** Default ARIA label for modals */
  ariaModalLabel: string;
}

/**
 * Responsive breakpoints
 */
export interface Breakpoints {
  /** Small device breakpoint in pixels */
  sm: number;
  /** Medium device breakpoint in pixels */
  md: number;
  /** Large device breakpoint in pixels */
  lg: number;
}

/**
 * Complete PromptJS configuration
 */
export interface PromptJSConfig {
  /** Theme mode */
  theme: Theme;
  /** Base z-index for all PromptJS elements */
  zIndexBase: number;
  /** Animation settings */
  animation: AnimationConfig;
  /** Overlay/backdrop settings */
  overlay: OverlayConfig;
  /** Modal settings */
  modal: ModalConfig;
  /** Toast settings */
  toast: ToastConfig;
  /** Internationalization */
  i18n: I18nBundle;
  /** Accessibility settings */
  a11y: A11yConfig;
  /** Responsive breakpoints */
  breakpoints: Breakpoints;
  /** Custom container element for mounting */
  container: HTMLElement | null;
}

/**
 * Partial configuration for updates
 */
export type PartialPromptJSConfig = Partial<{
  theme: Theme;
  zIndexBase: number;
  animation: Partial<AnimationConfig>;
  overlay: Partial<OverlayConfig>;
  modal: Partial<ModalConfig>;
  toast: Partial<ToastConfig>;
  i18n: Partial<I18nBundle>;
  a11y: Partial<A11yConfig>;
  breakpoints: Partial<Breakpoints>;
  container: HTMLElement | null;
}>;

// ============================================================================
// PROMPTJS API TYPE (for TypeScript IntelliSense)
// ============================================================================

/**
 * Type-safe accessor for window.PromptJS
 * The core library declares window.PromptJS as 'any', so we provide proper types here
 */
export interface PromptJSAPI {
  alert: (message: string, opts?: AlertOptions) => Promise<void>;
  confirm: (message: string, opts?: ConfirmOptions) => Promise<boolean>;
  prompt: (message: string, defaultValue?: string, opts?: PromptOptions) => Promise<string | null>;
  question: (opts: QuestionOptions) => Promise<{ id: string }>;
  toast: (options: ToastOptions) => void;
  Modal: {
    open: (options: ModalOptions) => ModalInstance;
    bare: (options: BareModalOptions) => ModalInstance;
    mount: (options: BareModalOptions) => ModalInstance;
  };
  config: {
    update: (config: PartialPromptJSConfig) => void;
    get: () => PromptJSConfig;
    onChange: (callback: (config: PromptJSConfig) => void) => () => void;
  };
  i18n: {
    use: (locale: string, translations: Partial<I18nBundle>) => void;
  };
  version: string;
}

/**
 * Type-safe reference to window.PromptJS
 * Use this instead of window.PromptJS directly for full TypeScript support
 * 
 * Note: We cast through 'unknown' first to handle potential signature mismatches
 * between different versions of the core library or custom wrappers
 */
const getPromptJS = (): PromptJSAPI => window.PromptJS as unknown as PromptJSAPI;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize PromptJS with custom configuration
 * 
 * Call this function once at your app's entry point to apply custom settings.
 * If not called, PromptJS will use its default configuration.
 * 
 * @param config - Partial configuration to apply
 * @param options - Initialization options
 * 
 * @example
 * ```tsx
 * // App.tsx or main.tsx
 * import { initializePromptJS } from './promptjs-react';
 * 
 * initializePromptJS({
 *   theme: 'dark',
 *   animation: {
 *     enable: true,
 *     durationMs: 250
 *   },
 *   modal: {
 *     closeOnEsc: true,
 *     closeOnBackdrop: false,
 *     draggable: true
 *   },
 *   toast: {
 *     defaultPosition: 'top-right',
 *     defaultTimeoutMs: 3000,
 *     behavior: 'stack'
 *   },
 *   i18n: {
 *     locale: 'en',
 *     ok: 'OK',
 *     cancel: 'Cancel',
 *     yes: 'Yes',
 *     no: 'No'
 *   }
 * });
 * ```
 */
export function initializePromptJS(
  config?: PartialPromptJSConfig,
  options?: {
    /** Show initialization message in console */
    verbose?: boolean;
    /** Custom branding name for console message */
    brandName?: string;
  }
): void {
  if (typeof window === 'undefined') {
    console.warn('[PromptJS] Cannot initialize: window is undefined (SSR environment)');
    return;
  }

  if (!window.PromptJS) {
    console.warn(
      '[PromptJS] PromptJS core library not found. ' +
      'Make sure to import @tlabsinc/promptjs-core before calling initializePromptJS().'
    );
    return;
  }

  try {
    // Apply custom configuration if provided
    if (config) {
      getPromptJS().config.update(config);
    }

    // Create global shorthand alias
    window.PJ = window.PromptJS as any;

    // Log success message
    if (options?.verbose !== false) {
      const brand = options?.brandName || 'PromptJS React';
      console.log(`✅ ${brand} initialized`);
    }
  } catch (error) {
    console.error('[PromptJS] Initialization failed:', error);
  }
}

/**
 * Get the current PromptJS configuration
 * 
 * @returns Current configuration object
 * 
 * @example
 * ```tsx
 * const config = getPromptJSConfig();
 * console.log('Current theme:', config.theme);
 * console.log('Animation enabled:', config.animation.enable);
 * ```
 */
export function getPromptJSConfig(): PromptJSConfig {
  if (typeof window === 'undefined' || !window.PromptJS) {
    throw new Error('[PromptJS] Core library not loaded');
  }
  return getPromptJS().config.get();
}

/**
 * Update PromptJS configuration
 * 
 * @param config - Partial configuration to merge with current config
 * 
 * @example
 * ```tsx
 * // Update theme
 * updatePromptJSConfig({ theme: 'dark' });
 * 
 * // Update multiple settings
 * updatePromptJSConfig({
 *   theme: 'dark',
 *   animation: { durationMs: 300 },
 *   toast: { defaultPosition: 'bottom-right' }
 * });
 * ```
 */
export function updatePromptJSConfig(config: PartialPromptJSConfig): void {
  if (typeof window === 'undefined' || !window.PromptJS) {
    throw new Error('[PromptJS] Core library not loaded');
  }
  getPromptJS().config.update(config);
}

/**
 * Set PromptJS theme
 * 
 * Convenience function to update only the theme. Perfect for syncing with your app's theme provider.
 * 
 * @param theme - Theme mode: 'light', 'dark', or 'auto'
 * 
 * @example
 * ```tsx
 * // Sync with your theme provider
 * setPromptJSTheme('dark');
 * 
 * // Use in theme context
 * const { theme } = useTheme();
 * useEffect(() => {
 *   setPromptJSTheme(theme);
 * }, [theme]);
 * ```
 */
export function setPromptJSTheme(theme: Theme): void {
  if (typeof window === 'undefined' || !window.PromptJS) {
    console.warn('[PromptJS] Core library not loaded, cannot set theme');
    return;
  }
  getPromptJS().config.update({ theme });
}

/**
 * React hook to sync PromptJS theme with your app's theme provider
 * 
 * This hook automatically updates PromptJS theme whenever your theme context changes.
 * 
 * @param theme - Current theme from your theme provider
 * 
 * @example
 * ```tsx
 * // In your App.tsx or root component
 * import { usePromptJSThemeSync } from './promptjs-react';
 * import { useTheme } from './contexts/ThemeContext';
 * 
 * function App() {
 *   const { theme } = useTheme(); // Your theme context
 *   usePromptJSThemeSync(theme); // Sync PromptJS theme
 *   
 *   return <YourApp />;
 * }
 * ```
 */
export function usePromptJSThemeSync(theme: Theme): void {
  useEffect(() => {
    setPromptJSTheme(theme);
  }, [theme]);
}

// ============================================================================
// AUTO-INITIALIZATION (commented out by default)
// ============================================================================

// Uncomment the following block to automatically apply custom configuration when this module loads:

// initializePromptJS({
//   theme: 'auto',
//   zIndexBase: 1000,
//   animation: {
//     enable: true,
//     durationMs: 200,
//     easing: 'ease-out'
//   },
//   overlay: {
//     fade: true,
//     surfaceAlpha: 0.5,
//     backdropBlurPx: 4
//   },
//   modal: {
//     concurrency: 'queue',
//     surfaceAlpha: 1,
//     dialogBlurPx: 0,
//     closeOnEsc: true,
//     closeOnBackdrop: true,
//     trapFocus: true,
//     showClose: true,
//     draggable: true
//   },
//   toast: {
//     defaultPosition: 'top-right',
//     behavior: 'stack',
//     maxVisible: 5,
//     defaultTimeoutMs: 3000,
//     defaultDismissible: true,
//     spacingPx: 12,
//     zBoost: 100,
//     margins: {
//       top: 16,
//       bottom: 16,
//       left: 16,
//       right: 16
//     }
//   },
//   i18n: {
//     locale: 'en',
//     dir: 'ltr',
//     ok: 'OK',
//     cancel: 'Cancel',
//     yes: 'Yes',
//     no: 'No',
//     close: 'Close',
//     dismiss: 'Dismiss',
//     titles: {
//       info: 'Information',
//       success: 'Success',
//       warning: 'Warning',
//       error: 'Error',
//       question: 'Question'
//     }
//   },
//   a11y: {
//     ariaModalLabel: 'Dialog window'
//   },
//   breakpoints: {
//     sm: 640,
//     md: 768,
//     lg: 1024
//   }
// }, {
//   verbose: true,
//   brandName: 'Your App Name'
// });

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * Hook for dialog functions (alert, confirm, prompt, question)
 * 
 * @example
 * ```tsx
 * const { alert, confirm, prompt, question } = useDialogs();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm("Delete this item?", {
 *     kind: 'warning',
 *     yesText: 'Delete',
 *     noText: 'Cancel',
 *     draggable: true,  // All BaseModalOptions available
 *     showClose: true
 *   });
 *   
 *   if (confirmed) {
 *     await alert("Item deleted!", { kind: 'success', animate: true });
 *   }
 * };
 * 
 * const handleQuestion = async () => {
 *   const result = await question({
 *     title: "Choose an option",
 *     message: "What would you like to do?",
 *     buttons: [
 *       { id: 'save', text: 'Save', variant: 'primary' },
 *       { id: 'discard', text: 'Discard', variant: 'danger' },
 *       { id: 'cancel', text: 'Cancel', variant: 'neutral' }
 *     ],
 *     onDismissal: 'cancel',     // Handle ESC/backdrop/close button
 *     showClose: true,           // Show close button (uses onDismissal value)
 *     draggable: true,           // Make modal draggable
 *     defaultButtonId: 'save'    // Focus Save button by default
 *   });
 *   
 *   console.log('User chose:', result.id); // 'save', 'discard', or 'cancel'
 * };
 * ```
 */
export const useDialogs = () => {
  const pjs = getPromptJS();
  
  const alert = useCallback(
    (message: string, opts?: AlertOptions) => pjs.alert(message, opts),
    []
  );

  const confirm = useCallback(
    (message: string, opts?: ConfirmOptions) => pjs.confirm(message, opts),
    []
  );

  const prompt = useCallback(
    (message: string, defaultValue?: string, opts?: PromptOptions) =>
      pjs.prompt(message, defaultValue, opts),
    []
  );

  const question = useCallback(
    (opts: QuestionOptions) => pjs.question(opts),
    []
  );

  return { alert, confirm, prompt, question };
};

/**
 * Hook for toast notifications
 * 
 * @example
 * ```tsx
 * const toast = useToast();
 * 
 * const handleSave = async () => {
 *   try {
 *     await saveData();
 *     toast({ kind: 'success', message: 'Saved successfully!' });
 *   } catch (error) {
 *     toast({ 
 *       kind: 'error', 
 *       message: 'Failed to save',
 *       timeoutMs: 5000 
 *     });
 *   }
 * };
 * ```
 */
export const useToast = () => {
  return useCallback((options: ToastOptions) => {
    getPromptJS().toast(options);
  }, []);
};

/**
 * Hook for opening full-featured modals
 * 
 * @example
 * ```tsx
 * const openModal = useModal();
 * 
 * const handleCustomModal = () => {
 *   const inst = openModal({
 *     title: "Custom Modal",
 *     content: "Modal content here",
 *     buttons: [
 *       { 
 *         id: 'save',
 *         text: "Save", 
 *         variant: "primary",
 *         onClick: async (ctx) => {
 *           await saveData();
 *           ctx.close('saved');
 *         }
 *       },
 *       { id: 'cancel', text: "Cancel", variant: "neutral" }
 *     ]
 *   });
 *   
 *   // Can update later
 *   setTimeout(() => {
 *     inst.update({ title: "Updated Title" });
 *   }, 2000);
 * };
 * ```
 */
export const useModal = () => {
  return useCallback((options: ModalOptions) => {
    return getPromptJS().Modal.open(options);
  }, []);
};

/**
 * Hook for mounting custom content in minimal modal wrappers
 * 
 * @example
 * ```tsx
 * const { bare, mount } = useBareModal();
 * 
 * const handleCustomModal = () => {
 *   const customElement = document.createElement('div');
 *   customElement.innerHTML = '<h1>Custom Content</h1>';
 *   
 *   // Both are equivalent (mount is an alias for bare)
 *   const inst = mount({
 *     content: customElement,
 *     closeOnEsc: true,
 *     animate: true
 *   });
 *   
 *   // Close after 5 seconds
 *   setTimeout(() => inst.close(), 5000);
 * };
 * ```
 */
export const useBareModal = () => {
  const pjs = getPromptJS();
  
  const bare = useCallback((options: BareModalOptions) => {
    return pjs.Modal.bare(options);
  }, []);

  const mount = useCallback((options: BareModalOptions) => {
    return pjs.Modal.mount(options);
  }, []);

  return { bare, mount };
};

/**
 * Hook for accessing the full PromptJS API
 * 
 * @example
 * ```tsx
 * const promptjs = usePromptJS();
 * 
 * // Access configuration
 * const config = promptjs.config.get();
 * 
 * // Update theme
 * promptjs.config.update({ theme: 'dark' });
 * 
 * // Use i18n
 * promptjs.i18n.use('es', {
 *   locale: 'es',
 *   ok: 'Aceptar',
 *   cancel: 'Cancelar'
 * });
 * ```
 */
export const usePromptJS = (): PromptJSAPI => {
  return getPromptJS();
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Show success toast
 */
export const showSuccess = (message: string, options?: Partial<ToastOptions>) => {
  getPromptJS().toast({ kind: 'success', message, ...options });
};

/**
 * Show error toast
 */
export const showError = (message: string, options?: Partial<ToastOptions>) => {
  getPromptJS().toast({ kind: 'error', message, ...options });
};

/**
 * Show warning toast
 */
export const showWarning = (message: string, options?: Partial<ToastOptions>) => {
  getPromptJS().toast({ kind: 'warning', message, ...options });
};

/**
 * Show info toast
 */
export const showInfo = (message: string, options?: Partial<ToastOptions>) => {
  getPromptJS().toast({ kind: 'info', message, ...options });
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Default export for convenience - the fully typed PromptJS API
 */
export default getPromptJS();
