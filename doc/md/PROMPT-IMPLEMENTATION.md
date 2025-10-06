# PromptJS `prompt()` Implementation Summary

## ✅ Implementation Complete

The `prompt()` function has been successfully added to PromptJS as a **drop-in async replacement** for the native `window.prompt()` API.

---

## 📁 Files Modified

### Core Package (`packages/core/`)

1. **`src/types.ts`**
   - ✅ Added `PromptOptions` interface with validation options

2. **`src/dialogs.ts`**
   - ✅ Implemented `prompt()` function with full validation support
   - ✅ Features: required fields, input types, regex patterns, custom validators
   - ✅ Auto-focus input, Enter to submit, ESC to cancel

3. **`src/index.ts`**
   - ✅ Exported `prompt` function
   - ✅ Added to global `window.PromptJS` object
   - ✅ Exported type definitions

### React Package (`packages/react/`)

4. **`src/provider.tsx`**
   - ✅ Imported and added `prompt` to context
   - ✅ Updated `usePrompt()` hook

5. **`src/types.ts`**
   - ✅ Added `prompt` type to `PromptContextValue`

6. **`src/hooks.ts`**
   - ✅ Added `prompt` to `useDialogs()` hook

### Documentation

7. **`README.md`**
   - ✅ Added `prompt()` to API documentation
   - ✅ Updated examples with prompt usage

8. **`doc/MIGRATION-NATIVE-APIS.md`**
   - ✅ Created comprehensive migration guide
   - ✅ Examples for all three APIs (alert, confirm, prompt)
   - ✅ Testing strategies, framework integration

### Demo Files

9. **`packages/core/demo-prompt.html`**
   - ✅ Interactive demo with 6+ examples
   - ✅ Shows basic usage, validation, custom input types

10. **`packages/core/demo-native-api-comparison.html`**
    - ✅ Side-by-side comparison with native APIs
    - ✅ Real-world registration flow example

---

## 🎯 API Design

### Function Signature

```typescript
async function prompt(
  message: string,
  defaultValue?: string,
  options?: PromptOptions
): Promise<string | null>
```

### Options Interface

```typescript
interface PromptOptions {
  title?: string;                    // Dialog title
  kind?: NotifyKind;                 // Visual accent (info, success, etc.)
  okText?: string;                   // OK button text (default: "OK")
  cancelText?: string;               // Cancel button text (default: "Cancel")
  placeholder?: string;              // Input placeholder
  inputType?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  required?: boolean;                // Prevent empty submission
  maxLength?: number;                // Max character limit
  pattern?: string;                  // Regex validation pattern
  validator?: (value: string) => boolean | string;  // Custom validation
}
```

### Return Value

- **`string`** - User's input if submitted
- **`null`** - If cancelled (ESC, Cancel button, or backdrop click)

---

## ✨ Features

### 1. **Drop-in Replacement**
```javascript
// Native (blocking)
const name = window.prompt("What's your name?", "Guest");

// PromptJS (async, non-blocking)
const name = await PromptJS.prompt("What's your name?", "Guest");
```

### 2. **Input Types**
```javascript
// Email
await prompt("Email:", "", { inputType: "email" });

// Password
await prompt("Password:", "", { inputType: "password" });

// Number
await prompt("Age:", "", { inputType: "number" });
```

### 3. **Validation**

**Required Field:**
```javascript
await prompt("Name:", "", { required: true });
```

**Pattern Validation:**
```javascript
await prompt("Email:", "", {
  pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
});
```

**Custom Validator:**
```javascript
await prompt("Username:", "", {
  validator: (value) => {
    if (value.length < 3) return "Too short";
    if (!/^[a-z0-9_]+$/.test(value)) return "Invalid format";
    return true;
  }
});
```

### 4. **Enhanced UX**

- ✅ **Auto-focus** input on open
- ✅ **Auto-select** default value
- ✅ **Enter key** submits (with validation)
- ✅ **ESC key** cancels
- ✅ **Real-time validation** feedback
- ✅ **Visual error messages**
- ✅ **Smooth animations**
- ✅ **Focus styles** on input
- ✅ **Accessible** keyboard navigation

---

## 🔄 Comparison with Native API

| Feature | Native `prompt()` | PromptJS `prompt()` |
|---------|------------------|---------------------|
| **Blocking** | ❌ Yes (freezes UI) | ✅ No (async) |
| **Styling** | ❌ Can't customize | ✅ Fully styled |
| **Validation** | ❌ None | ✅ Built-in + custom |
| **Input Types** | ❌ Text only | ✅ 6 types |
| **Error Messages** | ❌ None | ✅ Real-time feedback |
| **Keyboard** | ✅ Enter/ESC | ✅ Enter/ESC + Tab |
| **Mobile** | ❌ Poor UX | ✅ Touch-optimized |
| **Testable** | ❌ Hard to mock | ✅ Easy to mock |
| **Animations** | ❌ None | ✅ Smooth transitions |
| **Accessibility** | ⚠️ Basic | ✅ WCAG compliant |

---

## 📦 Usage Examples

### Basic Usage

```javascript
const name = await prompt("What's your name?");
if (name !== null) {
  console.log(`Hello, ${name}!`);
}
```

### With Default Value

