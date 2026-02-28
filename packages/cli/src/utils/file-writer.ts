import path from "node:path";
import fs from "fs-extra";
import { logger } from "./logger.js";

export interface WriteFileOptions {
  /** Base directory (cwd) */
  cwd: string;
  /** Force overwrite existing files */
  force: boolean;
}

export async function writeTemplateFile(
  relativePath: string,
  content: string,
  options: WriteFileOptions,
): Promise<boolean> {
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

export async function writeAllTemplates(files: Record<string, string>, options: WriteFileOptions): Promise<number> {
  let count = 0;
  for (const [relativePath, content] of Object.entries(files)) {
    const written = await writeTemplateFile(relativePath, content, options);
    if (written) count++;
  }
  return count;
}
