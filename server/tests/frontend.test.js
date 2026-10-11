import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { initialSite, initialProjects } from "../seed-content.js";
let dom, React, act, createRoot, MemoryRouter, module, root;
const content = {
  ...initialSite,
  projects: initialProjects.map((p, i) => ({ ...p, _id: String(i) })),
};
const respond = (value, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(value), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
before(
  async () => {
    dom = new JSDOM(
      '<!doctype html><html><head></head><body><div id="test"></div></body></html>',
      { url: "http://127.0.0.1:5173", pretendToBeVisual: true },
    );
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    Object.defineProperty(globalThis, "navigator", {
      value: dom.window.navigator,
      configurable: true,
    });
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.Node = dom.window.Node;
    globalThis.SVGElement = dom.window.SVGElement;
    globalThis.getComputedStyle = dom.window.getComputedStyle;
    globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(
      dom.window,
    );
    globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(
      dom.window,
    );
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    window.scrollTo = () => {};
    window.confirm = () => true;
    globalThis.fetch = () => respond({ theme: "dark-ember" });
    window.matchMedia = (query) => ({
      matches: query.includes("reduce") && !query.includes("no-preference"),
      media: query,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    });
    const dialog = dom.window.HTMLDialogElement.prototype;
    dialog.showModal = function () {
      this.setAttribute("open", "");
    };
    dialog.close = function () {
      this.removeAttribute("open");
    };
    await mkdir(".cache", { recursive: true });
    await build({
      configFile: false,
      root: path.resolve("."),
      publicDir: false,
      logLevel: "error",
      plugins: [react()],
      ssr: { noExternal: ["gsap"] },
      build: {
        ssr: "server/tests/frontend-entry.jsx",
        outDir: ".cache",
        emptyOutDir: false,
        minify: false,
        rollupOptions: { output: { entryFileNames: "frontend-test.mjs" } },
      },
    });
    React = await import("react");
    act = React.act;
    ({ createRoot } = await import("react-dom/client"));
    ({ MemoryRouter } = await import("react-router-dom"));
    module = await import(
      pathToFileURL(path.resolve(".cache/frontend-test.mjs")).href
    );
  },
  { timeout: 30000 },
);
after(async () => {
  if (root) await act(() => root.unmount());
  module?.ScrollTrigger.disable();
  module?.gsap.ticker.sleep();
  dom?.window.close();
  await unlink(".cache/frontend-test.mjs").catch(() => {});
});
async function render(Component, route = "/") {
  if (root) await act(() => root.unmount());
  root = createRoot(document.getElementById("test"));
  await act(async () => {
    root.render(
      React.createElement(
        MemoryRouter,
        { initialEntries: [route] },
        React.createElement(
          module.ThemeProvider,
          null,
          React.createElement(module.SiteContext.Provider, { value: content }, React.createElement(Component)),
        ),
      ),
    );
  });
}
async function change(element, value) {
  assert.ok(element, "Form element exists");
  await act(async () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      element instanceof window.HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype,
      "value",
    );
    descriptor.set.call(element, value);
    element.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}
async function click(element) {
  assert.ok(element);
  await act(async () => element.click());
}
async function submit(form) {
  await act(async () => {
    form.dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    );
    await new Promise((resolve) => setTimeout(resolve, 15));
  });
}
test("mobile menu opens, Escape closes and restores focus; active route is accessible", async () => {
  await render(module.Nav);
  const toggle = document.getElementById("menu-toggle");
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  await click(toggle);
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.ok(document.getElementById("nav-links").classList.contains("open"));
  assert.equal(document.body.style.overflow, "hidden");
  assert.equal(document.activeElement.getAttribute("aria-label"), "Close navigation menu");
  await act(async () => window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true })));
  assert.equal(document.activeElement.getAttribute("href"), "/resume");
  await act(async () => window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true })));
  assert.equal(document.activeElement.getAttribute("aria-label"), "Close navigation menu");
  await act(async () =>
    window.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, toggle);
  assert.equal(document.body.style.overflow, "");
  assert.equal(
    document
      .querySelector('a[href="/"][aria-current]')
      .getAttribute("aria-current"),
    "page",
  );
});
test("reduced-motion pages remain visible and create no page tweens or triggers", async () => {
  await render(module.Home);
  assert.match(document.querySelector("h1").textContent, /Building thoughtful/);
  assert.equal(module.ScrollTrigger.getAll().length, 0);
  assert.equal(module.gsap.getTweensOf(document.querySelector("h1")).length, 0);
  assert.notEqual(document.querySelector("h1").style.opacity, "0");
  assert.ok(document.querySelector('svg[aria-label*="portrait placeholder"]'));
  await render(module.About, "/about");
  assert.equal(module.ScrollTrigger.getAll().length, 0);
  assert.equal(module.gsap.getTweensOf(document.querySelector(".orbit-ring")).length, 0);
  assert.equal(document.querySelectorAll(".orbit-label").length, 6);
  assert.match(document.querySelector(".profile-orbit").textContent, /MongoDB/);
});
test("project search finds matching work and has a usable empty state", async () => {
  await render(module.Projects, "/projects");
  assert.equal(document.querySelectorAll(".gallery-card").length, 3);
  await change(document.querySelector(".search-field input"), "Shram");
  assert.equal(document.querySelectorAll(".gallery-card").length, 1);
  assert.match(
    document.querySelector(".gallery-card h2").textContent,
    /ShramSetu/,
  );
  await change(document.querySelector(".search-field input"), "does not exist");
  assert.equal(document.querySelectorAll(".gallery-card").length, 0);
  assert.match(
    document.querySelector(".empty-state").textContent,
    /No matching projects/,
  );
});
test("contact failure preserves input, success appears only after saved response", async () => {
  let shouldFail = true;
  globalThis.fetch = (url) =>
    url === "/api/csrf"
      ? respond({ csrf: "frontend-test-token" })
      : respond(
          shouldFail
            ? { error: "Database unavailable" }
            : { message: "Your inquiry has been saved." },
          shouldFail ? 503 : 201,
        );
  await render(module.Contact, "/contact");
  await change(document.querySelector('input[name="name"]'), "Alex");
  await change(
    document.querySelector('input[name="email"]'),
    "alex@example.com",
  );
  await change(
    document.querySelector("textarea"),
    "An internship enquiry with enough detail.",
  );
  await submit(document.querySelector("form"));
  assert.equal(document.querySelector('input[name="name"]').value, "Alex");
  assert.match(
    document.querySelector('[role="alert"]').textContent,
    /Database unavailable/,
  );
  assert.equal(document.querySelector(".notice.success"), null);
  shouldFail = false;
  await submit(document.querySelector("form"));
  assert.match(document.querySelector(".notice.success").textContent, /saved/);
  assert.equal(document.querySelector('input[name="name"]').value, "");
});
test("admin login and profile-save failure keep unsaved content", async () => {
  let authenticated = false,
    saveFails = true;
  globalThis.fetch = (url, options = {}) => {
    if (url === "/api/auth/me")
      return respond(
        authenticated
          ? { authenticated: true, csrf: "admin-test-token" }
          : { error: "Please sign in" },
        authenticated ? 200 : 401,
      );
    if (url === "/api/csrf") return respond({ csrf: "anonymous-test-token" });
    if (url === "/api/auth/login") {
      assert.equal(JSON.parse(options.body).email, "admin@example.com");
      authenticated = true;
      return respond({ authenticated: true, csrf: "admin-test-token" });
    }
    if (url === "/api/admin/projects") return respond(content.projects);
    if (url === "/api/admin/uploads") return respond([]);
    if (url === "/api/admin/inquiries")
      return respond({ items: [], total: 0, page: 1 });
    if (url === "/api/admin/site" && options.method === "PUT")
      return respond(
        saveFails ? { error: "Save failed" } : JSON.parse(options.body),
        saveFails ? 503 : 200,
      );
    if (url === "/api/admin/site") return respond(initialSite);
    throw new Error(`Unexpected test request ${url}`);
  };
  await render(module.Admin, "/admin");
  await change(
    document.querySelector('input[type="email"]'),
    "admin@example.com",
  );
  await change(
    document.querySelector('input[type="password"]'),
    "test-passphrase",
  );
  await submit(document.querySelector("form"));
  const field = [...document.querySelectorAll(".editor-field")]
    .find((label) => label.textContent.includes("Headline"))
    .querySelector("input");
  await change(field, "Unsaved custom headline");
  await submit(document.querySelector(".admin-editor"));
  assert.equal(field.value, "Unsaved custom headline");
  assert.match(
    document.querySelector('[role="alert"]').textContent,
    /Save failed/,
  );
  saveFails = false;
  await submit(document.querySelector(".admin-editor"));
  assert.match(
    document.querySelector(".notice.success").textContent,
    /published/,
  );
  assert.equal(field.value, "Unsaved custom headline");
});

