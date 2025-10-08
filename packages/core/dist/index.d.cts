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
type ButtonVariant = 'primary' | 'neutral' | 'danger' | 'ghost';
interface ButtonDef {
    id: string;
    text: string;
    variant?: ButtonVariant;
    closeOnClick?: boolean;
    onClick?: (ctx: ModalInstance) => void | Promise<void>;
}
type Theme = 'light' | 'dark' | 'auto';
type ModalConcurrency = 'queue' | 'reject';
type NotifyKind = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'question';
type ModalDraggable = boolean | {
    handle?: "header" | string | HTMLElement;
    axis?: "x" | "y" | "both";
    withinViewport?: boolean;
    disableOnMobile?: boolean;
    cursor?: string | null;
};
interface BaseModalOptions {
    title?: string;
    size?: 'sm' | 'md' | 'lg' | {
        w?: number | string;
        h?: number | string;
    };
    animate?: boolean;
    closeOnEsc?: boolean;
    closeOnBackdrop?: boolean;
    trapFocus?: boolean;
    ariaLabel?: string;
    concurrency?: ModalConcurrency;
    onOpen?: (ctx: ModalInstance) => void;
    onClose?: (result?: unknown) => void;
    showClose?: boolean;
    closeAriaLabel?: string;
    defaultButtonId?: string;
    kind?: NotifyKind;
    surfaceAlpha?: number;
    dialogBlurPx?: number;
    backdropBlurPx?: number;
    draggable?: ModalDraggable;
}
interface ModalOptions extends BaseModalOptions {
    content: string | Node;
    unsafeHTML?: boolean;
    buttons?: ButtonDef[];
}
interface BareModalOptions extends Omit<BaseModalOptions, "title"> {
    /** PromptJS chrome (header chrome off by default). Default: true */
    windowed?: boolean;
    /** Optional initial content (sanitized unless unsafeHTML). */
    content?: string | Node;
    unsafeHTML?: boolean;
    /** Optional surface/content classes (hooks) */
    surfaceClass?: string;
    contentClass?: string;
}
interface ModalInstance {
    id: string;
    close: (result?: unknown) => void;
    update: (partial: Partial<Pick<ModalOptions, "title" | "content" | "unsafeHTML" | "buttons">>) => void;
    readonly el: HTMLDivElement;
    readonly contentEl: HTMLElement;
}
interface AlertOptions extends BaseModalOptions {
    okText?: string;
}
interface ConfirmOptions extends BaseModalOptions {
    yesText?: string;
    noText?: string;
    includeCancel?: boolean;
    cancelText?: string;
}
interface PromptOptions extends BaseModalOptions {
    okText?: string;
    cancelText?: string;
    placeholder?: string;
    inputType?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    validator?: (value: string) => boolean | string;
}
interface QuestionButton {
    id: string;
    text: string;
    variant?: ButtonVariant;
}
interface QuestionOptions extends BaseModalOptions {
    message: string;
    buttons: QuestionButton[];
    onDismissal?: string;
}
/** Where the toast appears. */
type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
/** How multiple toasts are handled at a position. */
type ToastBehavior = 'stack' | 'queue' | 'replace';
/** Progress cue placement during auto-dismiss. */
type ToastProgressPosition = 'cover' | 'top' | 'bottom' | 'left' | 'right';
interface ToastTimeoutCue {
    /** Show a visual time-remaining cue when timeoutMs > 0. Default true. */
    show?: boolean;
    /** Where the cue appears. Default 'bottom'. */
    position?: ToastProgressPosition;
    direction?: 'grow' | 'shrink';
    /** Thickness in px for edge bars (ignored for 'cover'). Default 3. */
    thicknessPx?: number;
}
/** Animation preset types for enter/exit. */
type ToastAnimPreset = 'fade' | 'slide' | 'scale';
type ToastDirection = 'up' | 'down' | 'left' | 'right' | 'auto';
/**
 * 'edge' => off-screen (e.g., translate(-120%)),
 * number => px (e.g., 16),
 * string => any CSS length (e.g., '1.25rem').
 */
