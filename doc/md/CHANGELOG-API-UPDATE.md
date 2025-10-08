# PromptJS API Update - onDismissal Pattern

## Summary

Updated the PromptJS dialog API to provide a cleaner, more unified dismissal handling pattern and full modal configuration options for all dialog types.

## Breaking Changes

### QuestionOptions Interface

**Before:**
```typescript
interface QuestionOptions {
  title?: string;
  message: string;
  kind?: NotifyKind;
  buttons: QuestionButton[];
  defaultId?: string;
  escReturns?: string | null;      // ❌ REMOVED
  backdropReturns?: string | null; // ❌ REMOVED
}
```

**After:**
```typescript
interface QuestionOptions extends BaseModalOptions {
  message: string;
  buttons: QuestionButton[];
  defaultId?: string;
  onDismissal?: string;  // ✅ NEW: Unified dismissal handler
  // Also inherits: title, kind, showClose, closeOnEsc, closeOnBackdrop, 
  // draggable, animate, size, and all other BaseModalOptions
}
```

**Migration:**
```typescript
// OLD
await question({
  message: "Save changes?",
  buttons: [...],
  escReturns: 'cancel',
  backdropReturns: 'cancel'
});

// NEW
await question({
  message: "Save changes?",
  buttons: [...],
  onDismissal: 'cancel'  // Handles ESC, backdrop, AND close button
});
```

## Enhanced Features

### 1. All Dialog Options Now Extend BaseModalOptions

All dialog option interfaces now inherit from `BaseModalOptions`, giving you full control over modal behavior:

```typescript
// AlertOptions, ConfirmOptions, PromptOptions, QuestionOptions all extend BaseModalOptions

await alert("Hello!", {
  kind: 'success',
  showClose: true,      // Show close button
  draggable: true,      // Make draggable
  animate: true,        // Animate appearance
  closeOnEsc: true,     // Close on ESC key
  closeOnBackdrop: true,// Close on backdrop click
  size: 'lg',           // Modal size
  trapFocus: true,      // Trap keyboard focus
  ariaLabel: 'Success message',
  onOpen: (ctx) => console.log('Opened'),
  onClose: (result) => console.log('Closed', result)
});
```

### 2. Unified Dismissal Handling

The new `onDismissal` property handles all dismissal actions uniformly:

```typescript
const result = await question({
  message: "Choose an option",
  buttons: [
    { id: 'save', text: 'Save' },
    { id: 'cancel', text: 'Cancel' }
  ],
  onDismissal: 'cancel',  // Returns 'cancel' for ESC, backdrop, OR close button
  showClose: true         // Enable close button (X)
});

// result.id will be:
// - 'save' if Save button clicked
// - 'cancel' if Cancel button, ESC, backdrop, or close button
```

### 3. Consistent Parameter Naming

All dialog functions now use `opts` consistently:

```typescript
alert(message: string, opts?: AlertOptions)
confirm(message: string, opts?: ConfirmOptions)
prompt(message: string, defaultValue?: string, opts?: PromptOptions)
question(opts: QuestionOptions)
```

## Updated Type Definitions

### BaseModalOptions
```typescript
interface BaseModalOptions {
  // Visual & sizing
  size?: ModalSize | { w?: number | string; h?: number | string };
  
  // Animation & behavior
  animate?: boolean;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  trapFocus?: boolean;
  ariaLabel?: string;
  
  // Lifecycle & concurrency
  concurrency?: ModalConcurrency;
  onOpen?: (ctx: ModalInstance) => void;
  onClose?: (result?: unknown) => void;
  
  // Chrome (UI elements)
  showClose?: boolean;
  closeAriaLabel?: string;
  defaultButtonId?: string;  // ✅ NEW: Button ID to focus on modal open
  
  // Accent & visuals
  kind?: NotifyKind;
  surfaceAlpha?: number;
  dialogBlurPx?: number;
  backdropBlurPx?: number;
  
  // Draggable
  draggable?: ModalDraggable;
}
```

### AlertOptions
```typescript
interface AlertOptions extends BaseModalOptions {
  okText?: string;
  // Inherits: title, kind, showClose, draggable, animate, size, defaultButtonId, etc.
}
```

### ConfirmOptions
```typescript
interface ConfirmOptions extends BaseModalOptions {
  yesText?: string;
  noText?: string;
  includeCancel?: boolean;
  cancelText?: string;
  // Inherits: title, kind, showClose, draggable, animate, size, defaultButtonId, etc.
}
```

