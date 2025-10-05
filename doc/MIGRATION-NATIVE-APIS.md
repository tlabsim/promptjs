# Migrating from Native Browser APIs to PromptJS

PromptJS provides **drop-in async replacements** for native browser dialog APIs (`window.alert()`, `window.confirm()`, `window.prompt()`). This guide shows you how to migrate your code.

---

## Why Replace Native APIs?

Native browser dialogs have several limitations:

❌ **Blocking** - Freezes the entire browser tab  
❌ **Ugly** - Can't be styled, looks different across browsers  
❌ **Limited** - No validation, no customization  
❌ **Poor UX** - Interrupts user flow, can't be dismissed easily  
❌ **Not testable** - Hard to test in automated tests  

**PromptJS advantages:**

✅ **Non-blocking** - Async/await, doesn't freeze UI  
✅ **Beautiful** - Fully styled, consistent across browsers  
✅ **Powerful** - Validation, input types, customization  
✅ **Better UX** - Smooth animations, keyboard shortcuts  
✅ **Testable** - Easy to mock and test  

---

## Migration Examples

### 1. Alert

**Native (blocking):**
```javascript
window.alert("Operation complete!");
console.log("This runs after user clicks OK");
```

**PromptJS (async):**
```javascript
await PromptJS.alert("Operation complete!");
console.log("This runs after user clicks OK");
```

**Or without await:**
```javascript
PromptJS.alert("Operation complete!").then(() => {
  console.log("This runs after user clicks OK");
});
```

---

### 2. Confirm

**Native (blocking):**
```javascript
const result = window.confirm("Delete this item?");
if (result) {
  deleteItem();
}
```

**PromptJS (async):**
```javascript
const result = await PromptJS.confirm("Delete this item?");
if (result) {
  deleteItem();
}
```

**Or inline:**
```javascript
if (await PromptJS.confirm("Delete this item?")) {
  deleteItem();
}
```

---

### 3. Prompt (Basic)

**Native (blocking):**
```javascript
const name = window.prompt("What's your name?", "Guest");
if (name !== null) {
  console.log(`Hello, ${name}!`);
} else {
  console.log("User cancelled");
}
```

**PromptJS (async):**
```javascript
const name = await PromptJS.prompt("What's your name?", "Guest");
if (name !== null) {
  console.log(`Hello, ${name}!`);
} else {
  console.log("User cancelled");
}
```

---

## Enhanced Features (Beyond Native APIs)

### Required Input

```javascript
const name = await PromptJS.prompt(
  "Enter your full name:",
  "",
  {
    required: true,
    placeholder: "John Doe"
  }
);
// Can't submit empty value
```

### Email Input with Validation

```javascript
const email = await PromptJS.prompt(
  "Enter your email:",
  "",
  {
    inputType: "email",
    required: true,
    pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    placeholder: "user@example.com"
  }
);
```

### Custom Validation

```javascript
const username = await PromptJS.prompt(
  "Choose a username:",
  "",
  {
    required: true,
    validator: (value) => {
      if (value.length < 3) return "Must be at least 3 characters";
      if (!/^[a-z0-9_]+$/.test(value)) return "Only lowercase, numbers, underscore";
      if (value === "admin") return "Reserved username";
      return true;
    }
  }
);
```

### Password Input

```javascript
const password = await PromptJS.prompt(
  "Enter password:",
  "",
  {
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
```

### Number Input

```javascript
const age = await PromptJS.prompt(
  "Enter your age:",
  "",
  {
    inputType: "number",
    required: true,
    validator: (value) => {
      const num = parseInt(value);
      if (isNaN(num)) return "Must be a number";
      if (num < 1 || num > 120) return "Must be between 1 and 120";
      return true;
    }
  }
);
```

---

## Quick Migration Script

To quickly find all native API calls in your codebase:

```bash
# Find alert calls
grep -r "window\.alert\|^alert(" src/

# Find confirm calls  
grep -r "window\.confirm\|^confirm(" src/

# Find prompt calls
grep -r "window\.prompt\|^prompt(" src/
```

---

## Simple Search & Replace

### Step 1: Import PromptJS

Add to your entry file:
```javascript
import { alert, confirm, prompt } from '@tlabsinc/promptjs-core';
import '@tlabsinc/promptjs-core/dist/promptjs.css';

// Optional: Make available globally
window.PJ = { alert, confirm, prompt };
```

### Step 2: Replace Calls

**Option A: Use namespaced calls**
```javascript
// Before
window.alert("Hello");
window.confirm("Sure?");
window.prompt("Name?");

// After
await PJ.alert("Hello");
await PJ.confirm("Sure?");
await PJ.prompt("Name?");
```

**Option B: Replace directly (add await)**
```javascript
// Before
alert("Hello");
if (confirm("Sure?")) { ... }
const name = prompt("Name?");

// After (just add await)
await alert("Hello");
if (await confirm("Sure?")) { ... }
const name = await prompt("Name?");
```

---

## Testing

