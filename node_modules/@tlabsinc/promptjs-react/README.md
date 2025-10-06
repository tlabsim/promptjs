# @tlabsinc/promptjs-react

> React bindings for PromptJS - Modern, accessible, and themeable dialogs

[![npm version](https://img.shields.io/npm/v/@tlabsinc/promptjs-react.svg)](https://www.npmjs.com/package/@tlabsinc/promptjs-react)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@tlabsinc/promptjs-react)](https://bundlephobia.com/package/@tlabsinc/promptjs-react)

## Features

✅ **Zero Config** - Works without a provider (uses core API directly)  
✅ **Scoped Portals** - Optionally mount modals/toasts inside React components  
✅ **Theme Integration** - Sync with your React app's theme  
✅ **TypeScript** - Full type safety  
✅ **React 18+** - Uses modern React patterns  
✅ **SSR Safe** - Works with Next.js, Remix, etc.

---

## Installation

```bash
npm install @tlabsinc/promptjs-react @tlabsinc/promptjs-core
```

```bash
pnpm add @tlabsinc/promptjs-react @tlabsinc/promptjs-core
```

```bash
yarn add @tlabsinc/promptjs-react @tlabsinc/promptjs-core
```

---

## Quick Start

### Basic Usage (No Provider Needed!)

```tsx
import { useDialogs } from '@tlabsinc/promptjs-react';
import '@tlabsinc/promptjs-core/dist/promptjs.css';

function MyComponent() {
  const { alert, confirm, prompt } = useDialogs();
  
  const handleClick = async () => {
    await alert("Hello from React!");
    
    const ok = await confirm("Delete this item?");
    if (ok) {
      const reason = await prompt("Why?");
      console.log(reason);
    }
  };
  
  return <button onClick={handleClick}>Show Dialogs</button>;
}
```

### With Provider (Recommended for Theme Sync)

```tsx
import { PromptProvider, useDialogs, useToast } from '@tlabsinc/promptjs-react';
import '@tlabsinc/promptjs-core/dist/promptjs.css';

function App() {
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'auto'>('auto');
  
  return (
    <PromptProvider theme={theme}>
      <YourApp />
    </PromptProvider>
  );
}

function YourApp() {
  const { alert, confirm, prompt } = useDialogs();
  const toast = useToast();
  
  const handleSave = async () => {
    const name = await prompt("Enter your name:");
    if (name) {
      // Save logic here
      toast({ kind: 'success', message: `Saved ${name}!` });
    }
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

---

## API Reference

### Hooks Overview

| Hook | Purpose | Returns |
|------|---------|---------|
| `useDialogs()` | Alert, confirm, prompt, question | `{ alert, confirm, question, prompt }` |
| `useToast()` | Show toast notifications | `(options) => void` |
| `useModal()` | Open full-featured modals | `(options) => ModalInstance` |
| `useBareModal()` | Mount custom content (minimal wrapper) | `{ bare, mount }` |
| `usePrompt()` | Access full PromptJS API | `PromptContextValue` |

---

### `<PromptProvider>`

Wraps your app to provide theme sync and optional scoped portals.

```tsx
<PromptProvider 
  theme="auto"      // 'auto' | 'light' | 'dark'
  scope={false}     // true = mount inside provider
  zIndexBase={2000} // only used when scope=true
>
  {children}
</PromptProvider>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Theme mode (syncs with PromptJS config) |
| `scope` | `boolean` | `false` | Mount modals/toasts inside provider instead of body |
| `zIndexBase` | `number` | `2000` | Base z-index (only when `scope=true`) |

---

### `useDialogs()`

Returns dialog helper functions.

```tsx
const { alert, confirm, question, prompt } = useDialogs();

// Alert
await alert("Hello!");
await alert("Success!", { kind: 'success' });

// Confirm
const ok = await confirm("Delete?");
if (ok) { /* delete logic */ }

// Question (Yes/No)
const yes = await question("Continue?");

// Prompt
const name = await prompt("Your name?");
const email = await prompt("Your email?", "", { 
  inputType: 'email',
  required: true 
});
```

**Return Type:**

```typescript
{
  alert: (message: string, options?) => Promise<void>;
  confirm: (message: string, options?) => Promise<boolean>;
  question: (message: string, options?) => Promise<boolean>;
  prompt: (message: string, defaultValue?: string, options?) => Promise<string | null>;
}
```

---

### `useToast()`

Returns a stable toast function for showing notifications.

```tsx
const toast = useToast();

toast({ message: "Saved!" });
toast({ kind: 'success', message: "Operation complete!" });
toast({ 
  kind: 'error', 
  message: "Failed to save",
  timeoutMs: 5000 
});
```

**Parameters:**

```typescript
{
  message: string;
  kind?: 'info' | 'success' | 'warning' | 'error';
  timeoutMs?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  dismissible?: boolean;
  actions?: Array<{ text: string; onClick?: () => void }>;
}
```

---

### `useModal()`

Returns a function to open custom modals with full control (header, footer, buttons).

```tsx
const openModal = useModal();

const handleCustomModal = () => {
  const inst = openModal({
    title: "Custom Modal",
    content: "This is a custom modal with actions.",
    buttons: [
      { 
        text: "Save", 
        variant: "primary",
        onClick: () => console.log("Saved!")
      },
      { text: "Cancel", variant: "secondary" }
    ]
  });
  
  // Can update or close later
  // inst.update({ title: "Updated Title" });
  // inst.close();
};
```

---

### `useBareModal()`

Returns stable callbacks for mounting custom content in a minimal modal wrapper (no header/footer).

```tsx
const { bare, mount } = useBareModal();

const handleMountCustom = () => {
  const customElement = document.createElement('div');
  customElement.innerHTML = '<h1>Custom Content</h1><p>No header or footer!</p>';
  
  // Both work identically (mount is an alias for bare)
  const inst1 = bare({ content: customElement, closeOnEsc: true });
  const inst2 = mount({ content: customElement, closeOnEsc: true });
  
  // Later: inst1.close();
};

// Or mount React components
const MyCustomContent = () => <div>Custom React content!</div>;

const handleMountReact = () => {
  const container = document.createElement('div');
  ReactDOM.createRoot(container).render(<MyCustomContent />);
  
  mount({ content: container, closeOnEsc: true });
};
```

---

### `usePrompt()`

Returns the full PromptJS API (low-level access).

```tsx
const { config, Modal, toast, i18n, version } = usePrompt();

// Change config
React.useEffect(() => {
  config.update({ 
    animation: { enable: true, durationMs: 200 } 
  });
}, []);

// Access Modal class directly
const inst = Modal.open({ title: "Hello", content: "World" });
```

---

## Examples

### Example 1: Delete Confirmation

```tsx
import { useDialogs, useToast } from '@tlabsinc/promptjs-react';

function ItemCard({ item, onDelete }) {
  const { confirm } = useDialogs();
  const toast = useToast();
  
  const handleDelete = async () => {
    const ok = await confirm(
      `Delete "${item.name}"?`,
      {
        title: "Confirm Deletion",
        kind: "warning",
        yesText: "Delete",
        noText: "Cancel"
      }
    );
    
    if (ok) {
      await onDelete(item.id);
      toast({ 
        kind: 'success', 
        message: `Deleted ${item.name}` 
      });
    }
  };
  
  return (
    <div>
      <h3>{item.name}</h3>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

### Example 2: Multi-Step Registration Form

```tsx
import { useDialogs, useToast } from '@tlabsinc/promptjs-react';

function RegistrationButton() {
  const { prompt, confirm } = useDialogs();
  const toast = useToast();
  
  const handleRegister = async () => {
    try {
      // Step 1: Username
      const username = await prompt(
        "Choose a username:",
        "",
        {
          title: "Step 1/3: Username",
          required: true,
          validator: (value) => {
            if (value.length < 3) return "Must be at least 3 characters";
            if (!/^[a-zA-Z0-9_]+$/.test(value)) {
              return "Only letters, numbers, and underscore";
            }
            return true;
          }
        }
      );
      if (!username) return; // User cancelled
      
      // Step 2: Email
      const email = await prompt(
        "Enter your email:",
        "",
        {
          title: "Step 2/3: Email",
          inputType: "email",
          required: true
        }
      );
      if (!email) return;
      
      // Step 3: Password
      const password = await prompt(
        "Create a password:",
        "",
        {
          title: "Step 3/3: Password",
          inputType: "password",
          required: true,
          validator: (value) => {
            if (value.length < 8) return "Must be at least 8 characters";
            if (!/[A-Z]/.test(value)) return "Must contain uppercase";
            if (!/[0-9]/.test(value)) return "Must contain number";
            return true;
          }
        }
      );
      if (!password) return;
      
      // Confirm
      const ok = await confirm(
        `Register with:\n• Username: ${username}\n• Email: ${email}\n\nProceed?`
      );
      
      if (ok) {
        // Register user
        await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        
        toast({ 
          kind: 'success', 
          message: 'Account created successfully!' 
        });
      }
    } catch (error) {
      toast({ 
        kind: 'error', 
        message: 'Registration failed. Please try again.' 
      });
    }
  };
  
  return <button onClick={handleRegister}>Register</button>;
}
```

### Example 3: Scoped Modal (Inside a Panel)

```tsx
import { PromptProvider, useModal, useToast } from '@tlabsinc/promptjs-react';

function AdminPanel() {
  return (
    <PromptProvider scope={true} zIndexBase={10}>
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '20px', 
        borderRadius: '8px' 
      }}>
        <h2>Admin Panel</h2>
        <p>Modals appear inside this panel</p>
        <PanelButtons />
      </div>
    </PromptProvider>
  );
}

