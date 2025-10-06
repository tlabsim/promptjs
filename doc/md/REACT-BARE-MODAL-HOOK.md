# React Hook for Modal.bare() / Modal.mount() Added ✅

**Date**: October 6, 2025  
**Status**: COMPLETE

---

## 🎯 Issue Identified

You correctly noticed that the React library had `useModal()` for `Modal.open()`, but **no hook for `Modal.bare()` or `Modal.mount()`**!

This was an oversight - users had to access it via:
```tsx
const { Modal } = usePrompt();
Modal.bare({ content: ... }); // Not ideal
```

---

## ✨ Solution Implemented

### New Hook: `useBareModal()`

Added a dedicated React hook that provides stable callbacks for both `bare()` and `mount()`:

```typescript
export function useBareModal() {
  const ctx = usePrompt();
  return React.useMemo(() => ({
    bare: (opts: Parameters<typeof Modal.bare>[0]) => ctx.Modal.bare(opts),
    mount: (opts: Parameters<typeof Modal.bare>[0]) => ctx.Modal.mount(opts)
  }), [ctx]);
}
```

**Why both `bare` and `mount`?**
- They're aliases (same function)
- Gives developers choice of which name to use
- Consistent with core API

---

## 📝 Files Modified

### 1. **`packages/react/src/hooks.ts`**

Added the new hook after `useModal()`:
```typescript
/**
 * Hook for mounting custom content in a minimal modal wrapper.
 * Returns stable callbacks for both bare() and mount() (they're aliases).
 */
export function useBareModal() {
  const ctx = usePrompt();
  return React.useMemo(() => ({
    bare: (opts: Parameters<typeof Modal.bare>[0]) => ctx.Modal.bare(opts),
    mount: (opts: Parameters<typeof Modal.bare>[0]) => ctx.Modal.mount(opts)
  }), [ctx]);
}
```

### 2. **`packages/react/src/index.ts`**

Added export:
```typescript
export { useToast, useDialogs, useModal, useBareModal } from "./hooks";
```

### 3. **`packages/react/README.md`**

Added comprehensive documentation:

**a) Hooks Overview Table**:
```markdown
| Hook | Purpose | Returns |
|------|---------|---------|
| `useDialogs()` | Alert, confirm, prompt, question | `{ alert, confirm, question, prompt }` |
| `useToast()` | Show toast notifications | `(options) => void` |
| `useModal()` | Open full-featured modals | `(options) => ModalInstance` |
| `useBareModal()` | Mount custom content (minimal wrapper) | `{ bare, mount }` |
| `usePrompt()` | Access full PromptJS API | `PromptContextValue` |
```

**b) Full Hook Documentation** with examples (after `useModal()` section):
```tsx
### `useBareModal()`

Returns stable callbacks for mounting custom content in a minimal modal wrapper.

const { bare, mount } = useBareModal();

// Mount DOM element
const customElement = document.createElement('div');
const inst = mount({ content: customElement, closeOnEsc: true });

// Mount React component
const container = document.createElement('div');
ReactDOM.createRoot(container).render(<MyComponent />);
mount({ content: container });
```

### 4. **`PROMPTJS QUICK-START.md`**

Updated React hooks list:
```markdown
**Hooks**: `useDialogs()`, `useToast()`, `useModal()`, `useBareModal()`, `usePrompt()`
```

---

## 🚀 Usage Examples

### Basic Usage

```tsx
import { useBareModal } from '@tlabsinc/promptjs-react';

function MyComponent() {
  const { mount } = useBareModal();
  
  const handleCustomModal = () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="padding: 2rem;">
        <h1>Custom Content</h1>
        <p>No header or footer - full control!</p>
      </div>
    `;
    
    const inst = mount({
      content: container,
      closeOnEsc: true,
      animate: true
    });
    
    // Close after 3 seconds
    setTimeout(() => inst.close(), 3000);
  };
  
  return <button onClick={handleCustomModal}>Show Custom Modal</button>;
}
```

### Mounting React Components

```tsx
import { useBareModal } from '@tlabsinc/promptjs-react';
import ReactDOM from 'react-dom/client';

