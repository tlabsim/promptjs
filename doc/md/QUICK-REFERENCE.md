# PromptJS Quick Reference Card

## 🚀 Installation

```bash
npm i @tlabsinc/promptjs-core
# or
npm i @tlabsinc/promptjs-react
```

## 📥 Import

```javascript
// ES Modules
import { alert, confirm, prompt, Modal, toast } from '@tlabsinc/promptjs-core';
import '@tlabsinc/promptjs-core/dist/promptjs.css';

// CDN (UMD)
<script src="https://unpkg.com/@tlabsinc/promptjs-core/dist/index.global.js"></script>
// Access via: PromptJS.alert(), PromptJS.prompt(), etc.

//Local dist
<script src="https://unpkg.com/@tlabsinc/promptjs-core/dist/index.global.js"></script>
```

---

## 🎯 Native API Replacements

### Alert
```javascript
await alert("Operation complete!");
await alert("Success!", { title: "Done" });
```

### Confirm
```javascript
const ok = await confirm("Delete this?");
if (ok) { /* user clicked Yes */ }

const ok = await confirm("Sure?", { 
  yesText: "Delete", 
  noText: "Keep",
  includeCancel: true 
});
```

### Prompt ⭐ NEW
```javascript
// Basic
const name = await prompt("Your name?", "Guest");
if (name !== null) { /* user submitted */ }

// With validation
const email = await prompt("Email:", "", {
  inputType: "email",
  required: true,
  placeholder: "user@example.com"
});

// Custom validator
const username = await prompt("Username:", "", {
  validator: (v) => {
    if (v.length < 3) return "Too short";
    return true;
  }
});

// Password
const pwd = await prompt("Password:", "", {
  inputType: "password",
  required: true
});
```

---

## 🎨 Advanced Dialogs

### Question (custom buttons)
```javascript
const { id } = await question({
  message: "Choose an option:",
  buttons: [
    { id: "save", text: "Save", variant: "primary" },
    { id: "discard", text: "Discard", variant: "danger" },
    { id: "cancel", text: "Cancel", variant: "neutral" }
  ]
});

if (id === "save") { /* ... */ }
```

### Modal (full control)
```javascript
const modal = Modal.open({
  title: "Settings",
  content: "Your content here",
  buttons: [
    { id: "ok", text: "OK", variant: "primary", onClick: () => save() }
  ],
  draggable: true,
  size: "lg"
});

// Later...
modal.update({ content: "New content" });
modal.close();
```

---

## 📢 Toast Notifications

```javascript
// Simple
toast({ message: "Saved!" });

// With options
toast({
  kind: "success",           // info | success | warning | error
  message: "Upload complete!",
  title: "Success",
  position: "top-right",     // 6 positions available
  timeoutMs: 5000,           // 0 = sticky
  dismissible: true
});

// With actions
toast({
  message: "File deleted",
  actions: [
    { id: "undo", text: "Undo", onClick: () => restore() }
  ]
});
```

---

## ⚙️ Configuration

```javascript
import { config } from '@tlabsinc/promptjs-core';

config.update({
  theme: "dark",              // light | dark | auto
  animation: { 
    enable: true, 
    durationMs: 200 
  },
  i18n: {
    ok: "Okay",
    cancel: "Nope",
    // ... more strings
  }
});
```

---

## ⚛️ React Usage

```jsx
import { PromptProvider, usePrompt } from '@tlabsinc/promptjs-react';

function App() {
  return (
    <PromptProvider theme="auto">
      <MyComponent />
    </PromptProvider>
  );
}

function MyComponent() {
  const { alert, confirm, prompt, Modal, toast } = usePrompt();
  
  const handleClick = async () => {
    const name = await prompt("Name?");
    if (name) {
      await alert(`Hello, ${name}!`);
      toast({ message: "Done!" });
    }
  };
  
  return <button onClick={handleClick}>Greet</button>;
}
```

---

## 🎨 Input Types

