var PromptJS = (function (exports) {
  'use strict';

  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/utils.ts
  function uid(prefix = "pj") {
    return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  }
  function createNanoEvents() {
    const map = /* @__PURE__ */ new Map();
    return {
      on(t, fn) {
        if (!map.has(t)) map.set(t, /* @__PURE__ */ new Set());
        map.get(t).add(fn);
      },
      off(t, fn) {
        var _a;
        (_a = map.get(t)) == null ? void 0 : _a.delete(fn);
      },
      emit(t, ...a) {
        var _a;
        (_a = map.get(t)) == null ? void 0 : _a.forEach((fn) => fn(...a));
      }
    };
  }

  // src/config.ts
  var defaults = {
    theme: "auto",
    container: null,
    zIndexBase: 2e3,
    animation: { enable: true, durationMs: 180, easing: "ease" },
    i18n: {
      locale: "en",
      dir: "auto",
      ok: "OK",
      cancel: "Cancel",
      yes: "Yes",
      no: "No",
      close: "Close",
      dismiss: "Dismiss",
      titles: {
        info: "Information",
        success: "Success",
        warning: "Warning",
        error: "Error",
        question: "Question"
      }
    },
    a11y: {},
    breakpoints: { sm: 480, md: 640, lg: 800 },
    icons: {},
    overlay: {
      fade: true,
      surfaceAlpha: 0.6,
      backdropBlurPx: 0
    },
    modal: {
      concurrency: "queue",
      surfaceAlpha: 1,
      dialogBlurPx: 0
    },
    toast: {
      defaultPosition: "top-center",
      behavior: "stack",
      maxVisible: 3,
      spacingPx: 10,
      margins: { top: 16, bottom: 16, left: 16, right: 16 },
      zBoost: 100,
      animations: {
        // Final direction and distance are derived in toast.ts when direction === 'auto'
        // based on the chosen position. These are sensible global defaults.
        enter: { preset: "slide", direction: "auto" },
        exit: { preset: "slide", direction: "auto" },
        timeoutCue: { show: true, position: "bottom", direction: "shrink", thicknessPx: 3 }
      },
      defaultTimeoutMs: 4e3,
      defaultDismissible: true
    }
  };
  var current = { ...defaults };
  var ee = createNanoEvents();
  var config = {
    get: () => current,
    update(partial) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      current = {
        ...current,
        ...partial,
        breakpoints: {
          ...current.breakpoints,
          ...partial.breakpoints || {}
        },
        icons: {
          ...current.icons,
          ...partial.icons || {}
        },
        animation: { ...current.animation, ...partial.animation || {} },
        overlay: { ...current.overlay, ...partial.overlay || {} },
        i18n: {
          ...current.i18n,
          ...partial.i18n || {},
          titles: {
            ...current.i18n.titles,
            ...((_a = partial.i18n) == null ? void 0 : _a.titles) || {}
          }
        },
        toast: {
          ...current.toast,
          ...partial.toast || {},
          margins: {
            ...current.toast.margins,
            ...((_b = partial.toast) == null ? void 0 : _b.margins) || {}
          },
          animations: {
            ...current.toast.animations,
            ...((_c = partial.toast) == null ? void 0 : _c.animations) || {},
            enter: ((_e = (_d = partial.toast) == null ? void 0 : _d.animations) == null ? void 0 : _e.enter) ? {
              ...current.toast.animations.enter,
              ...partial.toast.animations.enter
            } : current.toast.animations.enter,
            exit: ((_g = (_f = partial.toast) == null ? void 0 : _f.animations) == null ? void 0 : _g.exit) ? {
              ...current.toast.animations.exit,
              ...partial.toast.animations.exit
            } : current.toast.animations.exit,
            timeoutCue: ((_i = (_h = partial.toast) == null ? void 0 : _h.animations) == null ? void 0 : _i.timeoutCue) ? {
              ...current.toast.animations.timeoutCue,
              ...partial.toast.animations.timeoutCue
            } : current.toast.animations.timeoutCue
          }
        }
      };
      if (current.theme === "auto") {
        document.documentElement.classList.add("pj-theme-auto");
        document.documentElement.classList.remove(
          "pj-theme-light",
          "pj-theme-dark"
        );
      } else if (current.theme === "light") {
        document.documentElement.classList.add("pj-theme-light");
        document.documentElement.classList.remove(
          "pj-theme-dark",
          "pj-theme-auto"
        );
      } else if (current.theme === "dark") {
        document.documentElement.classList.add("pj-theme-dark");
        document.documentElement.classList.remove(
          "pj-theme-light",
          "pj-theme-auto"
        );
      }
      const portal_grandcontainer = document.querySelector(".pj-portal");
      const toasts_grandcontainer = document.querySelector(".pj-toasts");
      if (portal_grandcontainer) {
        portal_grandcontainer.classList.remove("pj-theme-light", "pj-theme-dark", "pj-theme-auto");
        portal_grandcontainer.classList.add("pj-theme-" + (current.theme || "auto"));
      }
      if (toasts_grandcontainer) {
        toasts_grandcontainer.classList.remove("pj-theme-light", "pj-theme-dark", "pj-theme-auto");
        toasts_grandcontainer.classList.add("pj-theme-" + (current.theme || "auto"));
      }
      ee.emit("change");
    },
    onChange(fn) {
      ee.on("change", fn);
      return () => ee.off("change", fn);
    }
  };

  // src/modal.ts
  var modal_exports = {};
  __export(modal_exports, {
    bare: () => bare,
    open: () => open
  });

  // src/sanitize.ts
  var DEFAULT_OPTIONS = {
    // Conservative but practical allow-list for modal/notification body content
    allowedTags: /* @__PURE__ */ new Set([
      // Text & inline
      "b",
      "strong",
      "i",
      "em",
      "u",
      "s",
      "span",
      "small",
      "mark",
      "code",
      "kbd",
      "samp",
      "sup",
      "sub",
      "br",
      // Block
      "p",
      "div",
      "blockquote",
      "pre",
      "hr",
      // Lists
      "ul",
      "ol",
      "li",
      // Headings
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      // Links
      "a"
    ]),
    // Global attributes we consider safe
    allowedGlobalAttrs: /* @__PURE__ */ new Set([
      "title",
      "dir",
      "lang",
      "role"
    ]),
    // Per-tag attributes
    allowedPerTagAttrs: {
      a: /* @__PURE__ */ new Set(["href", "target", "rel", "name"])
      // Add more tag-specific attrs here if you later allow them (e.g., 'pre' could allow 'tabindex')
    },
    allowDataAttrs: true,
    allowAriaAttrs: true,
    allowClassAttr: true,
    allowIdAttr: false,
    // generally unnecessary in modal content; can cause collisions
    unwrapDisallowed: true
  };
  var DANGEROUS_TAGS = /* @__PURE__ */ new Set([
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "link",
    "meta",
    "base",
    "form",
    "input",
    "button",
    "textarea",
    "select",
    "option",
    "svg",
    "math"
    // SVG/MathML can be abused; keep disabled by default
  ]);
  var EVENT_ATTR = /^on/i;
  var ARIA_ATTR = /^aria-/i;
  var DATA_ATTR = /^data-/i;
  function isAllowedUrl(url) {
    const t = url.trim();
    if (!t) return true;
    if (t.startsWith("#") || t.startsWith("?") || t.startsWith("/")) return true;
    if (t.startsWith("./") || t.startsWith("../")) return true;
    try {
      const u = new URL(t, document.baseURI);
      const proto = u.protocol.toLowerCase();
      return proto === "http:" || proto === "https:" || proto === "mailto:" || proto === "tel:";
    } catch {
      return false;
    }
  }
  function sanitizeAttributes(el, opts) {
    const toRemove = [];
    const toSet = [];
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      const name = attr.name;
      const value = attr.value;
      if (EVENT_ATTR.test(name) || name === "style") {
        toRemove.push(name);
        continue;
      }
      if (name === "class") {
        if (!opts.allowClassAttr) {
          toRemove.push(name);
        }
        continue;
      }
      if (name === "id") {
        if (!opts.allowIdAttr) {
          toRemove.push(name);
        }
        continue;
      }
      if (opts.allowDataAttrs && DATA_ATTR.test(name)) continue;
      if (opts.allowAriaAttrs && ARIA_ATTR.test(name)) continue;
      if (opts.allowedGlobalAttrs.has(name)) continue;
      const tag = el.tagName.toLowerCase();
      const perTag = opts.allowedPerTagAttrs[tag];
      if (perTag && perTag.has(name)) {
        if (tag === "a" && name === "href") {
          if (!isAllowedUrl(value)) {
            toRemove.push(name);
            continue;
          }
          const target = el.getAttribute("target");
          if (target === "_blank") {
            const existingRel = el.getAttribute("rel") || "";
            const needed = /* @__PURE__ */ new Set(["noopener", "noreferrer"]);
            existingRel.split(/\s+/).forEach((r) => r && needed.delete(r.toLowerCase()));
            if (needed.size) {
              toSet.push({ name: "rel", value: (existingRel ? existingRel + " " : "") + Array.from(needed).join(" ") });
            }
          }
        }
        continue;
      }
      toRemove.push(name);
    }
    toRemove.forEach((n) => el.removeAttribute(n));
    toSet.forEach(({ name, value }) => el.setAttribute(name, value));
  }
  function unwrapElement(el) {
    const parent = el.parentNode;
    if (!parent) {
      el.remove();
      return;
    }
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  }
  function cleanNode(node, opts) {
    var _a, _b, _c;
    if (node.nodeType === Node.COMMENT_NODE) {
      (_a = node.parentNode) == null ? void 0 : _a.removeChild(node);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node;
    const tag = el.tagName.toLowerCase();
    if (DANGEROUS_TAGS.has(tag)) {
      (_b = el.parentNode) == null ? void 0 : _b.removeChild(el);
      return;
    }
    if (!opts.allowedTags.has(tag)) {
      if (opts.unwrapDisallowed) unwrapElement(el);
      else (_c = el.parentNode) == null ? void 0 : _c.removeChild(el);
      return;
    }
    sanitizeAttributes(el, opts);
    const children = Array.from(el.childNodes);
    for (const child of children) cleanNode(child, opts);
  }
  function sanitize(html, options) {
    if (!html) return "";
    const opts = {
      ...DEFAULT_OPTIONS,
      ...{},
      // Deep-merge perTagAttrs/sets if caller provided them
      allowedTags: DEFAULT_OPTIONS.allowedTags,
      allowedGlobalAttrs: DEFAULT_OPTIONS.allowedGlobalAttrs,
      allowedPerTagAttrs: DEFAULT_OPTIONS.allowedPerTagAttrs
    };
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    const nodes = Array.from(tpl.content.childNodes);
    for (const n of nodes) cleanNode(n, opts);
    const out = document.createElement("div");
    out.appendChild(tpl.content.cloneNode(true));
    return out.innerHTML;
  }

  // src/manager.ts
  var Manager = class {
    constructor() {
      // root layer for toast slots
      // Modal state
      this.activeModal = 0;
      this.modalQueue = [];
      // Toast state
      this.toastSlots = /* @__PURE__ */ new Map();
      this.toastQueues = /* @__PURE__ */ new Map();
    }
    ensureRoots() {
      var _a;
      const parent = (_a = config.get().container) != null ? _a : document.body;
      const existing = document.querySelector(".pj-portal");
      if (existing && this.portal && existing !== this.portal) {
        existing.remove();
        this.portal = void 0;
      }
      if (!this.portal) {
        this.portal = document.createElement("div");
        this.portal.className = "pj-portal pj-theme-" + (config.get().theme || "auto");
        this.portal.style.position = "relative";
        this.portal.style.zIndex = String(config.get().zIndexBase || 2e3);
        parent.appendChild(this.portal);
      } else {
        this.portal.style.zIndex = String(config.get().zIndexBase || 2e3);
      }
      if (!this.toastsRoot) {
        this.toastsRoot = document.createElement("div");
        this.toastsRoot.className = "pj-toasts pj-theme-" + (config.get().theme || "auto");
        const z = (config.get().zIndexBase || 2e3) + (config.get().toast.zBoost || 100);
        Object.assign(this.toastsRoot.style, {
          position: "fixed",
          inset: "0",
          zIndex: String(z),
          pointerEvents: "none"
        });
        parent.appendChild(this.toastsRoot);
      }
    }
    // -------- Modal orchestration --------
    open(job) {
      this.ensureRoots();
      const mode = config.get().modal.concurrency;
      if (this.activeModal > 0 && mode === "reject") {
        throw new Error("PromptJS: modal already open");
      }
      if (this.activeModal > 0 && mode === "queue") {
        this.modalQueue.push(job);
        return;
      }
      this.activeModal++;
      job();
    }
    onClose() {
      this.activeModal = Math.max(0, this.activeModal - 1);
      if (this.modalQueue.length) {
        const next = this.modalQueue.shift();
        this.open(next);
      }
    }
    scrollLock(lock) {
      const body = document.body;
      if (lock) {
        if (!body.style.getPropertyValue("--pj-scrollbar")) {
          const sbw = window.innerWidth - document.documentElement.clientWidth;
          body.style.setProperty("--pj-scrollbar", `${sbw}px`);
        }
        body.classList.add("pj-lock");
      } else {
        body.classList.remove("pj-lock");
        body.style.removeProperty("--pj-scrollbar");
      }
    }
    // -------- Toast infrastructure --------
    getToastSlot(pos) {
      this.ensureRoots();
      const existing = this.toastSlots.get(pos);
      if (existing) return existing;
      const slot = document.createElement("div");
      slot.className = `pj-toast-slot pj-${pos}`;
      slot.style.position = "fixed";
      slot.style.display = "flex";
      slot.style.flexDirection = "column";
      slot.style.pointerEvents = "none";
      const { margins, spacingPx } = config.get().toast;
      slot.style.gap = `${spacingPx}px`;
      const top = `${margins.top}px`;
      const bottom = `${margins.bottom}px`;
      const left = `${margins.left}px`;
      const right = `${margins.right}px`;
      switch (pos) {
        case "top-left":
          slot.style.top = top;
          slot.style.left = left;
          break;
        case "top-center":
          slot.style.top = top;
          slot.style.left = "50%";
          slot.style.transform = "translateX(-50%)";
          break;
        case "top-right":
          slot.style.top = top;
          slot.style.right = right;
          break;
        case "bottom-left":
          slot.style.bottom = bottom;
          slot.style.left = left;
          break;
        case "bottom-center":
          slot.style.bottom = bottom;
          slot.style.left = "50%";
          slot.style.transform = "translateX(-50%)";
          break;
        case "bottom-right":
          slot.style.bottom = bottom;
          slot.style.right = right;
          break;
      }
      this.toastsRoot.appendChild(slot);
      this.toastSlots.set(pos, slot);
      return slot;
    }
    /**
     * Mount a toast into its position slot honoring behavior.
     * - stack: append; if full, drop oldest to keep UI responsive
     * - queue: enqueue if full; mount when a slot frees
     * - replace: clear slot and show only the new toast
     */
    showToast(el, pos, behavior, maxVisible) {
      var _a;
      const slot = this.getToastSlot(pos);
      const visible = slot.children.length;
      el.style.pointerEvents = "auto";
      if (behavior === "replace") {
        while (slot.firstElementChild) slot.removeChild(slot.firstElementChild);
        slot.appendChild(el);
        return;
      }
      if (behavior === "stack") {
        if (visible >= maxVisible) {
          (_a = slot.firstElementChild) == null ? void 0 : _a.remove();
        }
        slot.appendChild(el);
        return;
      }
      if (visible >= maxVisible) {
        const q = this.toastQueues.get(pos) || [];
        q.push({ mount: () => slot.appendChild(el), maxVisible });
        this.toastQueues.set(pos, q);
      } else {
        slot.appendChild(el);
      }
    }
    /**
     * Notify manager that a toast at a position was removed.
     * Used to advance queued toasts for that position.
     */
    onToastRemoved(pos) {
      const slot = this.getToastSlot(pos);
      const q = this.toastQueues.get(pos);
      if (!q || q.length === 0) return;
      if (slot.children.length < q[0].maxVisible) {
        const next = q.shift();
        next.mount();
      }
    }
  };
  var manager = new Manager();

  // src/a11y.ts
  function getTabbables(root) {
    const selector = [
      "a[href]",
      "area[href]",
      "button:not([disabled])",
      'input:not([disabled]):not([type="hidden"])',
      "select:not([disabled])",
      "textarea:not([disabled])",
      "summary",
      // details/summary is focusable
      "[tabindex]",
      '[contenteditable="true"]'
    ].join(",");
    const nodes = Array.from(root.querySelectorAll(selector));
    return nodes.filter(isTabbable);
  }
  function isTabbable(el) {
    if (!isFocusable(el)) return false;
    const tabindex = getTabIndex(el);
    return tabindex >= 0;
  }
  function isFocusable(el) {
    if (!isVisible(el)) return false;
    if (el.disabled) return false;
    return true;
  }
  function isVisible(el) {
    var _a;
    const style = window.getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") return false;
    const details = el.closest("details");
    if (details && !details.open && !((_a = details.querySelector("summary")) == null ? void 0 : _a.contains(el))) return false;
    if (!el.ownerDocument || !el.getClientRects().length) {
      return !!el.ownerDocument;
    }
    return true;
  }
  function getTabIndex(el) {
    const attr = el.getAttribute("tabindex");
    if (attr !== null) {
      const n = Number(attr);
      return Number.isNaN(n) ? 0 : n;
    }
    const tag = el.tagName.toLowerCase();
    const naturallyTabbable = /^(a|area|input|select|textarea|button|summary)$/i.test(tag);
    if (naturallyTabbable) {
      if ((tag === "a" || tag === "area") && !el.hasAttribute("href")) return -1;
      return 0;
    }
    return -1;
  }
  function focusFirst(root, fallback) {
    const tabbables = getTabbables(root);
    const target = tabbables[0] || fallback || root;
    let removeTabIndex = false;
    if (target === root && getTabIndex(root) < 0) {
      root.setAttribute("tabindex", "-1");
      removeTabIndex = true;
    }
    try {
      target.focus({ preventScroll: true });
    } catch {
    } finally {
      if (removeTabIndex) root.removeAttribute("tabindex");
    }
  }
  function trapFocus(container, opts) {
    const previouslyFocused = document.activeElement || null;
    if (opts == null ? void 0 : opts.initialFocus) {
      try {
        opts.initialFocus.focus({ preventScroll: true });
      } catch {
      }
    } else {
      focusFirst(container, container);
    }
    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const tabbables = getTabbables(container);
      if (tabbables.length === 0) {
        e.preventDefault();
        focusFirst(container, container);
        return;
      }
      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (!active || active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!active || active === last || !container.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    const release = () => {
      document.removeEventListener("keydown", onKeyDown, true);
      const restore = (opts == null ? void 0 : opts.restoreFocus) === void 0 ? previouslyFocused : opts.restoreFocus;
      if (restore && document.contains(restore)) {
        try {
          restore.focus({ preventScroll: true });
        } catch {
        }
      }
    };
    return { release };
  }
  function ariaHideSiblings(target) {
    const doc = target.ownerDocument || document;
    const root = doc.body;
    const stack = [];
    Array.from(root.children).forEach((el) => {
      if (el === target || el.contains(target)) return;
      const prev = el.getAttribute("aria-hidden");
      stack.push({ el, prev });
      el.setAttribute("aria-hidden", "true");
    });
    return () => {
      for (const { el, prev } of stack) {
        if (prev === null) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", prev);
      }
    };
  }

  // src/modal-core.ts
  function setDragOffset(el, x, y) {
    if ("translate" in el.style)
      el.style.translate = `${x}px ${y}px`;
    else {
      el.style.setProperty("--pj-dx", `${x}px`);
      el.style.setProperty("--pj-dy", `${y}px`);
    }
  }
  function enableDragging(surfaceEl, handleEl, spec) {
    let startX = 0, startY = 0, baseX = 0, baseY = 0;
    let moving = false;
    const point = (e) => {
      var _a, _b;
      const t = (_b = (_a = e.touches) == null ? void 0 : _a[0]) != null ? _b : e;
      return { x: t.clientX, y: t.clientY };
    };
    const readTranslate = () => {
      const t = surfaceEl.style.translate || "";
      const m = t.match(/(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px/);
      if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
      const dx = parseFloat(getComputedStyle(surfaceEl).getPropertyValue("--pj-dx")) || 0;
      const dy = parseFloat(getComputedStyle(surfaceEl).getPropertyValue("--pj-dy")) || 0;
      return { x: dx, y: dy };
    };
    const clampViewport = (nx, ny) => {
      if (!spec.withinViewport) return { x: nx, y: ny };
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const r = surfaceEl.getBoundingClientRect();
      const minX = -r.left + r.width * -0.9;
      const maxX = vw - r.right + r.width * 0.9;
      const minY = -r.top + r.height * -0.9;
      const maxY = vh - r.bottom + r.height * 0.9;
      return {
        x: Math.min(Math.max(nx, minX), maxX),
        y: Math.min(Math.max(ny, minY), maxY)
      };
    };
    const onMove = (e) => {
      if (!moving) return;
      e.preventDefault();
      const p = point(e);
      let nx = baseX + (spec.axis === "y" ? 0 : p.x - startX);
      let ny = baseY + (spec.axis === "x" ? 0 : p.y - startY);
      ({ x: nx, y: ny } = clampViewport(nx, ny));
      setDragOffset(surfaceEl, nx, ny);
    };
    const onUp = () => {
      moving = false;
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("touchmove", onMove, true);
      handleEl.style.cursor = spec.cursor || "grab";
    };
    const onDown = (e) => {
      if (e instanceof MouseEvent && e.button !== 0) return;
      e.preventDefault();
      const p = point(e);
      startX = p.x;
      startY = p.y;
      const t = readTranslate();
      baseX = t.x;
      baseY = t.y;
      moving = true;
      handleEl.style.cursor = spec.cursor || "grabbing";
      document.addEventListener("mousemove", onMove, true);
      document.addEventListener("mouseup", onUp, { once: true, capture: true });
      document.addEventListener("touchmove", onMove, {
        passive: false,
        capture: true
      });
      document.addEventListener("touchend", onUp, { once: true, capture: true });
      surfaceEl.classList.add("pj-modal-moved");
    };
    handleEl.addEventListener("mousedown", onDown);
    handleEl.addEventListener("touchstart", onDown, { passive: false });
    return () => {
      handleEl.removeEventListener("mousedown", onDown);
      handleEl.removeEventListener("touchstart", onDown);
    };
  }
  function createSurface(core, r) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const id = uid("modal");
    const cfg = config.get();
    const animEnabled = (_c = (_b = core.animate) != null ? _b : (_a = cfg.animation) == null ? void 0 : _a.enable) != null ? _c : true;
    const animDur = (_e = (_d = cfg.animation) == null ? void 0 : _d.durationMs) != null ? _e : 180;
    const animEase = (_g = (_f = cfg.animation) == null ? void 0 : _f.easing) != null ? _g : "ease";
    const overlayFade = (_i = (_h = cfg.overlay) == null ? void 0 : _h.fade) != null ? _i : true;
    manager.ensureRoots();
    let overlay;
    let modal;
    let headerEl = null;
    let bodyEl;
    let footerEl = null;
    let isClosing = false;
    let releaseTrap = null;
    let restoreAria = null;
    let cleanupDrag = null;
    let _el;
    let _contentEl;
    const instance = {
      id,
      close: (result) => close(result),
      update: () => {
      },
      get el() {
        return _el;
      },
      get contentEl() {
        return _contentEl;
      }
    };
    let onEsc = null;
    const render = () => {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j, _k, _l, _m, _n, _o, _p;
      overlay = document.createElement("div");
      overlay.className = "pj-overlay";
      overlay.setAttribute("role", "presentation");
      const alpha = (_b2 = (_a2 = cfg.overlay) == null ? void 0 : _a2.surfaceAlpha) != null ? _b2 : 0.6;
      overlay.style.setProperty("--pj-overlay-alpha", String(alpha));
      const overlayBlur = (_e2 = (_d2 = core.backdropBlurPx) != null ? _d2 : (_c2 = cfg.overlay) == null ? void 0 : _c2.backdropBlurPx) != null ? _e2 : 0;
      if (overlayBlur > 0) {
        overlay.classList.add("pj-blur");
        overlay.style.setProperty("--pj-overlay-blur", `${overlayBlur}px`);
      }
      modal = document.createElement("div");
      modal.className = core.windowed ? "pj-modal" : "pj-modal-no-window";
      if (core.bare)
        modal.classList.add(
          "pad-none"
        );
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      if (core.ariaLabel) modal.setAttribute("aria-label", core.ariaLabel);
      if (core.kind) modal.classList.add(`pj-kind-${core.kind}`);
      const surfaceAlpha = (_g2 = (_f2 = core.surfaceAlpha) != null ? _f2 : cfg.modal.surfaceAlpha) != null ? _g2 : 1;
      const surfaceBlur = (_i2 = (_h2 = core.dialogBlurPx) != null ? _h2 : cfg.modal.dialogBlurPx) != null ? _i2 : 0;
      modal.style.setProperty("--pj-modal-alpha", String(surfaceAlpha));
      if (surfaceAlpha < 1 && surfaceBlur > 0) {
        modal.classList.add("pj-modal-translucent");
        modal.style.setProperty("--pj-modal-blur", `${surfaceBlur}px`);
      }
      const sz = (_j = core.size) != null ? _j : "md";
      if (core.windowed && typeof sz === "string") {
        modal.classList.add(`size-${sz}`);
      }
      if (r.renderHeader) {
        headerEl = document.createElement("div");
        headerEl.className = "pj-modal-header";
        modal.appendChild(headerEl);
      }
      bodyEl = document.createElement("div");
      bodyEl.className = "pj-modal-content";
      if (core.bare)
        bodyEl.classList.add(
          "pad-none"
        );
      if (core.contentClass) bodyEl.classList.add(core.contentClass);
      modal.appendChild(bodyEl);
      if (r.renderFooter) {
        footerEl = document.createElement("div");
        footerEl.className = "pj-modal-footer";
        modal.appendChild(footerEl);
      }
      if (core.surfaceClass) modal.classList.add(core.surfaceClass);
      overlay.appendChild(modal);
      manager.portal.appendChild(overlay);
      const initial = footerEl == null ? void 0 : footerEl.querySelector("button");
      if (core.trapFocus !== false) {
        releaseTrap = trapFocus(modal, { initialFocus: initial }).release;
      }
      restoreAria = ariaHideSiblings(overlay);
      _el = modal;
      _contentEl = bodyEl;
      if (r.renderHeader && headerEl) r.renderHeader(instance, headerEl);
      r.renderBody(instance, bodyEl, (el) => {
        _contentEl = el;
      });
      if (r.renderFooter && footerEl) r.renderFooter(instance, footerEl);
      if (r.setUpdater) {
        r.setUpdater(instance, {
          header: headerEl,
          body: bodyEl,
          footer: footerEl,
          setContentEl: (el) => {
            _contentEl = el;
          }
        });
      }
      const drag = core.draggable;
      const prefersCoarse = typeof window !== "undefined" && ((_k = window.matchMedia) == null ? void 0 : _k.call(window, "(pointer: coarse)").matches);
      const isMobileUA = /Mobi|Android/i.test(navigator.userAgent);
      const disableOnMobile = typeof drag === "object" ? (_l = drag.disableOnMobile) != null ? _l : true : true;
      if (drag && !prefersCoarse && !(isMobileUA && disableOnMobile)) {
        const spec = typeof drag === "object" ? drag : {};
        const axis = (_m = spec.axis) != null ? _m : "both";
        const withinViewport = (_n = spec.withinViewport) != null ? _n : true;
        const cursor = (_o = spec.cursor) != null ? _o : null;
        let handleEl = null;
        if (spec.handle instanceof HTMLElement) handleEl = spec.handle;
        else if (typeof spec.handle === "string") {
          if (spec.handle === "header") handleEl = headerEl != null ? headerEl : null;
          else if (spec.handle === "body") handleEl = bodyEl;
          else handleEl = modal.querySelector(spec.handle);
        } else {
          handleEl = core.windowed ? headerEl != null ? headerEl : modal : _contentEl != null ? _contentEl : bodyEl;
        }
        if (handleEl) {
          cleanupDrag = enableDragging(modal, handleEl, {
            axis,
            withinViewport,
            cursor
          });
          modal.classList.add("pj-modal-draggable");
          if (cursor) handleEl.style.cursor = cursor;
        }
      }
      bind();
      manager.scrollLock(true);
      if (animEnabled) {
        if (overlayFade) {
          overlay.classList.add("pj-overlay-in");
          overlay.style.setProperty("--pj-anim-duration", `${animDur}ms`);
          overlay.style.setProperty("--pj-anim-ease", animEase);
        }
        modal.classList.add("pj-modal-in");
        modal.style.setProperty("--pj-anim-duration", `${animDur}ms`);
        modal.style.setProperty("--pj-anim-ease", animEase);
      }
      (_p = core.onOpen) == null ? void 0 : _p.call(core, instance);
    };
    const bind = () => {
      var _a2, _b2;
      if ((_a2 = core.closeOnBackdrop) != null ? _a2 : true) {
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) close("backdrop");
        });
      }
      if ((_b2 = core.closeOnEsc) != null ? _b2 : true) {
        onEsc = (e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            close("esc");
            document.removeEventListener("keydown", onEsc, true);
          }
        };
        document.addEventListener("keydown", onEsc, true);
      }
    };
    const teardown = (result) => {
      var _a2;
      overlay.remove();
      manager.onClose();
      manager.scrollLock(false);
      try {
        releaseTrap == null ? void 0 : releaseTrap();
      } catch {
      }
      try {
        restoreAria == null ? void 0 : restoreAria();
      } catch {
      }
      try {
        cleanupDrag == null ? void 0 : cleanupDrag();
      } catch {
      }
      releaseTrap = restoreAria = cleanupDrag = null;
      try {
        document.removeEventListener("keydown", onEsc, true);
      } catch {
      }
      (_a2 = core.onClose) == null ? void 0 : _a2.call(core, result);
    };
    const close = (result) => {
      if (isClosing) return;
      isClosing = true;
      if (!animEnabled) {
        teardown(result);
        return;
      }
      modal.classList.remove("pj-modal-in");
      modal.classList.add("pj-modal-out");
      modal.style.setProperty("--pj-anim-duration", `${animDur}ms`);
      modal.style.setProperty("--pj-anim-ease", animEase);
      if (overlayFade) {
        overlay.classList.remove("pj-overlay-in");
        overlay.classList.add("pj-overlay-out");
        overlay.style.setProperty("--pj-anim-duration", `${animDur}ms`);
        overlay.style.setProperty("--pj-anim-ease", animEase);
      }
      let doneModal = false;
      let doneOverlay = !overlayFade;
      const tryDone = () => {
        if (doneModal && doneOverlay) teardown(result);
      };
      const onModalEnd = () => {
        doneModal = true;
        modal.removeEventListener("animationend", onModalEnd);
        tryDone();
      };
      modal.addEventListener("animationend", onModalEnd);
      if (overlayFade) {
        const onOverlayEnd = () => {
          doneOverlay = true;
          overlay.removeEventListener("animationend", onOverlayEnd);
          tryDone();
        };
        overlay.addEventListener("animationend", onOverlayEnd);
      }
      window.setTimeout(tryDone, (animDur != null ? animDur : 0) + 50);
    };
    manager.open(() => render());
    return instance;
  }

  // src/modal.ts
  function open(options) {
    var _a, _b, _c;
    const cfg = config.get();
    const i18n = cfg.i18n;
    const core = {
      // chrome
      windowed: true,
      bare: false,
      size: options.size,
      surfaceClass: options.surfaceClass,
      // optional hooks if you added them
      contentClass: options.contentClass,
      // visuals
      surfaceAlpha: options.surfaceAlpha,
      dialogBlurPx: options.dialogBlurPx,
      backdropBlurPx: options.backdropBlurPx,
      kind: options.kind,
      // behavior
      animate: options.animate,
      closeOnEsc: (_a = options.closeOnEsc) != null ? _a : true,
      closeOnBackdrop: (_b = options.closeOnBackdrop) != null ? _b : true,
      trapFocus: (_c = options.trapFocus) != null ? _c : true,
      ariaLabel: options.ariaLabel,
      draggable: options.draggable,
      onOpen: options.onOpen,
      onClose: options.onClose,
      concurrency: options.concurrency
    };
    return createSurface(core, {
      renderHeader(inst, header) {
        var _a2;
        const hasTitle = typeof options.title === "string" && options.title.length > 0;
        const computedTitle = hasTitle ? options.title : options.kind ? i18n.titles[options.kind] : void 0;
        if (computedTitle) {
          header.innerHTML = `<h2 class="pj-modal-title">${sanitize(
          computedTitle
        )}</h2>`;
        }
        if ((_a2 = options.showClose) != null ? _a2 : true) {
          const c = document.createElement("button");
          c.className = "pj-modal-close";
          c.setAttribute("aria-label", options.closeAriaLabel || i18n.close);
          c.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>';
          c.addEventListener("click", () => inst.close("close"));
          header.appendChild(c);
        }
      },
      renderBody(_inst, body, setContentEl) {
        if (typeof options.content === "string") {
          body.innerHTML = options.unsafeHTML ? options.content : sanitize(options.content);
          setContentEl(body);
        } else {
          body.appendChild(options.content);
          setContentEl(options.content);
        }
      },
      renderFooter(inst, footer) {
        var _a2;
        const btns = (_a2 = options.buttons) != null ? _a2 : [
          { id: "ok", text: i18n.ok, variant: "primary" }
        ];
        for (const btn of btns) {
          const b = document.createElement("button");
          b.className = `pj-modal-btn ${btn.variant || "neutral"}`;
          b.textContent = btn.text;
          b.addEventListener("click", async () => {
            var _a3;
            try {
              b.disabled = true;
              if (btn.onClick) await btn.onClick(inst);
            } finally {
              b.disabled = false;
              if ((_a3 = btn.closeOnClick) != null ? _a3 : true) inst.close(btn.id);
            }
          });
          footer.appendChild(b);
        }
        inst.update = (partial) => {
          var _a3, _b2;
          if (partial.title !== void 0) {
            const h = inst.el.querySelector(
              ".pj-modal-title"
            );
            if (h) h.textContent = (_a3 = partial.title) != null ? _a3 : "";
          }
          if (partial.content !== void 0) {
            const bodyEl = inst.el.querySelector(
              ".pj-modal-content"
            );
            if (!bodyEl) return;
            bodyEl.innerHTML = "";
            if (typeof partial.content === "string") {
              bodyEl.innerHTML = partial.unsafeHTML ? partial.content : sanitize(partial.content);
            } else {
              bodyEl.appendChild(partial.content);
            }
            inst._contentEl = bodyEl;
            ((_b2 = Object.getOwnPropertyDescriptor(inst, "contentEl")) == null ? void 0 : _b2.get) && /* @__PURE__ */ ((_) => _)(bodyEl);
          }
          if (partial.buttons) {
            footer.innerHTML = "";
            partial.buttons.forEach((bd) => {
              const bb = document.createElement("button");
              bb.className = `pj-modal-btn ${bd.variant || "neutral"}`;
              bb.textContent = bd.text;
              bb.addEventListener("click", async () => {
                var _a4;
                try {
                  bb.disabled = true;
                  if (bd.onClick) await bd.onClick(inst);
                } finally {
                  bb.disabled = false;
                  if ((_a4 = bd.closeOnClick) != null ? _a4 : true) inst.close(bd.id);
                }
              });
              footer.appendChild(bb);
            });
          }
        };
      },
      setUpdater: (inst, { header, body, footer, setContentEl }) => {
        inst.update = (partial) => {
          var _a2;
          if (partial.title !== void 0 && header) {
            const h = header.querySelector(
              ".pj-modal-title"
            );
            if (h) h.textContent = (_a2 = partial.title) != null ? _a2 : "";
          }
          if (partial.content !== void 0) {
            body.innerHTML = "";
            if (typeof partial.content === "string") {
              body.innerHTML = partial.unsafeHTML ? partial.content : sanitize(partial.content);
            } else {
              body.appendChild(partial.content);
            }
            setContentEl(body);
          }
          if (partial.buttons && footer) {
            footer.innerHTML = "";
            partial.buttons.forEach((bd) => {
              const bb = document.createElement("button");
              bb.className = `pj-modal-btn ${bd.variant || "neutral"}`;
              bb.textContent = bd.text;
              bb.addEventListener("click", async () => {
                var _a3;
                try {
                  bb.disabled = true;
                  if (bd.onClick) await bd.onClick(inst);
                } finally {
                  bb.disabled = false;
                  if ((_a3 = bd.closeOnClick) != null ? _a3 : true) inst.close(bd.id);
                }
              });
              footer.appendChild(bb);
            });
          }
        };
      }
    });
  }
  function bare(options = {}) {
    var _a, _b, _c;
    const windowed = options.windowed !== false;
    const core = {
      // chrome
      windowed,
      bare: true,
      size: options.size,
      surfaceClass: options.surfaceClass,
      contentClass: options.contentClass,
      // visuals
      surfaceAlpha: options.surfaceAlpha,
      dialogBlurPx: options.dialogBlurPx,
      backdropBlurPx: options.backdropBlurPx,
      kind: options.kind,
      // behavior
      animate: options.animate,
      closeOnEsc: (_a = options.closeOnEsc) != null ? _a : true,
      closeOnBackdrop: (_b = options.closeOnBackdrop) != null ? _b : true,
      trapFocus: (_c = options.trapFocus) != null ? _c : true,
      ariaLabel: options.ariaLabel,
      draggable: (() => {
        var _a2;
        if (!windowed && options.draggable) {
          const spec = typeof options.draggable === "object" ? options.draggable : {};
          return {
            handle: (_a2 = spec.handle) != null ? _a2 : void 0,
            axis: spec.axis,
            withinViewport: spec.withinViewport,
            disableOnMobile: spec.disableOnMobile,
            cursor: spec.cursor
          };
        }
        return options.draggable;
      })(),
      onOpen: options.onOpen,
      onClose: options.onClose,
      concurrency: options.concurrency
    };
    return createSurface(core, {
      // no header/footer by default
      renderBody(_inst, body, setContentEl) {
        if (typeof options.content === "string") {
          body.innerHTML = options.unsafeHTML ? options.content : sanitize(options.content);
          setContentEl(body);
        } else if (options.content) {
          body.appendChild(options.content);
          setContentEl(options.content);
        }
      }
    });
  }

  // src/toast.ts
  function px(v) {
    return typeof v === "number" ? `${v}px` : v;
  }
  function prefersReducedMotion() {
    return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function removeMatchingClasses(el, re) {
    el.classList.forEach((cls) => {
      if (re.test(cls)) el.classList.remove(cls);
    });
  }
  function onceAnimationEnd(el, expectedMs, done) {
    let called = false;
    const onEnd = (ev) => {
      if (ev.target === el && !called) {
        called = true;
        el.removeEventListener("animationend", onEnd);
        clearTimeout(timer);
        done();
      }
    };
    const timer = window.setTimeout(() => {
      if (!called) {
        called = true;
        el.removeEventListener("animationend", onEnd);
        done();
      }
    }, Math.max(0, expectedMs) + 50);
    el.addEventListener("animationend", onEnd);
    return () => {
      if (!called) {
        called = true;
        clearTimeout(timer);
        el.removeEventListener("animationend", onEnd);
        done();
      }
    };
  }
  function resolveAnim(position, phase, spec) {
    var _a, _b, _c, _d, _e, _f;
    const cfg = config.get();
    const baseDur = (_b = (_a = cfg.animation) == null ? void 0 : _a.durationMs) != null ? _b : 180;
    const baseEase = (_d = (_c = cfg.animation) == null ? void 0 : _c.easing) != null ? _d : "ease";
    if (!spec) {
      const def = phase === "enter" ? {
        preset: "slide",
        direction: autoDirection(position, phase),
        distance: defaultDistance(position, phase)
      } : { preset: "fade" };
      return {
        preset: def.preset,
        direction: def.direction,
        distance: def.distance,
        durationMs: baseDur,
        easing: baseEase
      };
    }
    const preset = spec.preset;
    const dir = preset === "slide" ? spec.direction && spec.direction !== "auto" ? spec.direction : autoDirection(position, phase) : void 0;
    let distance;
    if (preset === "slide") {
      if (spec.distance === "edge" || spec.distance === void 0) {
        distance = defaultDistance(position, phase);
      } else {
        distance = px(spec.distance);
      }
    }
    return {
      preset,
      direction: dir,
      distance,
      durationMs: (_e = spec.durationMs) != null ? _e : baseDur,
      easing: (_f = spec.easing) != null ? _f : baseEase
    };
  }
  function autoDirection(position, phase) {
    switch (position) {
      case "top-center":
        return phase === "enter" ? "up" : "up";
      case "bottom-center":
        return phase === "enter" ? "down" : "down";
      case "top-left":
      case "bottom-left":
        return "left";
      case "top-right":
      case "bottom-right":
        return "right";
    }
  }
  function defaultDistance(position, phase) {
    const offscreen = "120%";
    const subtle = "16px";
    if (position === "top-center") return phase === "enter" ? subtle : offscreen;
    if (position === "bottom-center")
      return phase === "enter" ? subtle : offscreen;
    return offscreen;
  }
  function applyAnim(el, phase, resolved) {
    el.style.setProperty("--pj-anim-duration", `${resolved.durationMs}ms`);
    el.style.setProperty("--pj-anim-ease", resolved.easing);
    if (resolved.preset === "fade") {
      el.classList.add(phase === "enter" ? "pj-enter-fade" : "pj-exit-fade");
      return;
    }
    if (resolved.preset === "scale") {
      el.classList.add(phase === "enter" ? "pj-enter-scale" : "pj-exit-scale");
      return;
    }
    if (resolved.preset === "slide" && resolved.direction) {
      if (phase === "enter" && resolved.distance) {
        el.style.setProperty("--pj-enter-distance", resolved.distance);
      }
      const cls = `pj-${phase}-slide-${resolved.direction}`;
      el.classList.add(cls);
    }
  }
  function addTimeoutCue(el, animations, timeoutMs) {
    var _a;
    if (!timeoutMs || timeoutMs <= 0) return;
    const cue = animations.timeoutCue || {};
    const show = cue.show !== false;
    if (!show) return;
    const pos = cue.position || "bottom";
    const thickness = (_a = cue.thicknessPx) != null ? _a : 3;
    if (pos === "cover") {
      const cover = document.createElement("div");
      cover.className = "pj-timeout-cover";
      cover.style.setProperty("--pj-timeout-ms", `${timeoutMs}ms`);
      if (cue.direction === "shrink") cover.style.animationDirection = "reverse";
      el.appendChild(cover);
      return;
    }
    const bar = document.createElement("div");
    bar.className = `pj-timeout-bar pj-${pos}`;
    bar.style.setProperty("--pj-timeout-ms", `${timeoutMs}ms`);
    if (pos === "top" || pos === "bottom") {
      bar.style.height = `${thickness}px`;
    } else {
      bar.style.width = `${thickness}px`;
    }
    if (cue.direction === "shrink") bar.style.animationDirection = "reverse";
    el.appendChild(bar);
  }
  function collapseAndRemove(container, position, durationMs, easing) {
    var _a;
    if (prefersReducedMotion() || durationMs <= 0 || !((_a = config.get().animation) == null ? void 0 : _a.enable)) {
      container.remove();
      manager.onToastRemoved(position);
      return;
    }
    const startH = container.offsetHeight;
    container.style.overflow = "hidden";
    container.style.height = `${startH}px`;
    container.style.marginTop = getComputedStyle(container).marginTop;
    container.style.marginBottom = getComputedStyle(container).marginBottom;
    container.style.paddingTop = getComputedStyle(container).paddingTop;
    container.style.paddingBottom = getComputedStyle(container).paddingBottom;
    container.offsetWidth;
    container.style.transition = [
      `height ${durationMs}ms ${easing}`,
      `margin ${durationMs}ms ${easing}`,
      `padding ${durationMs}ms ${easing}`,
      `opacity ${durationMs}ms ${easing}`
    ].join(", ");
    container.style.height = "0px";
    container.style.marginTop = "0px";
    container.style.marginBottom = "0px";
    container.style.paddingTop = "0px";
    container.style.paddingBottom = "0px";
    container.style.opacity = "0";
    const done = () => {
      container.removeEventListener("transitionend", done);
      container.remove();
      manager.onToastRemoved(position);
    };
    container.addEventListener("transitionend", done);
    window.setTimeout(done, durationMs + 50);
  }
  function beginExit(toastEl, container, position, userExitSpec) {
    var _a;
    if (toastEl._pjExiting) return;
    toastEl._pjExiting = true;
    removeMatchingClasses(toastEl, /^pj-enter-/);
    const cfg = config.get();
    const animEnabled = !!((_a = cfg.animation) == null ? void 0 : _a.enable);
    const exitResolved = resolveAnim(
      position,
      "exit",
      userExitSpec != null ? userExitSpec : cfg.toast.animations.exit
    );
    if (!animEnabled || prefersReducedMotion() || exitResolved.durationMs <= 0) {
      collapseAndRemove(container, position, 0, exitResolved.easing);
      return;
    }
    applyAnim(toastEl, "exit", exitResolved);
    toastEl.offsetWidth;
    onceAnimationEnd(toastEl, exitResolved.durationMs, () => {
      collapseAndRemove(
        container,
        position,
        exitResolved.durationMs,
        exitResolved.easing
      );
    });
  }
  function toast(opts) {
    var _a, _b, _c, _d, _e;
    manager.ensureRoots();
    const cfg = config.get();
    const pos = opts.position || cfg.toast.defaultPosition;
    const behavior = opts.behavior || cfg.toast.behavior;
    const maxVisible = opts.maxVisible || cfg.toast.maxVisible;
    const timeoutMs = (_a = opts.timeoutMs) != null ? _a : cfg.toast.defaultTimeoutMs;
    const container = document.createElement("div");
    container.className = "pj-toast-item";
    const el = document.createElement("div");
    el.className = `pj-toast pj-${opts.kind || "info"} ${((_b = opts.dismissible) != null ? _b : cfg.toast.defaultDismissible) ? "dismissible" : ""}`;
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    let contentContainer = el;
    let titleId;
    if (opts.title) {
      const h = document.createElement("div");
      h.className = "pj-toast-title";
      h.innerHTML = sanitize(opts.title);
      titleId = `pj-title-${Math.random().toString(36).slice(2, 9)}`;
      h.id = titleId;
      el.appendChild(h);
      el.classList.add("has-title");
      contentContainer = document.createElement("div");
      contentContainer.style.cssText = "display: flex; align-items: center; gap: 6px;";
      el.appendChild(contentContainer);
    }
    const body = document.createElement("div");
    body.className = "pj-toast-body";
    body.innerHTML = sanitize(opts.message);
    const bodyId = `pj-body-${Math.random().toString(36).slice(2, 9)}`;
    body.id = bodyId;
    contentContainer.appendChild(body);
    if (titleId) {
      el.setAttribute("aria-labelledby", titleId);
      el.setAttribute("aria-describedby", bodyId);
    }
    if ((_c = opts.actions) == null ? void 0 : _c.length) {
      const bar = document.createElement("div");
      bar.className = "pj-toast-actions";
      for (const a of opts.actions) {
        const btn = document.createElement("button");
        btn.className = "pj-toast-btn ghost";
        btn.textContent = a.text;
        btn.addEventListener(
          "click",
          () => {
            var _a2;
            return beginExit(el, container, pos, (_a2 = opts.animations) == null ? void 0 : _a2.exit);
          }
        );
        btn.addEventListener("click", () => {
          var _a2;
          try {
            (_a2 = a.onClick) == null ? void 0 : _a2.call(a);
          } catch {
          }
        });
        bar.appendChild(btn);
      }
      contentContainer.appendChild(bar);
    }
    const dismissible = (_d = opts.dismissible) != null ? _d : cfg.toast.defaultDismissible;
    if (dismissible) {
      const x = document.createElement("button");
      x.className = "pj-toast-close";
      x.setAttribute("aria-label", cfg.i18n.dismiss);
      x.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>';
      x.addEventListener(
        "click",
        () => {
          var _a2;
          return beginExit(el, container, pos, (_a2 = opts.animations) == null ? void 0 : _a2.exit);
        }
      );
      el.appendChild(x);
    }
    let timer;
    if (timeoutMs && timeoutMs > 0) {
      addTimeoutCue(el, opts.animations || cfg.toast.animations, timeoutMs);
      timer = window.setTimeout(
        () => {
          var _a2;
          return beginExit(el, container, pos, (_a2 = opts.animations) == null ? void 0 : _a2.exit);
        },
        timeoutMs
      );
    }
    const enterResolved = resolveAnim(
      pos,
      "enter",
      opts.animations && opts.animations.enter || cfg.toast.animations.enter
    );
    const animEnabled = !!((_e = cfg.animation) == null ? void 0 : _e.enable);
    if (!prefersReducedMotion() && animEnabled && enterResolved.durationMs > 0) {
      applyAnim(el, "enter", enterResolved);
      onceAnimationEnd(el, enterResolved.durationMs, () => {
        removeMatchingClasses(el, /^pj-enter-/);
      });
    }
    container.appendChild(el);
    manager.showToast(container, pos, behavior, maxVisible);
    return {
      dismiss: () => {
        var _a2;
        if (timer) window.clearTimeout(timer);
        beginExit(el, container, pos, (_a2 = opts.animations) == null ? void 0 : _a2.exit);
      }
    };
  }

  // src/dialogs.ts
  async function question(opts) {
    return new Promise((resolve) => {
      open({
        title: opts.title,
        content: opts.message,
        buttons: opts.buttons.map((b) => ({
          ...b,
          closeOnClick: true,
          onClick: () => resolve({ id: b.id })
        })),
        closeOnEsc: opts.escReturns !== null,
        closeOnBackdrop: opts.backdropReturns !== null,
        onClose: (r) => {
          if (r === "esc" && opts.escReturns) resolve({ id: opts.escReturns });
          else if (r === "backdrop" && opts.backdropReturns) resolve({ id: opts.backdropReturns });
        }
      });
    });
  }
  async function confirm(message, extra) {
    var _a, _b;
    const { id } = await question({
      message,
      title: extra == null ? void 0 : extra.title,
      buttons: [
        { id: "yes", text: (_a = extra == null ? void 0 : extra.yesText) != null ? _a : "Yes", variant: "primary" },
        { id: "no", text: (_b = extra == null ? void 0 : extra.noText) != null ? _b : "No", variant: "neutral" },
        ...extra && extra.includeCancel ? [{ id: "cancel", text: "Cancel" }] : []
      ],
      escReturns: "cancel",
      backdropReturns: "cancel"
    });
    return id === "yes";
  }
  async function alert(message, opts) {
    await new Promise((resolve) => {
      open({
        title: opts == null ? void 0 : opts.title,
        content: message,
        buttons: [{ id: "ok", text: config.get().i18n.ok, variant: "primary", onClick: () => resolve() }],
        closeOnEsc: true,
        closeOnBackdrop: true
      });
    });
  }

  // src/i18n.ts
  var i18n_exports = {};
  __export(i18n_exports, {
    getAvailable: () => getAvailable,
    load: () => load,
    register: () => register,
    set: () => set,
    use: () => use
  });
  var registry = /* @__PURE__ */ new Map();
  function register(bundle) {
    registry.set(bundle.locale, bundle);
  }
  function getAvailable() {
    return Array.from(registry.keys());
  }
  function set(locale) {
    const pack = registry.get(locale);
    if (!pack) throw new Error(`PromptJS: no i18n pack registered for "${locale}"`);
    config.update({ i18n: pack });
  }
  function use(locale, bundle) {
    if (bundle) register(bundle);
    set(locale);
  }
  function load(locale, loader) {
    return loader().then((bundle) => {
      register(bundle);
      set(locale);
      return bundle;
    });
  }
  register({
    locale: "en",
    dir: "auto",
    ok: "OK",
    cancel: "Cancel",
    yes: "Yes",
    no: "No",
    close: "Close",
    dismiss: "Dismiss",
    titles: {
      info: "Information",
      success: "Success",
      warning: "Warning",
      error: "Error",
      question: "Question"
    }
  });

  // src/index.ts
  var version = "0.1.0" ;
  if (typeof window !== "undefined") {
    const api = { config, Modal: modal_exports, toast, question, confirm, alert, i18n: i18n_exports, version };
    window.PromptJS = Object.freeze(api);
  }

  exports.Modal = modal_exports;
  exports.alert = alert;
  exports.config = config;
  exports.confirm = confirm;
  exports.i18n = i18n_exports;
  exports.question = question;
  exports.toast = toast;
  exports.version = version;

  return exports;

})({});
//# sourceMappingURL=index.global.js.map
//# sourceMappingURL=index.global.js.map