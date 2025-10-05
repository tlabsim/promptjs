# PromptJS - Quick Start Guide

> **Modern, accessible, and themeable dialogs for the web**  
> Drop-in replacement for `alert()`, `confirm()`, and `prompt()` with a beautiful UI

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

## 🚀 Basic Usage

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

## 🎨 Enhanced Features

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

## 🎯 Real-World Examples

### Example 1: Delete Confirmation

```javascript
async function deleteItem(id) {
  const confirmed = await PromptJS.confirm(
    "Are you sure you want to delete this item?",
    {
      title: "Confirm Deletion",
      kind: "warning",
      okText: "Delete",
      cancelText: "Cancel"
    }
  );
  
  if (confirmed) {
    // Perform deletion
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    
    // Show success
    await PromptJS.alert("Item deleted successfully", { kind: 'success' });
  }
}
```

### Example 2: User Registration Flow

```javascript
async function registerUser() {
  // Step 1: Username
  const username = await PromptJS.prompt(
    "Choose a username:",
    "",
    {
      title: "Step 1/3: Username",
      required: true,
      pattern: "^[a-zA-Z0-9_]{3,20}$",
      validator: (value) => {
        if (value.length < 3) return "Must be at least 3 characters";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Only letters, numbers, and underscore";
        return true;
      }
    }
  );
  if (!username) return; // User cancelled
  
  // Step 2: Email
  const email = await PromptJS.prompt(
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
  const password = await PromptJS.prompt(
    "Create a password:",
    "",
    {
      title: "Step 3/3: Password",
      inputType: "password",
      required: true,
      validator: (value) => {
        if (value.length < 8) return "Must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Must contain uppercase letter";
        if (!/[0-9]/.test(value)) return "Must contain number";
        return true;
      }
    }
  );
  if (!password) return;
  
  // Confirm
  const confirmed = await PromptJS.confirm(
    `Register with:\n• Username: ${username}\n• Email: ${email}\n\nProceed?`
  );
  
  if (confirmed) {
    // Register user
    await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    await PromptJS.alert("Welcome! Account created successfully.", { kind: 'success' });
  }
}
```

### Example 3: Form with Validation

```javascript
async function collectUserInfo() {
  try {
    const name = await PromptJS.prompt("What's your name?", "", {
      required: true,
      minLength: 2
    });
    
    const age = await PromptJS.prompt("What's your age?", "", {
      inputType: "number",
      validator: (val) => parseInt(val) >= 0 ? true : "Invalid age"
    });
    
    const email = await PromptJS.prompt("Your email?", "", {
      inputType: "email",
      required: true
    });
    
    // All inputs collected successfully
    console.log({ name, age, email });
    
  } catch (error) {
    // User cancelled at some step
    await PromptJS.alert("Registration cancelled", { kind: 'info' });
  }
}
```

---

## ⚙️ Configuration

### Global Configuration

Configure PromptJS once for your entire application:

```javascript
// After loading PromptJS
PromptJS.config.update({
  // Theme: 'light', 'dark', or 'auto' (follows system)
  theme: 'auto',
  
  // Animation settings
  animation: {
    enable: true,
    durationMs: 200,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
  },
  
  // Internationalization
  i18n: {
    locale: 'en',
    ok: 'OK',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No'
  },
  
  // Z-index for modals
  zIndexBase: 2000
});
```

### Laravel Integration

**Method 1: Blade Component** (Recommended)

Create `resources/views/components/promptjs.blade.php`:

```blade
@once
<link rel="stylesheet" href="{{ asset('css/promptjs.css') }}">
<script src="{{ asset('js/prompt.js') }}"></script>
<script>
  if (window.PromptJS) {
    PromptJS.config.update({
      theme: 'auto',
      i18n: {
        locale: '{{ app()->getLocale() }}',
        ok: '{{ __('OK') }}',
        cancel: '{{ __('Cancel') }}'
      }
    });
    window.PJ = PromptJS; // Shorthand
  }
</script>
@endonce
```

Use in any view:

```blade
@extends('layouts.app')

@section('content')
  <x-promptjs />
  
  <button onclick="handleClick()">Click Me</button>
  
  <script>
    async function handleClick() {
      await PJ.alert("Hello from Laravel!");
    }
  </script>
@endsection
```