```javascript
const name = await prompt("What's your name?", "Guest");
```

### With Validation

```javascript
const email = await prompt(
  "Enter your email:",
  "",
  {
    title: "Email Required",
    inputType: "email",
    required: true,
    pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
  }
);
```

### React Usage

```jsx
import { usePrompt } from '@tlabsinc/promptjs-react';

function MyComponent() {
  const { prompt } = usePrompt();
  
  const handleClick = async () => {
    const name = await prompt("What's your name?");
    if (name) {
      console.log(name);
    }
  };
  
  return <button onClick={handleClick}>Ask Name</button>;
}
```

### Vanilla JS (CDN)

```html
<script src="https://unpkg.com/@tlabsinc/promptjs-core/dist/index.global.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@tlabsinc/promptjs-core/dist/promptjs.css">

<script>
async function askName() {
  const name = await PromptJS.prompt("What's your name?");
  console.log(name);
}
</script>
```

---

## 🧪 Testing

### Jest/Vitest Example

```javascript
import { prompt } from '@tlabsinc/promptjs-core';

jest.mock('@tlabsinc/promptjs-core', () => ({
  prompt: jest.fn()
}));

test('handles user input', async () => {
  prompt.mockResolvedValue('John Doe');
  
  const result = await myFunction();
  
  expect(prompt).toHaveBeenCalledWith('Enter name:');
  expect(result).toBe('John Doe');
});

test('handles cancellation', async () => {
  prompt.mockResolvedValue(null);
  
  const result = await myFunction();
  
  expect(result).toBeNull();
});
```

---

## 🎨 Styling

The input field uses CSS custom properties for theming:

```css
--pj-border          /* Border color */
--pj-primary         /* Focus color */
--pj-primary-alpha   /* Focus shadow */
--pj-input-bg        /* Background */
--pj-text            /* Text color */
--pj-error           /* Error color */
```

---

## 🚀 Benefits for Your Project

### 1. **Drop-in Replacement Strategy**

Your implementation allows projects to easily migrate:

```javascript
// Before (native)
const name = window.prompt("Name?");

// After (just add await)
const name = await PromptJS.prompt("Name?");
```

### 2. **API Consistency**

All three APIs follow the same async pattern:

```javascript
await PromptJS.alert("Message");     // Promise<void>
await PromptJS.confirm("Sure?");     // Promise<boolean>
await PromptJS.prompt("Name?");      // Promise<string | null>
```

### 3. **No Breaking Changes**

- ✅ Existing `Modal.open()` returns `ModalInstance` (unchanged)
- ✅ Existing `alert()` returns `Promise<void>` (unchanged)
- ✅ Existing `confirm()` returns `Promise<boolean>` (unchanged)
- ✅ New `prompt()` returns `Promise<string | null>` (consistent)
- ✅ Existing `question()` returns `Promise<{ id: string }>` (unchanged)

### 4. **Progressive Enhancement**

Users can choose their complexity level:

```javascript
// Simple: Drop-in replacement
await prompt("Name?");

// Medium: With validation
await prompt("Email?", "", { inputType: "email", required: true });

// Advanced: Full modal control
Modal.open({ content: customComponent });
```

---

## 📚 Documentation Status

- ✅ API Reference in README.md
- ✅ Migration guide (MIGRATION-NATIVE-APIS.md)
- ✅ Interactive demos (2 HTML files)
- ✅ TypeScript definitions
- ✅ JSDoc comments in code
- ✅ Usage examples for all frameworks

---

## 🎯 Next Steps (Optional Enhancements)

### Future Improvements

1. **Multi-line Input**
   ```javascript
   await prompt("Bio:", "", { inputType: "textarea", rows: 5 });
   ```

2. **Autocomplete**
   ```javascript
   await prompt("City:", "", { autocomplete: ["New York", "London"] });
   ```

3. **Async Validators**
   ```javascript
   await prompt("Username:", "", {
     validator: async (value) => {
       const exists = await checkUsername(value);
       return exists ? "Username taken" : true;
     }
   });
   ```

4. **Input Masks**
   ```javascript
   await prompt("Phone:", "", { mask: "(###) ###-####" });
   ```

---

## ✅ Checklist

- [x] Implemented `prompt()` function
- [x] Added `PromptOptions` interface
- [x] Exported from core package
- [x] Added to React bindings
- [x] Updated documentation
- [x] Created demo files
- [x] Created migration guide
- [x] Added TypeScript types
- [x] Tested with validation
- [x] Tested with different input types
- [x] Ensured accessibility
- [x] No breaking changes to existing APIs

---

## 🎉 Conclusion

The `prompt()` implementation is **production-ready** and provides:

1. ✅ **Drop-in replacement** for `window.prompt()`
2. ✅ **Enhanced features** (validation, input types)
3. ✅ **Better UX** (non-blocking, beautiful, accessible)
4. ✅ **Type-safe** (full TypeScript support)
5. ✅ **Framework-agnostic** (works everywhere)
6. ✅ **Zero breaking changes** to existing APIs

Your architecture was **perfectly designed** to support this addition without any modifications to existing functionality!

---

**Author:** Iftekhar Mahmud Towhid (tlabs.im@gmail.com)  
**Date:** October 6, 2025  
**Version:** 0.1.0+prompt
