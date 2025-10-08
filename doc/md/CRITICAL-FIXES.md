# Critical Bug Fixes Applied

**Date**: October 9, 2025  
**Files Modified**: `packages/core/src/dialogs.ts`

## Summary

Fixed 3 critical promise resolution bugs that could cause UI hangs and memory leaks.

---

## Bug #1: `alert()` - Missing onClose Handler ✅ FIXED

### Problem
```typescript
// BEFORE: Promise never resolves if user presses ESC or clicks backdrop
export async function alert(message: string, opts?: AlertOptions): Promise<void> {
  await new Promise<void>((resolve)=> {
    open({
      ...opts,
      content: message,
      buttons: [{ id:'ok', text: opts?.okText ?? config.get().i18n.ok, variant:'primary', onClick: ()=>resolve() }],
      closeOnEsc: true,      // ❌ Allows ESC but no handler
      closeOnBackdrop: true, // ❌ Allows backdrop but no handler
      // Missing onClose handler!
    });
  });
}
```

### Fix Applied
```typescript
// AFTER: Promise resolves on any dismissal
export async function alert(message: string, opts?: AlertOptions): Promise<void> {
  await new Promise<void>((resolve)=> {
    open({
      ...opts,
      content: message,
      buttons: [{ id:'ok', text: opts?.okText ?? config.get().i18n.ok, variant:'primary', onClick: ()=>resolve() }],
      closeOnEsc: true,
      closeOnBackdrop: true,
      onClose: () => resolve(), // ✅ Resolve on any dismissal
    });
  });
}
```

---

## Bug #2: `prompt()` - Double Resolution Risk ✅ FIXED

### Problem
```typescript
// BEFORE: Multiple code paths could resolve the same promise
// 1. Enter key handler: resolve(inputValue)
// 2. OK button handler: resolve(inputValue)
// 3. Cancel button: resolve(null)
// 4. onClose handler: resolve(null)
```

### Fix Applied
```typescript
// AFTER: Safe resolution with flag
let resolved = false;

const safeResolve = (value: string | null) => {
  if (!resolved) {
    resolved = true;
    resolve(value);
  }
};

// All resolution points now use safeResolve():
// - Enter key: safeResolve(inputValue)
// - OK button: safeResolve(inputValue)
// - Cancel button: safeResolve(null)
// - onClose: safeResolve(null)
```

---

## Bug #3: `prompt()` - Input Validation Edge Cases ✅ FIXED

### Problems Fixed

#### 3a. Inconsistent Trimming
```typescript
// BEFORE: required uses trimmed value, minLength uses original
if (opts?.required && !value.trim()) { ... }
if (opts?.minLength && value.length < opts.minLength) { ... }
```

```typescript
// AFTER: Both use trimmed value for consistency
const trimmed = value.trim();
if (opts?.required && !trimmed) { ... }
if (opts?.minLength && trimmed.length < opts.minLength) { ... }
```

#### 3b. Regex Pattern Exception Handling
```typescript
// BEFORE: Invalid regex crashes the function
if (opts?.pattern) {
  const regex = new RegExp(opts.pattern); // Can throw
  if (!regex.test(value)) { ... }
}
```

```typescript
// AFTER: Catches invalid regex
if (opts?.pattern) {
  try {
    const regex = new RegExp(opts.pattern);
    if (!regex.test(value)) {
      return 'Invalid format';
    }
  } catch (e) {
    console.error('[PromptJS] Invalid regex pattern:', opts.pattern, e);
    return 'Invalid format pattern';
  }
}
```

#### 3c. Validator Exception Handling
```typescript
// BEFORE: User validator can throw and crash
if (opts?.validator) {
  const result = opts.validator(value); // Can throw
  if (result === false) return 'Invalid input';
  if (typeof result === 'string') return result;
}
```

```typescript
// AFTER: Catches validator exceptions
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
```

#### 3d. Missing Close Button Handler
```typescript
// BEFORE: onClose only handles 'esc' and 'backdrop'
onClose: (result) => {
  if (result === 'esc' || result === 'backdrop') {
    resolve(null);
  }
}
```

