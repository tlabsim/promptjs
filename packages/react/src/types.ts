import type { ReactNode } from "react";
import type {
  config as CoreConfig,
  Modal as CoreModal,
  toast as coreToast,
  alert as coreAlert,
  confirm as coreConfirm,
  question as coreQuestion,
  prompt as corePrompt,
  i18n as coreI18n,
  version as coreVersion
} from "@tlabsinc/promptjs-core";

export type PromptTheme = "auto" | "light" | "dark";

/**
 * When `scope` is true, PromptJS mounts its portals inside the
 * provider’s wrapper instead of `document.body`.
 */
export interface PromptProviderProps {
  children: ReactNode;
  theme?: PromptTheme;
  scope?: boolean;
  zIndexBase?: number; // only used when scope === true
}

export interface PromptContextValue {
  config: typeof CoreConfig;
  Modal: typeof CoreModal;
  toast: typeof coreToast;
  alert: typeof coreAlert;
  confirm: typeof coreConfirm;
  question: typeof coreQuestion;
  prompt: typeof corePrompt;
  i18n: typeof coreI18n;
  version: typeof coreVersion;
}
