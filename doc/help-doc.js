/* help-doc.js
   - Wires Run/Copy buttons for all demos
   - Controls PromptJS theme (header buttons + theming section)
   - Keeps header theme buttons IN SYNC with PromptJS.config.theme via onChange()
   - Leaves the help doc’s own theme alone
*/

(function () {
  const hasPrompt = () => typeof window !== "undefined" && !!window.PromptJS;
  const PJ = () => window.PromptJS;

  // ---- Utilities -----------------------------------------------------------

  function bySel(sel, root = document) {
    return root.querySelector(sel);
  }

  function bySelAll(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function copyText(selector) {
    const node = bySel(selector);
    if (!node) return false;
    const text = node.textContent || "";
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(ta);
    });
    return true;
  }

  function markCopied(btn) {
    btn.classList.add("copied");
    const prev = btn.textContent;
    btn.textContent = "Copied";
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.textContent = prev;
    }, 900);
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Gentle info toast hint
  function hintToast(message) {
    if (!hasPrompt()) return;
    PJ().toast({ kind: "info", message, timeoutMs: 1500 });
  }

  // ---- Version badge -------------------------------------------------------

  function setVersionBadges() {
    if (!hasPrompt()) return;
    const v = PJ().version || "unknown";
    const a = bySel("#version");
    const b = bySel("#version-inline");
    if (a) a.textContent = "v" + v;
    if (b) b.textContent = "v" + v;
  }

  // ---- Theme controls (PromptJS theme ONLY) --------------------------------

  // Sync header theme button active state from current config.theme
  function syncHeaderThemeButtons() {
    const group = bySel(".theme-toggle");
    if (!group || !hasPrompt()) return;
    const theme = PJ().config.get().theme || "auto";
    bySelAll(".theme-toggle button", group).forEach((b) => {
      const t = b.getAttribute("data-theme");
      b.classList.toggle("active", t === theme);
    });
  }

  // Header buttons: data-theme="auto|light|dark" -> PromptJS.config.update({theme: ..})
  function wireHeaderTheme() {
    const group = bySel(".theme-toggle");
    if (!group) return;

    // Clicks update PromptJS theme
    group.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-theme]");
      if (!btn || !hasPrompt()) return;
      const theme = btn.getAttribute("data-theme");
      PJ().config.update({ theme });
      hintToast(`PromptJS theme: ${theme}`);
      // active state will also be updated by the onChange subscription; doing it here keeps it snappy
      syncHeaderThemeButtons();
    });

    // Tooltip/hint: these control PromptJS theme only
    group.setAttribute("title", "Controls PromptJS theme (not the doc page)");
  }

  // Theming section demo buttons
  function wireThemingSection() {
    bySelAll('#theming .btn-run[data-demo^="theme-"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!hasPrompt()) return;
        const id = btn.getAttribute("data-demo");
        const theme =
          id === "theme-dark"
            ? "dark"
            : id === "theme-light"
            ? "light"
            : "auto";
        PJ().config.update({ theme });
        hintToast(`PromptJS theme set to ${theme} (help doc theme unchanged)`);
        // active state will be synced via onChange
      });
    });
  }

  // ---- Copy buttons (any section) ------------------------------------------
  function wireCopyButtons() {
    bySelAll(".btn-copy[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sel = btn.getAttribute("data-copy");
        if (copyText(sel)) markCopied(btn);
      });
    });
  }

  // ---- Run buttons: demo dispatch ------------------------------------------
  function wireRunButtons() {
    bySelAll(".btn-run[data-demo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!hasPrompt()) return;
        const id = btn.getAttribute("data-demo");
        const run = DEMOS[id];
        if (run) run();
      });
    });
  }

  // ---- Collapsible TOC -----------------------------------------------------
  function wireCollapsibleTOC() {
    const toc = document.getElementById("toc");
    if (!toc) return;

    // Find all groups
    const groups = toc.querySelectorAll(".toc-group");
    groups.forEach((group, idx) => {
      const title = group.querySelector(".toc-group-title");
      const key = "toc-open-" + (title?.textContent?.trim() || idx);

      // Default open unless stored otherwise
      const stored = sessionStorage.getItem(key);
      const isOpen = stored === null ? "true" : stored;
      group.setAttribute("data-open", isOpen);

      if (!title) return;

      title.setAttribute("role", "button");
      title.setAttribute("tabindex", "0");
      title.setAttribute("aria-expanded", isOpen === "true" ? "true" : "false");

      const toggle = () => {
        const curr = group.getAttribute("data-open") === "true";
        const next = (!curr).toString();
        group.setAttribute("data-open", next);
        title.setAttribute("aria-expanded", next);
        try {
          sessionStorage.setItem(key, next);
        } catch {}
      };

      title.addEventListener("click", toggle);
      // Keyboard support
      title.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  // --- Simple toast-config snapshot/restore helpers ---------------------------
  function copyToastConfig() {
    // animations + numbers/strings only, safe to structuredClone or JSON clone
    const t = PJ().config.get().toast;
    try {
      return structuredClone(t);
    } catch {
      return JSON.parse(JSON.stringify(t));
    }
  }

  function restoreToastConfig(snapshot, delayMs = 0) {
    const doRestore = () => PJ().config.update({ toast: snapshot });
    if (delayMs > 0) setTimeout(doRestore, delayMs);
    else doRestore();
  }

  function setTopCenterSlideDefaults() {
    if (!hasPrompt()) return;
    PJ().config.update({
      toast: {
        behavior: "replace",
        defaultPosition: "top-center",
        animations: {
          enter: { preset: "slide", direction: "up", distance: "edge" },
          exit: { preset: "slide", direction: "up", distance: "edge" },
        },
      },
    });
  }

  // ---- Demo implementations -------------------------------------------------
  const DEMOS = {
    // Quick demo ---------------------------------------------------------------
    "qd-modal-info": () => {
      if (!hasPrompt()) return;
      PJ().Modal.open({
        kind: "info",
        title: "Heads up",
        content: "This is a quick information modal.",
      });
    },

    "qd-confirm": async () => {
      if (!hasPrompt()) return;
      const ok = await PJ().confirm("Proceed with this action?", {
        title: "Confirm",
      });
      PJ().toast({
        kind: ok ? "success" : "info",
        message: ok ? "Confirmed." : "Cancelled.",
        timeoutMs: 1400,
      });
    },

    "qd-question": async () => {
      if (!hasPrompt()) return;
      const { id } = await PJ().question({
        title: "Pick one",
        message: "Choose an option.",
        kind: "question",
        buttons: [
          { id: "a", text: "Option A", variant: "primary" },
          { id: "b", text: "Option B" },
        ],
        escReturns: "b",
        backdropReturns: "b",
      });
      PJ().toast({
        kind: "success",
        message: "You chose: <b>" + id + "</b>",
        timeoutMs: 1400,
      });
    },

    "qd-bare-sheet": () => {
      if (!hasPrompt()) return;
      const bareModal = PJ().Modal.bare({
        windowed: false, // full-bleed/sheet style
        content: (() => {
          const box = document.createElement("div");

          box.style.cssText =
            "padding:16px 18px; background:rgba(15,20,32,.75); border: 1px solid #31405a; box-shadow:0 8px 24px rgba(0,0,0,.3);";
          box.innerHTML = `
        <h3 style="margin:0 0 6px">Bare modal</h3>
        <p style="margin:0 0 10px;color:#a9b3c9">No header/footer chrome — perfect for custom layouts.</p>
        <button id="bare-ok" style="padding:6px 10px;border:1px solid #31405a;background:#0f1420;color:#e7ecf7;border-radius:8px;cursor:pointer">Close</button>
      `;
          setTimeout(() => {
            box.querySelector("#bare-ok")?.addEventListener("click", () => {
              // close by dispatching a click outside or calling the instance from onOpen
              // simpler: use a separate small modal to confirm close
              PJ().toast({ kind: "info", message: "Closing…", timeoutMs: 900 });
              // Let the user dismiss by backdrop or ESC (defaults true)

              setTimeout(() => {
                bareModal.close("ok");
              }, 1000);
            });
          }, 0);
          return box;
        })(),
      });
    },

    "qd-toast-success": () => {
      if (!hasPrompt()) return;
      PJ().toast({
        kind: "success",
        message: "Saved successfully.",
        // keep default position; small lifetime cue will show if enabled in config
      });
    },

    "qd-toast-queue": () => {
      if (!hasPrompt()) return;
      // No global config change — specify per toast
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          PJ().toast({
            kind: "info",
            message: "Queued " + (i + 1),
            timeoutMs: 2000,
            position: "top-right",
            behavior: "queue",
            maxVisible: 3,
          });
        }, i * 800);
      }
    },

    "qd-toast-replace": () => {
      if (!hasPrompt()) return;
      PJ().toast({
        kind: "info",
        message: "Connecting…",
        position: "bottom-center",
        behavior: "replace",
      });
      setTimeout(
        () =>
          PJ().toast({
            kind: "warning",
            message: "Still trying…",
            position: "bottom-center",
            behavior: "replace",
          }),
        900
      );
      setTimeout(
        () =>
          PJ().toast({
            kind: "success",
            message: "Connected.",
            position: "bottom-center",
            behavior: "replace",
          }),
        1800
      );
    },

    "qd-toast-sticky": () => {
      if (!hasPrompt()) return;
      PJ().toast({
        kind: 'neutral',
        message: "<b>Item archived</b>.",
        actions: [
          {
            text: "Undo",
            onClick: () =>
              PJ().toast({
                kind: "info",
                message: "Restored.",
                timeoutMs: 1200,
              }),
          },
          { text: "Close" },
        ],
        timeoutMs: 0,
        dismissible: false,
      });
    },

    // Quick start
    quickstart: () => {
      PJ().Modal.open({
        kind: "info",
        title: "Welcome",
        content: "PromptJS is ready.",
      });
    },

    // Config overview
    "config-overview": () => {
      PJ().config.update({
        theme: "auto",
        container: null,
        zIndexBase: 2000,
        animation: { enable: true, durationMs: 180, easing: "ease" },
        i18n: PJ().config.get().i18n,
        a11y: {},
        breakpoints: { sm: 480, md: 640, lg: 800 },
        icons: {},
        overlay: { fade: true, surfaceAlpha: 0.6, backdropBlurPx: 0 },
        modal: { concurrency: "queue", surfaceAlpha: 1, backdropBlurPx: 0 },
        toast: {
          defaultPosition: "top-center",
          behavior: "stack",
          maxVisible: 3,
          spacingPx: 10,
          margins: { top: 16, bottom: 16, left: 16, right: 16 },
          zBoost: 100,
          animations: {
            enter: { preset: "slide", direction: "auto" },
            exit: { preset: "slide", direction: "auto" },
            timeoutCue: { show: true, position: "bottom", thicknessPx: 3 },
          },
          defaultTimeoutMs: 4000,
          defaultDismissible: true,
        },
      });
      PJ().toast({
        kind: "success",
        message: "Config applied (overview defaults).",
      });
    },

    "config-tryit": () => {
      if (!hasPrompt()) return;

      // Cycle PromptJS theme: auto -> dark -> light -> auto
      const next = { auto: "dark", dark: "light", light: "auto" };
      const curTheme = PJ().config.get().theme || "auto";
      PJ().config.update({ theme: next[curTheme] });

      // Flip only the timeout cue direction via deep-merge
      const cue = PJ().config.get().toast.animations.timeoutCue || {};
      const curDir = cue.direction || "shrink";
      PJ().config.update({
        toast: {
          animations: {
            timeoutCue: { direction: curDir === "shrink" ? "grow" : "shrink" },
          },
        },
      });

      PJ().toast({
        kind: "info",
        message: "Theme & timeout cue direction toggled.",
        position: "top-right",
        timeoutMs: 2500,
      });
    },

    // Modals
    "modal-basic": () => {
      PJ().Modal.open({
        kind: "info",
        title: "Information",
        content: "Everything is wired up!",
      });
    },
    "modal-async": () => {
      PJ().Modal.open({
        kind: "question",
        title: "Do a slow thing?",
        content: "We'll fake a 1s async task.",
        buttons: [
          { id: "cancel", text: "Cancel", variant: "neutral" },
          {
            id: "go",
            text: "Do it",
            variant: "primary",
            onClick: async () => {
              await sleep(1000);
            },
          },
        ],
        onClose: (r) => console.log("Closed by:", r),
      });
    },
    "modal-update": () => {
      const inst = PJ().Modal.open({ title: "Downloading…", content: "0%" });
      let i = 0;
      const t = setInterval(() => {
        i += 10;
        inst.update({ content: i + "%" });
        if (i >= 100) {
          clearInterval(t);
          inst.update({ title: "Done!", content: "Complete." });
        }
      }, 200);
    },

    // Dialog helpers
    "dlg-alert": async () => {
      await PJ().alert("Saved successfully.", { title: "Success" });
    },
    "dlg-confirm": async () => {
      const ok = await PJ().confirm("Delete this item?", {
        title: "Confirm",
        includeCancel: true,
      });
      PJ().toast({
        kind: ok ? "success" : "info",
        message: ok ? "Deleted." : "Kept.",
      });
    },
    "dlg-question": async () => {
      const res = await PJ().question({
        title: "Pick one",
        message: "Choose:",
        buttons: [
          { id: "a", text: "Option A", variant: "primary" },
          { id: "b", text: "Option B" },
        ],
        escReturns: "a",
        backdropReturns: "b",
      });
      PJ().toast({ kind: "info", message: "You chose <b>" + res.id + "</b>." });
    },

    "bare-overlay": () => {
      if (!hasPrompt()) return;
      const box = document.createElement("div");
      box.innerHTML = `
    <div style="display:grid;gap:12px;max-width:360px">
      <h3 style="margin:0">Hello from bare()</h3>
      <p style="margin:0">No header/footer chrome—just your content.</p>
      <button id="close-bare" class="btn">Close</button>
    </div>`;

      const inst = PJ().Modal.bare({
        windowed: false,
        content: box,
        backdropBlurPx: 2,
      });

      box
        .querySelector("#close-bare")
        .addEventListener("click", () => inst.close("ok"));
    },

    "bare-windowed": () => {
      if (!hasPrompt()) return;
      const panel = document.createElement("div");
      panel.innerHTML = `
    <div style="display:grid;gap:10px">
      <div style="font-weight:600">Translucent card</div>
      <p style="margin:0">Use surfaceAlpha + dialogBlurPx.</p>
      <button id="close-card" class="btn">Close</button>
    </div>`;

      const inst = PJ().Modal.bare({
        windowed: true,
        content: panel,
        surfaceAlpha: 0.9,
        dialogBlurPx: 6,
        ariaLabel: "Translucent card",
      });

      panel
        .querySelector("#close-card")
        .addEventListener("click", () => inst.close("ok"));
    },

    "bare-draggable": () => {
      if (!hasPrompt()) return;
      const body = document.createElement("div");
      body.style.cssText = "padding:24px;";
      body.innerHTML = `
    <div class="my-handle" style="cursor:grab;font-weight:600;margin-bottom:8px">Drag me</div>
    <p style="margin:0 0 12px 0">Provide your own handle inside content.</p>
    <button id="close-drag" class="btn">Close</button>`;

      const inst = PJ().Modal.bare({
        windowed: true,
        content: body,
        draggable: { handle: ".my-handle", cursor: "grab" },
      });

      body
        .querySelector("#close-drag")
        .addEventListener("click", () => inst.close("ok"));
    },

    // Toasts
    "toast-basic": () => {
      setTopCenterSlideDefaults();
      PJ().toast({ kind: "success", message: "Saved user <b>John Doe</b>." });
    },
    "toast-queue": () => {
      if (!hasPrompt()) return;
      const snap = copyToastConfig();

      PJ().config.update({
        toast: {
          behavior: "queue",
          defaultPosition: "top-right",
          maxVisible: 2,
        },
      });
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          PJ().toast({ kind: "info", message: "Queued " + (i + 1), timeoutMs: 2000 });
        }, i * 800);
      }

      restoreToastConfig(snap, 6000);
    },
    "toast-mini-modal": () => {
      PJ().toast({
        kind: "success",
        message: "<b>Hello</b>, Saved successfully.",
        actions: [
          { text: "Undo", onClick: () => PJ().alert("Undo clicked") },
          { text: "Close" },
        ],
        timeoutMs: 0,
        dismissible: false,
      });
    },
    "toast-anim": () => {
      PJ().toast({
        kind: "warning",
        message: "Sliding in from the left.",
        animations: {
          enter: {
            preset: "slide",
            direction: "left",
            distance: "40vh",
            durationMs: 400,
            easing: "ease-out",
          },
          exit: { preset: "fade", durationMs: 160 },
        },
      });
    },

    // i18n
    "i18n-bn": () => {
      PJ().i18n.use("bn", {
        locale: "bn",
        dir: "auto",
        ok: "ঠিক আছে",
        cancel: "বাতিল",
        yes: "হ্যাঁ",
        no: "না",
        close: "বন্ধ",
        dismiss: "বন্ধ করুন",
        titles: {
          info: "তথ্য",
          success: "সাফল্য",
          warning: "সতর্কতা",
          error: "ত্রুটি",
          question: "প্রশ্ন",
        },
      });
      PJ().alert("ভাষা পরিবর্তিত হয়েছে।", { title: "নোট" });
    },

    // Theming (PromptJS theme only)
    "theme-dark": () => PJ().config.update({ theme: "dark" }),
    "theme-light": () => PJ().config.update({ theme: "light" }),
    "theme-auto": () => PJ().config.update({ theme: "auto" }),

    // Recipes
    "recipe-form": () => {
      if (!hasPrompt()) return;
      setTopCenterSlideDefaults();

      const form = document.createElement("form");
      form.innerHTML = `
    <label style="display:block;margin:6px 0">
      Name: <input id="name" required style="width:100%; margin-top:8px;" />
    </label>
    <small>Required. Press “Save” to simulate an async API call.</small>`;

      const inst = PJ().Modal.open({
        title: "Create user",
        content: form,
        buttons: [
          { id: "cancel", text: "Cancel", variant: "neutral" },
          {
            id: "save",
            text: "Save",
            variant: "primary",
            closeOnClick: false,
            onClick: async () => {
              const input = form.querySelector("#name");
              const name = input.value.trim();
              if (!name) {
                input.focus();
                return;
              }
              await new Promise((r) => setTimeout(r, 800));
              PJ().toast({
                kind: "success",
                message: "User <b>" + name + "</b> created.",
              });
              inst.close("save");
            },
          },
        ],
        closeOnBackdrop: false,
      });
    },

    "recipe-wizard": () => {
      if (!hasPrompt()) return;

      let step = 1;

      const inst = PJ().Modal.open({
        title: "Step 1 / 2",
        content: "Choose where to go next.",
        buttons: [
          {
            id: "back",
            text: "Back",
            variant: "ghost",
            onClick: () => {},
            closeOnClick: false,
          },
          {
            id: "next",
            text: "Next",
            variant: "primary",
            closeOnClick: false,
            onClick: () => {
              step = 2;
              inst.update({
                title: "Step 2 / 2",
                content: "All set. Continue?",
                buttons: [
                  {
                    id: "back",
                    text: "Back",
                    variant: "ghost",
                    closeOnClick: false,
                    onClick: () => {
                      step = 1;
                      inst.update({
                        title: "Step 1 / 2",
                        content: "Choose where to go next.",
                        buttons: [
                          {
                            id: "back",
                            text: "Back",
                            variant: "ghost",
                            onClick: () => {},
                            closeOnClick: false,
                          },
                          {
                            id: "next",
                            text: "Next",
                            variant: "primary",
                            closeOnClick: false,
                            onClick: () => {
                              step = 2;
                              inst.update({
                                title: "Step 2 / 2",
                                content: "All set. Continue?",
                                buttons: [
                                  {
                                    id: "back",
                                    text: "Back",
                                    variant: "ghost",
                                    closeOnClick: false,
                                    onClick: () => {},
                                  },
                                  {
                                    id: "finish",
                                    text: "Finish",
                                    variant: "primary",
                                  },
                                ],
                              });
                            },
                          },
                        ],
                      });
                    },
                  },
                  { id: "finish", text: "Finish", variant: "primary" },
                ],
              });
            },
          },
        ],
      });
    },

    "recipe-status": () => {
      if (!hasPrompt()) return;
      const snap = copyToastConfig();

      // snapshot only what we change
      const prev = PJ().config.get().toast;
      const prevBehavior = prev.behavior;
      const prevPos = prev.defaultPosition;

      PJ().config.update({
        toast: { behavior: "replace", defaultPosition: "bottom-center" },
      });
      PJ().toast({ kind: "info", message: "Connecting…" });
      setTimeout(
        () => PJ().toast({ kind: "warning", message: "Still trying…" }),
        900
      );
      setTimeout(() => {
        PJ().toast({ kind: "success", message: "Connected." });
        // restore shortly after the last toast shows
        setTimeout(() => {
          PJ().config.update({
            toast: { behavior: prevBehavior, defaultPosition: prevPos },
          });
        }, 800);
      }, 1800);

      restoreToastConfig(snap, 4000);
    },

    "recipe-retry": () => {
      if (!hasPrompt()) return;
      PJ().config.update({
        toast: { behavior: "replace", defaultPosition: "top-center" },
      });
      PJ().toast({
        kind: "error",
        message: "Failed to save.",
        actions: [
          {
            text: "Retry",
            onClick: () => {
              PJ().toast({
                kind: "info",
                message: "Retrying…",
                timeoutMs: 1200,
              });
              setTimeout(() => {
                PJ().toast({ kind: "success", message: "Saved on retry." });
              }, 1200);
            },
          },
          { text: "Dismiss" },
        ],
        timeoutMs: 0,
        dismissible: true,
      });
    },

    "recipe-undo": () => {
      if (!hasPrompt()) return;
      PJ().config.update({
        toast: { behavior: "replace", defaultPosition: "top-center" },
      });
      PJ().toast({
        kind: "success",
        message: "<b>Item archived</b>.",
        actions: [
          {
            text: "Undo",
            onClick: () => PJ().toast({ kind: "info", message: "Restored." }),
          },
          { text: "Close" },
        ],
        timeoutMs: 0,
        dismissible: false,
      });
    },

    "recipe-destructive": async () => {
      if (!hasPrompt()) return;
      setTopCenterSlideDefaults();
      const ok = await PJ().confirm("Delete this repository?", {
        title: "Delete repository",
        yesText: "Delete",
        noText: "Keep",
        includeCancel: true,
      });
      if (ok) PJ().toast({ kind: "success", message: "Repository deleted." });
      else
        PJ().toast({ kind: "info", message: "Kept as-is.", timeoutMs: 1500 });
    },

    "recipe-container": () => {
      if (!hasPrompt()) return;

      // Create a host panel
      const host = document.createElement("div");
      host.style.cssText =
        "position:relative;min-height:160px;border:1px dashed #3a4253;padding:12px;border-radius:10px";
      host.innerHTML =
        "<b>Local mount:</b> modals/toasts appear within this box.";
      document.querySelector("main.content")?.prepend(host);

      // Snapshot bits we touch
      const prevContainer = PJ().config.get().container;
      const prevZ = PJ().config.get().zIndexBase;

      // Point PromptJS at it
      PJ().config.update({
        container: host,
        zIndexBase: 10,
        toast: { zBoost: 20 },
      });

      // Open a modal inside the panel
      const inst = PJ().Modal.open({
        title: "Local modal",
        content: "I render inside the panel.",
      });

      // Clean up / revert after a moment
      setTimeout(() => {
        PJ().config.update({
          container: prevContainer || null,
          zIndexBase: prevZ || 2000,
        });
        // remove the demo host node from the document
        host.remove();
      }, 3500);
    },

    "recipe-i18n": async () => {
      if (!hasPrompt()) return;

      // Snapshot before switching (we only need the locale code here)
      const prevLocale = PJ().config.get().i18n.locale;

      PJ().i18n.use("de", {
        locale: "de",
        dir: "auto",
        ok: "OK",
        cancel: "Abbrechen",
        yes: "Ja",
        no: "Nein",
        close: "Schließen",
        dismiss: "Schließen",
        titles: {
          info: "Information",
          success: "Erfolg",
          warning: "Warnung",
          error: "Fehler",
          question: "Frage",
        },
      });

      await PJ().alert("Sprache gewechselt.", { title: "Hinweis" });

      // Restore previous locale (defaults include 'en' already registered)
      if (prevLocale && prevLocale !== "de") {
        PJ().i18n.set(prevLocale);
      } else {
        PJ().i18n.set("en");
      }
    },
  };

  // ---- Init ----------------------------------------------------------------
  window.addEventListener("DOMContentLoaded", () => {
    setVersionBadges();
    wireHeaderTheme();
    wireThemingSection();
    wireCopyButtons();
    wireRunButtons();
    wireCollapsibleTOC();

    // Keep header theme buttons synced with actual PromptJS theme
    if (hasPrompt() && PJ().config && PJ().config.onChange) {
      try {
        PJ().config.onChange(() => syncHeaderThemeButtons());
      } catch {}
      // initial sync
      syncHeaderThemeButtons();
    }
  });
})();