test("all public pages and admin sections use each saved theme, including on refresh", async () => {
  for (const theme of ["dark-ember", "clean-white", "midnight-navy", "warm-ivory"]) {
    globalThis.fetch = (url) => {
      if (url === "/api/appearance") return respond({ theme });
      if (url === "/api/auth/me") return respond({ authenticated: true, csrf: "theme-test" });
      if (url === "/api/admin/site") return respond(initialSite);
      if (url === "/api/admin/projects") return respond(content.projects);
      if (url === "/api/admin/uploads") return respond([]);
      if (url === "/api/admin/inquiries") return respond({ items: [], total: 0, page: 1 });
      throw new Error(`Unexpected request ${url}`);
    };
    window.localStorage.setItem("theme", "untrusted-browser-choice");
    for (const Page of [module.Home, module.About, module.Projects, module.Resume, module.Contact, () => React.createElement(module.ProjectDetails, { p: content.projects[0], preview: true })]) {
      await render(Page);
      assert.equal(document.documentElement.dataset.theme, theme);
      assert.ok(document.querySelector("h1"));
      assert.equal(module.ScrollTrigger.getAll().length, 0);
    }
    await render(module.Admin, "/admin");
    for (const name of ["Appearance", "Projects", "Inquiries", "Media", "Profile"]) {
      await click([...document.querySelectorAll(".admin-sidebar nav button")].find(el => el.textContent === name || el.textContent.startsWith(name)));
      assert.equal(document.documentElement.dataset.theme, theme);
      assert.ok(document.querySelector("h1"));
    }
    await render(module.Home); // New provider instance simulates refresh, with no visitor preference.
    assert.equal(document.documentElement.dataset.theme, theme);
  }
});

