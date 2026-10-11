import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { themeIds } from "../../shared/themes.js";

const luminance = (hex) => {
  const rgb = hex.slice(1).match(/../g).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
const contrast = (a, b) => {
  const values = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
};
test("all four palettes define complete semantic tokens with readable text, controls and focus", async () => {
  const css = await readFile("public/themes.css", "utf8");
  const needed = ["bg", "surface", "surface-raised", "surface-hover", "input-bg", "text", "text-muted", "border", "border-strong", "accent", "accent-hover", "on-accent", "focus", "nav-bg", "nav-text", "nav-hover", "nav-accent", "success", "error", "shadow-color", "portrait-bg", "portrait-end", "portrait-shirt", "portrait-ink"];
  for (const id of themeIds) {
    const block = css.split(`[data-theme="${id}"]`)[1].split("}")[0];
    const tokens = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map(match => [match[1], match[2]]));
    for (const key of needed) assert.ok(tokens[key], `${id}: ${key}`);
    for (const surface of ["bg", "surface", "surface-raised", "surface-hover", "input-bg"]) {
      for (const ink of ["text", "text-muted", "accent", "success", "error"]) assert.ok(contrast(tokens[ink], tokens[surface]) >= 4.5, `${id}: ${ink} on ${surface}`);
    }
    for (const accent of ["accent", "accent-hover"]) assert.ok(contrast(tokens["on-accent"], tokens[accent]) >= 4.5, `${id}: button contrast`);
    assert.ok(contrast(tokens["nav-text"], tokens["nav-bg"] ) >= 4.5, `${id}: nav text`);
    assert.ok(contrast(tokens["nav-accent"], tokens["nav-bg"] ) >= 4.5, `${id}: nav accent`);
    for (const surface of ["bg", "surface", "input-bg"]) assert.ok(contrast(tokens.focus, tokens[surface]) >= 3, `${id}: focus ring`);
    assert.ok(contrast(tokens["border-strong"], tokens["input-bg"]) >= 3, `${id}: field border`);
  }
  assert.ok(!css.includes("prefers-color-scheme"));
});
test("early theme script is blocking and responsive overrides provide natural phone layouts", async () => {
  const config = await readFile("vite.config.js", "utf8");
  assert.match(config, /\/api\/theme\.js/);
  assert.ok(!config.includes('type: "module"'));
  const css = await readFile("src/responsive.css", "utf8");
  assert.match(css, /100dvh/);
  assert.match(css, /max-width: 800px/);
  assert.match(css, /max-width: 480px/);
  assert.match(css, /\.save-bar\s*\{[^}]*position: static/);
  assert.match(css, /prefers-reduced-motion/);
});