### PromptOptions
```typescript
interface PromptOptions extends BaseModalOptions {
  okText?: string;
  cancelText?: string;
  placeholder?: string;
  inputType?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  required?: boolean;
  maxLength?: number;
  minLength?: number;  // ✅ NEW: Minimum length validation
  pattern?: string;
  validator?: (value: string) => boolean | string;
  // Inherits: title, kind, showClose, draggable, animate, size, defaultButtonId, etc.
}
```

### QuestionOptions
```typescript
interface QuestionOptions extends BaseModalOptions {
  message: string;
  buttons: QuestionButton[];
  onDismissal?: string;  // ✅ NEW: Replaces escReturns/backdropReturns
  // Inherits: title, kind, showClose, draggable, animate, size, defaultButtonId, etc.
}
```

## Usage Examples

### Basic Dialogs with Enhanced Options

```typescript
// Alert with custom styling
await alert("Success!", {
  kind: 'success',
  okText: 'Got it',
  draggable: true,
  showClose: true
});

// Confirm with cancel option
const confirmed = await confirm("Delete this item?", {
  kind: 'warning',
  yesText: 'Delete',
  noText: 'Keep',
  includeCancel: true,
  cancelText: 'Maybe later',
  draggable: true
});

// Prompt with validation
const email = await prompt("Enter your email", "", {
  inputType: 'email',
  required: true,
  minLength: 5,
  pattern: '^[^@]+@[^@]+\\.[^@]+$',
  validator: (value) => {
    if (!value.includes('@')) return 'Invalid email format';
    return true;
  }
});
```

### Question Dialog with onDismissal and Default Focus

```typescript
const result = await question({
  title: "Save Changes",
  message: "You have unsaved changes. What would you like to do?",
  kind: 'warning',
  buttons: [
    { id: 'save', text: 'Save', variant: 'primary' },
    { id: 'discard', text: 'Discard', variant: 'danger' },
    { id: 'cancel', text: 'Cancel', variant: 'neutral' }
  ],
  onDismissal: 'cancel',     // ESC/backdrop/close returns 'cancel'
  showClose: true,           // Show close button (X)
  closeOnEsc: true,          // Enable ESC key
  closeOnBackdrop: false,    // Prevent accidental backdrop clicks
  draggable: true,           // Make it draggable
  size: 'md',
  defaultButtonId: 'save'    // ✅ NEW: Auto-focus Save button on open
});

switch (result.id) {
  case 'save':
    await saveChanges();
    break;
  case 'discard':
    discardChanges();
    break;
  case 'cancel':
    // User cancelled (clicked Cancel, ESC, backdrop, or close button)
    break;
}
```

### React Hook Usage

```tsx
import { useDialogs } from './promptjs-react';

function MyComponent() {
  const { alert, confirm, prompt, question } = useDialogs();
  
  const handleDelete = async () => {
    const confirmed = await confirm("Delete this item?", {
      kind: 'warning',
      yesText: 'Delete',
      noText: 'Cancel',
      showClose: true,
      draggable: true
    });
    
    if (confirmed) {
      await deleteItem();
      await alert("Item deleted!", { kind: 'success' });
    }
  };
  
  return <button onClick={handleDelete}>Delete</button>;
}
```

## Benefits

1. **Simpler API**: One `onDismissal` parameter instead of three separate ones
2. **Complete Control**: All dialog types now have access to full modal configuration
3. **Better UX**: Close button now properly handled in question dialogs
4. **Consistent Naming**: All functions use `opts` parameter consistently
5. **Type Safety**: Full TypeScript support with proper inheritance
6. **Backward Compatible**: Browser-like API signatures maintained (message as first parameter)
7. **Default Focus**: New `defaultButtonId` allows auto-focusing specific buttons for better keyboard accessibility

## Files Modified

### Core Package
- `packages/core/src/types.ts` - Updated all dialog option interfaces
- `packages/core/src/dialogs.ts` - Updated implementations

### React Package
- `promptjs-react.ts` - Updated type definitions and examples

## Version
- Updated: October 9, 2025
- Impact: Breaking change for `QuestionOptions` (escReturns/backdropReturns removed)
- Migration: Replace `escReturns`/`backdropReturns` with single `onDismissal` property
