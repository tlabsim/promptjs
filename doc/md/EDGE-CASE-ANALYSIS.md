# PromptJS Edge Case & Robustness Analysis

**Analysis Date**: October 9, 2025  
**Analyzed Version**: Current main branch

## Summary

Overall the codebase shows **good robustness** with proper defensive programming, but there are several edge cases that need attention.

---

## 🔴 CRITICAL Issues

### 1. **`question()` - Promise Never Resolves if No Dismissal Handler**

**File**: `dialogs.ts:20-38`

```typescript
export async function question(opts: QuestionOptions): Promise<{ id: string }> {
  const { message, buttons, onDismissal, ...modalOpts } = opts;
  
  return new Promise((resolve) => {
    const m = open({
      ...modalOpts,
      content: message,
      buttons: buttons.map(b => ({
        ...b,
        closeOnClick: true,
        onClick: () => resolve({ id: b.id }),
      })),
      onClose: (r) => {
        // ❌ PROBLEM: If onDismissal is undefined and user closes via ESC/backdrop/close button,
        // the promise never resolves!
        if (['esc', 'backdrop', 'close'].includes(r as string) && onDismissal) {
          resolve({ id: onDismissal });
        }
      }
    });
  });
}
```

**Problem**: If `onDismissal` is not provided and the user dismisses the modal (ESC, backdrop, or close button), the promise hangs forever.

**Impact**: Memory leak, frozen UI state, hung promises.

**Fix Required**:
```typescript
onClose: (r) => {
  if (['esc', 'backdrop', 'close'].includes(r as string)) {
    if (onDismissal) {
      resolve({ id: onDismissal });
    }
    // If no onDismissal, the modal simply doesn't resolve
    // This is intentional - user must click a button
    // But we should document this or provide a default
  }
}
```

**Recommended Solution**: Either throw an error or resolve with a default value:
```typescript
onClose: (r) => {
  if (['esc', 'backdrop', 'close'].includes(r as string)) {
    if (onDismissal) {
      resolve({ id: onDismissal });
    } else {
      // Option A: Reject the promise
      // reject(new Error('Dialog dismissed without onDismissal handler'));
      
      // Option B: Resolve with special value
      resolve({ id: '__dismissed__' });
      
      // Option C: Do nothing (current behavior - promise hangs)
    }
  }
}
```

---

### 2. **`alert()` - Missing `onClose` Handler**

**File**: `dialogs.ts:63-77`

```typescript
export async function alert(message: string, opts?: AlertOptions): Promise<void> {
  await new Promise<void>((resolve)=> {
    open({
      ...opts,
      content: message,
      buttons: [{ 
        id:'ok', 
        text: opts?.okText ?? config.get().i18n.ok, 
        variant:'primary', 
        onClick: ()=>resolve() 
      }],
      closeOnEsc: true,
      closeOnBackdrop: true,
      // ❌ PROBLEM: No onClose handler!
      // If user presses ESC or clicks backdrop, promise never resolves
    });
  });
}
```

**Problem**: `closeOnEsc: true` and `closeOnBackdrop: true` allow dismissal, but there's no `onClose` handler to resolve the promise.

**Impact**: Promise hangs, memory leak.

**Fix Required**:
```typescript
export async function alert(message: string, opts?: AlertOptions): Promise<void> {
  await new Promise<void>((resolve)=> {
    open({
      ...opts,
      content: message,
      buttons: [{ 
        id:'ok', 
        text: opts?.okText ?? config.get().i18n.ok, 
        variant:'primary', 
        onClick: ()=>resolve() 
      }],
      closeOnEsc: true,
      closeOnBackdrop: true,
      onClose: () => resolve()  // ✅ FIXED
    });
  });
}
```

---

### 3. **`prompt()` - Double Resolution Risk**

**File**: `dialogs.ts:160-164,178-188,200-204`