**Method 2: Layout Template**

Add to `resources/views/layouts/app.blade.php`:

```blade
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="{{ asset('css/promptjs.css') }}">
  <script src="{{ asset('js/prompt.js') }}"></script>
  <script>
    window.PJ = window.PromptJS; // Shorthand
    PJ.config.update({
      theme: 'auto',
      i18n: { locale: '{{ app()->getLocale() }}' }
    });
  </script>
</head>
<body>
  @yield('content')
</body>
</html>
```

---

## 🎨 Theming

### Automatic Theme Detection

```javascript
// Follows system preference (light/dark)
PromptJS.config.update({ theme: 'auto' });
```

### Manual Theme

```javascript
// Force light theme
PromptJS.config.update({ theme: 'light' });

// Force dark theme
PromptJS.config.update({ theme: 'dark' });
```

### Custom CSS Variables

Override CSS variables in your stylesheet:

```css
:root {
  --pj-primary: #3b82f6;      /* Primary color */
  --pj-success: #10b981;      /* Success color */
  --pj-warning: #f59e0b;      /* Warning color */
  --pj-error: #ef4444;        /* Error color */
  --pj-radius: 8px;           /* Border radius */
  --pj-font-family: 'Inter', sans-serif; /* Font */
}
```

---

## 📱 Advanced Usage

### Toast Notifications

```javascript
// Simple toast
PromptJS.toast({ message: "Saved!" });

// With type
PromptJS.toast({ 
  message: "Operation successful!", 
  kind: 'success' 
});

// With duration
PromptJS.toast({ 
  message: "This will disappear in 2 seconds", 
  timeoutMs: 2000 
});

// Different positions
PromptJS.toast({ 
  message: "Bottom right", 
  position: 'bottom-right' 
});
```

### Custom Modal

```javascript
const modal = new PromptJS.Modal({
  title: "Custom Dialog",
  content: "This is a custom modal with HTML content",
  buttons: [
    { 
      label: "Action", 
      onClick: () => console.log("Action clicked") 
    },
    { 
      label: "Close", 
      variant: "secondary" 
    }
  ]
});

modal.open();
```

### Question Dialog (Yes/No)

```javascript
const answer = await PromptJS.question("Do you want to continue?");
if (answer) {
  console.log("User clicked Yes");
} else {
  console.log("User clicked No");
}
```

---

## 🧪 Recipes (Copy & Paste Ready)

Practical snippets you can use as-is in your projects.

### Recipe 1: Form in Modal with Async Validation

Create a modal with a real DOM form, prevent closing on validation failure, and simulate an async API call.

```javascript
// Create a real DOM form to bypass string sanitization
const form = document.createElement("form");
form.innerHTML = `
  <label style="display:block;margin:6px 0">
    Name: <input id="name" required style="width:100%; margin-top:8px;" />
  </label>
  <small>Required. Press "Save" to simulate an async API call.</small>`;

const inst = PromptJS.Modal.open({
  title: "Create user",
  content: form,
  buttons: [
    { id: "cancel", text: "Cancel", variant: "neutral" },
    {
      id: "save",
      text: "Save",
      variant: "primary",
      closeOnClick: false, // stay open until we decide to close
      onClick: async () => {
        const input = form.querySelector("#name");
        const name = input.value.trim();
        if (!name) { input.focus(); return; } // do NOT close
        
        // Simulate network call
        await new Promise((r) => setTimeout(r, 800));
        
        PromptJS.toast({ 
          kind: "success", 
          message: `User <b>${name}</b> created.` 
        });
        inst.close("save"); // close on success
      },
    },
  ],
  closeOnBackdrop: false,
});
```

### Recipe 2: Multi-Step Wizard

Use `inst.update()` to change modal content and buttons dynamically.

