import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { build } from "esbuild";
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
      entryPoints: ["server/tests/frontend-entry.jsx"],
      outfile: ".cache/frontend-test.mjs",
      bundle: true,
      format: "esm",
      platform: "node",
      jsx: "automatic",
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-router-dom",
        "lucide-react",
      ],
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
          module.SiteContext.Provider,
          { value: content },
          React.createElement(Component),
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
  await act(async () =>
    window.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, toggle);
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
  assert.ok(document.querySelector('img[src="/portrait-placeholder.svg"]'));
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