```typescript
// Line 160: Enter key handler
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const error = validateInput(inputValue);
    if (error) { /* ... */ return; }
    resolve(inputValue);  // ✅ First resolution
    modal.close('ok');
  }
});

// Line 178: OK button handler
{ 
  id: 'ok', 
  text: opts?.okText ?? config.get().i18n.ok, 
  variant: 'primary',
  closeOnClick: false,
  onClick: () => {
    const error = validateInput(inputValue);
    if (error) { /* ... */ return; }
    resolve(inputValue);  // ❌ Could be second resolution
    modal.close('ok');
  }
}

// Line 200: onClose handler
onClose: (result) => {
  if (result === 'esc' || result === 'backdrop') {
    resolve(null);  // ❌ Could be third resolution
  }
}
```

**Problem**: If user presses Enter, then immediately clicks OK (or vice versa), the promise could be resolved twice. Also, `modal.close('ok')` triggers `onClose` with `result='ok'`, which doesn't match the if condition, but subsequent ESC would still try to resolve.

**Impact**: While JavaScript promises ignore additional resolutions, this indicates unclear state management and could cause confusion or bugs in future modifications.

**Fix Required**: Add a flag to prevent double resolution:
```typescript
let resolved = false;
const safeResolve = (value: string | null) => {
  if (!resolved) {
    resolved = true;
    resolve(value);
  }
};

// Then use safeResolve() everywhere instead of resolve()
```

---

## 🟡 HIGH Priority Issues

### 4. **`defaultButtonId` Implementation Has Race Condition**

**File**: `modal.ts:101-132`

```typescript
renderFooter(inst, footer) {
  const btns: ButtonDef[] = options.buttons ?? [
    { id: "ok", text: i18n.ok, variant: "primary" },
  ];
  let defaultButton: HTMLButtonElement | null = null;
  
  for (const btn of btns) {
    const b = document.createElement("button");
    // ... setup button ...
    footer.appendChild(b);
    
    if (options.defaultButtonId && btn.id === options.defaultButtonId) {
      defaultButton = b;
    }
  }
  
  // ❌ PROBLEM: Modifying core.onOpen here is dangerous
  if (defaultButton) {
    const originalOnOpen = options.onOpen;
    core.onOpen = (ctx) => {
      if (originalOnOpen) originalOnOpen(ctx);
      setTimeout(() => defaultButton?.focus(), 100);
    };
  }
}
```

**Problem**: 
1. Modifying `core.onOpen` after it's been passed to `createSurface` - the reference might already be captured
2. The `originalOnOpen` is from `options.onOpen`, but `core.onOpen` might be different
3. No null check on `defaultButton` inside setTimeout (though `?.` handles it)

**Fix Required**: Focus should be handled in the main `createSurface` flow or passed as a callback.

---

### 5. **Button Validation Missing**

**File**: `dialogs.ts:20-38`

```typescript
export async function question(opts: QuestionOptions): Promise<{ id: string }> {
  const { message, buttons, onDismissal, ...modalOpts } = opts;
  // ❌ No validation: What if buttons array is empty?
  // ❌ No validation: What if buttons have duplicate IDs?
  // ❌ No validation: What if onDismissal matches no button ID?
  
  return new Promise((resolve) => {
    const m = open({
      content: message,
      buttons: buttons.map(b => ({ /* ... */ })),
      // ...
    });
  });
}
```

**Problem**: No validation of button array or IDs.

**Impact**: 
- Empty buttons array = modal with no buttons
- Duplicate button IDs = unpredictable behavior
- Invalid `onDismissal` = misleading button ID returned

**Fix Required**:
```typescript
export async function question(opts: QuestionOptions): Promise<{ id: string }> {
  const { message, buttons, onDismissal, ...modalOpts } = opts;
  
  // Validation
  if (!buttons || buttons.length === 0) {
    throw new Error('[PromptJS] question() requires at least one button');
  }
  
  const ids = buttons.map(b => b.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.warn('[PromptJS] Duplicate button IDs detected in question()');
  }
  
  if (onDismissal && !ids.includes(onDismissal)) {
    console.warn(`[PromptJS] onDismissal value "${onDismissal}" does not match any button ID`);
  }
  
  // ... rest of function
}
```

---

### 6. **Input Validation Edge Cases**

