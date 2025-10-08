# How `window.PromptJS` Works - Complete Explanation

## Overview

`window.PromptJS` is the **global API object** that gets automatically created when you import the `@tlabsinc/promptjs-core` package. This is a common pattern for UI libraries to provide both module-based imports AND a global browser API.

## The Flow

### 1️⃣ **Core Package Creates the Global** 
**File**: `packages/core/src/index.ts`

```typescript
// Core package imports all the functionality
import { config } from './config';
import { open as Modal } from './modal';
import { bare } from './modal-core';
import { toast } from './toast';
import { question, confirm, alert, prompt } from './dialogs';
import { i18n } from './i18n';

// Version string
const version = "1.0.0";

// Declare the global type (tells TypeScript that window.PromptJS exists)
declare global { 
  interface Window { 
    PromptJS?: any  // Declared as 'any' for flexibility
  } 
}

// AUTOMATICALLY RUN when the module loads (browser only)
if (typeof window !== 'undefined') {
  // Create the API object with all methods
  const api = { 
    config,      // Configuration management
    Modal,       // Modal.open(), Modal.bare(), Modal.mount()
    toast,       // Toast notifications
    question,    // Question dialogs
    confirm,     // Confirm dialogs
    alert,       // Alert dialogs
    prompt,      // Prompt dialogs
    i18n,        // Internationalization
    version      // Library version
  } as const;
  
  // Freeze it (make immutable) and attach to window
  window.PromptJS = Object.freeze(api);
}
```

**Key Point**: This code runs **automatically** when you import or load the core package. No manual initialization needed!

---

### 2️⃣ **How It Gets Loaded in Your App**

There are **two ways** the core package gets loaded:

#### **Option A: Via Script Tag (Standalone)**
```html
<!-- In your HTML -->
<link rel="stylesheet" href="path/to/promptjs.css">
<script src="path/to/promptjs.global.js"></script>

<script>
  // window.PromptJS is now available!
  window.PromptJS.alert("Hello!");
</script>
```

#### **Option B: Via Import (Module Bundler)**
```typescript
// In your app entry point (e.g., App.tsx, main.tsx, _app.tsx)
import '@tlabsinc/promptjs-core';           // ✅ This creates window.PromptJS
import '@tlabsinc/promptjs-core/dist/promptjs.css';

// Now window.PromptJS exists globally!
```

**Important**: You only need to import the core package **once** at your app's entry point. After that, `window.PromptJS` is available everywhere.

---

### 3️⃣ **Your React File Uses the Global**
**File**: `promptjs-react.ts`

```typescript
// Your file ASSUMES window.PromptJS already exists
// (because core package was imported at app entry point)

export interface PromptJSAPI {
  alert: (message: string, options?: AlertOptions) => Promise<void>;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  question: (options: QuestionOptions) => Promise<{ id: string }>;
  // ... etc
}

// Type-safe accessor
const getPromptJS = (): PromptJSAPI => window.PromptJS as PromptJSAPI;

// React hooks use the global
export const useDialogs = () => {
  const pjs = getPromptJS();  // Accesses window.PromptJS
  
  const alert = useCallback(
    (message: string, options?: AlertOptions) => pjs.alert(message, options),
    []
  );
  
  return { alert, confirm, prompt, question };
};
```

---

## Complete Setup Example

### **Step 1: Install Packages**
```bash
npm install @tlabsinc/promptjs-core @tlabsinc/promptjs-react
```

### **Step 2: Initialize in App Entry Point**
```tsx
// App.tsx or main.tsx or _app.tsx (Next.js)

// ✅ Import core package ONCE at app entry
import '@tlabsinc/promptjs-core';
import '@tlabsinc/promptjs-core/dist/promptjs.css';

// Now window.PromptJS is available globally!

function App() {
  return (
    <div>
      <MyComponent />
    </div>
  );
}

export default App;
```

### **Step 3: Use Anywhere in Your App**
```tsx
// components/MyComponent.tsx

// Import the React hooks (NOT the core package again)
import { useDialogs, useToast } from './promptjs-react';

function MyComponent() {
  const { alert, confirm } = useDialogs();
  const toast = useToast();
  
  const handleClick = async () => {
    // These hooks internally use window.PromptJS
    const confirmed = await confirm("Are you sure?");
    if (confirmed) {
      toast({ kind: 'success', message: 'Done!' });
    }
  };
  
  return <button onClick={handleClick}>Click Me</button>;
}
```

