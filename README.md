# PromptJS

Lightweight, framework‑agnostic UI primitives for **modals**, **toasts**, and **dialogs** — with sane defaults, accessible focus management, and zero external deps.

> **Status:** actively developed.

---

## Features

* Modals & dialogs: focus trap, ESC/backdrop close, queue/reject concurrency, draggable (desktop).
* Toasts: per‑position slots, `stack | queue | replace`, enter/exit presets, timeout progress cue (bar/cover, grow/shrink).
* Animations: global policy + per‑instance overrides (`slide | fade | scale`), reduced‑motion aware.
* Internationalization: tiny i18n helper with built‑in English pack.
* Styling: theme classes (`pj-theme-light|dark|auto`) and CSS variables.
* No deps: vanilla TypeScript + DOM.

---

## Install

```bash
# Core (vanilla / any framework)
npm i @tlabsinc/promptjs-core

# Optional React bindings
npm i @tlabsinc/promptjs-react
```

### CDN (UMD)

```html
<link rel="stylesheet" href="https://unpkg.com/@tlabsinc/promptjs-core/dist/promptjs.css">
<script src="https://unpkg.com/@tlabsinc/promptjs-core/dist/index.global.js"></script>
<script>
  PromptJS.toast({ kind: "success", message: "Hello!" });
</script>
```

---

## Quick start (Core)

```ts
import { Modal, toast, alert, confirm, prompt, question, config } from "@tlabsinc/promptjs-core";
import "@tlabsinc/promptjs-core/dist/promptjs.css";

config.update({ theme: "auto" });

Modal.open({
  kind: "info",
  title: "Welcome",
  content: "PromptJS is ready.",
});

toast({ kind: "success", message: "<b>Saved</b> successfully." });

// Drop-in replacements for native browser APIs
await alert("Operation complete!");
const confirmed = await confirm("Delete this item?");
const name = await prompt("Enter your name:", "Guest");
```

---

## React usage (optional)

```tsx
import { PromptProvider, usePrompt } from "@tlabsinc/promptjs-react";
import "@tlabsinc/promptjs-core/dist/promptjs.css";

function App() {
  return (
    <PromptProvider theme="auto">
      <Demo />
    </PromptProvider>
  );
}

function Demo() {
  const { Modal, toast, alert, confirm, prompt } = usePrompt();
  return (
    <button
      onClick={async () => {
        const name = await prompt("What's your name?", "");
        if (name) {
          Modal.open({ title: `Hi ${name}!`, content: "From React." });
          await alert("Nice to meet you!");
          toast({ kind: "success", message: "Done." });
        }
      }}
    >
      Try it
    </button>
  );
}
```

---

## Core API (snapshot)

### Modals

```ts
Modal.open({
  kind?: "info" | "success" | "warning" | "error" | "question",
  title?: string,
  content: string | Node,
  unsafeHTML?: boolean,
  showClose?: boolean,
  closeOnEsc?: boolean,
  closeOnBackdrop?: boolean,
  trapFocus?: boolean,
  surfaceAlpha?: number,
  dialogBlurPx?: number,
  backdropBlurPx?: number,
  ariaLabel?: string,
  draggable?: boolean | {
    handle?: "header" | string | HTMLElement,
    axis?: "x" | "y" | "both",
    withinViewport?: boolean,
    disableOnMobile?: boolean,
    cursor?: string | null
  },
  buttons?: Array<{ id: string; text: string; variant?: "primary"|"neutral"|"danger"|"ghost"; closeOnClick?: boolean; onClick?: (inst)=>void|Promise<void> }>,
  onOpen?: (inst)=>void,
  onClose?: (reason)=>void,
  animate?: boolean,
});
```

> Returns `{ id, close(result?), update(partial) }`. Also see `Modal.bare()`.

### Toasts

```ts
toast({
  kind?: "info" | "success" | "warning" | "error" | "question",
  title?: string,               // optional heading
  message: string,              // sanitized HTML
  actions?: Array<{ id: string; text: string; onClick?: ()=>void|Promise<void> }>,
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right",
  behavior?: "stack" | "queue" | "replace",
  maxVisible?: number,
  timeoutMs?: number,           // 0 = sticky
  dismissible?: boolean,
  animations?: {
    enter?: { preset?: "slide"|"fade"|"scale"; direction?: "left"|"right"|"up"|"down"|"auto"; distance?: "edge"|number|string; durationMs?: number; easing?: string; },
    exit?:  { preset?: "slide"|"fade"|"scale"; direction?: "left"|"right"|"up"|"down"|"auto";                 durationMs?: number; easing?: string; },
    timeoutCue?: { show?: boolean; position?: "top"|"bottom"|"left"|"right"|"cover"; direction?: "grow"|"shrink"; thicknessPx?: number; }
  }
});
```

> **Important:** For `slide`, `enter.direction` means the edge it **comes from**; `exit.direction` means the edge it **goes to**.

### Dialog helpers

Drop-in replacements for native browser APIs with async/await:

```ts
// Alert - simple notification
await alert("Message", { title?: string });

// Confirm - returns boolean
const ok = await confirm("Are you sure?", { includeCancel: true });

// Prompt - returns string | null (NEW!)
const name = await prompt("What's your name?", "Default", {
  title?: string,
  inputType?: "text" | "password" | "email" | "number" | "tel" | "url",
  placeholder?: string,
  required?: boolean,
  maxLength?: number,
  pattern?: string,
  validator?: (value: string) => boolean | string
});

// Question - returns selected button id
const { id } = await question({ 
  message: "Pick one", 
  buttons: [{ id: "yes", text: "Yes" }, { id: "no", text: "No" }] 
});
```

---

## Configuration (selected)

```ts
config.update({
  theme: "auto",
  zIndexBase: 2000,
  animation: { enable: true, durationMs: 180, easing: "ease" },
  overlay: { fade: true, surfaceAlpha: 0.6, backdropBlurPx: 0 },
  modal:   { concurrency: "queue", surfaceAlpha: 1, dialogBlurPx: 0 },
  toast: {
    defaultPosition: "top-center",
    behavior: "stack",
    maxVisible: 3,
    margins: { top: 16, bottom: 16, left: 16, right: 16 },
    spacingPx: 10,
    zBoost: 100,
    animations: {
      enter: { preset: "slide", direction: "auto" },
      exit:  { preset: "slide", direction: "auto" },
      timeoutCue: { show: true, position: "bottom", direction: "shrink", thicknessPx: 3 }
    },
    defaultTimeoutMs: 4000,
    defaultDismissible: true
  }
});
```

---

## Accessibility

* Modals: `role="dialog"`, `aria-modal="true"`, focus trap, ESC/backdrop close (configurable), background `aria-hidden` during open.
* Toasts: `role="status"`, `aria-live="polite"`, localized close labels.

---

## Browser support

Modern evergreen browsers. Respects `prefers-reduced-motion`.

---

## License

MIT © TLABS Inc. · [https://tlabsinc.com](https://tlabsinc.com)

---

## Links

* Docs / Demo: *(add link)*
* Core (npm): [https://www.npmjs.com/package/@tlabsinc/promptjs-core](https://www.npmjs.com/package/@tlabsinc/promptjs-core)
* React (npm): [https://www.npmjs.com/package/@tlabsinc/promptjs-react](https://www.npmjs.com/package/@tlabsinc/promptjs-react)
* Issues: *(add GitHub URL)*