**File**: `dialogs.ts:90-108`

```typescript
const validateInput = (value: string): string | null => {
  if (opts?.required && !value.trim()) {
    return 'This field is required';
  }
  // ❌ minLength checked AFTER trim check but value hasn't been trimmed
  if (opts?.minLength && value.length < opts.minLength) {
    return `Minimum ${opts.minLength} characters required`;
  }
  // ❌ What if pattern is invalid regex?
  if (opts?.pattern) {
    const regex = new RegExp(opts.pattern);
    if (!regex.test(value)) {
      return 'Invalid format';
    }
  }
  // ❌ What if validator throws an exception?
  if (opts?.validator) {
    const result = opts.validator(value);
    if (result === false) return 'Invalid input';
    if (typeof result === 'string') return result;
  }
  return null;
};
```

**Problems**:
1. `minLength` checks original value length, not trimmed (inconsistent with `required`)
2. Invalid regex pattern will throw exception
3. User-provided validator could throw exception

**Fix Required**:
```typescript
const validateInput = (value: string): string | null => {
  const trimmed = value.trim();
  
  if (opts?.required && !trimmed) {
    return 'This field is required';
  }
  
  if (opts?.minLength && trimmed.length < opts.minLength) {
    return `Minimum ${opts.minLength} characters required`;
  }
  
  if (opts?.pattern) {
    try {
      const regex = new RegExp(opts.pattern);
      if (!regex.test(value)) {
        return 'Invalid format';
      }
    } catch (e) {
      console.error('[PromptJS] Invalid regex pattern:', opts.pattern);
      return 'Invalid format pattern';
    }
  }
  
  if (opts?.validator) {
    try {
      const result = opts.validator(value);
      if (result === false) return 'Invalid input';
      if (typeof result === 'string') return result;
    } catch (e) {
      console.error('[PromptJS] Validator threw exception:', e);
      return 'Validation error';
    }
  }
  
  return null;
};
```

---

## 🟢 MEDIUM Priority Issues

### 7. **Manager - Root Element Collision Handling**

**File**: `manager.ts:36-42`

```typescript
const existing = document.querySelector('.pj-portal') as HTMLElement;
if (existing && this.portal && existing !== this.portal) {
  existing.remove();
  this.portal = undefined!;
}
```

**Problem**: If an external library or code creates a `.pj-portal` element, it gets removed. This could break other code.

**Fix**: Use a more unique identifier or namespace.

---

### 8. **Modal Core - Animation Fallback Timeout Edge Case**

**File**: `modal-core.ts:453-460`

```typescript
window.setTimeout(tryDone, (animDur ?? 0) + 50);
```

**Problem**: If animations are disabled or interrupted, both `animationend` listeners AND the timeout will fire, calling `tryDone()` multiple times.

**Current Behavior**: The code has `doneModal` and `doneOverlay` flags, so multiple calls are safe. ✅ This is actually handled correctly!

---

### 9. **Toast - Element Removal Race Condition**

**File**: `toast.ts:262-275`

```typescript
function collapseAndRemove(container: HTMLElement, position: ToastPosition, durationMs: number, easing: string) {
  // ...
  const done = () => {
    container.removeEventListener("transitionend", done);
    container.remove();
    manager.onToastRemoved(position);
  };
  container.addEventListener("transitionend", done);
  window.setTimeout(done, durationMs + 50);
}
```

**Problem**: Both `transitionend` and `setTimeout` can call `done()`, which removes the event listener and element. Second call will fail.

**Current State**: Mostly safe due to early removal of listener, but could still have edge cases.

**Fix**: Add a guard flag:
```typescript
let removed = false;
const done = () => {
  if (removed) return;
  removed = true;
  container.removeEventListener("transitionend", done);
  container.remove();
  manager.onToastRemoved(position);
};
```

---

### 10. **Dragging - Touch Event Cleanup**

**File**: `modal-core.ts:121-127`

```typescript
const onUp = () => {
  moving = false;
  document.removeEventListener("mousemove", onMove, true);
  document.removeEventListener("touchmove", onMove, true);
  handleEl.style.cursor = spec.cursor || "grab";
};
```

