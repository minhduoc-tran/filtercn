import path from "node:path";
import fs from "fs-extra";
import { logger } from "./logger.js";
export async function writeTemplateFile(relativePath, content, options) {
  const fullPath = path.join(options.cwd, relativePath);
  if (fs.existsSync(fullPath) && !options.force) {
    logger.warn(`Skipped (already exists): ${relativePath}`);
    return false;
  }
  await fs.ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, content, "utf-8");
  logger.success(`Created: ${relativePath}`);
  return true;
}
export async function writeAllTemplates(files, options) {
  let count = 0;
  for (const [relativePath, content] of Object.entries(files)) {
    const written = await writeTemplateFile(relativePath, content, options);
    if (written) count++;
  }
  return count;
}
//# sourceMappingURL=file-writer.js.map
