import { useEffect } from "react";

// Shared by both navigation drawers. Keep keyboard focus inside the open drawer.
export function useDrawer(open, panelRef, triggerRef, onClose, query = "(max-width: 800px)") {
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const inertElements = [];
    for (let node = panel; node && node !== document.body; node = node.parentElement) {
      for (const sibling of node.parentElement?.children || []) {
        if (sibling === node || sibling.classList.contains("drawer-backdrop") || ["SCRIPT", "STYLE", "LINK"].includes(sibling.tagName) || sibling.hasAttribute("inert")) continue;
        sibling.setAttribute("inert", "");
        inertElements.push(sibling);
      }
    }
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0 && document.documentElement.clientWidth) document.body.style.paddingRight = `${scrollbar}px`;
    const focusable = () => [...panel.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(el => !el.hidden);
    const focusFirst = () => (focusable()[0] || panel).focus();
    focusFirst();
    const keydown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0], last = items.at(-1);
      if (!first) { event.preventDefault(); panel.focus(); }
      else if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    const focusin = event => { if (!panel.contains(event.target)) focusFirst(); };
    const media = window.matchMedia(query);
    const resize = event => { if (!event.matches) onClose(); };
    window.addEventListener("keydown", keydown);
    document.addEventListener("focusin", focusin);
    media.addEventListener("change", resize);
    return () => {
      window.removeEventListener("keydown", keydown);
      document.removeEventListener("focusin", focusin);
      media.removeEventListener("change", resize);
      inertElements.forEach(element => element.removeAttribute("inert"));
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      trigger?.focus();
    };
  }, [open, panelRef, triggerRef, onClose, query]);
}