type ToastDistance = 'edge' | number | string;
interface ToastAnimSpec {
    preset: ToastAnimPreset;
    direction?: ToastDirection;
    distance?: ToastDistance;
    durationMs?: number;
    easing?: string;
}
interface ToastAnimations {
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
interface ToastOptions {
    kind?: NotifyKind;
    title?: string;
    message: string;
    timeoutMs?: number;
    dismissible?: boolean;
    actions?: Array<{
        id: string;
        text: string;
        onClick?: () => void | Promise<void>;
    }>;
    position?: ToastPosition;
    behavior?: ToastBehavior;
    maxVisible?: number;
    animations?: ToastAnimations;
}
interface I18nBundle {
    locale: string;
    dir: 'ltr' | 'rtl' | 'auto';
    ok: string;
    cancel: string;
    yes: string;
    no: string;
    close: string;
    dismiss: string;
    titles: {
        info: string;
        success: string;
        warning: string;
        error: string;
        question: string;
    };
}

/**
 * PromptJS – config.ts
 * Central runtime configuration store and defaults.
 * Uses a simple event emitter to notify changes.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * Exposes:
 *   - config.get(): read the current configuration
 *   - config.update(partial): shallow-merge updates (with deep-merge for breakpoints/icons/toast)
 *   - config.onChange(fn): subscribe to changes (returns unsubscribe)
 *
 * Covers theme (light/dark/auto), container, z-index base, animation, i18n,
 * a11y hints, breakpoints, icon overrides, modal concurrency, and toast defaults.
 */

interface PromptJSConfig {
    theme: Theme;
    container: HTMLElement | null;
    zIndexBase: number;
    animation: {
        enable: boolean;
        durationMs: number;
        easing?: string;
    };
    i18n: {
        locale: string;
        dir: "ltr" | "rtl" | "auto";
        ok: string;
        cancel: string;
        yes: string;
        no: string;
        close: string;
        dismiss: string;
        titles: {
            info: string;
            success: string;
            warning: string;
            error: string;
            question: string;
        };
    };
    a11y: {
        ariaModalLabel?: string;
    };
    breakpoints: {
        sm: number;
        md: number;
        lg: number;
    };
    icons: Partial<Record<"info" | "success" | "warning" | "error" | "question", string | HTMLElement>>;
    overlay: {
        fade: boolean;
        surfaceAlpha: number;
        backdropBlurPx: number;
    };
    modal: {
        concurrency: ModalConcurrency;
        surfaceAlpha?: number;
        dialogBlurPx?: number;
    };
    toast: {
        defaultPosition: ToastPosition;
        behavior: ToastBehavior;
        maxVisible: number;
        spacingPx: number;
        margins: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        };
        zBoost: number;
        animations: ToastAnimations;
        defaultTimeoutMs: number;
        defaultDismissible: boolean;
    };
}
declare const config: {
    get: () => PromptJSConfig;
    update(partial: Partial<PromptJSConfig>): void;
    onChange(fn: () => void): () => void;
};

/**
 * PromptJS – modal.ts
 * Core modal dialog implementation.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * Exposes:
 *   - open(options): standard modal dialog with header, content, footer
 *  - bare(options): bare modal surface with content only
 *  - Both return a ModalInstance with .close(), .contentEl, and .update()
 */

declare function open(options: ModalOptions): ModalInstance;
declare function bare(options?: BareModalOptions): ModalInstance;
/**
 * Alias for bare() - mounts custom content in a minimal modal wrapper.
 * Provides a more semantic name for mounting DOM elements.
 */
declare const mount: typeof bare;

declare const modal_bare: typeof bare;
declare const modal_mount: typeof mount;
declare const modal_open: typeof open;
declare namespace modal {
  export { modal_bare as bare, modal_mount as mount, modal_open as open };
}

/**
 * PromptJS – toast.ts
 * Edge notifications with per-position slots, behavior (stack|queue|replace),
 * enter/exit animations, and a timeout progress cue.
 *
 * Uses Manager's toast slots/queues; does not affect modals.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 */

declare function toast(opts: ToastOptions): {
    dismiss: () => void;
};

declare function question(opts: QuestionOptions): Promise<{
    id: string;
}>;
declare function confirm(message: string, opts?: ConfirmOptions): Promise<boolean>;
declare function alert(message: string, opts?: AlertOptions): Promise<void>;
declare function prompt(message: string, defaultValue?: string, opts?: PromptOptions): Promise<string | null>;

/**
 * PromptJS – i18n.ts
 * Locale registry and helpers so apps can switch language with one call.
 * This updates config.i18n and deep-merges default dialog titles.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 */

declare function register(bundle: I18nBundle): void;
declare function getAvailable(): string[];
/**
 * Set the active language. The bundle must be registered first
 * (or pass the bundle via use()).
 */
declare function set(locale: string): void;
/**
 * Convenience: register and set in one call.
 */
declare function use(locale: string, bundle?: I18nBundle): void;
/**
 * Load a locale asynchronously (for JSON or code-split modules),
 * then register and set it. Returns the loaded bundle.
 */
declare function load(locale: string, loader: () => Promise<I18nBundle>): Promise<I18nBundle>;

declare const i18n_getAvailable: typeof getAvailable;
declare const i18n_load: typeof load;
declare const i18n_register: typeof register;
declare const i18n_set: typeof set;
declare const i18n_use: typeof use;
declare namespace i18n {
  export { i18n_getAvailable as getAvailable, i18n_load as load, i18n_register as register, i18n_set as set, i18n_use as use };
}

/**
 * PromptJS – index.ts
 * Entry point for the public API.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * - ESM: re-exports config, Modal, notify, question, confirm, alert, and types.
 * - UMD (when bundled): attaches a global `window.PromptJS` for Blade/vanilla usage.
 * - No side effects beyond optional global attach when `window` is present.
 */

declare const version: string;

declare global {
    interface Window {
        PromptJS?: any;
    }
}

export { type AlertOptions, type ConfirmOptions, modal as Modal, type ModalInstance, type ModalOptions, type PromptOptions, type QuestionOptions, type ToastOptions, alert, config, confirm, i18n, prompt, question, toast, version };
