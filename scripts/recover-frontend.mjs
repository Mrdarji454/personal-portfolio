// Recover application components from the surviving Vite output without copying bundled libraries.
import fs from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import generatorModule from "@babel/generator";
import * as t from "@babel/types";
import postcss from "postcss";
const traverse = traverseModule.default,
  generate = generatorModule.default;
const sourceDir = ".recovery/original-dist/assets";
const filenames = fs.readdirSync(sourceDir);
const source = (prefix) =>
  parse(
    fs.readFileSync(
      path.join(
        sourceDir,
        filenames.find((f) => f.startsWith(prefix) && f.endsWith(".js")),
      ),
      "utf8",
    ),
    { sourceType: "module" },
  );
const index = source("index-"),
  pages = source("PublicPages-"),
  admin = source("Admin-");
function writeMissing(file, content) {
  if (fs.existsSync(file)) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log("Restored", file);
}
function jsxName(node) {
  if (t.isIdentifier(node)) return t.jsxIdentifier(node.name);
  if (t.isStringLiteral(node)) return t.jsxIdentifier(node.value);
  if (t.isMemberExpression(node))
    return t.jsxMemberExpression(jsxName(node.object), jsxName(node.property));
  throw new Error("Unsupported JSX tag");
}
function recover(file, original, names, imports, renames, exports, extra = "") {
  const selected = original.program.body
    .filter((n) => t.isFunctionDeclaration(n) && names.includes(n.id.name))
    .map((n) => t.cloneNode(n, true));
  if (selected.length !== names.length)
    throw new Error("Missing component in surviving build: " + file);
  const ast = parse(
    imports +
      "\n" +
      extra +
      "\n" +
      selected.map((n) => generate(n).code).join("\n"),
    { sourceType: "module" },
  );
  traverse(ast, {
    Program(p) {
      for (const [oldName, newName] of Object.entries(renames))
        p.scope.rename(oldName, newName);
    },
  });
  traverse(ast, {
    CallExpression: {
      exit(p) {
        const callee = p.node.callee;
        if (
          !t.isMemberExpression(callee) ||
          !["jsxDEV", "jsx", "jsxs"].includes(callee.property.name)
        )
          return;
        const [tag, props, key] = p.node.arguments;
        if (!t.isObjectExpression(props))
          throw new Error("Unsupported JSX props");
        const attrs = [],
          children = [];
        for (const prop of props.properties) {
          if (t.isSpreadElement(prop)) {
            attrs.push(t.jsxSpreadAttribute(prop.argument));
            continue;
          }
          const name = prop.key.name || prop.key.value;
          if (name === "children") {
            const values = t.isArrayExpression(prop.value)
              ? prop.value.elements
              : [prop.value];
            for (const child of values) {
              if (!child) continue;
              children.push(
                t.isJSXElement(child) || t.isJSXFragment(child)
                  ? child
                  : t.jsxExpressionContainer(child),
              );
            }
          } else
            attrs.push(
              t.jsxAttribute(
                t.jsxIdentifier(name),
                t.jsxExpressionContainer(prop.value),
              ),
            );
        }
        const isFragment =
          t.isMemberExpression(tag) && tag.property.name === "Fragment";
        if (isFragment) {
          p.replaceWith(
            t.jsxFragment(
              t.jsxOpeningFragment(),
              t.jsxClosingFragment(),
              children,
            ),
          );
          return;
        }
        if (key && !(t.isUnaryExpression(key) && key.operator === "void"))
          attrs.unshift(
            t.jsxAttribute(
              t.jsxIdentifier("key"),
              t.jsxExpressionContainer(key),
            ),
          );
        const name = jsxName(tag),
          selfClosing = !children.length;
        p.replaceWith(
          t.jsxElement(
            t.jsxOpeningElement(name, attrs, selfClosing),
            selfClosing ? null : t.jsxClosingElement(t.cloneNode(name)),
            children,
            selfClosing,
          ),
        );
      },
    },
  });
  const output =
    generate(ast, { comments: false }).code + "\n" + exports + "\n";
  writeMissing(file, output);
}
recover(
  "src/api.js",
  index,
  ["RT"],
  "",
  { RT: "api", Hi: "csrfToken" },
  "export { api };",
  'let Hi="";',
);
recover(
  "src/site.jsx",
  index,
  ["Qy", "l_"],
  "import * as x from 'react'; import {api as RT} from './api';",
  {
    x: "React",
    RT: "api",
    IT: "SiteContext",
    Qy: "useSite",
    l_: "SiteProvider",
  },
  "export { SiteContext, useSite, SiteProvider };",
  "const IT=x.createContext(null);",
);
recover(
  "src/ui.jsx",
  index,
  ["fd", "p_", "y_", "A_"],
  "import * as x from 'react'; import {Link as gd, NavLink as Hy, useLocation as Ea} from 'react-router-dom'; import {ArrowUpRight as r_, ArrowUp as c_, Menu as h_, X as m_, Github as s_, Linkedin as f_, Mail as d_} from 'lucide-react'; import {useSite as Qy} from './site';",
  {
    x: "React",
    gd: "Link",
    Hy: "NavLink",
    Ea: "useLocation",
    r_: "ArrowUpRight",
    c_: "ArrowUp",
    h_: "Menu",
    m_: "X",
    s_: "Github",
    f_: "Linkedin",
    d_: "Mail",
    Qy: "useSite",
    fd: "Arrow",
    p_: "Nav",
    y_: "Footer",
    A_: "Socials",
  },
  'export { Arrow, Nav, Footer, Socials }; export {ProjectVisual} from "./project-visual";',
);
recover(
  "src/project-visual.jsx",
  pages,
  ["Sl"],
  "",
  { Sl: "ProjectVisual" },
  "export { ProjectVisual };",
);
recover(
  "src/blocks.jsx",
  pages,
  ["ea", "In", "Al", "ia", "Rl"],
  "import {Link as ui} from 'react-router-dom'; import {Arrow as Ge} from './ui'; import {useSite as rs} from './site'; import {ProjectVisual as Sl} from './project-visual';",
  {
    ui: "Link",
    Ge: "Arrow",
    rs: "useSite",
    Sl: "ProjectVisual",
    ea: "Portrait",
    In: "Preview",
    Al: "ProjectRow",
    ia: "ContactCTA",
    Rl: "SkillList",
  },
  "export { Portrait, Preview, ProjectRow, ContactCTA, SkillList };",
);
recover(
  "src/motion.js",
  pages,
  ["ht", "Mt", "Es"],
  "import * as Gi from 'react'; import Xe from 'gsap'; import {ScrollTrigger} from 'gsap/ScrollTrigger';",
  {
    Gi: "React",
    Xe: "gsap",
    ht: "usePageMotion",
    Mt: "pauseOrbit",
    Es: "useSEO",
  },
  "export { usePageMotion, pauseOrbit, useSEO };",
  "Xe.registerPlugin(ScrollTrigger);",
);
recover(
  "src/pages/PublicPages.jsx",
  pages,
  ["jc", "xc", "kc", "xl", "yc", "Pc", "Cc", "Oc"],
  "import * as Gi from 'react'; import {Link as ui,useParams as kl} from 'react-router-dom'; import {CodeXml as Jo,Database as Ol,Braces as Cl,Terminal as Tl,Globe as Ml,Layers as wl,Search as Vl,ArrowLeft as Zo,Printer as Ul,Download as El} from 'lucide-react'; import {Arrow as Ge,Socials as yl} from '../ui'; import {useSite as rs} from '../site'; import {api as Pl} from '../api'; import {Portrait as ea,Preview as In,ProjectRow as Al,ContactCTA as ia,SkillList as Rl} from '../blocks'; import {usePageMotion as ht,pauseOrbit as Mt,useSEO as Es} from '../motion';",
  {
    Gi: "React",
    ui: "Link",
    kl: "useParams",
    Jo: "CodeXml",
    Ol: "Database",
    Cl: "Braces",
    Tl: "Terminal",
    Ml: "Globe",
    wl: "Layers",
    Vl: "Search",
    Zo: "ArrowLeft",
    Ul: "Printer",
    El: "Download",
    Ge: "Arrow",
    yl: "Socials",
    rs: "useSite",
    Pl: "api",
    ea: "Portrait",
    In: "Preview",
    Al: "ProjectRow",
    ia: "ContactCTA",
    Rl: "SkillList",
    ht: "usePageMotion",
    Mt: "pauseOrbit",
    Es: "useSEO",
    jc: "Home",
    xc: "About",
    kc: "Projects",
    xl: "ProjectDetails",
    yc: "DemoVideo",
    Pc: "CaseStudy",
    Cc: "Contact",
    Oc: "Resume",
  },
  "export { Home, About, Projects, ProjectDetails, CaseStudy, Contact, Resume };",
);
const adminVars = [];
for (const node of admin.program.body)
  if (t.isVariableDeclaration(node))
    for (const decl of node.declarations)
      if (["Z", "$"].includes(decl.id.name))
        adminVars.push(
          generate(t.variableDeclaration("const", [t.cloneNode(decl, true)]))
            .code,
        );