test("appearance previews are temporary, failed saves preserve selection, successful save persists and duplicates are blocked", async () => {
  let saved = "dark-ember", fail = true, writes = 0, release;
  globalThis.fetch = async (url, options = {}) => {
    if (url === "/api/appearance") return respond({ theme: saved });
    if (url === "/api/csrf") return respond({ csrf: "theme-test" });
    if (url === "/api/admin/appearance") {
      writes++;
      await new Promise(resolve => { release = resolve; });
      if (fail) return respond({ error: "Theme save failed" }, 503);
      saved = JSON.parse(options.body).theme;
      return respond({ theme: saved });
    }
    throw new Error(`Unexpected request ${url}`);
  };
  const Editor = () => React.createElement(module.Appearance, { setDirty: () => {} });
  await render(Editor);
  assert.equal(document.querySelectorAll('.theme-choice input[type="radio"]').length, 4);
  await click(document.querySelector('input[value="clean-white"]'));
  assert.equal(document.documentElement.dataset.theme, "dark-ember");
  await click([...document.querySelectorAll("button")].find(el => el.textContent === "Preview theme"));
  assert.equal(document.documentElement.dataset.theme, "clean-white");
  assert.equal(saved, "dark-ember");
  const form = document.querySelector("form");
  await act(async () => { form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })); form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })); await new Promise(resolve => setTimeout(resolve, 10)); });
  assert.equal(writes, 1);
  assert.ok(document.querySelector("fieldset").disabled);
  await act(async () => { release(); await new Promise(resolve => setTimeout(resolve, 10)); });
  assert.match(document.querySelector('[role="alert"]').textContent, /Theme save failed/);
  assert.equal(document.querySelector('input[value="clean-white"]').checked, true);
  assert.equal(document.documentElement.dataset.theme, "clean-white");
  await render(module.Home);
  assert.equal(document.documentElement.dataset.theme, "dark-ember");
  await render(Editor);
  await click(document.querySelector('input[value="midnight-navy"]'));
  fail = false;
  await act(async () => { document.querySelector("form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })); await new Promise(resolve => setTimeout(resolve, 10)); release(); await new Promise(resolve => setTimeout(resolve, 10)); });
  assert.equal(saved, "midnight-navy");
  assert.equal(document.documentElement.dataset.theme, saved);
  assert.match(document.querySelector(".notice.success").textContent, /Default theme saved/);
  await render(module.Home);
  assert.equal(document.documentElement.dataset.theme, "midnight-navy");
});

test("appearance loading failure offers retry and prevents saving a guessed default", async () => {
  let fail = true;
  globalThis.fetch = () => respond(fail ? { error: "Appearance unavailable" } : { theme: "warm-ivory" }, fail ? 503 : 200);
  await render(() => React.createElement(module.Appearance, { setDirty: () => {} }));
  assert.match(document.querySelector('[role="alert"]').textContent, /Appearance unavailable/);
  assert.equal(document.querySelector("form"), null);
  fail = false;
  await click(document.querySelector("button"));
  assert.equal(document.querySelector('input[value="warm-ivory"]').checked, true);
});

test("admin mobile drawer traps focus, restores scrolling and closes on section navigation", async () => {
  globalThis.fetch = url => {
    if (url === "/api/appearance") return respond({ theme: "warm-ivory" });
    if (url === "/api/auth/me") return respond({ authenticated: true, csrf: "drawer-test" });
    if (url === "/api/admin/site") return respond(initialSite);
    if (url === "/api/admin/projects") return respond(content.projects);
    if (url === "/api/admin/uploads") return respond([]);
    if (url === "/api/admin/inquiries") return respond({ items: [], total: 0, page: 1 });
    throw new Error(`Unexpected request ${url}`);
  };
  await render(module.Admin, "/admin");
  const toggle = document.querySelector('[aria-label="Open dashboard menu"]');
  await click(toggle);
  const panel = document.getElementById("admin-sidebar");
  assert.equal(panel.getAttribute("role"), "dialog");
  assert.equal(document.body.style.overflow, "hidden");
  assert.equal(document.querySelector(".admin-main").hasAttribute("inert"), true);
  assert.equal(document.activeElement.getAttribute("aria-label"), "Close dashboard menu");
  await act(async () => window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true })));
  assert.ok(document.activeElement.classList.contains("logout-button"));
  await act(async () => window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  assert.equal(document.body.style.overflow, "");
  assert.equal(document.querySelector(".admin-main").hasAttribute("inert"), false);
  assert.equal(document.activeElement, toggle);
  await click(toggle);
  await click([...panel.querySelectorAll("nav button")].find(el => el.textContent === "Appearance"));
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(document.body.style.overflow, "");
  assert.equal(document.querySelector("h1").textContent, "Appearance");
  await click(document.querySelector('input[value="clean-white"]'));
  await click([...document.querySelectorAll("button")].find(el => el.textContent === "Preview theme"));
  assert.ok(document.querySelector('dialog[open] .hero'));
  assert.equal(document.documentElement.dataset.theme, "clean-white");
  assert.equal(document.body.style.overflow, "hidden");
  await click(document.querySelector('dialog [aria-label="Close dialog"]'));
  assert.equal(document.body.style.overflow, "");
  await click([...document.querySelectorAll("button")].find(el => el.textContent === "Reset preview"));
  assert.equal(document.documentElement.dataset.theme, "warm-ivory");
});