---

## Why This Architecture?

### ✅ **Pros**

1. **Single Source of Truth**: One global instance, no prop drilling
2. **No Context Provider Needed**: Works immediately
3. **Framework Agnostic**: Same API works in Vue, Angular, vanilla JS
4. **Easy Integration**: Import once, use everywhere
5. **Small Bundle**: No wrapper overhead

### ⚠️ **Cons**

1. **Requires Core Package**: Must import `@tlabsinc/promptjs-core` first
2. **Global State**: Can't have multiple isolated instances (usually not needed)
3. **SSR Considerations**: `window` doesn't exist on server (but code handles this)

---

## Troubleshooting

### ❌ **Error: "Cannot read property 'alert' of undefined"**

**Cause**: `window.PromptJS` doesn't exist yet.

**Solution**: Import the core package at your app's entry point:
```tsx
// App.tsx
import '@tlabsinc/promptjs-core';
import '@tlabsinc/promptjs-core/dist/promptjs.css';
```

### ❌ **TypeScript Error: "window.PromptJS has type 'any'"**

**Cause**: The core package declares it as `any` for flexibility.

**Solution**: Use `promptjs-react.ts` which provides proper types:
```typescript
// Instead of:
window.PromptJS.alert("Hi");  // Type is 'any'

// Use:
import { useDialogs } from './promptjs-react';
const { alert } = useDialogs();  // Fully typed!
```

### ❌ **Error: "Conversion of type ... may be a mistake"**

**Cause**: Type mismatch between actual implementation and type definition.

**Solution**: This was the `question()` return type issue we just fixed:
- ✅ **Correct**: `question(options) => Promise<{ id: string }>`
- ❌ **Wrong**: `question(message, options) => Promise<boolean>`

---

## The Type System

### **Core Package** (`@tlabsinc/promptjs-core`)
```typescript
// Declares window.PromptJS as 'any'
declare global { 
  interface Window { 
    PromptJS?: any 
  } 
}
```

### **Your React File** (`promptjs-react.ts`)
```typescript
// Provides PROPER types via interface
export interface PromptJSAPI {
  alert: (message: string, options?: AlertOptions) => Promise<void>;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  question: (options: QuestionOptions) => Promise<{ id: string }>;
  // ... all properly typed
}

// Type-safe accessor
const getPromptJS = (): PromptJSAPI => window.PromptJS as PromptJSAPI;
```

This gives you:
- ✅ Full TypeScript IntelliSense
- ✅ Compile-time type checking
- ✅ Autocomplete for all options
- ✅ Error detection before runtime

---

## Comparison with Other Patterns

### **Pattern 1: Global (PromptJS)** ✅ Current
```typescript
// App.tsx - Import once
import '@tlabsinc/promptjs-core';

// Any component
const { alert } = useDialogs();
await alert("Hi");  // Uses window.PromptJS
```

**Pros**: Simple, no provider, works everywhere  
**Cons**: Global state

---

### **Pattern 2: Context Provider** (Alternative)
```typescript
// App.tsx
<PromptProvider>
  <App />
</PromptProvider>

// Component
const { alert } = usePrompt();  // Gets from context
await alert("Hi");
```

**Pros**: Isolated state, testable  
**Cons**: More boilerplate, provider required

---

### **Pattern 3: Direct Import** (Alternative)
```typescript
// Any component
import { alert } from '@tlabsinc/promptjs-core';
await alert("Hi");
```

**Pros**: Direct access  
**Cons**: No React hooks, harder to mock

---

## Summary

### **How window.PromptJS Gets Created:**

1. ✅ **Core package** (`@tlabsinc/promptjs-core`) creates it automatically when imported
2. ✅ You import core package **once** at app entry point
3. ✅ `window.PromptJS` becomes globally available
4. ✅ Your `promptjs-react.ts` hooks access it via `getPromptJS()`
5. ✅ TypeScript types ensure type safety

### **What You Need to Do:**

```tsx
// 1. Install packages
npm install @tlabsinc/promptjs-core @tlabsinc/promptjs-react

// 2. Import core ONCE at app entry (App.tsx or main.tsx)
import '@tlabsinc/promptjs-core';
import '@tlabsinc/promptjs-core/dist/promptjs.css';

// 3. Use hooks anywhere in your app
import { useDialogs, useToast } from './promptjs-react';
```

**That's it!** The core package handles everything else automatically. 🎉