recover(
  "src/pages/Admin.jsx",
  admin,
  ["U", "P", "S", "z", "W", "I", "R", "le", "te", "de"],
  "import * as d from 'react'; import {Link as G} from 'react-router-dom'; import {api as g} from '../api'; import {SiteContext as se} from '../site'; import {useSEO as re} from '../motion'; import {Home as ae,ProjectDetails as oe} from './PublicPages'; import {ArrowUp as B,X as ie,ArrowDown as K,Eye as Y,LogOut as ne,Plus as X,Save as J,Trash2 as Q} from 'lucide-react';",
  {
    d: "React",
    G: "Link",
    g: "api",
    se: "SiteContext",
    re: "useSEO",
    ae: "Home",
    oe: "ProjectDetails",
    B: "ArrowUp",
    ie: "CloseIcon",
    K: "ArrowDown",
    Y: "Eye",
    ne: "LogOut",
    X: "Plus",
    J: "Save",
    Q: "Trash2",
    Z: "emptyProject",
    $: "strip",
    U: "Field",
    P: "Lines",
    S: "cleanLines",
    z: "Modal",
    W: "Login",
    I: "UploadInput",
    R: "Collection",
    le: "ProfileEditor",
    te: "ProjectEditor",
    de: "Admin",
  },
  "export default Admin;",
  adminVars.join("\n"),
);
const cssfile = filenames.find((f) => f.endsWith(".css"));
const css = postcss.parse(
  fs.readFileSync(path.join(sourceDir, cssfile), "utf8"),
);
const start = css.nodes.findIndex(
  (n) => n.type === "rule" && n.selector === ":root",
);
const split = css.nodes.findIndex(
  (n) => n.type === "rule" && n.selector === ".public-layout",
);
if (start < 0 || split < start)
  throw new Error("Cannot locate authored styles");
writeMissing(
  "src/styles.css",
  '@import "tailwindcss";\n@theme { --color-accent:#ff8854; --font-sans:"Segoe UI",Arial,sans-serif; }\n' +
    css.nodes
      .slice(start, split)
      .map((n) => n.toString())
      .join("\n"),
);
writeMissing(
  "src/upgrade.css",
  css.nodes
    .slice(split)
    .map((n) => n.toString())
    .join("\n"),
);
for (const name of ["favicon.svg", "portrait-placeholder.svg"])
  writeMissing(
    "public/" + name,
    fs.readFileSync(".recovery/original-dist/" + name, "utf8"),
  );
let html = fs
  .readFileSync(".recovery/original-dist/index.html", "utf8")
  .replace(/\s*<script type="module"[^>]*>\s*<\/script>/, "")
  .replace(/\s*<link rel="stylesheet"[^>]*>/, "")
  .replace(
    "</body>",
    '<script type="module" src="/src/App.jsx"></script>\n</body>',
  );
writeMissing("index.html", html);