test("phone and tablet motion avoids pinning and scrub while the labelled orbit rotates continuously", async () => {
  const original = window.matchMedia;
  globalThis.fetch = () => respond({ theme: "dark-ember" });
  try {
    for (const width of [360, 390, 768]) {
      window.innerWidth = width;
      window.matchMedia = query => ({
        matches: /max-width:\s*1023px/.test(query), media: query,
        addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
      });
      await render(module.About);
      for (const trigger of module.ScrollTrigger.getAll()) {
        assert.ok(!trigger.vars.pin);
        assert.ok(!trigger.vars.scrub);
        assert.ok(!trigger.vars.horizontal);
      }
      const ring = document.querySelector(".orbit-ring");
      const counter = document.querySelector(".orbit-counter");
      const orbit = module.gsap.getTweensOf(ring);
      assert.equal(orbit.length, 1);
      assert.equal(orbit[0].parent.repeat(), -1);
      assert.equal(document.querySelectorAll(".orbit-label").length, 6);
      ring.dispatchEvent(new window.MouseEvent("mouseenter", { bubbles: true }));
      ring.dispatchEvent(new window.FocusEvent("focusin", { bubbles: true }));
      assert.equal(orbit[0].paused(), false);
      assert.equal(orbit[0].parent.paused(), false);
      orbit[0].parent.progress(.25);
      assert.equal(Math.round(module.gsap.getProperty(ring, "rotation")), 90);
      assert.equal(Math.round(module.gsap.getProperty(counter, "rotation")), -90);
      assert.equal(module.gsap.getTweensOf(document.querySelector(".journey-progress")).length, 0);
    }
  } finally {
    window.matchMedia = original;
    window.innerWidth = 1024;
    await render(module.Home);
  }
  assert.equal(module.ScrollTrigger.getAll().length, 0);
});

