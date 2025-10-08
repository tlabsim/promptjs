# PromptJS Dismissal Behavior Design

## Question: Should `onDismissal` be in ConfirmOptions/AlertOptions/PromptOptions?

### Answer: No, by design

## Reasoning

### 1. **Type System Constraint**
- `onDismissal` in `QuestionOptions` returns a **button ID** (string)
- Convenience functions have **fixed return types**:
  - `confirm()` → `boolean` (Yes=true, No/Cancel=false)
  - `alert()` → `void` (just resolves)
  - `prompt()` → `string | null` (value or null)

Adding `onDismissal` to these would create confusion since the button ID can't affect the return type.

### 2. **Implicit Dismissal Behavior** (Mimics Browser APIs)
These functions already have well-defined dismissal behavior that matches browser standards:

```typescript
// Browser window.confirm() - ESC returns false
const result = await confirm("Delete?");  // ESC/backdrop/close → false

// Browser window.alert() - ESC closes
await alert("Done!");  // ESC/backdrop/close → resolves

// Browser window.prompt() - ESC returns null  
const value = await prompt("Name?");  // ESC/backdrop/close → null
```

### 3. **Users Already Have Control**
Since these extend `BaseModalOptions`, users can control dismissal behavior:

```typescript
// Prevent dismissal entirely
await confirm("Are you sure?", {
  closeOnEsc: false,
  closeOnBackdrop: false,
  showClose: false
});

// Allow only ESC, not backdrop
await alert("Important!", {
  closeOnEsc: true,
  closeOnBackdrop: false,
  showClose: true
});

// Full control
await prompt("Enter code:", "", {
  closeOnEsc: false,       // Must use buttons
  closeOnBackdrop: false,  // Can't accidentally dismiss
  showClose: true,         // But can click X (returns null)
  required: true           // Must enter value or cancel
});
```

### 4. **When You Need More Control**
If you need custom dismissal behavior (different button IDs, complex logic), use `question()` directly:

```typescript
// Full control with question()
const result = await question({
  message: "Save changes?",
  buttons: [
    { id: 'save', text: 'Save', variant: 'primary' },
    { id: 'discard', text: "Don't Save", variant: 'danger' },
    { id: 'cancel', text: 'Cancel', variant: 'neutral' }
  ],
  onDismissal: 'cancel',     // ESC/backdrop/close → 'cancel'
  closeOnEsc: true,          // Allow ESC
  closeOnBackdrop: false,    // Prevent accidental backdrop
  showClose: true,           // Show X button
  defaultButtonId: 'cancel'  // Focus Cancel by default
});

// Then handle the result
switch (result.id) {
  case 'save': /* ... */; break;
  case 'discard': /* ... */; break;
  case 'cancel': /* ... */; break;
}
```

## Summary Table

| Function | Return Type | Dismissal Behavior | Need `onDismissal`? |
|----------|-------------|-------------------|-------------------|
| `question()` | `{ id: string }` | Returns button ID from `onDismissal` | ✅ Yes (flexible) |
| `confirm()` | `boolean` | Always returns `false` | ❌ No (implicit) |
| `alert()` | `void` | Always resolves | ❌ No (implicit) |
| `prompt()` | `string \| null` | Always returns `null` | ❌ No (implicit) |

## Control Options Available to All

Since all options extend `BaseModalOptions`:

```typescript
interface BaseModalOptions {
  closeOnEsc?: boolean;        // ✅ Control ESC behavior
  closeOnBackdrop?: boolean;   // ✅ Control backdrop behavior  
  showClose?: boolean;         // ✅ Control close button
  // ... 20+ other options
}
```

## Conclusion

**No need for `onDismissal` in ConfirmOptions/AlertOptions/PromptOptions** because:
1. Return types are fixed (boolean, void, string|null)
2. Dismissal behavior is implicit and predictable (matches browser APIs)
3. Users already have fine-grained control via `BaseModalOptions`
4. Power users can use `question()` for full customization

This design provides:
- ✅ **Simplicity** for common cases (confirm, alert, prompt)
- ✅ **Control** via inherited properties (closeOnEsc, etc.)
- ✅ **Flexibility** via question() for complex scenarios
- ✅ **Consistency** with browser APIs