function PanelButtons() {
  const openModal = useModal();
  const toast = useToast();
  
  return (
    <>
      <button onClick={() => openModal({ 
        title: "Local Modal", 
        content: "This appears inside the panel" 
      })}>
        Open Modal
      </button>
      
      <button onClick={() => toast({ 
        message: "Local toast inside panel" 
      })}>
        Show Toast
      </button>
    </>
  );
}
```

### Example 4: Theme Switcher

```tsx
import { PromptProvider, usePrompt } from '@tlabsinc/promptjs-react';

function App() {
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'auto'>('auto');
  
  return (
    <PromptProvider theme={theme}>
      <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
      <YourApp />
    </PromptProvider>
  );
}

function ThemeSwitcher({ theme, onThemeChange }) {
  return (
    <div>
      <button onClick={() => onThemeChange('light')}>Light</button>
      <button onClick={() => onThemeChange('dark')}>Dark</button>
      <button onClick={() => onThemeChange('auto')}>Auto</button>
      <span>Current: {theme}</span>
    </div>
  );
}
```

### Example 5: Custom Modal with Form

```tsx
import { useModal, useToast } from '@tlabsinc/promptjs-react';

function CreateUserButton() {
  const openModal = useModal();
  const toast = useToast();
  
  const handleCreate = () => {
    const form = document.createElement('form');
    form.innerHTML = `
      <label style="display:block;margin:12px 0">
        Name: 
        <input id="name" required style="width:100%;margin-top:8px;" />
      </label>
      <label style="display:block;margin:12px 0">
        Email: 
        <input id="email" type="email" required style="width:100%;margin-top:8px;" />
      </label>
    `;
    
    const inst = openModal({
      title: "Create User",
      content: form,
      buttons: [
        { text: "Cancel", variant: "neutral" },
        {
          text: "Create",
          variant: "primary",
          closeOnClick: false,
          onClick: async () => {
            const name = (form.querySelector('#name') as HTMLInputElement).value;
            const email = (form.querySelector('#email') as HTMLInputElement).value;
            
            if (!name || !email) {
              toast({ kind: 'error', message: 'All fields required' });
              return;
            }
            
            // Submit to API
            await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email })
            });
            
            toast({ kind: 'success', message: `User ${name} created!` });
            inst.close();
          }
        }
      ]
    });
  };
  
  return <button onClick={handleCreate}>Create User</button>;
}
```

---

## TypeScript Support

Full TypeScript support with type inference:

```tsx
import type { PromptProviderProps, PromptContextValue } from '@tlabsinc/promptjs-react';

