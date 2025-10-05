# Prompt Validation Fix - Prevent Modal Close on Error

## Issue

When validation fails in the prompt dialog, the modal was closing immediately after clicking the OK button, even though the error message was displayed.

## Root Cause

The modal button's `onClick` handler has a try-finally block:

```typescript
b.addEventListener("click", async () => {
  try {
    b.disabled = true;
    if (btn.onClick) await btn.onClick(inst);
  } finally {
    b.disabled = false;
    if (btn.closeOnClick ?? true) inst.close(btn.id); // ⚠️ Always executes
  }
});
```

Even if an error is thrown in the onClick handler, the `finally` block still executes and closes the modal.

## Solution

### Before (Incorrect)
```typescript
{
  id: 'ok',
  text: 'OK',
  variant: 'primary',
  // closeOnClick defaults to true
  onClick: () => {
    const error = validateInput(inputValue);
    if (error) {
      showError(error);
      throw new Error('Validation failed'); // ❌ Finally block still runs
    }
    resolve(inputValue);
  }
}
```

### After (Correct)
```typescript
{
  id: 'ok',
  text: 'OK',
  variant: 'primary',
  closeOnClick: false, // ✅ Prevent auto-close
  onClick: () => {
    const error = validateInput(inputValue);
    if (error) {
      showError(error);
      return; // ✅ Just return, don't close
    }
    // Validation passed
    resolve(inputValue);
    modal.close('ok'); // ✅ Manually close
  }
}
```

## Changes Made

### 1. OK Button Configuration
- Set `closeOnClick: false` to prevent automatic closing
- Manually call `modal.close('ok')` only when validation passes

### 2. Cancel Button Configuration
- Explicitly set `closeOnClick: true` for clarity
- Keeps default behavior (closes immediately)

### 3. Enter Key Handler
- Updated to manually resolve and close when validation passes
- Maintains consistency with OK button behavior

## Code Flow

### Successful Validation
```
User clicks OK
  ↓
Validation passes
  ↓
resolve(inputValue)
  ↓
modal.close('ok')
  ↓
Modal closes ✅
```

### Failed Validation
```
User clicks OK
  ↓
Validation fails
  ↓
Show error message
  ↓
Add error class
  ↓
return (early exit)
  ↓
Modal stays open ✅
```

## Updated Implementation

```typescript
export async function prompt(
  message: string,
  defaultValue?: string,
  opts?: Partial<import('./types').PromptOptions>
): Promise<string | null> {
  return new Promise((resolve) => {
    let inputValue = defaultValue ?? '';
    let errorEl: HTMLElement | null = null;

    const validateInput = (value: string): string | null => {
      if (opts?.required && !value.trim()) {
        return 'This field is required';
      }
      if (opts?.pattern) {
        const regex = new RegExp(opts.pattern);
        if (!regex.test(value)) {
          return 'Invalid format';
        }
      }
      if (opts?.validator) {
        const result = opts.validator(value);
        if (result === false) return 'Invalid input';
        if (typeof result === 'string') return result;
      }
      return null;
    };

    // ... setup input elements ...

    // Enter key handler
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const error = validateInput(inputValue);
        if (error) {
          if (errorEl) {
            errorEl.textContent = error;
            inputEl.classList.add('error');
          }
          return; // Don't close
        }
        resolve(inputValue);
        modal.close('ok'); // Manually close
      }
    });

    const modal = open({
      buttons: [
        { 
          id: 'cancel',
          text: 'Cancel',
          variant: 'neutral',
          closeOnClick: true, // Auto-close on cancel
          onClick: () => resolve(null)
        },
        { 
          id: 'ok',
          text: 'OK',
          variant: 'primary',
          closeOnClick: false, // Don't auto-close
          onClick: () => {
            const error = validateInput(inputValue);
            if (error) {
              if (errorEl) {
                errorEl.textContent = error;
                inputEl.classList.add('error');
              }
              return; // Don't close
            }
            resolve(inputValue);
            modal.close('ok'); // Manually close
          }
        }
      ],
      // ...
    });
  });
}
```

## Testing Scenarios

### Scenario 1: Empty Required Field
```typescript
const name = await prompt("Name:", "", { required: true });
```
1. Click OK without entering text
2. ✅ Error shown: "This field is required"
3. ✅ Modal stays open
4. Enter text and click OK
5. ✅ Modal closes with value

### Scenario 2: Pattern Validation
```typescript
const email = await prompt("Email:", "", {
  pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
});
```
1. Enter "invalid-email"
2. Click OK
3. ✅ Error shown: "Invalid format"
4. ✅ Modal stays open
5. Enter "user@example.com"
6. Click OK
7. ✅ Modal closes with value

### Scenario 3: Custom Validator
```typescript
const username = await prompt("Username:", "", {
  validator: (value) => {
    if (value.length < 3) return "Too short";
    if (value === "admin") return "Reserved";
    return true;
  }
});
```
1. Enter "ab"
2. Click OK
3. ✅ Error shown: "Too short"
4. ✅ Modal stays open
5. Enter "admin"
6. Click OK
7. ✅ Error shown: "Reserved"
8. ✅ Modal stays open
9. Enter "john"
10. Click OK
11. ✅ Modal closes with value

### Scenario 4: Cancel Button
```typescript
const name = await prompt("Name:");
```
1. Click Cancel
2. ✅ Modal closes immediately
3. ✅ Returns null

### Scenario 5: ESC Key
```typescript
const name = await prompt("Name:");
```
1. Press ESC
2. ✅ Modal closes immediately
3. ✅ Returns null

### Scenario 6: Enter Key
```typescript
const name = await prompt("Name:", "", { required: true });
```
1. Press Enter without text
2. ✅ Error shown
3. ✅ Modal stays open
4. Enter text and press Enter
5. ✅ Modal closes with value

## Benefits

1. ✅ **Intuitive UX** - Modal only closes on successful submission
2. ✅ **Clear Feedback** - Error message displayed with modal open
3. ✅ **Consistent Behavior** - OK button and Enter key work the same
4. ✅ **User Friendly** - No need to reopen modal and re-enter data
5. ✅ **Form Pattern** - Matches standard form validation UX

## Summary

- **Problem**: Modal closed even when validation failed
- **Cause**: `closeOnClick` defaulted to `true` and `finally` block always executed
- **Solution**: Set `closeOnClick: false` and manually close only on success
- **Result**: Modal stays open when validation fails, closes when validation passes

This fix makes the prompt behavior match user expectations and standard form validation patterns! ✅
