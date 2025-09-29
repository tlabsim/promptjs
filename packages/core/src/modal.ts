/**
 * PromptJS – modal.ts
 * Core modal dialog implementation.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * Exposes:
 *   - open(options): standard modal dialog with header, content, footer
 *  - bare(options): bare modal surface with content only
 *  - Both return a ModalInstance with .close(), .contentEl, and .update()
 */
 


import { sanitize } from "./sanitize";
import { createSurface, type CoreOptions } from "./modal-core";
import type {
  ModalOptions,
  BareModalOptions,
  ModalInstance,
  ButtonDef,
} from "./types";
import { config } from "./config";

/* ---------------- Dialogs: Modal.open(...) ---------------- */

export function open(options: ModalOptions): ModalInstance {
  const cfg = config.get();
  const i18n = cfg.i18n;

  const core: CoreOptions = {
    // chrome
    windowed: true,
    bare: false,
    size: options.size,
    surfaceClass: (options as any).surfaceClass, // optional hooks if you added them
    contentClass: (options as any).contentClass,

    // visuals
    surfaceAlpha: options.surfaceAlpha,
    dialogBlurPx: options.dialogBlurPx,
    backdropBlurPx: options.backdropBlurPx,
    kind: options.kind,

    // behavior
    animate: options.animate,
    closeOnEsc: options.closeOnEsc ?? true,
    closeOnBackdrop: options.closeOnBackdrop ?? true,
    trapFocus: options.trapFocus ?? true,
    ariaLabel: options.ariaLabel,
    draggable: options.draggable,
    onOpen: options.onOpen,
    onClose: options.onClose,
    concurrency: options.concurrency,
  };

  // dialog renderers
  return createSurface(core, {
    renderHeader(inst, header) {
      const hasTitle =
        typeof options.title === "string" && options.title.length > 0;
      const geti18Title = (kind: string) => {
        return (i18n.titles as any)[kind] || "";
      };
      const computedTitle = hasTitle
        ? options.title
        : options.kind
        ? geti18Title(options.kind)
        : undefined;

      if (computedTitle) {
        header.innerHTML = `<h2 class="pj-modal-title">${sanitize(
          computedTitle
        )}</h2>`;
      }

      if (options.showClose ?? true) {
        const c = document.createElement("button");
        c.className = "pj-modal-close";
        c.setAttribute("aria-label", options.closeAriaLabel || i18n.close);
        c.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
          'fill="none" stroke="currentColor" stroke-width="4" aria-hidden="true">' +
          '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>';
        c.addEventListener("click", () => inst.close("close"));
        header.appendChild(c);
      }
    },

    renderBody(_inst, body, setContentEl) {
      if (typeof options.content === "string") {
        body.innerHTML = options.unsafeHTML
          ? options.content
          : sanitize(options.content);
        setContentEl(body);
      } else {
        body.appendChild(options.content);
        setContentEl(options.content as HTMLElement);
      }
    },

    renderFooter(inst, footer) {
      const btns: ButtonDef[] = options.buttons ?? [
        { id: "ok", text: i18n.ok, variant: "primary" },
      ];
      for (const btn of btns) {
        const b = document.createElement("button");
        b.className = `pj-modal-btn ${btn.variant || "neutral"}`;
        b.textContent = btn.text;
        b.addEventListener("click", async () => {
          try {
            b.disabled = true;
            if (btn.onClick) await btn.onClick(inst);
          } finally {
            b.disabled = false;
            if (btn.closeOnClick ?? true) inst.close(btn.id);
          }
        });
        footer.appendChild(b);
      }

      // Provide a real update() only for dialog fields
      (inst as any).update = (
        partial: Partial<
          Pick<ModalOptions, "title" | "content" | "unsafeHTML" | "buttons">
        >
      ) => {
        if (partial.title !== undefined) {
          const h = inst.el.querySelector(
            ".pj-modal-title"
          ) as HTMLElement | null;
          if (h) h.textContent = partial.title ?? "";
        }
        if (partial.content !== undefined) {
          const bodyEl = inst.el.querySelector(
            ".pj-modal-content"
          ) as HTMLElement;
          if (!bodyEl) return;
          bodyEl.innerHTML = "";
          if (typeof partial.content === "string") {
            bodyEl.innerHTML = partial.unsafeHTML
              ? partial.content
              : sanitize(partial.content);
          } else {
            bodyEl.appendChild(partial.content);
          }
          (inst as any)._contentEl = bodyEl; // defensive, though getter is set in core
          // keep the exposed getter consistent
          Object.getOwnPropertyDescriptor(inst, "contentEl")?.get &&
            ((_) => _)(bodyEl);
        }
        if (partial.buttons) {
          footer.innerHTML = "";
          partial.buttons.forEach((bd) => {
            const bb = document.createElement("button");
            bb.className = `pj-modal-btn ${bd.variant || "neutral"}`;
            bb.textContent = bd.text;
            bb.addEventListener("click", async () => {
              try {
                bb.disabled = true;
                if (bd.onClick) await bd.onClick(inst);
              } finally {
                bb.disabled = false;
                if (bd.closeOnClick ?? true) inst.close(bd.id);
              }
            });
            footer.appendChild(bb);
          });
        }
      };
    },

    setUpdater: (inst, { header, body, footer, setContentEl }) => {
      (inst as any).update = (
        partial: Partial<
          Pick<ModalOptions, "title" | "content" | "unsafeHTML" | "buttons">
        >
      ) => {
        // title
        if (partial.title !== undefined && header) {
          const h = header.querySelector(
            ".pj-modal-title"
          ) as HTMLElement | null;
          if (h) h.textContent = partial.title ?? "";
        }

        // content
        if (partial.content !== undefined) {
          body.innerHTML = "";
          if (typeof partial.content === "string") {
            body.innerHTML = partial.unsafeHTML
              ? partial.content
              : sanitize(partial.content);
          } else {
            body.appendChild(partial.content);
          }
          setContentEl(body); // keeps inst.contentEl correct without touching privates
        }

        // buttons (only if footer exists)
        if (partial.buttons && footer) {
          footer.innerHTML = "";
          partial.buttons.forEach((bd) => {
            const bb = document.createElement("button");
            bb.className = `pj-modal-btn ${bd.variant || "neutral"}`;
            bb.textContent = bd.text;
            bb.addEventListener("click", async () => {
              try {
                bb.disabled = true;
                if (bd.onClick) await bd.onClick(inst);
              } finally {
                bb.disabled = false;
                if (bd.closeOnClick ?? true) inst.close(bd.id);
              }
            });
            footer.appendChild(bb);
          });
        }
      };
    },
  });
}

export function bare(options: BareModalOptions = {}): ModalInstance {
  const windowed = options.windowed !== false;

  const core: CoreOptions = {
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
    closeOnEsc: options.closeOnEsc ?? true,
    closeOnBackdrop: options.closeOnBackdrop ?? true,
    trapFocus: options.trapFocus ?? true,
    ariaLabel: options.ariaLabel,
    draggable: (() => {
      if (!windowed && options.draggable) {
        const spec =
          typeof options.draggable === "object" ? options.draggable : {};
        return {
          handle: spec.handle ?? undefined,
          axis: spec.axis,
          withinViewport: spec.withinViewport,
          disableOnMobile: spec.disableOnMobile,
          cursor: spec.cursor,
        };
      }
      return options.draggable;
    })(),
    onOpen: options.onOpen,
    onClose: options.onClose,
    concurrency: options.concurrency,
  };

  return createSurface(core, {
    // no header/footer by default
    renderBody(_inst, body, setContentEl) {
      if (typeof options.content === "string") {
        body.innerHTML = options.unsafeHTML
          ? options.content
          : sanitize(options.content);
        setContentEl(body);
      } else if (options.content) {
        body.appendChild(options.content);
        setContentEl(options.content as HTMLElement);
      }
    },
  });
}