// All hooks return properly typed values
const dialogs = useDialogs(); // { alert, confirm, question, prompt }
const toast = useToast();     // (options: ToastOptions) => void
const openModal = useModal(); // (options: ModalOptions) => ModalInstance
```

---

## SSR / Next.js

The package is SSR-safe. Use dynamic imports if needed:

```tsx
// Next.js App Router
'use client';

import { PromptProvider, useDialogs } from '@tlabsinc/promptjs-react';
import '@tlabsinc/promptjs-core/dist/promptjs.css';

export default function MyApp() {
  return (
    <PromptProvider theme="auto">
      <YourApp />
    </PromptProvider>
  );
}
```

```tsx
// Next.js Pages Router
import dynamic from 'next/dynamic';

const PromptProvider = dynamic(
  () => import('@tlabsinc/promptjs-react').then(mod => mod.PromptProvider),
  { ssr: false }
);

export default function App({ Component, pageProps }) {
  return (
    <PromptProvider theme="auto">
      <Component {...pageProps} />
    </PromptProvider>
  );
}
```

---

## Advanced Usage

### Access Raw Config

```tsx
import { usePrompt } from '@tlabsinc/promptjs-react';

function ConfigManager() {
  const { config } = usePrompt();
  
  React.useEffect(() => {
    config.update({
      animation: { enable: true, durationMs: 150 },
      zIndexBase: 3000,
      i18n: { locale: 'en', ok: 'OK', cancel: 'Cancel' }
    });
  }, [config]);
  
  return null;
}
```

### Internationalization

```tsx
import { usePrompt } from '@tlabsinc/promptjs-react';

