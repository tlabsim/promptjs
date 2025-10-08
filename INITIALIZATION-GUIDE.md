# PromptJS React - Initialization Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install @tlabsinc/promptjs-core @tlabsinc/promptjs-react
```

### 2. Initialize in App Entry Point

```tsx
// App.tsx or main.tsx or _app.tsx (Next.js)

import '@tlabsinc/promptjs-core';
import '@tlabsinc/promptjs-core/dist/promptjs.css';
import { initializePromptJS } from './promptjs-react';

// Initialize with custom configuration
initializePromptJS({
  theme: 'auto',
  animation: {
    enable: true,
    durationMs: 250
  },
  modal: {
    closeOnEsc: true,
    closeOnBackdrop: true,
    draggable: true
  },
  toast: {
    defaultPosition: 'top-right',
    defaultTimeoutMs: 3000,
    behavior: 'stack'
  }
});

function App() {
  return <YourApp />;
}
```

### 3. Use Anywhere

```tsx
// Any component
import { useDialogs, useToast } from './promptjs-react';

function MyComponent() {
  const { alert, confirm } = useDialogs();
  const toast = useToast();

  const handleAction = async () => {
    const confirmed = await confirm("Are you sure?");
    if (confirmed) {
      toast({ kind: 'success', message: 'Done!' });
    }
  };
}
```

---

## Initialization Function API

### `initializePromptJS(config?, options?)`

Initialize PromptJS with custom configuration.

#### Parameters

**`config?: PartialPromptJSConfig`**
- Optional configuration object
- If omitted, uses PromptJS defaults

**`options?: InitializationOptions`**
```typescript
{
  verbose?: boolean;    // Show console message (default: true)
  brandName?: string;   // Custom brand for console message (default: 'PromptJS React')
}
```

#### Returns
`void`

---

## Configuration Options

### Complete Configuration Interface

```typescript
interface PromptJSConfig {
  // Theme
  theme: 'light' | 'dark' | 'auto';
  
  // Base z-index
  zIndexBase: number;
  
  // Animation settings
  animation: {
    enable: boolean;
    durationMs: number;
    easing: string;
  };
  
  // Overlay/backdrop
  overlay: {
    fade: boolean;
    surfaceAlpha: number;      // 0-1
    backdropBlurPx: number;
  };
  
  // Modal defaults
  modal: {
    concurrency: 'queue' | 'reject';
    surfaceAlpha: number;      // 0-1
    dialogBlurPx: number;
    closeOnEsc: boolean;
    closeOnBackdrop: boolean;
    trapFocus: boolean;
    showClose: boolean;
    draggable: boolean | ModalDraggable;
  };
  
  // Toast defaults
  toast: {
    defaultPosition: ToastPosition;
    behavior: 'stack' | 'queue' | 'replace';
    maxVisible: number;
    defaultTimeoutMs: number;
    defaultDismissible: boolean;
    spacingPx: number;
    zBoost: number;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    animations: ToastAnimations;
  };
  
  // Internationalization
  i18n: {
    locale: string;
    dir: 'ltr' | 'rtl' | 'auto';
    ok: string;
    cancel: string;
    yes: string;
    no: string;
    close: string;
    dismiss: string;
    titles: {
      info: string;
      success: string;
      warning: string;
      error: string;
      question: string;
    };
  };
  
  // Accessibility
  a11y: {
    ariaModalLabel: string;
  };
  
  // Responsive breakpoints
  breakpoints: {
    sm: number;
    md: number;
    lg: number;
  };
  
  // Container element
  container: HTMLElement | null;
}
```

---

## Usage Examples

### Example 1: Minimal Setup

```tsx
import { initializePromptJS } from './promptjs-react';

// Use all defaults
initializePromptJS();
```

### Example 2: Custom Theme Only

```tsx
import { initializePromptJS } from './promptjs-react';

initializePromptJS({
  theme: 'dark'
});
```

### Example 3: Custom Branding

```tsx
import { initializePromptJS } from './promptjs-react';

initializePromptJS({
  theme: 'auto',
  i18n: {
    locale: 'en',
    ok: 'Got it',
    cancel: 'Nevermind',
    yes: 'Absolutely',
    no: 'Not now'
  }
}, {
  brandName: 'My App',
  verbose: true
});

// Console: ✅ My App initialized
```

### Example 4: Full Custom Configuration

```tsx
import { initializePromptJS } from './promptjs-react';

