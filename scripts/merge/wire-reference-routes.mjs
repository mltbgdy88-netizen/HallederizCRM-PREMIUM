/**

 * Wires Final reference UI components into PREMIUM route pages.

 * Platform routes -> app/(platform)/... ; login -> app/login ; emerald -> app/(emerald)/...

 * Run from repo root: node scripts/merge/wire-reference-routes.mjs

 */

import fs from "node:fs";

import path from "node:path";

import { fileURLToPath } from "node:url";



const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root = path.resolve(__dirname, "../..");

const finalApp = path.resolve(root, "../hallederizcrm final/apps/web/app");

const appRoot = path.resolve(root, "apps/web/app");

const platformApp = path.join(appRoot, "(platform)");



/** Wired outside (platform) group */

const SPECIAL_ROUTES = new Set(["/ana-sayfa", "/login", "/offline-api"]);



const ROUTE_REWRITES = [

  ["/arsiv", "/archive"],

  ["/demo", "/demo-mode"],

  ["/empty", "/live-empty"],

  ["/offline", "/offline-api"]

];



function rewriteRoute(finalRoute) {

  let route = finalRoute;

  for (const [from, to] of ROUTE_REWRITES) {

    if (route === from || route.startsWith(`${from}/`)) {

      route = to + route.slice(from.length);

    }

  }

  return route;

}



function resolveTargetDir(route) {

  if (route === "/login") {

    return path.join(appRoot, "login");

  }

  if (route === "/offline-api") {

    return path.join(appRoot, "(offline-shell)", "offline-api");

  }

  if (route === "/ana-sayfa") {

    return path.join(appRoot, "(emerald)", "ana-sayfa");

  }

  return path.join(platformApp, route.replace(/^\//, ""));

}



function collectFinalPages(dir, base = "") {

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const pages = [];



  for (const entry of entries) {

    const rel = `${base}/${entry.name}`.replace(/\\/g, "/");

    const full = path.join(dir, entry.name);



    if (entry.isDirectory()) {

      if (entry.name.startsWith("(") && entry.name.endsWith(")")) {

        pages.push(...collectFinalPages(full, base));

        continue;

      }

      pages.push(...collectFinalPages(full, rel));

      continue;

    }



    if (entry.name !== "page.tsx") continue;



    const content = fs.readFileSync(full, "utf8");

    const importMatch = content.match(

      /import\s+\{\s*(\w+)\s*\}\s+from\s+"@\/features\/([^"]+)"/

    );

    if (!importMatch) continue;



    const route = rewriteRoute(

      rel.replace(/\/page\.tsx$/, "").replace(/^\/+/, "/") || "/"

    );



    pages.push({

      route,

      component: importMatch[1],

      featurePath: importMatch[2]

    });

  }



  return pages;

}



function relativeImport(fromDir, featurePath, component) {

  const target = path.join(root, "apps/web/src/features", featurePath);

  let rel = path.relative(fromDir, target).replace(/\\/g, "/");

  if (!rel.startsWith(".")) rel = `./${rel}`;

  return `import { ${component} } from "${rel}";`;

}



function writePage(route, component, featurePath) {

  const routeDir = resolveTargetDir(route);

  fs.mkdirSync(routeDir, { recursive: true });

  const pageFile = path.join(routeDir, "page.tsx");

  const importLine = relativeImport(routeDir, featurePath, component);

  const fnName = `${component.replace(/Page$/, "")}Route`;



  fs.writeFileSync(

    pageFile,

    `${importLine}



export default function ${fnName}() {

  return <${component} />;

}

`,

    "utf8"

  );

  return pageFile;

}



const pages = collectFinalPages(finalApp);

let written = 0;



for (const page of pages) {

  if (page.route === "/") continue;

  writePage(page.route, page.component, page.featurePath);

  written += 1;

}



console.log(`Wired ${written} reference routes (${SPECIAL_ROUTES.size} special layouts).`);