function LanguageSwitcher() {
  const { i18n } = usePrompt();
  
  const switchToSpanish = () => {
    i18n.use('es', {
      locale: 'es',
      ok: 'Aceptar',
      cancel: 'Cancelar',
      yes: 'Sí',
      no: 'No',
      titles: {
        info: 'Información',
        success: 'Éxito',
        warning: 'Advertencia',
        error: 'Error'
      }
    });
  };
  
  return <button onClick={switchToSpanish}>Español</button>;
}
```

---

## Comparison: With vs Without Provider

### Without Provider (Simpler)
```tsx
// Works out of the box, no setup needed
function Component() {
  const { alert } = useDialogs();
  return <button onClick={() => alert("Hello!")}>Click</button>;
}
```

### With Provider (More Control)
```tsx
// Better theme sync, scoped portals, cleaner unmount
<PromptProvider theme="dark" scope={true}>
  <Component />
</PromptProvider>
```

**Use Provider when:**
- ✅ You want theme sync with React state
- ✅ You need scoped modals (inside a specific component)
- ✅ You want automatic cleanup on unmount

**Skip Provider when:**
- ✅ You want simplicity (just import and use)
- ✅ You're using global modals/toasts
- ✅ You manage config manually

---

## Bundle Size

- **@tlabsinc/promptjs-react**: ~2KB (minified + gzipped)
- **@tlabsinc/promptjs-core**: ~5KB (minified + gzipped)
- **Total**: ~7KB (for full functionality!)

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+

---

## License

MIT © TLabs

---

## Links

- **Core Package**: [@tlabsinc/promptjs-core](https://www.npmjs.com/package/@tlabsinc/promptjs-core)
- **Documentation**: [Full Docs](../../doc/)
- **GitHub**: [github.com/tlabsinc/promptjs](https://github.com/tlabsinc/promptjs)
- **Quick Start**: [Quick Start Guide](../../PROMPTJS%20QUICK-START.md)

---

## Contributing

Contributions welcome! Please open an issue or PR on GitHub.

---

**Made with ❤️ by TLabs**