```javascript
let step = 1;

const inst = PromptJS.Modal.open({
  title: "Step 1 / 2",
  content: "Choose where to go next.",
  buttons: [
    { 
      id: "back", 
      text: "Back", 
      variant: "ghost", 
      closeOnClick: false 
    },
    {
      id: "next",
      text: "Next",
      variant: "primary",
      closeOnClick: false,
      onClick: () => {
        step = 2;
        inst.update({
          title: "Step 2 / 2",
          content: "All set. Continue?",
          buttons: [
            {
              id: "back",
              text: "Back",
              variant: "ghost",
              closeOnClick: false,
              onClick: () => {
                step = 1;
                inst.update({
                  title: "Step 1 / 2",
                  content: "Choose where to go next.",
                  buttons: [
                    { id: "back", text: "Back", variant: "ghost", closeOnClick: false },
                    { 
                      id: "next", 
                      text: "Next", 
                      variant: "primary", 
                      closeOnClick: false, 
                      onClick: () => {
                        step = 2;
                        inst.update({
                          title: "Step 2 / 2",
                          content: "All set. Continue?",
                          buttons: [
                            { id: "back", text: "Back", variant: "ghost", closeOnClick: false },
                            { id: "finish", text: "Finish", variant: "primary" }
                          ]
                        });
                      } 
                    },
                  ],
                });
              },
            },
            { id: "finish", text: "Finish", variant: "primary" },
          ],
        });
      },
    },
  ],
});
```

### Recipe 3: Status Toast (Replace Behavior)

Show sequential status updates in the same toast position using replace behavior.

```javascript
// Save previous config
const prev = PromptJS.config.get().toast;

// Use replace behavior
PromptJS.config.update({ 
  toast: { 
    behavior: "replace", 
    defaultPosition: "bottom-center" 
  }
});

// Show sequential status updates
PromptJS.toast({ kind: "info", message: "Connecting…" });

setTimeout(() => {
  PromptJS.toast({ kind: "warning", message: "Still trying…" });
}, 900);

setTimeout(() => {
  PromptJS.toast({ kind: "success", message: "Connected." });
  
  // Restore config after completion
  setTimeout(() => {
    PromptJS.config.update({ 
      toast: { 
        behavior: prev.behavior, 
        defaultPosition: prev.defaultPosition 
      } 
    });
  }, 800);
}, 1800);
```

### Recipe 4: Retryable Error Toast

Show an error toast with action buttons for retry functionality.

```javascript
PromptJS.toast({
  kind: "error",
  message: "Failed to save.",
  actions: [
    { 
      text: "Retry", 
      onClick: () => {
        PromptJS.toast({ 
          kind: "info", 
          message: "Retrying…", 
          timeoutMs: 1200 
        });
        
        setTimeout(() => {
          PromptJS.toast({ 
            kind: "success", 
            message: "Saved on retry." 
          });
        }, 1200);
      } 
    },
    { text: "Dismiss" }
  ],
  timeoutMs: 0,        // Never auto-dismiss
  dismissible: true    // Show close button
});
```

### Recipe 5: Undo Pattern (Sticky Toast)

Implement an undo action with a persistent toast.

```javascript
PromptJS.toast({
  kind: "success",
  message: "<b>Item archived</b>.",
  actions: [
    { 
      text: "Undo", 
      onClick: () => {
        PromptJS.toast({ 
          kind: "info", 
          message: "Restored." 
        });
        // Perform undo logic here
      } 
    },
    { text: "Close" }
  ],
  timeoutMs: 0,        // Never auto-dismiss
  dismissible: false   // No close button (force action choice)
});
```

### Recipe 6: Destructive Confirm

Show a confirmation dialog for destructive actions with custom labels.

```javascript
const ok = await PromptJS.confirm("Delete this repository?", {
  title: "Delete repository",
  yesText: "Delete",
  noText: "Keep",
  includeCancel: true  // Add a third "Cancel" button
});

if (ok) {
  PromptJS.toast({ 
    kind: "success", 
    message: "Repository deleted." 
  });
} else {
  PromptJS.toast({ 
    kind: "info", 
    message: "Kept as-is.", 
    timeoutMs: 1500 
  });
}
```

### Recipe 7: Custom Container (Scoped Modals)

Mount modals/toasts inside a specific panel instead of full-screen.