initializePromptJS({
  theme: 'dark',
  zIndexBase: 10000,
  
  animation: {
    enable: true,
    durationMs: 250,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  overlay: {
    fade: true,
    surfaceAlpha: 0.8,
    backdropBlurPx: 4
  },
  
  modal: {
    concurrency: 'queue',
    surfaceAlpha: 1,
    dialogBlurPx: 0,
    closeOnEsc: true,
    closeOnBackdrop: false,
    trapFocus: true,
    showClose: true,
    draggable: {
      handle: 'header',
      axis: 'both',
      withinViewport: true,
      disableOnMobile: true
    }
  },
  
  toast: {
    defaultPosition: 'top-right',
    behavior: 'stack',
    maxVisible: 5,
    defaultTimeoutMs: 4000,
    defaultDismissible: true,
    spacingPx: 12,
    zBoost: 10,
    margins: {
      top: 16,
      bottom: 16,
      left: 16,
      right: 16
    },
    animations: {
      enter: {
        preset: 'slide',
        direction: 'down',
        distance: 100,
        durationMs: 300,
        easing: 'ease-out'
      },
      exit: {
        preset: 'fade',
        durationMs: 200,
        easing: 'ease-in'
      },
      timeoutCue: {
        show: true,
        position: 'bottom',
        direction: 'shrink',
        thicknessPx: 3
      }
    }
  },
  
  i18n: {
    locale: 'en',
    dir: 'ltr',
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
  
  a11y: {
    ariaModalLabel: 'Dialog'
  },
  
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024
  }
}, {
  brandName: 'My Awesome App',
  verbose: true
});
```

### Example 5: Environment-Based Configuration

```tsx
import { initializePromptJS } from './promptjs-react';

const isDevelopment = process.env.NODE_ENV === 'development';

initializePromptJS({
  theme: 'auto',
  animation: {
    enable: !isDevelopment, // Disable animations in dev for faster testing
    durationMs: isDevelopment ? 0 : 250
  },
  toast: {
    defaultPosition: 'top-right',
    defaultTimeoutMs: isDevelopment ? 10000 : 3000 // Longer in dev
  }
}, {
  verbose: isDevelopment
});
```

### Example 6: Multi-Language Support

```tsx
import { initializePromptJS } from './promptjs-react';

const userLocale = navigator.language.startsWith('es') ? 'es' : 'en';

const i18nConfig = {
  en: {
    locale: 'en',
    dir: 'ltr' as const,
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
  es: {
    locale: 'es',
    dir: 'ltr' as const,
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
  }
};

initializePromptJS({
  i18n: i18nConfig[userLocale]
});
```

---

## Configuration Helpers

### `getPromptJSConfig()`

Get the current configuration.

```typescript
import { getPromptJSConfig } from './promptjs-react';

const config = getPromptJSConfig();
console.log('Current theme:', config.theme);
console.log('Animation enabled:', config.animation.enable);
```

### `updatePromptJSConfig(config)`

Update configuration after initialization.

```typescript
import { updatePromptJSConfig } from './promptjs-react';

// Change theme dynamically
updatePromptJSConfig({ theme: 'dark' });

// Update multiple settings
updatePromptJSConfig({
  theme: 'dark',
  animation: { durationMs: 300 },
  toast: { defaultPosition: 'bottom-right' }
});
```

---

## Common Patterns

### Pattern 1: Theme Switcher

```tsx
import { useState, useEffect } from 'react';
import { getPromptJSConfig, updatePromptJSConfig } from './promptjs-react';

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    setTheme(getPromptJSConfig().theme);
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    updatePromptJSConfig({ theme: newTheme });
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <select value={theme} onChange={(e) => handleThemeChange(e.target.value as any)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="auto">Auto</option>
    </select>
  );
}
```

### Pattern 2: Load Config from localStorage

```tsx
import { initializePromptJS } from './promptjs-react';

const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' || 'auto';
const savedConfig = localStorage.getItem('promptjs-config');

initializePromptJS({
  theme: savedTheme,
  ...(savedConfig ? JSON.parse(savedConfig) : {})
});
```

### Pattern 3: React Context for Configuration

```tsx
import { createContext, useContext, useState } from 'react';
import { updatePromptJSConfig, type Theme } from './promptjs-react';

interface ConfigContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('auto');

  const handleSetTheme = (newTheme: Theme) => {
    updatePromptJSConfig({ theme: newTheme });
    setTheme(newTheme);
  };

  return (
    <ConfigContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used within ConfigProvider');
  return context;
}
```

---

## Troubleshooting

### Issue: "PromptJS core library not found"

**Problem:**
```
[PromptJS] PromptJS core library not found. 
Make sure to import @tlabsinc/promptjs-core before calling initializePromptJS().
```

**Solution:**
```tsx
// ✅ Import core BEFORE calling initializePromptJS
import '@tlabsinc/promptjs-core';
import '@tlabsinc/promptjs-core/dist/promptjs.css';
import { initializePromptJS } from './promptjs-react';

initializePromptJS({ /* config */ });
```

### Issue: "Cannot initialize: window is undefined"

**Problem:**
You're calling `initializePromptJS()` during SSR (Server-Side Rendering).

**Solution:**
```tsx
// Next.js App Router
'use client'; // Mark as client component

import { useEffect } from 'react';
import { initializePromptJS } from './promptjs-react';

export default function App() {
  useEffect(() => {
    // Initialize only on client
    initializePromptJS({ /* config */ });
  }, []);

  return <YourApp />;
}
```

### Issue: Configuration not applied

**Problem:**
Configuration update doesn't seem to work.

**Solution:**
```tsx
// ❌ Wrong: Trying to update before core is loaded
updatePromptJSConfig({ theme: 'dark' });

// ✅ Correct: Wait for component mount
useEffect(() => {
  updatePromptJSConfig({ theme: 'dark' });
}, []);
```

---

## Summary

✅ **Three exported functions:**
- `initializePromptJS(config?, options?)` - Initialize with custom config
- `getPromptJSConfig()` - Get current configuration
- `updatePromptJSConfig(config)` - Update configuration

✅ **Call once at app entry point**

✅ **Fully typed** - Complete IntelliSense support

✅ **Flexible** - Use defaults or customize everything

✅ **Safe** - Handles SSR, missing core, errors gracefully

**Get started in 3 lines:**
```tsx
import { initializePromptJS } from './promptjs-react';

initializePromptJS({ theme: 'dark' });
```

That's it! 🚀