test("home portrait backdrop simplifies phone motion, pauses offscreen and cleans up on navigation", async () => {
  const originalMedia = window.matchMedia;
  const originalObserver = globalThis.IntersectionObserver;
  let notify, disconnected = 0, hidden = false;
  globalThis.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; }
    observe(target) { this.backdrop = target.classList.contains("portrait-atmosphere"); if (this.backdrop) notify = this.callback; }
    disconnect() { if (this.backdrop) disconnected++; }
  };
  Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
  globalThis.fetch = () => respond({ theme: "dark-ember" });
  try {
    for (const width of [390, 1440]) {
      window.matchMedia = query => ({
        matches: query.includes("min-width: 1024px") ? width >= 1024 : query.includes("max-width: 1023px") && width < 1024,
        media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
      });
      await render(module.Home);
      assert.equal(document.querySelector(".portrait-atmosphere").getAttribute("aria-hidden"), "true");
      const track = document.querySelector(".portrait-track-a");
      const [tween] = module.gsap.getTweensOf(track);
      assert.equal(tween.repeat(), -1);
      assert.equal(module.gsap.getTweensOf(document.querySelector(".portrait-track-b")).length, width >= 1024 ? 1 : 0);
      tween.progress(.25);
      assert.equal(Math.round(module.gsap.getProperty(track, "rotation")), 90);
      notify([{ isIntersecting: false }]);
      assert.equal(tween.paused(), true);
      hidden = true;
      notify([{ isIntersecting: true }]);
      assert.equal(tween.paused(), true);
      hidden = false;
      document.dispatchEvent(new window.Event("visibilitychange"));
      assert.equal(tween.paused(), false);
      await render(module.Projects, "/projects");
      assert.equal(module.gsap.getTweensOf(track).length, 0);
    }
    assert.equal(disconnected, 2);
  } finally {
    window.matchMedia = originalMedia;
    globalThis.IntersectionObserver = originalObserver;
    delete document.hidden;
    await render(module.Home);
  }
});