```javascript
// Create a host panel
const host = document.createElement("div");
host.style.cssText = "position:relative;min-height:160px;border:1px dashed #3a4253;padding:12px;border-radius:10px";
host.innerHTML = "<b>Local mount:</b> modals/toasts appear within this box.";
document.body.appendChild(host);

// Save current config
const prevContainer = PromptJS.config.get().container;
const prevZ = PromptJS.config.get().zIndexBase;

// Point PromptJS at the panel
PromptJS.config.update({ 
  container: host, 
  zIndexBase: 10,
  toast: { zBoost: 20 }
});

// Open a modal inside the panel
PromptJS.Modal.open({ 
  title: "Local modal", 
  content: "I render inside the panel." 
});

// Clean up / revert after a moment
setTimeout(() => {
  PromptJS.config.update({ 
    container: prevContainer || null, 
    zIndexBase: prevZ || 2000 
  });
  host.remove();
}, 3500);
```

### Recipe 8: One-Click Locale Switch

Dynamically switch the UI language at runtime.

```javascript
const prevLocale = PromptJS.config.get().i18n.locale;

// Register German translations
PromptJS.i18n.use("de", {
  locale: "de",
  dir: "auto",
  ok: "OK", 
  cancel: "Abbrechen", 
  yes: "Ja", 
  no: "Nein",
  close: "Schließen", 
  dismiss: "Schließen",
  titles: { 
    info: "Information", 
    success: "Erfolg", 
    warning: "Warnung", 
    error: "Fehler", 
    question: "Frage" 
  }
});

// Show alert in German
await PromptJS.alert("Sprache gewechselt.", { title: "Hinweis" });

// Restore previous locale
if (prevLocale && prevLocale !== "de") {
  PromptJS.i18n.set(prevLocale);
} else {
  PromptJS.i18n.set("en");
}
```

---

## 🌐 Internationalization

### Change Language

```javascript
PromptJS.config.update({
  i18n: {
    locale: 'es',
    ok: 'Aceptar',
    cancel: 'Cancelar',
    yes: 'Sí',
    no: 'No',
    close: 'Cerrar',
    dismiss: 'Descartar',
    titles: {
      info: 'Información',
      success: 'Éxito',
      warning: 'Advertencia',
      error: 'Error',
      question: 'Pregunta'
    }
  }
});
```

### RTL Support

```javascript
PromptJS.config.update({
  i18n: {
    locale: 'ar',
    dir: 'rtl', // Right-to-left
    ok: 'حسناً',
    cancel: 'إلغاء'
  }
});
```

---

## 🔧 TypeScript Support

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

## 📚 API Reference

### `alert(message, options?)`

Show an informational alert.

```typescript
await PromptJS.alert("Hello World");
await PromptJS.alert("Success!", { kind: 'success' });
await PromptJS.alert("Warning", { kind: 'warning', title: 'Alert' });
```

**Parameters:**
- `message` (string): The message to display
- `options` (optional):
  - `title` (string): Dialog title
  - `kind` ('info' | 'success' | 'warning' | 'error'): Visual style
  - `okText` (string): OK button text

**Returns:** `Promise<void>`

---

### `confirm(message, options?)`

Show a confirmation dialog.

```typescript
const ok = await PromptJS.confirm("Delete?");
const ok = await PromptJS.confirm("Are you sure?", {
  title: "Confirm",
  okText: "Yes",
  cancelText: "No"
});
```

**Parameters:**
- `message` (string): The message to display
- `options` (optional):
  - `title` (string): Dialog title
  - `kind` ('info' | 'success' | 'warning' | 'error'): Visual style
  - `okText` (string): OK button text
  - `cancelText` (string): Cancel button text

**Returns:** `Promise<boolean>` - `true` if OK clicked, `false` if cancelled

---

### `prompt(message, defaultValue?, options?)`

Show a prompt dialog for user input.

```typescript
const name = await PromptJS.prompt("Your name?");
const email = await PromptJS.prompt("Email?", "", { inputType: 'email' });
const age = await PromptJS.prompt("Age?", "", {
  inputType: 'number',
  required: true,
  validator: (val) => parseInt(val) > 0 ? true : "Invalid"
});
```

**Parameters:**
- `message` (string): The prompt message
- `defaultValue` (string, optional): Default input value
- `options` (optional):
  - `title` (string): Dialog title
  - `inputType` ('text' | 'password' | 'email' | 'number' | 'tel' | 'url'): Input type
  - `required` (boolean): Make input required
  - `pattern` (string): Regex pattern for validation
  - `maxLength` (number): Maximum length
  - `minLength` (number): Minimum length
  - `validator` (function): Custom validation function
  - `okText` (string): OK button text
  - `cancelText` (string): Cancel button text