```javascript
// Text (default)
await prompt("Name:", "", { inputType: "text" });

// Password (hidden)
await prompt("Password:", "", { inputType: "password" });

// Email (with validation)
await prompt("Email:", "", { inputType: "email" });

// Number
await prompt("Age:", "", { inputType: "number" });

// Tel
await prompt("Phone:", "", { inputType: "tel" });

// URL
await prompt("Website:", "", { inputType: "url" });
```

---

## ✅ Validation Options

```javascript
await prompt("Username:", "", {
  // Required field
  required: true,
  
  // Regex pattern
  pattern: "^[a-z0-9_]+$",
  
  // Max length
  maxLength: 20,
  
  // Custom validator
  validator: (value) => {
    if (value.length < 3) return "Too short!";
    if (value === "admin") return "Reserved!";
    return true;  // valid
  },
  
  // Placeholder
  placeholder: "lowercase_only"
});
```

---

## 🎯 Return Values

```typescript
alert()     → Promise<void>
confirm()   → Promise<boolean>
prompt()    → Promise<string | null>
question()  → Promise<{ id: string }>
Modal.open() → ModalInstance
toast()     → { dismiss: () => void }
```

---

## 🎨 Modal Sizes

```javascript
Modal.open({ size: "sm" });  // Small
Modal.open({ size: "md" });  // Medium (default)
Modal.open({ size: "lg" });  // Large

// Custom size
Modal.open({ size: { w: "600px", h: "400px" } });
```

---

## 📍 Toast Positions

```javascript
position: "top-left"      position: "top-center"      position: "top-right"
position: "bottom-left"   position: "bottom-center"   position: "bottom-right"
```

---

## 🎭 Toast Behaviors

```javascript
behavior: "stack"    // Show multiple toasts
behavior: "queue"    // Wait for previous to finish
behavior: "replace"  // Replace existing toast
```

---

## 🎨 Button Variants

```javascript
buttons: [
  { id: "save", text: "Save", variant: "primary" },    // Blue
  { id: "cancel", text: "Cancel", variant: "neutral" }, // Gray
  { id: "delete", text: "Delete", variant: "danger" },  // Red
  { id: "info", text: "Info", variant: "ghost" }        // Transparent
]
```

---

## 🔧 Common Patterns

### Confirmation Before Delete
```javascript
if (await confirm("Delete this item?")) {
  await deleteItem();
  toast({ kind: "success", message: "Deleted!" });
}
```

### Form Input with Validation
```javascript
const email = await prompt("Enter email:", "", {
  inputType: "email",
  required: true,
  validator: (v) => v.includes("@") || "Invalid email"
});
if (email) {
  await saveEmail(email);
}
```

### Multi-Step Dialog
```javascript
const name = await prompt("Name?");
if (!name) return;

const email = await prompt("Email?", "", { inputType: "email" });
if (!email) return;

if (await confirm(`Register as ${name}?`)) {
  await register(name, email);
  await alert("Registration complete!");
}
```

---

## 🧪 Testing

```javascript
// Mock in tests
jest.mock('@tlabsinc/promptjs-core', () => ({
  alert: jest.fn().mockResolvedValue(undefined),
  confirm: jest.fn().mockResolvedValue(true),
  prompt: jest.fn().mockResolvedValue("test input"),
}));
```

---

## 📚 Links

- **Docs**: [README.md](../README.md)
- **Migration Guide**: [MIGRATION-NATIVE-APIS.md](./MIGRATION-NATIVE-APIS.md)
- **Architecture**: [API-ARCHITECTURE.md](./API-ARCHITECTURE.md)
- **GitHub**: https://github.com/tlabsim/promptjs
- **NPM**: https://www.npmjs.com/package/@tlabsinc/promptjs-core

---

## 💡 Tips

1. **Always use `await`** with dialog functions (alert, confirm, prompt, question)
2. **Check for `null`** with prompt() - it means user cancelled
3. **Use validation** to prevent invalid input in prompt()
4. **Theme automatically** detects system preference with `theme: "auto"`
5. **Animations respect** `prefers-reduced-motion` automatically
6. **Modals are accessible** with focus traps and keyboard navigation

---

**Version**: 0.1.0  
**Author**: TLABS Inc.  
**License**: MIT
