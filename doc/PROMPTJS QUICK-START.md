# PromptJS - Quick Start Guide

> **Modern, accessible, and powerful dialogs for the web**  
> Drop-in replacement for `alert()`, `confirm()`, and `prompt()` with a beautiful UI

---

## Table of Contents

- [What is PromptJS?](#-what-is-promptjs) - Core features & capabilities
- [Installation](#-installation) - CDN, Download, NPM
- [Basic Usage](#-basic-usage) - Alert, Confirm, Prompt
- [Enhanced Features](#-enhanced-features) - Types, Validation, Custom Text
- [Quick Examples](#-quick-examples) - Delete, Registration
- [Configuration](#%EF%B8%8F-configuration) - Complete config options
- [Theming](#-theming) - Light, Dark, Auto, Custom colors
- [Advanced Usage](#-advanced-usage) - Modal.open(), Modal.bare()/mount(), Toasts
- [Common Patterns](#-common-patterns) - Recipes & snippets
- [Internatilization](#-internationalization) - Multi-language support
- [TypeScript](#-typescript-support) - Type definitions
- [React Integration](#%EF%B8%8F-react-integration) - React hooks
- [API Reference](#-api-quick-reference) - Function signatures
- [Migration](#-migration-from-native-apis) - From native APIs
- [Troubleshooting](#-troubleshooting) - Common issues

---

## What is PromptJS?

**Two-in-one UI library**: Modals + Toasts in a single, zero-dependency package (~7KB gzipped)

### Core Features

#### 1 **Modals (Dialogs)**
- **Low-level APIs**: 
  - `Modal.open(options)` → Returns `ModalInstance` with full control
  - `Modal.bare(element)` / `Modal.mount(element)` → Mount any DOM element as modal
- **High-level Wrappers**: 
  - `alert(message)` → Simple notification
  - `confirm(message)` → Yes/No dialog
  - `prompt(message)` → Input dialog with validation
  - `question(message)` → Custom button choices

**ModalInstance** provides:
```javascript
const inst = Modal.open({ title: "Hello", content: "..." });
inst.update({ title: "Updated!" });  // Update content dynamically
inst.close();                         // Close programmatically
```

#### 2 **Toast Notifications**
- Multiple positions (top/bottom, left/center/right)
- Behaviors: stack, queue, or replace
- Auto-dismiss or sticky
- Action buttons
- Progress indicators

#### 3 **Customization**
- **Global Config**: `config.update({ theme: 'dark', animation: {...} })`
- **Per-Instance**: Pass options directly when calling modals/toasts
- **CSS Theming**: Override CSS variables for colors, spacing, fonts
- **Built-in Themes**: Light, dark, or auto (follows system)

#### 4 **Developer Experience**
- **Zero Dependencies**: Pure TypeScript, no external libs
- **Async/Await**: Non-blocking, promise-based APIs
- **Validation**: Built-in input validation (required, pattern, custom)
- **Accessibility**: Focus trap, ARIA labels, keyboard navigation
- **i18n Ready**: Multi-language support with RTL
- **Responsive**: Mobile-friendly with breakpoints
- **React Bindings**: Optional `@tlabsinc/promptjs-react` package

---

## 📦 Installation

### Option 1: CDN (Quickest)

```html
<!-- Add to your HTML <head> -->
<link rel="stylesheet" href="https://cdn.example.com/promptjs/promptjs.css">
<script src="https://cdn.example.com/promptjs/prompt.js"></script>
```

### Option 2: Download Files

1. Download `prompt.js` and `promptjs.css` from the [releases page](https://github.com/tlabsinc/promptjs/releases)
2. Add to your project:

```html
<link rel="stylesheet" href="/path/to/promptjs.css">
<script src="/path/to/prompt.js"></script>
```

### Option 3: NPM (For Modern Bundlers)

```bash
npm install @tlabsinc/promptjs-core
```

```javascript
import { alert, confirm, prompt } from '@tlabsinc/promptjs-core';
import '@tlabsinc/promptjs-core/dist/promptjs.css';
```

---

##  Basic Usage

### Simple Alert

```javascript
// Native browser alert (ugly, blocking)
alert("Hello World!");

// PromptJS alert (beautiful, async)
await PromptJS.alert("Hello World!");

// Or use shorthand
await PJ.alert("Hello World!");
```

### Confirm Dialog

```javascript
// Native confirm
const ok = confirm("Delete this item?");
if (ok) {
  // delete logic
}

// PromptJS confirm
const ok = await PromptJS.confirm("Delete this item?");
if (ok) {
  // delete logic
}
```

### Prompt Dialog

```javascript
// Native prompt
const name = prompt("What's your name?");

// PromptJS prompt
const name = await PromptJS.prompt("What's your name?");
if (name) {
  console.log(`Hello, ${name}!`);
}

// With default value
const name = await PromptJS.prompt("What's your name?", "Guest");
```

---

##  Enhanced Features

### Alert with Types

```javascript
// Information
await PromptJS.alert("Operation completed", { kind: 'info' });

// Success
await PromptJS.alert("Saved successfully!", { kind: 'success' });

// Warning
await PromptJS.alert("Unsaved changes", { kind: 'warning' });

// Error
await PromptJS.alert("Something went wrong", { kind: 'error' });
```

### Confirm with Custom Text

```javascript
const ok = await PromptJS.confirm(
  "Delete this item permanently?",
  {
    title: "Confirm Deletion",
    okText: "Delete",
    cancelText: "Keep"
  }
);
```

### Prompt with Validation

```javascript
// Email validation
const email = await PromptJS.prompt(
  "Enter your email:",
  "",
  {
    title: "Email Address",
    inputType: "email",
    required: true,
    pattern: "^[^@]+@[^@]+\\.[^@]+$"
  }
);

// Custom validation
const age = await PromptJS.prompt(
  "Enter your age:",
  "",
  {
    inputType: "number",
    validator: (value) => {
      const num = parseInt(value);
      if (num < 18) return "Must be 18 or older";
      if (num > 120) return "Invalid age";
      return true; // Valid
    }
  }
);

// Password with requirements
const password = await PromptJS.prompt(
  "Create a password:",
  "",
  {
    inputType: "password",
    required: true,
    minLength: 8,
    validator: (value) => {
      if (!/[A-Z]/.test(value)) return "Must contain uppercase";
      if (!/[0-9]/.test(value)) return "Must contain number";
      return true;
    }
  }
);
```

---

##  Quick Examples

### Delete Confirmation
```javascript
async function deleteItem(id) {
  const ok = await PromptJS.confirm("Delete this item?", {
    title: "Confirm Deletion",
    kind: "warning",
    okText: "Delete"
  });
  
  if (ok) {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    PromptJS.toast({ kind: 'success', message: 'Deleted!' });
  }
}
```

### Multi-Step Registration
```javascript
async function registerUser() {
  const username = await PromptJS.prompt("Username:", "", {
    required: true,
    validator: (v) => v.length >= 3 ? true : "Too short"
  });
  if (!username) return;
  
  const email = await PromptJS.prompt("Email:", "", {
    inputType: "email",
    required: true
  });
  if (!email) return;
  
  const password = await PromptJS.prompt("Password:", "", {
    inputType: "password",
    required: true,
    validator: (v) => {
      if (v.length < 8) return "Min 8 characters";
      if (!/[A-Z]/.test(v)) return "Need uppercase";
      if (!/[0-9]/.test(v)) return "Need number";
      return true;
    }
  });
  if (!password) return;
  
  const ok = await PromptJS.confirm(`Register as ${username}?`);
  if (ok) {
    await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    PromptJS.toast({ kind: 'success', message: 'Account created!' });
  }
}
```

---

##  Configuration

### Complete Configuration Options

PromptJS provides extensive configuration options. Configure once at app initialization:

```javascript
PromptJS.config.update({
  // ============================================
  // THEME & APPEARANCE
  // ============================================
  theme: 'auto', // 'light' | 'dark' | 'auto' (follows system preference)
  zIndexBase: 2000, // Base z-index for all dialogs and toasts
  
  // ============================================
  // ANIMATION
  // ============================================
  animation: {
    enable: true, // Master switch for all animations
    durationMs: 200, // Default animation duration
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' // CSS easing function
  },
  
  // ============================================
  // OVERLAY (Modal backdrop)
  // ============================================
  overlay: {
    fade: true, // Fade backdrop in/out
    surfaceAlpha: 0.6, // Backdrop opacity (0-1)
    backdropBlurPx: 0 // Blur effect on backdrop (in pixels)
  },
  
  // ============================================
  // MODAL BEHAVIOR
  // ============================================
  modal: {
    concurrency: 'queue', // 'queue' | 'reject' - how to handle multiple modals
    surfaceAlpha: 1, // Modal surface opacity (0-1)
    dialogBlurPx: 0, // Blur effect on modal content (in pixels)
    closeOnEsc: true, // Close on ESC key
    closeOnBackdrop: true, // Close on backdrop click
    trapFocus: true, // Trap focus inside modal
    showClose: true, // Show X close button
    draggable: false // Enable dragging (desktop only)
  },
  
  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  toast: {
    defaultPosition: 'top-right', // 'top-left' | 'top-center' | 'top-right' | 
                                   // 'bottom-left' | 'bottom-center' | 'bottom-right'
    behavior: 'stack', // 'stack' | 'queue' | 'replace'
    maxVisible: 3, // Maximum visible toasts per position
    defaultTimeoutMs: 4000, // Default auto-dismiss time (0 = never)
    defaultDismissible: true, // Show close button by default
    spacingPx: 10, // Space between toasts
    zBoost: 100, // Z-index boost above modals
    margins: {
      top: 16,
      bottom: 16,
      left: 16,
      right: 16
    },
    animations: {
      enter: {
        preset: 'slide', // 'slide' | 'fade' | 'scale'
        direction: 'auto', // 'auto' | 'left' | 'right' | 'up' | 'down'
        durationMs: 200
      },
      exit: {
        preset: 'slide',
        direction: 'auto',
        durationMs: 150
      },
      timeoutCue: {
        show: true, // Show progress indicator
        position: 'bottom', // 'top' | 'bottom' | 'left' | 'right' | 'cover'
        direction: 'shrink', // 'grow' | 'shrink'
        thicknessPx: 3
      }
    }
  },
  
  // ============================================
  // INTERNATIONALIZATION (i18n)
  // ============================================
  i18n: {
    locale: 'en',
    dir: 'auto', // 'auto' | 'ltr' | 'rtl' (for right-to-left languages)
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
      question: 'Question'
    }
  },
  
  // ============================================
  // ACCESSIBILITY
  // ============================================
  a11y: {
    ariaModalLabel: 'Dialog' // Default ARIA label for modals
  },
  
  // ============================================
  // RESPONSIVE BREAKPOINTS
  // ============================================
  breakpoints: {
    sm: 640,  // Small devices
    md: 768,  // Medium devices
    lg: 1024  // Large devices
  },
  
  // ============================================
  // CUSTOM CONTAINER
  // ============================================
  container: null // HTMLElement | null - Mount target (null = document.body)
});
```

### Common Configuration Patterns

#### Minimal Setup (Recommended)
```javascript
PromptJS.config.update({
  theme: 'auto',
  animation: { enable: true, durationMs: 200 },
  toast: { defaultPosition: 'top-right' }
});
```

#### Disable Animations
```javascript
PromptJS.config.update({
  animation: { enable: false }
});
```

#### Custom Toast Behavior
```javascript
PromptJS.config.update({
  toast: {
    behavior: 'replace', // Only show one toast at a time
    defaultPosition: 'bottom-center',
    defaultTimeoutMs: 3000
  }
});
```

#### Queue Modals (Sequential)
```javascript
PromptJS.config.update({
  modal: { concurrency: 'queue' } // Show modals one after another
});
```

#### Reject Concurrent Modals
```javascript
PromptJS.config.update({
  modal: { concurrency: 'reject' } // Reject new modals while one is open
});
```

#### Custom Theme Colors (CSS)
```css
:root {
  --pj-primary: #3b82f6;
  --pj-success: #10b981;
  --pj-warning: #f59e0b;
  --pj-error: #ef4444;
  --pj-radius: 8px;
}
```

### Reading Current Config

```javascript
// Get entire config
const config = PromptJS.config.get();

// Get specific value
const theme = PromptJS.config.get().theme;
const toastPosition = PromptJS.config.get().toast.defaultPosition;
```

### Config Change Listener

```javascript
// Listen for config changes
const unsubscribe = PromptJS.config.onChange((newConfig) => {
  console.log('Config updated:', newConfig);
});

// Stop listening
unsubscribe();
```

### Laravel Integration

**Blade Component** (`resources/views/components/promptjs.blade.php`):
```blade
@once
<link rel="stylesheet" href="{{ asset('css/promptjs.css') }}">
<script src="{{ asset('js/prompt.js') }}"></script>
<script>
  PromptJS.config.update({
    i18n: { locale: '{{ app()->getLocale() }}' }
  });
  window.PJ = PromptJS;
</script>
@endonce
```

**Usage**:
```blade
<x-promptjs />
<button onclick="PJ.alert('Hello!')">Click</button>
```

**Or in Layout** (`layouts/app.blade.php`):
```blade
<script src="{{ asset('js/prompt.js') }}"></script>
<script>window.PJ = PromptJS;</script>
```

---

##  Theming

```javascript
// Auto (follows system)
PromptJS.config.update({ theme: 'auto' });

// Manual
PromptJS.config.update({ theme: 'light' }); // or 'dark'
```

**Custom Colors** (CSS):
```css
:root {
  --pj-primary: #3b82f6;
  --pj-success: #10b981;
  --pj-warning: #f59e0b;
  --pj-error: #ef4444;
}
```

---

##  Advanced Usage

### Modal APIs

#### **Modal.open()** - Full-featured dialog
```javascript
const inst = PromptJS.Modal.open({
  title: "Custom Dialog",
  content: "HTML content or DOM element",
  kind: 'info',  // Visual style
  buttons: [
    { 
      text: "Save", 
      variant: "primary",
      closeOnClick: false,  // Keep modal open
      onClick: async (inst) => {
        // Handle action
        await saveData();
        inst.close('saved');  // Close manually
      }
    },
    { text: "Cancel", variant: "neutral" }
  ],
  draggable: true,  // Make draggable on desktop
  closeOnBackdrop: false,  // Prevent backdrop close
  onClose: (reason) => console.log('Closed:', reason)
});

// ModalInstance methods
inst.update({ title: "New Title", content: "Updated content" });
inst.close('custom-reason');
inst.id;  // Unique modal ID
inst.contentEl;  // Access content DOM element
```

#### **Modal.bare()** / **Modal.mount()** - Minimal wrapper
```javascript
const myElement = document.createElement('div');
myElement.innerHTML = '<h1>Custom Content</h1>';

// Both are equivalent (mount is an alias for bare)
const inst = PromptJS.Modal.bare({
  content: myElement,
  closeOnEsc: true,
  animate: true
});

// Or use the more semantic mount() alias
const inst2 = PromptJS.Modal.mount({
  content: myElement,
  closeOnEsc: true
});
```

### Toast Notifications
```javascript
// Simple
PromptJS.toast({ message: "Saved!", kind: 'success' });

// With actions
PromptJS.toast({
  message: "Connection lost",
  kind: 'error',
  actions: [
    { text: "Retry", onClick: () => reconnect() },
    { text: "Dismiss" }
  ],
  timeoutMs: 0,  // Never auto-dismiss
  dismissible: true
});

// Different positions
PromptJS.toast({ message: "Top right", position: 'top-right' });
PromptJS.toast({ message: "Bottom center", position: 'bottom-center' });
```

### Event Callbacks
```javascript
Modal.open({
  title: "Modal with Events",
  content: "...",
  onOpen: (inst) => {
    console.log('Modal opened:', inst.id);
    // Initialize, load data, etc.
  },
  onClose: (reason) => {
    console.log('Modal closed with reason:', reason);
    // Cleanup, save state, etc.
  },
  buttons: [
    {
      text: "Save",
      onClick: async (inst) => {
        // Button click handler
        await saveData();
        inst.close('saved');  // Triggers onClose('saved')
      }
    }
  ]
});
```

### Per-Instance Overrides
```javascript
// Override global config for specific modal
Modal.open({
  title: "Special Modal",
  content: "...",
  animate: false,  // No animation for this one
  surfaceAlpha: 0.9,  // Custom backdrop
  draggable: { handle: "header", axis: "y" }  // Drag vertically only
});

// Override global config for specific toast
toast({
  message: "Custom toast",
  timeoutMs: 10000,  // Longer timeout
  position: 'bottom-left',  // Different position
  behavior: 'replace'  // Replace existing toasts
});
```

---

##  Common Patterns

### Form in Modal with Validation
```javascript
const form = document.createElement("form");
form.innerHTML = `<label>Name: <input id="name" required /></label>`;

const inst = PromptJS.Modal.open({
  title: "Create User",
  content: form,
  buttons: [
    { text: "Cancel", variant: "neutral" },
    {
      text: "Save",
      variant: "primary",
      closeOnClick: false,
      onClick: async () => {
        const name = form.querySelector("#name").value;
        if (!name) return;
        await fetch('/api/users', { method: 'POST', body: JSON.stringify({ name }) });
        PromptJS.toast({ kind: 'success', message: 'User created!' });
        inst.close();
      }
    }
  ]
});
```

### Status Updates (Replace Behavior)
```javascript
PromptJS.config.update({ toast: { behavior: "replace", defaultPosition: "bottom-center" }});
PromptJS.toast({ kind: "info", message: "Connectingâ€¦" });
setTimeout(() => PromptJS.toast({ kind: "success", message: "Connected!" }), 1500);
```

### Undo Pattern
```javascript
PromptJS.toast({
  kind: "success",
  message: "Item deleted",
  actions: [
    { text: "Undo", onClick: () => { /* restore logic */ } },
    { text: "Close" }
  ],
  timeoutMs: 0,
  dismissible: false
});
```

### Locale Switching
```javascript
PromptJS.i18n.use("es", {
  locale: "es",
  ok: "Aceptar",
  cancel: "Cancelar",
  titles: { info: "InformaciÃ³n", success: "Ã‰xito" }
});
await PromptJS.alert("Â¡Hola!");
```

### Scoped Modals (Custom Container)
```javascript
const panel = document.getElementById('my-panel');
PromptJS.config.update({ container: panel, zIndexBase: 10 });
// Modals now render inside panel
```

---

##  Internationalization

```javascript
// Spanish
PromptJS.config.update({
  i18n: {
    locale: 'es',
    ok: 'Aceptar',
    cancel: 'Cancelar',
    titles: { success: 'Ã‰xito', error: 'Error' }
  }
});

// RTL (Arabic, Hebrew, etc.)
PromptJS.config.update({
  i18n: { locale: 'ar', dir: 'rtl', ok: 'Ø­Ø³Ù†Ø§Ù‹', cancel: 'Ø¥Ù„ØºØ§Ø¡' }
});
```

---

##  TypeScript Support

PromptJS is written in TypeScript and includes full type definitions:

```typescript
import { 
  alert, 
  confirm, 
  prompt, 
  Modal, 
  toast,
  type PromptOptions,
  type ModalOptions 
} from '@tlabsinc/promptjs-core';

// Full autocomplete and type safety
const result: string | null = await prompt("Name?", "", {
  required: true,
  inputType: "text",
  validator: (value: string) => value.length > 0 ? true : "Required"
});
```

---

##  React Integration
**Hooks**: `useDialogs()`, `useToast()`, `useModal()`, `useBareModal()`, `usePrompt()`

📖 **Full React Docs**: [packages/react/README.md](./packages/react/README.md)

```bash
npm install @tlabsinc/promptjs-react @tlabsinc/promptjs-core
```

**Basic Usage**:
```tsx
import { useDialogs } from '@tlabsinc/promptjs-react';

function MyComponent() {
  const { alert, confirm, prompt } = useDialogs();
  
  const handleClick = async () => {
    const name = await prompt("Your name?");
    if (name) await alert(`Hello ${name}!`);
  };
  
  return <button onClick={handleClick}>Click</button>;
}
```

**With Provider** (Recommended):
```tsx
import { PromptProvider, useDialogs, useToast } from '@tlabsinc/promptjs-react';

function App() {
  return (
    <PromptProvider theme="auto">
      <MyApp />
    </PromptProvider>
  );
}
```

**Hooks**: `useDialogs()`, `useToast()`, `useModal()`, `usePrompt()`

ðŸ“– **Full React Docs**: [packages/react/README.md](./packages/react/README.md)

---

##  API Quick Reference

### Dialog Functions

```typescript
// Alert - Returns Promise<void>
await alert(message, { title?, kind?, okText? })

// Confirm - Returns Promise<boolean>
await confirm(message, { title?, kind?, okText?, cancelText? })

// Prompt - Returns Promise<string | null>
await prompt(message, defaultValue?, {
  title?, inputType?, required?, pattern?, maxLength?,
  minLength?, validator?, okText?, cancelText?
})

// Question - Returns Promise<boolean>
await question(message, { title? })

// Toast - Returns void
toast({
  message, kind?, title?, timeoutMs?, position?,
  dismissible?, actions?
})
```

### Key Options

| Function | Key Options | Return |
|----------|-------------|--------|
| `alert()` | `kind`, `title`, `okText` | `Promise<void>` |
| `confirm()` | `kind`, `title`, `okText`, `cancelText` | `Promise<boolean>` |
| `prompt()` | `inputType`, `required`, `validator`, `pattern` | `Promise<string \| null>` |
| `question()` | `title` | `Promise<boolean>` |
| `toast()` | `kind`, `position`, `timeoutMs`, `actions` | `void` |

### Input Types (prompt)
`'text'` | `'password'` | `'email'` | `'number'` | `'tel'` | `'url'`

### Dialog Kinds
`'info'` | `'success'` | `'warning'` | `'error'` | `'question'`

### Toast Positions
`'top-left'` | `'top-center'` | `'top-right'` | `'bottom-left'` | `'bottom-center'` | `'bottom-right'`

---

##  Migration from Native APIs

| Native | PromptJS |
|--------|----------|
| `alert("Hi")` | `await PromptJS.alert("Hi")` |
| `confirm("OK?")` | `await PromptJS.confirm("OK?")` |
| `prompt("Name?")` | `await PromptJS.prompt("Name?")` |

**Benefits**: âœ… Async/Await âœ… Modern UI âœ… Validation âœ… Accessible âœ… Themeable

---

##  Troubleshooting

| Issue | Solution |
|-------|----------|
| Dialogs not showing | Check: `console.log(window.PromptJS)` should be defined |
| Behind other elements | `config.update({ zIndexBase: 9999 })` |
| Theme not applying | Set before showing: `config.update({ theme: 'dark' })` |
| Validation not working | Use `closeOnClick: false` on buttons |
| Toast not dismissing | Set `timeoutMs: 0` for sticky toasts |

---

##  Pro Tips

- **Shorthand**: Use `window.PJ = window.PromptJS` for brevity
- **Configure Once**: Set global config at app initialization
- **Auto Theme**: Use `theme: 'auto'` for system preference
- **Validation**: Built-in validators (required, pattern) before custom
- **Non-Blocking**: Always `await` dialog functions

---

##  Bundle Size

~7KB gzipped total â€¢ Zero dependencies ðŸŽ‰

---

##  Resources

- [Full API Docs](./doc/) â€¢ [Examples](./packages/core/demo-*.html)
- [GitHub](https://github.com/tlabsinc/promptjs) â€¢ [NPM](https://www.npmjs.com/package/@tlabsinc/promptjs-core)
- [React Package](./packages/react/README.md)

---

**Made with â¤ï¸ by TLabs** â€¢ MIT License