**Problem**: Touch events are added with `{ passive: false, capture: true }` but removed with just `true`. This might cause cleanup to fail.

**Fix**:
```typescript
// Store options
const touchOpts = { passive: false, capture: true };

// Add with options
document.addEventListener("touchmove", onMove, touchOpts);

// Remove with same options
document.removeEventListener("touchmove", onMove, touchOpts);
```

---

### 11. **Sanitize - URL Validation Edge Cases**

**File**: `sanitize.ts:79-93`

```typescript
function isAllowedUrl(url: string): boolean {
  const t = url.trim();
  if (!t) return true;  // ❌ Empty href is allowed?
  if (t.startsWith('#') || t.startsWith('?') || t.startsWith('/')) return true;
  if (t.startsWith('./') || t.startsWith('../')) return true;

  try {
    const u = new URL(t, document.baseURI);
    const proto = u.protocol.toLowerCase();
    return proto === 'http:' || proto === 'https:' || proto === 'mailto:' || proto === 'tel:';
  } catch {
    return false;
  }
}
```

**Problem**: 
1. Empty href returns `true` (might be intentional)
2. `javascript:` URLs could slip through if they start with allowed prefixes
3. `data:` URLs are blocked (might want to allow data:text/plain)

**Fix**: Add more checks:
```typescript
function isAllowedUrl(url: string): boolean {
  const t = url.trim().toLowerCase();
  if (!t) return false;  // Block empty
  
  // Block dangerous protocols explicitly
  if (t.startsWith('javascript:') || t.startsWith('data:') || t.startsWith('vbscript:')) {
    return false;
  }
  
  // Allow safe relative/hash URLs
  if (t.startsWith('#') || t.startsWith('?') || t.startsWith('/')) return true;
  if (t.startsWith('./') || t.startsWith('../')) return true;

  try {
    const u = new URL(t, document.baseURI);
    const proto = u.protocol.toLowerCase();
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(proto);
  } catch {
    return false;
  }
}
```

---

## 🔵 LOW Priority Issues

### 12. **A11y - Focus Trap Edge Cases**

- No handling for dynamically added/removed tabbable elements while trap is active
- `details` element handling might not work in all browsers
- Could be more robust with MutationObserver

### 13. **Config - onChange Callbacks Memory Leak**

If `config.onChange()` callbacks are never cleaned up and new ones keep getting added, potential memory leak.

### 14. **Missing TypeScript Null Checks**

Several places use `!` assertions that could be safer with proper null checks.

---

## ✅ Things Done Well

1. **Animation Cleanup**: Proper timeout fallbacks for animation events
2. **Try-Catch Blocks**: Good defensive programming in teardown functions
3. **Sanitization**: Comprehensive HTML sanitization
4. **Accessibility**: Good ARIA support and focus management
5. **Concurrency**: Modal queue/reject system works well
6. **Memory Management**: Generally good cleanup of event listeners

---

## Recommendations

### Immediate Fixes (Critical):
1. ✅ Fix `question()` promise hanging issue
2. ✅ Fix `alert()` missing onClose handler  
3. ✅ Fix `prompt()` double resolution

### Short-term (High Priority):
4. Add button validation
5. Fix input validation edge cases
6. Review `defaultButtonId` implementation

### Long-term (Medium Priority):
7. Add comprehensive error boundaries
8. Improve event cleanup patterns
9. Add debug logging mode
10. Consider adding telemetry/monitoring hooks

### Testing Recommendations:
- Add unit tests for all dialog functions
- Test promise resolution in all dismissal scenarios
- Test rapid button clicking
- Test animation interruptions
- Test with various accessibility tools
- Test dragging edge cases (multi-touch, boundary conditions)

---

## Conclusion

The codebase is **generally well-structured** with good defensive programming practices. However, there are **3 critical promise resolution bugs** that could cause serious user experience issues. These should be fixed immediately.

The high and medium priority issues are edge cases that would improve robustness but are less likely to occur in normal usage.

**Overall Grade: B+** (Would be A- after fixing critical issues)
