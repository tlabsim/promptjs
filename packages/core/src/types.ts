/**
 * PromptJS – types.ts
 * Public TypeScript definitions for the core API.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * Contains:
 *   - ButtonVariant, ButtonDef
 *   - ModalOptions, ModalInstance
 *   - NotifyKind, NotifyOptions
 *   - Theme, ModalConcurrency
 *
 * Maintain backward-compatible type evolution to avoid breaking consumers.
 */

export type ButtonVariant = 'primary' | 'neutral' | 'danger' | 'ghost';

export interface ButtonDef {
  id: string;
  text: string;
  variant?: ButtonVariant;
  closeOnClick?: boolean;
  onClick?: (ctx: ModalInstance) => void | Promise<void>;
}

export type Theme = 'light' | 'dark' | 'auto';
export type ModalConcurrency = 'queue' | 'reject';

export type NotifyKind = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'question';

export type ModalDraggable =
  | boolean
  | {
      handle?: "header" | string | HTMLElement; // default: "header" when windowed, whole surface when non-windowed
      axis?: "x" | "y" | "both";                // default: "both"
      withinViewport?: boolean;                 // default: true (constrain)
      disableOnMobile?: boolean;                // default: true
      cursor?: string | null;                   // default: "grab" (null = don't change)
    };

export interface BaseModalOptions {
  // Visual + sizing
  size?: 'sm' | 'md' | 'lg' | { w?: number | string; h?: number | string };

  // Animation / behavior / a11y
  animate?: boolean;               // overrides config.animation.enable per modal
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  trapFocus?: boolean;
  ariaLabel?: string;

  // Lifecycle & concurrency
  concurrency?: ModalConcurrency;
  onOpen?: (ctx: ModalInstance) => void;
  onClose?: (result?: unknown) => void;

  // Chrome
  showClose?: boolean;             // default true. Renders header "X" button.
  closeAriaLabel?: string;         // default "Close"

  // Accent
  kind?: NotifyKind;               // optional accent styling for dialogs

  // Surface visuals
  surfaceAlpha?: number;
  dialogBlurPx?: number;
  backdropBlurPx?: number;         // overrides config.overlay.blurPx per modal

  // Draggable (desktop only)
  draggable?: ModalDraggable;
}

// ----- Dialog options (EXACTLY your current ModalOptions) -----
export interface ModalOptions extends BaseModalOptions {
  title?: string;
  content: string | Node;
  unsafeHTML?: boolean;
  buttons?: ButtonDef[];
}

export interface BareModalOptions extends Omit<ModalOptions, "title" | "buttons" | "content" | "unsafeHTML"> {
  /** PromptJS chrome (header chrome off by default). Default: true */
  windowed?: boolean;
  /** Optional initial content (sanitized unless unsafeHTML). */
  content?: string | Node;
  unsafeHTML?: boolean;
  /** Optional surface/content classes (hooks) */
  surfaceClass?: string;
  contentClass?: string;
}

export interface ModalInstance {
  id: string;
  close: (result?: unknown) => void;
  update: (partial: Partial<Pick<ModalOptions, "title" | "content" | "unsafeHTML" | "buttons">>) => void;

  readonly el: HTMLDivElement;
  readonly contentEl: HTMLElement;
}

// ---------- Overlay-style notification dialog (OK) ----------
/**
 * Overlay alert/notification (full-screen overlay with an OK button).
 */
export interface NotifyOptions {
  kind?: NotifyKind;
  title?: string;
  message: string;
  okText?: string; // default from i18n.ok
}

// Helper option types for alert/confirm/question
export interface AlertOptions {
  title?: string;
  kind?: NotifyKind;
  okText?: string;             // falls back to i18n.ok
}

export interface ConfirmOptions {
  title?: string;
  kind?: NotifyKind;
  yesText?: string;            // falls back to i18n.yes
  noText?: string;             // falls back to i18n.no
  includeCancel?: boolean;     // default false
  cancelText?: string;         // falls back to i18n.cancel
}

export interface QuestionButton { id: string; text: string; variant?: ButtonVariant; }

export interface QuestionOptions {
  title?: string;
  message: string;
  kind?: NotifyKind;           // can be 'question' to show question accent
  buttons: QuestionButton[];   // e.g., Yes/No/Cancel
  defaultId?: string;
  escReturns?: string | null;
  backdropReturns?: string | null;
}

// ---------- Toasts (edge notifications) ----------

/** Where the toast appears. */
export type ToastPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

/** How multiple toasts are handled at a position. */
export type ToastBehavior = 'stack' | 'queue' | 'replace';

/** Progress cue placement during auto-dismiss. */
export type ToastProgressPosition = 'cover' | 'top' | 'bottom' | 'left' | 'right';

export interface ToastTimeoutCue {
  /** Show a visual time-remaining cue when timeoutMs > 0. Default true. */
  show?: boolean;
  /** Where the cue appears. Default 'bottom'. */
  position?: ToastProgressPosition;
  direction?: 'grow' | 'shrink';  // default 'shrink'
  /** Thickness in px for edge bars (ignored for 'cover'). Default 3. */
  thicknessPx?: number;
}

/** Animation preset types for enter/exit. */
export type ToastAnimPreset = 'fade' | 'slide' | 'scale';
export type ToastDirection = 'up' | 'down' | 'left' | 'right' | 'auto';
/**
 * 'edge' => off-screen (e.g., translate(-120%)),
 * number => px (e.g., 16),
 * string => any CSS length (e.g., '1.25rem').
 */
export type ToastDistance = 'edge' | number | string;

export interface ToastAnimSpec {
  preset: ToastAnimPreset;         // slide|fade|scale
  direction?: ToastDirection;      // default 'auto' for slide
  distance?: ToastDistance;        // default 'edge' for slide
  durationMs?: number;             // override default duration
  easing?: string;                 // CSS timing function
}

export interface ToastAnimations {
  /** Enter/appear animation. Default: { preset:'slide', direction:'auto', distance:'edge' } */
  enter?: ToastAnimSpec;
  /** Exit/disappear animation. Default: { preset:'fade' } */
  exit?: ToastAnimSpec;
  /** Visual time-remaining cue (not a motion animation). */
  timeoutCue?: ToastTimeoutCue;
}

/**
 * Toast (edge notification) options.
 * Small, non-blocking messages with position, behavior, and optional progress cue.
 */
export interface ToastOptions {
  kind?: NotifyKind;
  title?: string;
  message: string;
  timeoutMs?: number;              // 0 = sticky
  dismissible?: boolean;           // show ×
  actions?: Array<{ id: string; text: string; onClick?: () => void | Promise<void> }>;

  position?: ToastPosition;        // default from config.toast.defaultPosition
  behavior?: ToastBehavior;        // default from config.toast.behavior
  maxVisible?: number;             // cap for stack/queue (default from config)
  animations?: ToastAnimations;    // enter/exit + timeout progress cue
}

// Internationalization bundle shape used by config and i18n helpers.
export interface I18nBundle {
  locale: string;                 // e.g., 'en', 'bn'
  dir: 'ltr' | 'rtl' | 'auto';
  ok: string;
  cancel: string;
  yes: string;
  no: string;
  close: string;                  // modal header close aria-label
  dismiss: string;                // toast dismiss aria-label
  titles: {
    info: string;
    success: string;
    warning: string;
    error: string;
    question: string;
  };
}

// ---------- End of public types ----------