function MyCustomContent({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>React Component in Modal!</h1>
      <p>Full React component with state, hooks, etc.</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

function MyComponent() {
  const { mount } = useBareModal();
  
  const handleReactModal = () => {
    const container = document.createElement('div');
    
    const inst = mount({
      content: container,
      closeOnEsc: true
    });
    
    // Render React component into the container
    const root = ReactDOM.createRoot(container);
    root.render(<MyCustomContent onClose={() => inst.close()} />);
  };
  
  return <button onClick={handleReactModal}>Show React Modal</button>;
}
```

### Using Both bare() and mount()

```tsx
import { useBareModal } from '@tlabsinc/promptjs-react';

function MyComponent() {
  const { bare, mount } = useBareModal();
  
  const handleBare = () => {
    // Emphasizes minimal chrome
    bare({ content: '<div>Minimal!</div>' });
  };
  
  const handleMount = () => {
    // Emphasizes mounting content
    const el = document.createElement('div');
    el.textContent = 'Mounted!';
    mount({ content: el });
  };
  
  return (
    <>
      <button onClick={handleBare}>Use bare()</button>
      <button onClick={handleMount}>Use mount()</button>
    </>
  );
}
```

### Comparison: useModal() vs useBareModal()

```tsx
import { useModal, useBareModal } from '@tlabsinc/promptjs-react';

function ModalComparison() {
  const openModal = useModal();
  const { mount } = useBareModal();
  
  const handleFullModal = () => {
    // Full-featured: header, title, buttons, footer
    openModal({
      title: "Full Modal",
      content: "Has header, footer, and buttons",
      buttons: [
        { text: "OK", variant: "primary" },
        { text: "Cancel", variant: "secondary" }
      ]
    });
  };
  
  const handleBareModal = () => {
    // Minimal: just your content in a modal wrapper
    const content = document.createElement('div');
    content.innerHTML = `
      <div style="padding: 2rem;">
        <h2>Bare Modal</h2>
        <p>No header, no footer, just content!</p>
      </div>
    `;
    mount({ content, closeOnEsc: true });
  };
  
  return (
    <>
      <button onClick={handleFullModal}>Full Modal</button>
      <button onClick={handleBareModal}>Bare/Mount Modal</button>
    </>
  );
}
```

---

## 🎨 Advanced Patterns

### Form in Bare Modal

```tsx
import { useBareModal } from '@tlabsinc/promptjs-react';
import { useState } from 'react';

function FormInModal() {
  const { mount } = useBareModal();
  
  const handleShowForm = () => {
    const container = document.createElement('div');
    
    const inst = mount({
      content: container,
      closeOnEsc: false, // Don't close accidentally while filling form
      closeOnBackdrop: false
    });
    
    // Render form component
    ReactDOM.createRoot(container).render(
      <FormComponent onSubmit={(data) => {
        console.log('Form submitted:', data);
        inst.close();
      }} />
    );
  };
  
  return <button onClick={handleShowForm}>Open Form</button>;
}

function FormComponent({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email });
  };
  
  return (
    <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
      <h2>User Form</h2>
      <input 
        value={name} 
        onChange={e => setName(e.target.value)}
        placeholder="Name"
      />
      <input 
        value={email} 
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### With TypeScript

```tsx
import { useBareModal } from '@tlabsinc/promptjs-react';
import type { BareModalOptions, ModalInstance } from '@tlabsinc/promptjs-core';

function TypeSafeComponent() {
  const { mount } = useBareModal();
  
  const handleMount = (): ModalInstance => {
    const options: BareModalOptions = {
      content: document.createElement('div'),
      closeOnEsc: true,
      animate: true,
      draggable: false
    };
    
    return mount(options); // Fully typed!
  };
  
  return <button onClick={handleMount}>Typed Mount</button>;
}
```

---

## ✅ Benefits

### For Developers
✅ **Dedicated hook** for bare/mount modals  
✅ **Stable callbacks** - won't cause unnecessary re-renders  
✅ **Type-safe** - full TypeScript support  
✅ **Choice of names** - use `bare()` or `mount()`  
✅ **Consistent API** - matches core package  

### For Library
✅ **Complete API coverage** - all Modal methods now have hooks  
✅ **React-friendly** - proper memoization with `useMemo`  
✅ **No breaking changes** - purely additive  
✅ **Well-documented** - examples in README  

---

## 📊 React Hooks Summary

PromptJS React now provides **5 hooks**:

| Hook | Purpose | Use Case |
|------|---------|----------|
| `useDialogs()` | Alert, confirm, prompt, question | Quick dialogs |
| `useToast()` | Notifications | Toast messages |
| `useModal()` | Full-featured modals | Dialogs with buttons |
| **`useBareModal()`** | **Minimal modals** | **Custom content** |
| `usePrompt()` | Full API access | Advanced use cases |

---

## 🔄 Migration

**No migration needed!** This is purely additive.

### Before (workaround)
```tsx
const { Modal } = usePrompt();
Modal.bare({ content: el }); // Works but not ideal
```

### After (recommended)
```tsx
const { mount } = useBareModal();
mount({ content: el }); // Clean, dedicated hook!
```

---

## ✅ Verification

### Checklist
- [x] Added `useBareModal()` hook in `hooks.ts`
- [x] Exported from `index.ts`
- [x] Added to hooks overview table in README
- [x] Added full documentation section in README
- [x] Added usage examples (DOM + React)
- [x] Updated Quick Start guide
- [x] No TypeScript errors
- [x] Stable callbacks with `useMemo`
- [x] Consistent with other hooks

---

## 🚀 Status

✅ **Implementation Complete**  
✅ **Documentation Complete**  
✅ **Type-Safe**  
✅ **Zero Breaking Changes**  

The React library now has full coverage of the PromptJS Modal API! 🎉

---

**Issue Resolution**: The React library now provides `useBareModal()` hook for `Modal.bare()` and `Modal.mount()`, completing the React bindings API coverage. ✅
