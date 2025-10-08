# PromptJS React - Complete Documentation Index

## 📚 Documentation Files

1. **[MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)** - Migrate from old `promptjs.ts` to new `promptjs-react.ts`
2. **[INITIALIZATION-GUIDE.md](./INITIALIZATION-GUIDE.md)** - How to initialize and configure PromptJS
3. **[HOW-WINDOW-PROMPTJS-WORKS.md](./HOW-WINDOW-PROMPTJS-WORKS.md)** - Understanding the architecture
4. **[TYPESCRIPT-TYPE-MISMATCH-RESOLVED.md](./TYPESCRIPT-TYPE-MISMATCH-RESOLVED.md)** - TypeScript type casting explanation
5. **[PROMPTJS-REACT-UPGRADE.md](./PROMPTJS-REACT-UPGRADE.md)** - Complete feature comparison and upgrade guide

---

## 🚀 Quick Start

### 1. Install

```bash
npm install @tlabsinc/promptjs-core @tlabsinc/promptjs-react
```

### 2. Initialize (App.tsx)

```tsx
import '@tlabsinc/promptjs-core';
import '@tlabsinc/promptjs-core/dist/promptjs.css';
import { initializePromptJS } from './promptjs-react';

initializePromptJS({
  theme: 'auto',
  modal: { closeOnEsc: true, draggable: true },
  toast: { defaultPosition: 'top-right', defaultTimeoutMs: 3000 }
});
```

### 3. Use (Any Component)

```tsx
import { useDialogs, useToast } from './promptjs-react';

function MyComponent() {
  const { alert, confirm } = useDialogs();
  const toast = useToast();

  const handleAction = async () => {
    const ok = await confirm("Are you sure?");
    if (ok) toast({ kind: 'success', message: 'Done!' });
  };
}
```

---

## 📖 What's in `promptjs-react.ts`?

### ✅ **Complete Type Exports** (40+ types)

**Core Types:**
- `Theme`, `Dir`, `NotifyKind`, `ButtonVariant`, `ModalSize`
- `ToastPosition`, `ToastBehavior`, `ToastAnimPreset`, `ToastDirection`
- `ModalConcurrency`, `ToastDistance`, `InputType`

**Advanced Types:**
- `ModalDraggable` - Drag configuration
- `ButtonDef` - Buttons with onClick handlers
- `ToastAnimations` - Custom animations
- `I18nBundle` - Complete i18n structure
- `PromptJSConfig` - Full configuration interface

**Dialog Options:**
- `AlertOptions`, `ConfirmOptions`, `PromptOptions`
- `QuestionOptions`, `NotifyOptions`

**Modal Options:**
- `BaseModalOptions` (15+ properties)
- `ModalOptions`, `BareModalOptions`
- `ModalInstance`

**Toast Options:**
- `ToastOptions`, `ToastAction`
- `ToastAnimSpec`, `ToastTimeoutCue`

**Configuration Types:**
- `AnimationConfig`, `OverlayConfig`, `ModalConfig`
- `ToastConfig`, `A11yConfig`, `Breakpoints`
- `PartialPromptJSConfig`

### ✅ **Initialization Functions**

```typescript
// Initialize with custom config
export function initializePromptJS(
  config?: PartialPromptJSConfig,
  options?: { verbose?: boolean; brandName?: string }
): void;

// Get current configuration
export function getPromptJSConfig(): PromptJSConfig;

// Update configuration
export function updatePromptJSConfig(config: PartialPromptJSConfig): void;
```

### ✅ **React Hooks**

```typescript
// Dialog functions
export const useDialogs = () => { alert, confirm, prompt, question };

// Toast notifications
export const useToast = () => toast;

// Full-featured modals
export const useModal = () => openModal;

// Minimal modal wrappers
export const useBareModal = () => { bare, mount };

// Full API access
export const usePromptJS = () => PromptJSAPI;
```

### ✅ **Convenience Functions**

```typescript
export const showSuccess = (message, options?) => void;
export const showError = (message, options?) => void;
export const showWarning = (message, options?) => void;
export const showInfo = (message, options?) => void;
```

---

## 🎯 Key Features

### 1. **Complete Type Coverage**

```typescript
// ✅ Full IntelliSense for all options
import { useModal, type ModalOptions } from './promptjs-react';

const openModal = useModal();

const options: ModalOptions = {
  title: "Modal",
  content: "Content",
  size: 'lg',
  draggable: {
    handle: 'header',
    axis: 'both',
    withinViewport: true
  },
  kind: 'info',
  closeOnEsc: true,
  buttons: [
    {
      id: 'ok',
      text: 'OK',
      variant: 'primary',
      onClick: async (ctx) => {
        await saveData();
        ctx.close('success');
      }
    }
  ]
};

openModal(options); // ✅ Fully typed!
```