test("home screenshot controls work without motion, skip failed images and preserve case study links", async () => {
  const project = content.projects.find(project => project.featured);
  const original = project.screenshots;
  project.screenshots = ["first", "second", "third"].map(name => ({ src: `/uploads/${name}.webp`, alt: `${name} screenshot`, width: 1600, height: 1000 }));
  try {
    await render(module.Home);
    const cover = document.querySelector(".project-showcase");
    assert.equal(cover.getAttribute("aria-roledescription"), "carousel");
    assert.equal(cover.querySelector("a").getAttribute("href"), `/projects/${project.slug}`);
    assert.equal(cover.querySelector("button[aria-label^='Play']"), null);
    assert.equal(cover.querySelector("button[aria-label^='Pause']"), null);
    await click(cover.querySelector("button[aria-label^='Next']"));
    assert.equal(cover.querySelector(".current").getAttribute("src"), "/uploads/second.webp");
    assert.equal(module.gsap.getTweensOf(cover.querySelector(".current")).length, 0);
    await act(async () => cover.querySelector(".current").dispatchEvent(new window.Event("error")));
    assert.equal(cover.querySelector(".current").getAttribute("src"), "/uploads/third.webp");
    await click(cover.querySelector("button[aria-label^='Previous']"));
    assert.equal(cover.querySelector(".current").getAttribute("src"), "/uploads/first.webp");
    await act(async () => cover.querySelector(".current").dispatchEvent(new window.Event("error")));
    assert.equal(cover.querySelectorAll("button").length, 0);
    await act(async () => cover.querySelector(".current").dispatchEvent(new window.Event("error")));
    assert.ok(cover.querySelector(".project-visual"));
  } finally { project.screenshots = original; await render(module.Home); }
});

test("home slideshow advances in order, pauses on hover and cleans up after navigation", async () => {
  const project = content.projects.find(project => project.featured);
  const originalShots = project.screenshots, originalMedia = window.matchMedia;
  project.screenshots = ["first", "second", "third"].map(name => ({ src: `/uploads/${name}.webp`, alt: name, width: 1600, height: 1000 }));
  window.matchMedia = query => ({ matches: query.includes("max-width: 1023px"), media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  try {
    await render(module.Home);
    const cover = document.querySelector(".project-showcase"), bar = cover.querySelector(".showcase-progress > span");
    await act(async () => cover.querySelector(".current").dispatchEvent(new window.Event("load")));
    assert.equal(module.gsap.getTweensOf(bar).length, 1);
    await act(async () => cover.dispatchEvent(new window.MouseEvent("mouseover", { bubbles: true })));
    assert.equal(module.gsap.getTweensOf(bar).length, 0);
    await act(async () => cover.dispatchEvent(new window.MouseEvent("mouseout", { bubbles: true })));
    await act(async () => module.gsap.getTweensOf(bar)[0].progress(1));
    assert.equal(cover.querySelector(".current").getAttribute("src"), "/uploads/second.webp");
    await act(async () => cover.querySelector(".current").dispatchEvent(new window.Event("load")));
    await act(async () => module.gsap.getTweensOf(bar)[0].progress(1));
    assert.equal(cover.querySelector(".current").getAttribute("src"), "/uploads/third.webp");
    await click(cover.querySelector("button[aria-label^='Previous']"));
    assert.equal(module.gsap.getTweensOf(bar).length, 0);
    assert.ok(cover.querySelector("button[aria-label^='Play']"));
    await render(module.Projects, "/projects");
    assert.equal(module.gsap.getTweensOf(bar).length, 0);
  } finally { project.screenshots = originalShots; window.matchMedia = originalMedia; await render(module.Home); }
});
