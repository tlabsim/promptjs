# Centralized PromptJS Configuration Guide

## Problem Statement

Managing PromptJS configuration across multiple pages is tedious:
- Need to call `config.update()` on every page
- Risk of inconsistent configurations
- Duplicated code

## Solution: Centralized Configuration Patterns

Since browsers cannot auto-load config files like Node.js can, we provide three practical patterns for centralized configuration.

---

## Solution 1: ES Module Initialization File (Recommended for Modern Apps)

### Step 1: Create `promptjs-init.js`

**Location:** `src/lib/promptjs-init.js` or `public/js/promptjs-init.js`

```javascript
import { config, alert, confirm, prompt, Modal, toast, question } from '@tlabsinc/promptjs-core';
import '@tlabsinc/promptjs-core/dist/promptjs.css';

// ============================================
// CENTRALIZED CONFIGURATION
// Edit this once, applies to all pages
// ============================================
config.update({
  // Theme
  theme: 'auto', // 'light' | 'dark' | 'auto'
  
  // Z-index base
  zIndexBase: 2000,
  
  // Animation
  animation: {
    enable: true,
    durationMs: 200,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
  },
  
  // Internationalization
  i18n: {
    locale: 'en',
    dir: 'auto',
    ok: 'OK',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    dismiss: 'Dismiss',
    titles: {
      info: 'Information',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
      question: 'Question'
    }
  },
  
  // Modal defaults
  modal: {
    concurrency: 'queue', // 'queue' | 'reject'
    surfaceAlpha: 1,
    dialogBlurPx: 0
  },
  
  // Toast defaults
  toast: {
    defaultPosition: 'top-right',
    behavior: 'stack',
    maxVisible: 3,
    defaultTimeoutMs: 4000,
    defaultDismissible: true
  }
});

// Re-export configured APIs
export { alert, confirm, prompt, Modal, toast, question, config };
```

### Step 2: Use in Any Page

```javascript
// Import from your configured init file
import { alert, confirm, prompt } from './lib/promptjs-init.js';

// Use directly - already configured!
async function myFunction() {
  await alert("Hello!");
  const ok = await confirm("Sure?");
  const name = await prompt("Name?");
}
```

**Benefits:**
- ✅ Single configuration point
- ✅ Type-safe imports
- ✅ Tree-shakeable
- ✅ Works with bundlers (Vite, Webpack, etc.)

---

## Solution 2: Global UMD Configuration (For Vanilla HTML/Laravel)

### Step 1: Create `promptjs-configured.js`

**Location:** `public/js/promptjs-configured.js`

```javascript
(function() {
  // Load PromptJS
  const script = document.createElement('script');
  script.src = '/js/promptjs/index.global.js';
  script.onload = function() {
    if (!window.PromptJS) return;
    
    // ============================================
    // CENTRALIZED CONFIGURATION
    // Edit this once, applies to all pages
    // ============================================
    window.PromptJS.config.update({
      theme: 'auto',
      animation: {
        enable: true,
        durationMs: 200
      },
      toast: {
        defaultPosition: 'top-right',
        defaultTimeoutMs: 4000
      },
      modal: {
        concurrency: 'queue'
      }
    });
    
    // Create convenient global alias
    window.PJ = {
      alert: window.PromptJS.alert,
      confirm: window.PromptJS.confirm,
      prompt: window.PromptJS.prompt,
      Modal: window.PromptJS.Modal,
      toast: window.PromptJS.toast,
      question: window.PromptJS.question,
      config: window.PromptJS.config
    };
    
    // Dispatch ready event
    document.dispatchEvent(new Event('promptjs:ready'));
  };
  
  document.head.appendChild(script);
  
  // Load CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/css/promptjs.css';
  document.head.appendChild(link);
})();
```

### Step 2: Use in Any HTML Page

```html
<!DOCTYPE html>
<html>
<head>
  <script src="/js/promptjs-configured.js"></script>
</head>
<body>
  <button onclick="handleClick()">Click Me</button>
  
  <script>
    // Wait for PromptJS to be ready
    document.addEventListener('promptjs:ready', function() {
      console.log('PromptJS configured and ready!');
    });
    
    async function handleClick() {
      // Use pre-configured PJ
      await PJ.alert("Hello!");
      const ok = await PJ.confirm("Delete?");
      if (ok) {
        PJ.toast({ kind: 'success', message: 'Deleted!' });
      }
    }
  </script>
</body>
</html>
```

**Benefits:**
- ✅ No bundler required
- ✅ Works in vanilla HTML
- ✅ Single include for all pages
- ✅ Simple setup

---

## Solution 3: Laravel Blade Component (Best for Laravel)

### Step 1: Create Blade Component

**Location:** `resources/views/components/promptjs.blade.php`