Native browser APIs are hard to mock. PromptJS makes testing easy:

```javascript
// Jest/Vitest example
import { prompt } from '@tlabsinc/promptjs-core';

// Mock the prompt
jest.mock('@tlabsinc/promptjs-core', () => ({
  prompt: jest.fn()
}));

test('handles user input', async () => {
  prompt.mockResolvedValue('Test User');
  
  const result = await myFunction();
  
  expect(prompt).toHaveBeenCalledWith('Enter name:');
  expect(result).toBe('Test User');
});

test('handles cancellation', async () => {
  prompt.mockResolvedValue(null);
  
  const result = await myFunction();
  
  expect(result).toBeNull();
});
```

---

## Framework Integration

### React

```jsx
import { usePrompt } from '@tlabsinc/promptjs-react';

function MyComponent() {
  const { alert, confirm, prompt } = usePrompt();
  
  const handleClick = async () => {
    const name = await prompt("What's your name?");
    if (name) {
      await alert(`Hello, ${name}!`);
    }
  };
  
  return <button onClick={handleClick}>Greet</button>;
}
```

### Vue

```vue
<script setup>
import { alert, confirm, prompt } from '@tlabsinc/promptjs-core';

async function handleClick() {
  const name = await prompt("What's your name?");
  if (name) {
    await alert(`Hello, ${name}!`);
  }
}
</script>

<template>
  <button @click="handleClick">Greet</button>
</template>
```

### Laravel Blade

```html
<script src="/js/promptjs.js"></script>
<link rel="stylesheet" href="/css/promptjs.css">

<script>
async function deleteItem(id) {
  const confirmed = await PromptJS.confirm('Delete this item?');
  if (confirmed) {
    // Send delete request
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    await PromptJS.alert('Item deleted!');
    location.reload();
  }
}
</script>
```

---

## API Reference

### alert(message, options?)

```typescript
await alert(message: string, options?: {
  title?: string;
}): Promise<void>
```

### confirm(message, options?)

```typescript
await confirm(message: string, options?: {
  title?: string;
  yesText?: string;
  noText?: string;
  includeCancel?: boolean;
}): Promise<boolean>
```

### prompt(message, defaultValue?, options?)

```typescript
await prompt(
  message: string,
  defaultValue?: string,
  options?: {
    title?: string;
    inputType?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
    pattern?: string; // regex pattern
    validator?: (value: string) => boolean | string;
    okText?: string;
    cancelText?: string;
  }
): Promise<string | null>
```

**Returns:**
- String value if user submits
- `null` if user cancels (ESC or Cancel button)

---

## Compatibility Table

| Feature | Native | PromptJS |
|---------|--------|----------|
| Alert | ✅ `window.alert()` | ✅ `await alert()` |
| Confirm | ✅ `window.confirm()` | ✅ `await confirm()` |
| Prompt | ✅ `window.prompt()` | ✅ `await prompt()` |
| Returns | Synchronous | Promise (async/await) |
| Styling | ❌ Browser default | ✅ Fully customizable |
| Validation | ❌ None | ✅ Built-in + custom |
| Input Types | ❌ Text only | ✅ text, password, email, number, tel, url |
| Animations | ❌ None | ✅ Smooth transitions |
| Keyboard | ✅ Enter/ESC | ✅ Enter/ESC + tab navigation |
| Mobile | ❌ Poor UX | ✅ Touch-optimized |
| Testable | ❌ Hard to mock | ✅ Easy to mock |
| Non-blocking | ❌ Blocks UI | ✅ Async, doesn't block |

---

## FAQ

### Q: Do I need to use `await`?

**A:** Yes, if you need to wait for the result. But you can also use `.then()`:

```javascript
// With await (recommended)
const name = await prompt("Name?");
console.log(name);

// With .then()
prompt("Name?").then(name => {
  console.log(name);
});
```

### Q: What if I forget `await`?

**A:** Your code will continue immediately and you won't get the result:

```javascript
// ❌ Wrong - result is a Promise
const name = prompt("Name?");
console.log(name); // Promise { <pending> }

// ✅ Correct
const name = await prompt("Name?");
console.log(name); // "John"
```

### Q: Can I use this in non-async functions?

**A:** Yes, use `.then()`:

```javascript
function regularFunction() {
  prompt("Name?").then(name => {
    if (name) {
      console.log(name);
    }
  });
}
```

### Q: Does it work without bundlers?

**A:** Yes! Use the UMD build:

```html
<script src="https://unpkg.com/@tlabsinc/promptjs-core/dist/index.global.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@tlabsinc/promptjs-core/dist/promptjs.css">

<script>
async function test() {
  const name = await PromptJS.prompt("Name?");
  console.log(name);
}
</script>
```

---

## Need Help?

- 📖 [Full Documentation](../README.md)
- 💬 [GitHub Issues](https://github.com/tlabsim/promptjs/issues)
- 📧 Email: tlabs.im@gmail.com

---

**Happy migrating! 🚀**