### 2. **Custom Initialization**

```typescript
// Flexible configuration on startup
initializePromptJS({
  theme: 'dark',
  animation: { durationMs: 250 },
  modal: {
    draggable: { handle: 'header', axis: 'both' }
  },
  toast: {
    defaultPosition: 'bottom-right',
    animations: {
      enter: { preset: 'slide', direction: 'up' },
      exit: { preset: 'fade' }
    }
  }
}, {
  brandName: 'My App',
  verbose: true
});
```

### 3. **Advanced Modal Features**

```typescript
import { useBareModal, type BareModalOptions } from './promptjs-react';

const { mount } = useBareModal();

// Mount custom React component in modal
const MyModalContent = () => <div>Custom content</div>;

const inst = mount({
  content: document.createElement('div'), // Or React portal
  windowed: true,
  closeOnEsc: true,
  draggable: true,
  kind: 'info',
  surfaceAlpha: 0.95,
  dialogBlurPx: 4
});
```

### 4. **Custom Toast Animations**

```typescript
import { useToast, type ToastAnimations } from './promptjs-react';

const toast = useToast();

const animations: ToastAnimations = {
  enter: {
    preset: 'slide',
    direction: 'down',
    distance: 100,
    durationMs: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  exit: {
    preset: 'fade',
    durationMs: 200
  },
  timeoutCue: {
    show: true,
    position: 'bottom',
    direction: 'shrink',
    thicknessPx: 3
  }
};

toast({
  kind: 'success',
  message: 'Custom animations!',
  animations
});
```

### 5. **Dynamic Configuration**

```typescript
import { updatePromptJSConfig, getPromptJSConfig } from './promptjs-react';

// Get current config
const config = getPromptJSConfig();
console.log('Current theme:', config.theme);

// Update theme
updatePromptJSConfig({ theme: 'dark' });

// Update multiple settings
updatePromptJSConfig({
  theme: 'dark',
  animation: { durationMs: 300 },
  toast: { defaultPosition: 'bottom-right' }
});
```

### 6. **Internationalization**

```typescript
import { initializePromptJS, type I18nBundle } from './promptjs-react';

const spanish: Partial<I18nBundle> = {
  locale: 'es',
  dir: 'ltr',
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
};

initializePromptJS({ i18n: spanish });
```

---

## 📊 Comparison: Old vs New

| Feature | promptjs.ts | promptjs-react.ts |
|---------|-------------|-------------------|
| **Lines of Code** | 312 | 1,030 |
| **Type Coverage** | ~30% | 100% |
| **Exported Types** | 8 | 40+ |
| **Auto-Initialize** | ✅ Yes | ❌ Manual (more flexible) |
| **Config Helpers** | ❌ No | ✅ Yes |
| **Complete Types** | ❌ Missing many | ✅ All core types |
| **Draggable Config** | ❌ Missing | ✅ Complete |
| **Toast Animations** | ❌ Missing | ✅ Complete |
| **ButtonDef** | ❌ Missing | ✅ With onClick |
| **Complete I18n** | ❌ Partial | ✅ Complete |
| **Type Conflicts** | ⚠️ Some | ✅ None |
| **Documentation** | ⚠️ Minimal | ✅ Comprehensive |

---

## 🔧 Advanced Usage Examples

### Example 1: Question Dialog

```typescript
import { useDialogs, type QuestionOptions } from './promptjs-react';

const { question } = useDialogs();

const result = await question({
  title: "Choose Action",
  message: "What would you like to do?",
  buttons: [
    { id: 'save', text: 'Save', variant: 'primary' },
    { id: 'discard', text: 'Discard', variant: 'danger' },
    { id: 'cancel', text: 'Cancel', variant: 'neutral' }
  ],
  escReturns: 'cancel',
  backdropReturns: 'cancel'
});

console.log('User chose:', result.id); // 'save', 'discard', or 'cancel'
```

### Example 2: Modal with Update

```typescript
import { useModal } from './promptjs-react';

const openModal = useModal();

const inst = openModal({
  title: "Processing...",
  content: "Please wait",
  buttons: []
});

// Update after async operation
setTimeout(() => {
  inst.update({
    title: "Complete!",
    content: "Operation finished successfully",
    buttons: [
      { id: 'ok', text: 'OK', variant: 'primary' }
    ]
  });
}, 2000);
```

