// QWIZEN THEME INTEGRATION GUIDE
// How to sync PromptJS with your ThemeContext

// ============================================================================
// METHOD 1: Using usePromptJSThemeSync Hook (Recommended)
// ============================================================================

// In your App.tsx or root component:

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { usePromptJSThemeSync } from '@/lib/promptjs-react';

function AppContent() {
  const { theme } = useTheme(); // 'light' | 'dark' | 'auto'
  
  // This hook automatically syncs PromptJS theme when your theme changes
  usePromptJSThemeSync(theme as 'light' | 'dark' | 'auto');
  
  return <YourAppComponents />;
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

// ============================================================================
// METHOD 2: Manual Sync with useEffect
// ============================================================================

import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { setPromptJSTheme } from '@/lib/promptjs-react';

function App() {
  const { theme } = useTheme();
  
  useEffect(() => {
    setPromptJSTheme(theme as 'light' | 'dark' | 'auto');
  }, [theme]);
  
  return <YourAppComponents />;
}

// ============================================================================
// METHOD 3: Inside ThemeContext Provider (Advanced)
// ============================================================================

// In your ThemeContext.tsx:

import { setPromptJSTheme } from '@/lib/promptjs-react';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('auto');
  
  const changeTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setPromptJSTheme(newTheme); // Sync PromptJS automatically
  };
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================================================
// HANDLING CONTRAST MODE
// ============================================================================

// If your ThemeContext has both theme and contrast:
// export type ThemeMode = 'light' | 'dark' | 'auto';
// export type ContrastMode = 'normal' | 'high';

// You can ignore contrast for PromptJS or map it to theme:

import { usePromptJSThemeSync } from '@/lib/promptjs-react';

function App() {
  const { theme, contrast } = useTheme();
  
  // Option 1: Just sync theme, ignore contrast
  usePromptJSThemeSync(theme as 'light' | 'dark' | 'auto');
  
  // Option 2: If you want to handle high contrast
  // You could extend PromptJS with custom CSS classes based on contrast mode
  useEffect(() => {
    if (contrast === 'high') {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [contrast]);
  
  return <YourAppComponents />;
}

// ============================================================================
// COMPLETE SETUP EXAMPLE
// ============================================================================

// 1. In your main App.tsx:

import '@tlabsinc/promptjs-core';
import '@tlabsinc/promptjs-core/dist/promptjs.css';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { usePromptJSThemeSync } from '@/lib/promptjs-react';

function AppContent() {
  const { theme } = useTheme();
  usePromptJSThemeSync(theme as 'light' | 'dark' | 'auto');
  
  return (
    <Router>
      <Layout>
        <Routes />
      </Layout>
    </Router>
  );
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;

// 2. Now anywhere in your app, dialogs and toasts will match your theme!

import { useDialogs, useToast } from '@/lib/promptjs-react';

function MyComponent() {
  const { alert, confirm } = useDialogs();
  const toast = useToast();
  
  const handleAction = async () => {
    const confirmed = await confirm("Are you sure?", {
      kind: 'warning'
    });
    
    if (confirmed) {
      toast({ kind: 'success', message: 'Done!' });
    }
  };
  
  // Dialogs and toasts automatically match your current theme!
  return <button onClick={handleAction}>Do Something</button>;
}

// ============================================================================
// AVAILABLE EXPORTS FOR THEME MANAGEMENT
// ============================================================================

// From promptjs-react.ts:

export {
  // Hook for automatic theme sync
  usePromptJSThemeSync,
  
  // Function to manually set theme
  setPromptJSTheme,
  
  // Function to update any config (including theme)
  updatePromptJSConfig,
  
  // Type for theme
  type Theme, // 'light' | 'dark' | 'auto'
};

// Usage:
import { 
  usePromptJSThemeSync, 
  setPromptJSTheme, 
  type Theme 
} from '@/lib/promptjs-react';