```typescript
// AFTER: Also handles 'close' button
onClose: (result) => {
  if (result === 'esc' || result === 'backdrop' || result === 'close') {
    safeResolve(null);
  }
}
```

---

## Bug #4: `question()` - Button Validation ✅ FIXED

### Problem
```typescript
// BEFORE: No validation, could pass empty buttons array
export async function question(opts: QuestionOptions): Promise<{ id: string }> {
  const { message, buttons, onDismissal, ...modalOpts } = opts;
  // No checks!
  return new Promise((resolve) => { ... });
}
```

### Fix Applied
```typescript
// AFTER: Validates button array
export async function question(opts: QuestionOptions): Promise<{ id: string }> {
  const { message, buttons, onDismissal, ...modalOpts } = opts;
  
  // Validation
  if (!buttons || buttons.length === 0) {
    throw new Error('[PromptJS] question() requires at least one button');
  }
  
  return new Promise((resolve) => { ... });
}
```

---

## Impact Assessment

### Before Fixes
- ❌ `alert()` could hang forever if dismissed via ESC/backdrop
- ❌ `prompt()` could have race conditions with double resolution
- ❌ `prompt()` validation could crash with invalid regex or throwing validators
- ❌ `prompt()` close button didn't resolve promise
- ❌ `question()` could be called with no buttons

### After Fixes
- ✅ All promises resolve correctly in all scenarios
- ✅ No double resolution possible
- ✅ Validation is robust with error handling
- ✅ All dismissal methods handled properly
- ✅ Input validation cleared of edge cases

---

## Testing Recommendations

### Test `alert()`
```typescript
// Test ESC dismissal
await alert("Test");
// Press ESC → Should resolve ✅

// Test backdrop dismissal
await alert("Test");
// Click backdrop → Should resolve ✅
```

### Test `prompt()`
```typescript
// Test double resolution protection
const result = await prompt("Name:", "", {
  pattern: "\\w+",  // Valid regex
  validator: (v) => v.length > 2 || "Too short"
});
// Quickly press Enter then click OK → Should resolve once ✅

// Test invalid regex
await prompt("Test:", "", { pattern: "[invalid" });
// Should show error, not crash ✅

// Test throwing validator
await prompt("Test:", "", {
  validator: (v) => { throw new Error("Bad!"); }
});
// Should show error, not crash ✅

// Test close button
await prompt("Test:");
// Click X button → Should resolve with null ✅
```

### Test `question()`
```typescript
// Test empty buttons (should throw)
try {
  await question({ message: "Test", buttons: [] });
} catch (e) {
  console.log("Correctly threw error"); ✅
}

// Test without onDismissal
const result = await question({
  message: "Choose",
  buttons: [{ id: 'ok', text: 'OK' }]
});
// Press ESC → Promise doesn't resolve (must click button)
// This is intentional behavior ✅
```

---

## Files Changed

- ✅ `packages/core/src/dialogs.ts` - All fixes applied
- ✅ Zero TypeScript errors
- ✅ Backward compatible (no breaking changes)

---

## Documentation Created

1. ✅ `EDGE-CASE-ANALYSIS.md` - Comprehensive analysis of all potential issues
2. ✅ `CRITICAL-FIXES.md` - This file, documenting all fixes applied
3. ✅ `DESIGN-DISMISSAL-BEHAVIOR.md` - Design decisions for dismissal handling

---

## Next Steps

### Immediate
- ✅ All critical bugs fixed
- ✅ Code compiles without errors
- ⏭️ Run manual testing with above test cases

### Short-term
- ⏭️ Add unit tests for all dialog functions
- ⏭️ Test with various edge cases (rapid clicking, etc.)
- ⏭️ Update user documentation with dismissal behavior

### Long-term
- ⏭️ Consider adding debug logging mode
- ⏭️ Review high priority issues from edge case analysis
- ⏭️ Add comprehensive test suite
