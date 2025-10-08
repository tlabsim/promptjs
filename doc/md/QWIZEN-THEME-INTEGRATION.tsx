// App.tsx - Qwizen Theme Integration Example

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { usePromptJSThemeSync } from '@/lib/promptjs-react';

// Import PromptJS core (do this once at app entry)
import '@tlabsinc/promptjs-core';
import '@tlabsinc/promptjs-core/dist/promptjs.css';

function AppContent() {
  const { theme } = useTheme(); // Get theme from your context
  
  // Automatically sync PromptJS theme with your app theme
  usePromptJSThemeSync(theme as 'light' | 'dark' | 'auto');
  
  return (
    <div>
      {/* Your app content */}
    </div>
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
