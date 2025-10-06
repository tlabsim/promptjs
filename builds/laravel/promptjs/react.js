// src/provider.tsx
import * as React from "react";
import {
  config,
  Modal,
  toast,
  alert,
  confirm,
  question,
  prompt,
  i18n,
  version
} from "@tlabsinc/promptjs-core";
import { jsx } from "react/jsx-runtime";
var hasWindow = () => typeof window !== "undefined";
var Ctx = React.createContext(null);
var PromptProvider = ({
  children,
  theme = "auto",
  scope = false,
  zIndexBase = 2e3
}) => {
  const hostRef = React.useRef(null);
  React.useEffect(() => {
    if (!hasWindow()) return;
    config.update({ theme });
  }, [theme]);
  React.useEffect(() => {
    if (!hasWindow()) return;
    if (scope) {
      const host = hostRef.current;
      const prev = config.get();
      config.update({ container: host, zIndexBase });
      return () => {
        config.update({ container: null, zIndexBase: prev.zIndexBase });
      };
    }
    return;
  }, [scope, zIndexBase]);
  const value = React.useMemo(
    () => ({ config, Modal, toast, alert, confirm, question, prompt, i18n, version }),
    []
  );
  return /* @__PURE__ */ jsx(Ctx.Provider, { value, children: /* @__PURE__ */ jsx("div", { ref: hostRef, style: scope ? { position: "relative" } : void 0, children }) });
};
function usePrompt() {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    return { config, Modal, toast, alert, confirm, question, prompt, i18n, version };
  }
  return ctx;
}

// src/hooks.ts
import * as React2 from "react";
function useToast() {
  const ctx = usePrompt();
  return React2.useCallback((opts) => {
    return ctx.toast(opts);
  }, [ctx]);
}
function useDialogs() {
  const ctx = usePrompt();
  return React2.useMemo(() => {
    return {
      alert: ctx.alert,
      confirm: ctx.confirm,
      question: ctx.question,
      prompt: ctx.prompt
    };
  }, [ctx]);
}
function useModal() {
  const ctx = usePrompt();
  return React2.useCallback((opts) => {
    return ctx.Modal.open(opts);
  }, [ctx]);
}
function useBareModal() {
  const ctx = usePrompt();
  return React2.useMemo(() => ({
    bare: (opts) => ctx.Modal.bare(opts),
    mount: (opts) => ctx.Modal.mount(opts)
  }), [ctx]);
}
export {
  PromptProvider,
  useBareModal,
  useDialogs,
  useModal,
  usePrompt,
  useToast
};
//# sourceMappingURL=index.js.map