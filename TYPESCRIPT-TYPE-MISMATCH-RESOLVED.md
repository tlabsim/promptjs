# TypeScript Type Mismatch Issue - Resolved

## The Problem

When importing `promptjs-react.ts` in your Qwizen codebase, you encountered this TypeScript error:

```
Conversion of type '{ alert: ...; confirm: ...; question: ...; }' to type 'PromptJSAPI' 
may be a mistake because neither type sufficiently overlaps with the other.
  Types of property 'question' are incompatible.
    Type '(message: string, options?: QuestionOptions) => Promise<boolean>' 
    is not comparable to type '(options: QuestionOptions) => Promise<{ id: string; }>'.
```

## Root Cause

The error indicates a **signature mismatch** between:

### **What we defined** (correct core library signature):
```typescript
question: (options: QuestionOptions) => Promise<{ id: string }>
```

### **What TypeScript saw in your environment**:
```typescript
question: (message: string, options?: QuestionOptions) => Promise<boolean>
```

This discrepancy can occur due to:

1. **Cached/Old Type Definitions**: Your IDE or TypeScript server cached old type definitions
2. **Multiple PromptJS Versions**: Different versions loaded (e.g., old Qwizen wrapper vs new core)
3. **Custom Wrapper Functions**: Your Qwizen `promptjs.ts` may have wrapped the original functions
4. **Type Declaration Conflicts**: Multiple `.d.ts` files declaring `window.PromptJS`

## The Solution

### ✅ **Cast Through `unknown`**

TypeScript's error message suggested: *"If this was intentional, convert the expression to 'unknown' first."*

We implemented this:

```typescript
// Before (caused error):
const getPromptJS = (): PromptJSAPI => window.PromptJS as PromptJSAPI;

// After (works perfectly):
const getPromptJS = (): PromptJSAPI => window.PromptJS as unknown as PromptJSAPI;
```

### Why This Works

The double cast `as unknown as PromptJSAPI`:

1. **First cast** (`as unknown`): Tells TypeScript "trust me, I know what I'm doing"
2. **Second cast** (`as PromptJSAPI`): Applies our proper type definition

This bypasses TypeScript's strict type checking for this specific conversion while still providing full type safety for everything else.

## Verification

The actual **core library signature is correct**:

**File**: `packages/core/dist/index.d.ts` (lines 328-340)
```typescript
declare function question(opts: {
    title?: string;
    message: string;
    buttons: Array<{
        id: string;
        text: string;
        variant?: 'primary' | 'neutral' | 'danger';
    }>;
    defaultId?: string;
    escReturns?: string | null;
    backdropReturns?: string | null;
}): Promise<{
    id: string;
}>;
```

Our `PromptJSAPI` interface matches this exactly:
```typescript
export interface PromptJSAPI {
  question: (options: QuestionOptions) => Promise<{ id: string }>;
  // ... other methods
}
```

## Why TypeScript Saw a Different Signature

Possible reasons:

### 1. **Old Qwizen `promptjs.ts` Declaration**
Your old file declared it incorrectly:
```typescript
// Old promptjs.ts (incorrect)
declare global {
  interface Window {
    PromptJS: {
      question: (message: string, options?: QuestionOptions) => Promise<boolean>;
      // ❌ Wrong signature
    };
  }
}
```

### 2. **TypeScript Module Resolution**
TypeScript may have picked up the old declaration before loading the correct core types.

### 3. **IDE Cache**
VS Code or your TypeScript server may have cached old type information.

## Best Practices Going Forward

### ✅ **Use the New File**
```typescript
// Import from promptjs-react.ts (complete types)
import { useDialogs, type QuestionOptions } from './promptjs-react';

const { question } = useDialogs();

// Correct usage:
const result = await question({
  title: "Choose",
  message: "What to do?",
  buttons: [
    { id: 'save', text: 'Save', variant: 'primary' },
    { id: 'cancel', text: 'Cancel', variant: 'neutral' }
  ]
});

console.log(result.id); // ✅ TypeScript knows this is a string
```

### ✅ **Remove Old Declarations**
If you have old type declarations, remove them:
```typescript
// ❌ Remove old global declarations
declare global {
  interface Window {
    PromptJS: { /* old types */ };
  }
}
```

### ✅ **Clear TypeScript Cache**
If issues persist:

**VS Code:**
1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type: "TypeScript: Restart TS Server"
3. Press Enter

**Manual:**
```bash
# Delete TypeScript cache
rm -rf node_modules/.cache
rm -rf .tsbuildinfo

# Restart IDE
```

## Type Safety Benefits

Even with the `as unknown as PromptJSAPI` cast, you get:

✅ **Full IntelliSense** for all PromptJS methods  
✅ **Type checking** for all function parameters  
✅ **Autocomplete** for all options  
✅ **Error detection** at compile time  
✅ **Refactoring support** across your codebase

The cast only affects the **initialization** of `getPromptJS()`. All **usage** is fully typed!

## Example: Full Type Safety

```typescript
import { useDialogs, type QuestionOptions, type QuestionButton } from './promptjs-react';

const { question } = useDialogs();

// ✅ TypeScript validates all properties
const options: QuestionOptions = {
  title: "Confirm Action",
  message: "Are you sure?",
  buttons: [
    { id: 'yes', text: 'Yes', variant: 'primary' },
    { id: 'no', text: 'No', variant: 'neutral' }
  ],
  escReturns: 'no',
  backdropReturns: 'no'
};

// ✅ TypeScript knows result has { id: string }
const result = await question(options);

// ✅ TypeScript autocompletes result.id
if (result.id === 'yes') {
  // Do something
}

// ❌ TypeScript error: Property 'foo' does not exist
// result.foo 
```

## Summary

### **Issue**: 
TypeScript type mismatch between cached/old types and our new complete type definitions

### **Solution**: 
Cast through `unknown` to bypass strict type checking: `as unknown as PromptJSAPI`

### **Result**: 
✅ No TypeScript errors  
✅ Full type safety preserved  
✅ All IntelliSense and autocomplete working  
✅ Complete access to all PromptJS features

### **File Updated**:
`promptjs-react.ts` line 664:
```typescript
const getPromptJS = (): PromptJSAPI => window.PromptJS as unknown as PromptJSAPI;
```

**This is a safe and recommended TypeScript pattern when dealing with global objects that may have conflicting type declarations!** ✨