**Returns:** `Promise<string | null>` - Input value or `null` if cancelled

---

### `question(message, options?)`

Show a yes/no question dialog.

```typescript
const yes = await PromptJS.question("Continue?");
```

**Returns:** `Promise<boolean>` - `true` for Yes, `false` for No

---

### `toast(options)`

Show a temporary notification.

```typescript
PromptJS.toast({ message: "Saved!" });
PromptJS.toast({ 
  message: "Error occurred", 
  kind: 'error',
  timeoutMs: 3000 
});
```

**Parameters:**
- `message` (string): Toast message
- `kind` ('info' | 'success' | 'warning' | 'error', optional): Visual style
- `timeoutMs` (number, optional): Auto-dismiss duration (ms)
- `position` (string, optional): Toast position
- `dismissible` (boolean, optional): Show close button

---

## 🎓 Migration from Native APIs

### Replace Native `alert()`

```javascript
// Before
alert("Hello");

// After
await PromptJS.alert("Hello");
// or
await PJ.alert("Hello");
```

### Replace Native `confirm()`

```javascript
// Before
if (confirm("Delete?")) {
  deleteItem();
}

// After
if (await PromptJS.confirm("Delete?")) {
  deleteItem();
}
```

### Replace Native `prompt()`

```javascript
// Before
const name = prompt("Name?", "Guest");
if (name) {
  greet(name);
}

// After
const name = await PromptJS.prompt("Name?", "Guest");
if (name) {
  greet(name);
}
```

**Key Differences:**
- ✅ **Async/Await**: Use `await` (non-blocking)
- ✅ **Modern UI**: Beautiful, themed dialogs
- ✅ **Validation**: Built-in input validation
- ✅ **Accessible**: ARIA labels, keyboard navigation
- ✅ **Customizable**: Full control over appearance

---

## 🐛 Troubleshooting

### Dialogs Not Showing

1. **Check CSS is loaded:**
   ```html
   <link rel="stylesheet" href="/path/to/promptjs.css">
   ```

2. **Check JS is loaded:**
   ```html
   <script src="/path/to/prompt.js"></script>
   ```

3. **Check console for errors:**
   ```javascript
   console.log(window.PromptJS); // Should not be undefined
   ```

### Z-Index Issues

If dialogs appear behind other elements:

```javascript
PromptJS.config.update({
  zIndexBase: 9999 // Increase if needed
});
```

### Theme Not Working

Ensure you're setting theme before showing dialogs:

```javascript
// Set theme first
PromptJS.config.update({ theme: 'dark' });

// Then show dialog
await PromptJS.alert("Hello");
```

---

## 📦 Bundle Sizes

- **prompt.js**: ~15KB minified, ~5KB gzipped
- **promptjs.css**: ~8KB minified, ~2KB gzipped
- **Total**: ~7KB gzipped

Zero dependencies! 🎉

---

## 🔗 Resources

- **Documentation**: [Full API Docs](./doc/)
- **Examples**: [Demo Files](./packages/core/demo-*.html)
- **GitHub**: [github.com/tlabsinc/promptjs](https://github.com/tlabsinc/promptjs)
- **NPM**: [@tlabsinc/promptjs-core](https://www.npmjs.com/package/@tlabsinc/promptjs-core)

---

## 💡 Pro Tips

1. **Use Shorthand**: Assign `window.PJ = window.PromptJS` for shorter syntax
2. **Configure Once**: Set global config in your app initialization
3. **Async/Await**: Always use `await` for better control flow
4. **Validation**: Use built-in validators before custom ones
5. **Theming**: Use `auto` theme for automatic light/dark switching

---

## ✨ What's Next?

- [Advanced Modal Customization](./doc/ADVANCED-MODALS.md)
- [Custom Styling Guide](./doc/STYLING.md)
- [React Integration](./packages/react/README.md)
- [Accessibility Features](./doc/ACCESSIBILITY.md)

---

**Made with ❤️ by TLabs**  
Licensed under MIT
