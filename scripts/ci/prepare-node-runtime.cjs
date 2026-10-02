// Make TypeScript's bundler-style output executable by plain Node in containers.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const app = process.argv[2];
if (!['api', 'worker'].includes(app)) throw new Error('Expected api or worker');
require('./ensure-workspace-entrypoints.cjs');
const appDist = path.join(root, 'apps', app, 'dist');
const nested = `apps/${app}/src/index.js`;
if (!fs.existsSync(path.join(appDist, 'index.js'))) {
  if (!fs.existsSync(path.join(appDist, nested))) throw new Error('Compiled application entrypoint missing');
  fs.writeFileSync(path.join(appDist, 'index.js'), `export * from './${nested}';\n`);
}
function visit(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { visit(file); continue; }
    if (!entry.name.endsWith('.js')) continue;
    const source = fs.readFileSync(file, 'utf8');
    const output = source.replace(/((?:from\s*|import\s*\(\s*|import\s*)["'])(\.{1,2}\/[^"']+)(["'])/g, (match, before, spec, after) => {
      const target = path.resolve(path.dirname(file), spec);
      if (fs.existsSync(target) && fs.statSync(target).isFile()) return match;
      if (fs.existsSync(`${target}.js`)) return `${before}${spec}.js${after}`;
      if (fs.existsSync(path.join(target, 'index.js'))) return `${before}${spec}/index.js${after}`;
      throw new Error(`Unresolved runtime import in ${file}: ${spec}`);
    });
    if (output !== source) fs.writeFileSync(file, output);
  }
}
for (const name of fs.readdirSync(path.join(root, 'packages'))) visit(path.join(root, 'packages', name, 'dist'));
visit(appDist);
console.log(`Plain Node runtime prepared: ${app}`);