### Example 3: Toast with Actions

```typescript
import { useToast, type ToastAction } from './promptjs-react';

const toast = useToast();

const actions: ToastAction[] = [
  {
    id: 'undo',
    text: 'Undo',
    onClick: async () => {
      await undoAction();
      toast({ kind: 'info', message: 'Undone!' });
    }
  },
  {
    id: 'view',
    text: 'View',
    onClick: () => {
      router.push('/details');
    }
  }
];

toast({
  kind: 'success',
  message: 'Item deleted',
  timeoutMs: 5000,
  dismissible: true,
  actions
});
```

---

## 🛠️ TypeScript Benefits

### IntelliSense Everywhere

```typescript
import { useToast } from './promptjs-react';

const toast = useToast();

toast({
  kind: '|' // ← IntelliSense shows: 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'question'
  message: 'Test',
  position: '|' // ← Shows all 6 positions
  animations: {
    enter: {
      preset: '|' // ← Shows: 'fade' | 'slide' | 'scale'
      direction: '|' // ← Shows: 'up' | 'down' | 'left' | 'right' | 'auto'
    }
  }
});
```

### Compile-Time Errors

```typescript
// ❌ TypeScript error: Property 'invalidProp' does not exist
toast({
  message: 'Test',
  invalidProp: true
});

// ❌ TypeScript error: Type '"invalid"' is not assignable to type 'NotifyKind'
toast({
  message: 'Test',
  kind: 'invalid'
});

// ✅ All valid
toast({
  message: 'Test',
  kind: 'success',
  timeoutMs: 3000
});
```

### Type Safety in Functions

```typescript
import { type ModalOptions, type ButtonDef } from './promptjs-react';

// ✅ Function parameters are typed
function createModal(options: Partial<ModalOptions>) {
  // TypeScript validates all properties
}

// ✅ Array types are validated
const buttons: ButtonDef[] = [
  {
    id: 'save',
    text: 'Save',
    variant: 'primary', // ✅ Only valid variants allowed
    onClick: async (ctx) => {
      ctx.close(); // ✅ ctx is typed as ModalInstance
    }
  }
];
```

---

## 📝 Summary

### What You Get

✅ **1,030 lines** of comprehensive TypeScript definitions  
✅ **40+ types** covering every PromptJS feature  
✅ **100% type coverage** - no `any` types  
✅ **Zero TypeScript errors** - handles conflicts gracefully  
✅ **5 React hooks** - fully typed with examples  
✅ **3 helper functions** - init, get, update config  
✅ **4 convenience functions** - quick toast shortcuts  
✅ **Complete IntelliSense** - autocomplete everywhere  
✅ **SSR-safe** - handles server-side rendering  
✅ **Comprehensive docs** - 5 documentation files  

### When to Use

✅ Building React apps with PromptJS  
✅ Need full TypeScript type safety  
✅ Want advanced customization  
✅ Need complete IntelliSense support  
✅ Building production applications  

### Replaces

❌ Old `promptjs.ts` (312 lines, partial types)  
❌ Direct `window.PromptJS` access (no types)  
❌ Custom type declarations (incomplete)  

---

## 🎓 Learn More

- **[MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)** - Step-by-step migration from old file
- **[INITIALIZATION-GUIDE.md](./INITIALIZATION-GUIDE.md)** - Complete initialization examples
- **[HOW-WINDOW-PROMPTJS-WORKS.md](./HOW-WINDOW-PROMPTJS-WORKS.md)** - Architecture explanation
- **[TYPESCRIPT-TYPE-MISMATCH-RESOLVED.md](./TYPESCRIPT-TYPE-MISMATCH-RESOLVED.md)** - Type casting details
- **[PROMPTJS-REACT-UPGRADE.md](./PROMPTJS-REACT-UPGRADE.md)** - Feature comparison

---

## 🚀 Get Started Now!

```bash
# 1. Install
npm install @tlabsinc/promptjs-core @tlabsinc/promptjs-react

# 2. Copy promptjs-react.ts to your project
cp promptjs-react.ts src/lib/promptjs-react.ts

# 3. Initialize in App.tsx
import { initializePromptJS } from '@/lib/promptjs-react';
initializePromptJS({ theme: 'auto' });

# 4. Use anywhere
import { useDialogs, useToast } from '@/lib/promptjs-react';
```

**That's it! You now have complete TypeScript support for PromptJS!** 🎉
