import fs from "node:fs";
import path from "node:path";

const SRC_DIR = "src/components/conditional-filter";
const OUT_FILE = "packages/cli/src/templates/index.ts";

function readFiles(dir, relativeTo = dir) {
  let results = {};
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === "__tests__" || file.includes("README") || file === ".DS_Store") continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = { ...results, ...readFiles(fullPath, relativeTo) };
    } else {
      const relPath = path.relative(relativeTo, fullPath);
      let content = fs.readFileSync(fullPath, "utf8");
      // Replace @/ with __ALIAS__
      content = content.replace(/@\//g, "__ALIAS__");
      results[relPath] = content;
    }
  }
  return results;
}

const templates = readFiles(SRC_DIR);

let out = `/**
 * Auto-generated templates for the FilterCN CLI
 */

const ALIAS = "__ALIAS__";


`;

const dict = {};

for (const [key, content] of Object.entries(templates)) {
  const varName = `TEMPLATE_${key.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`;
  out += `const ${varName} = \`${content.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`;\n\n`;
  dict[key] = varName;
}

out += `export function getTemplateFiles(alias: string): Record<string, string> {
  const replaceAlias = (content: string) => content.replaceAll(ALIAS, alias);
  return {\n`;
for (const [key, varName] of Object.entries(dict)) {
  out += `    "${key}": replaceAlias(${varName}),\n`;
}
out += `  };\n}\n`;

fs.writeFileSync(OUT_FILE, out);
console.log("Templates generated! Wrote", Object.keys(templates).length, "files to", OUT_FILE);
