import * as React from "react";
import {
  config,
  Modal,
  toast,
  alert,
  confirm,
  question,
  i18n,
  version
} from "@tlabsinc/promptjs-core";
import type { PromptContextValue, PromptProviderProps, PromptTheme } from "./types";

const hasWindow = () => typeof window !== "undefined";

const Ctx = React.createContext<PromptContextValue | null>(null);

export const PromptProvider: React.FC<PromptProviderProps> = ({
  children,
  theme = "auto",
  scope = false,
  zIndexBase = 2000
}) => {
  const hostRef = React.useRef<HTMLDivElement | null>(null);

  // Keep PromptJS theme synced with prop
  React.useEffect(() => {
    if (!hasWindow()) return;
    config.update({ theme });
  }, [theme]);

  // Optionally scope PromptJS portals to this provider’s subtree
  React.useEffect(() => {
    if (!hasWindow()) return;

    if (scope) {
      const host = hostRef.current!;
      const prev = config.get();
      config.update({ container: host, zIndexBase });
      return () => {
        // restore previous container and zIndexBase on unmount
        config.update({ container: null, zIndexBase: prev.zIndexBase });
      };
    }
    // if not scoped, nothing to manage
    return;
  }, [scope, zIndexBase]);

  const value = React.useMemo<PromptContextValue>(
    () => ({ config, Modal, toast, alert, confirm, question, i18n, version }),
    []
  );

  // Always render a wrapper div so `scope` can be toggled without remounting children.
  return (
    <Ctx.Provider value={value}>
      <div ref={hostRef} style={scope ? { position: "relative" } : undefined}>
        {children}
      </div>
    </Ctx.Provider>
  );
};

export function usePrompt(): PromptContextValue {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    // Allow hooks to work without a provider by returning the core API directly.
    // This keeps usage friction very low.
    return { config, Modal, toast, alert, confirm, question, i18n, version };
  }
  return ctx;
}
