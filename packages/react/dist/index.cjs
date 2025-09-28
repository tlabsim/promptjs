"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  PromptProvider: () => PromptProvider,
  useDialogs: () => useDialogs,
  useModal: () => useModal,
  usePrompt: () => usePrompt,
  useToast: () => useToast
});
module.exports = __toCommonJS(index_exports);

// src/provider.tsx
var React = __toESM(require("react"), 1);
var import_promptjs_core = require("@tlabsinc/promptjs-core");
var import_jsx_runtime = require("react/jsx-runtime");
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
    import_promptjs_core.config.update({ theme });
  }, [theme]);
  React.useEffect(() => {
    if (!hasWindow()) return;
    if (scope) {
      const host = hostRef.current;
      const prev = import_promptjs_core.config.get();
      import_promptjs_core.config.update({ container: host, zIndexBase });
      return () => {
        import_promptjs_core.config.update({ container: null, zIndexBase: prev.zIndexBase });
      };
    }
    return;
  }, [scope, zIndexBase]);
  const value = React.useMemo(
    () => ({ config: import_promptjs_core.config, Modal: import_promptjs_core.Modal, toast: import_promptjs_core.toast, alert: import_promptjs_core.alert, confirm: import_promptjs_core.confirm, question: import_promptjs_core.question, i18n: import_promptjs_core.i18n, version: import_promptjs_core.version }),
    []
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, { value, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: hostRef, style: scope ? { position: "relative" } : void 0, children }) });
};
function usePrompt() {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    return { config: import_promptjs_core.config, Modal: import_promptjs_core.Modal, toast: import_promptjs_core.toast, alert: import_promptjs_core.alert, confirm: import_promptjs_core.confirm, question: import_promptjs_core.question, i18n: import_promptjs_core.i18n, version: import_promptjs_core.version };
  }
  return ctx;
}

// src/hooks.ts
var React2 = __toESM(require("react"), 1);
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
      question: ctx.question
    };
  }, [ctx]);
}
function useModal() {
  const ctx = usePrompt();
  return React2.useCallback((opts) => {
    return ctx.Modal.open(opts);
  }, [ctx]);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PromptProvider,
  useDialogs,
  useModal,
  usePrompt,
  useToast
});
//# sourceMappingURL=index.cjs.map