```blade
@once
{{-- Load PromptJS assets --}}
<link rel="stylesheet" href="{{ asset('css/promptjs.css') }}">
<script src="{{ asset('js/promptjs/index.global.js') }}"></script>

<script>
  // Wait for PromptJS to load
  (function() {
    function initPromptJS() {
      if (!window.PromptJS) {
        setTimeout(initPromptJS, 50);
        return;
      }
      
      // ============================================
      // CENTRALIZED CONFIGURATION
      // Uses Laravel config system
      // ============================================
      window.PromptJS.config.update({
        theme: '{{ config('promptjs.theme', 'auto') }}',
        zIndexBase: {{ config('promptjs.zIndexBase', 2000) }},
        animation: {
          enable: {{ config('promptjs.animation.enable', 'true') }},
          durationMs: {{ config('promptjs.animation.duration', 200) }},
          easing: '{{ config('promptjs.animation.easing', 'ease') }}'
        },
        i18n: {
          locale: '{{ config('promptjs.i18n.locale', 'en') }}',
          ok: '{{ __('promptjs.ok') }}',
          cancel: '{{ __('promptjs.cancel') }}',
          yes: '{{ __('promptjs.yes') }}',
          no: '{{ __('promptjs.no') }}',
          close: '{{ __('promptjs.close') }}',
          dismiss: '{{ __('promptjs.dismiss') }}'
        },
        modal: {
          concurrency: '{{ config('promptjs.modal.concurrency', 'queue') }}'
        },
        toast: {
          defaultPosition: '{{ config('promptjs.toast.position', 'top-right') }}',
          defaultTimeoutMs: {{ config('promptjs.toast.timeout', 4000) }},
          behavior: '{{ config('promptjs.toast.behavior', 'stack') }}'
        }
      });
      
      // Create global alias
      window.PJ = {
        alert: window.PromptJS.alert,
        confirm: window.PromptJS.confirm,
        prompt: window.PromptJS.prompt,
        Modal: window.PromptJS.Modal,
        toast: window.PromptJS.toast,
        question: window.PromptJS.question,
        config: window.PromptJS.config
      };
      
      // Mark as ready
      window.PJ.ready = true;
      document.dispatchEvent(new Event('promptjs:ready'));
    }
    
    initPromptJS();
  })();
</script>
@endonce
```

### Step 2: Create Laravel Config File

**Location:** `config/promptjs.php`

```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Theme
    |--------------------------------------------------------------------------
    | Options: 'light', 'dark', 'auto'
    */
    'theme' => env('PROMPTJS_THEME', 'auto'),
    
    /*
    |--------------------------------------------------------------------------
    | Z-Index Base
    |--------------------------------------------------------------------------
    */
    'zIndexBase' => 2000,
    
    /*
    |--------------------------------------------------------------------------
    | Animation Settings
    |--------------------------------------------------------------------------
    */
    'animation' => [
        'enable' => true,
        'duration' => 200,
        'easing' => 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Internationalization
    |--------------------------------------------------------------------------
    */
    'i18n' => [
        'locale' => config('app.locale', 'en'),
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Modal Settings
    |--------------------------------------------------------------------------
    */
    'modal' => [
        'concurrency' => 'queue', // 'queue' or 'reject'
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Toast Settings
    |--------------------------------------------------------------------------
    */
    'toast' => [
        'position' => 'top-right',
        'timeout' => 4000,
        'behavior' => 'stack',
    ],
];
```

### Step 3: Create Language File (Optional)

**Location:** `resources/lang/en/promptjs.php`

```php
<?php

return [
    'ok' => 'OK',
    'cancel' => 'Cancel',
    'yes' => 'Yes',
    'no' => 'No',
    'close' => 'Close',
    'dismiss' => 'Dismiss',
];
```

### Step 4: Add to Layout

**Location:** `resources/views/layouts/app.blade.php`

```blade
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title')</title>
    
    {{-- Include PromptJS Component --}}
    <x-promptjs />
</head>
<body>
    @yield('content')
</body>
</html>
```

### Step 5: Use in Any Blade View

```blade
@extends('layouts.app')

@section('content')
  <div class="container">
    <button onclick="handleDelete()">Delete</button>
  </div>
  
  <script>
    async function handleDelete() {
      // Use pre-configured PJ
      const confirmed = await PJ.confirm('Delete this item?');
      if (confirmed) {
        // Delete logic here
        PJ.toast({ kind: 'success', message: 'Item deleted!' });
      }
    }
  </script>
@endsection
```

**Benefits:**
- ✅ Laravel config integration
- ✅ Environment-aware (.env support)
- ✅ Multi-language support
- ✅ Include once in layout
- ✅ Works in all views

---

## Advanced: Dynamic Configuration Per Environment

### `.env` Configuration

```env
# Development
PROMPTJS_THEME=auto
PROMPTJS_ANIMATION_DURATION=200

# Production
PROMPTJS_THEME=light
PROMPTJS_ANIMATION_DURATION=150
```

### Access in Blade

```blade
<x-promptjs />
```

The component automatically reads from `.env` via Laravel config!

---

## Summary

| Pattern | Best For | Setup Complexity | Flexibility |
|---------|----------|------------------|-------------|
| **ES Module Init** | Modern SPAs, Vite, React | Low | High |
| **UMD Global** | Vanilla HTML, Simple Sites | Very Low | Medium |
| **Laravel Blade** | Laravel Projects | Medium | Very High |

### Recommendation

- **Laravel Project** → Use Solution 3 (Blade Component)
- **Modern Framework** → Use Solution 1 (ES Module)
- **Simple/Legacy** → Use Solution 2 (UMD Global)

All three solutions achieve the same goal: **Edit configuration once, applies everywhere!** ✅
