import path from "node:path";
import fs from "fs-extra";

export interface ProjectInfo {
  /** Whether the project has a src/ directory */
  hasSrc: boolean;
  /** The components directory path (e.g. "src/components" or "components") */
  componentsDir: string;
  /** The detected package manager */
  packageManager: "npm" | "pnpm" | "yarn" | "bun";
  /** The import alias (e.g. "@/") */
  alias: string;
}

export function detectProject(cwd: string): ProjectInfo {
  const hasSrc = fs.existsSync(path.join(cwd, "src"));

  // Detect components directory
  let componentsDir = "components";
  if (hasSrc) {
    componentsDir = path.join("src", "components");
  }

  // Detect package manager from lockfiles
  const packageManager = detectPackageManager(cwd);

  // Detect alias from tsconfig
  const alias = detectAlias(cwd);

  return { hasSrc, componentsDir, packageManager, alias };
}

function detectPackageManager(cwd: string): ProjectInfo["packageManager"] {
  if (fs.existsSync(path.join(cwd, "bun.lockb")) || fs.existsSync(path.join(cwd, "bun.lock"))) {
    return "bun";
  }
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }
  return "npm";
}

function detectAlias(cwd: string): string {
  const tsconfigPath = path.join(cwd, "tsconfig.json");
  if (!fs.existsSync(tsconfigPath)) return "@/";

  try {
    const raw = fs.readFileSync(tsconfigPath, "utf-8");
    // Strip comments (basic) then parse
    const cleaned = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    const tsconfig = JSON.parse(cleaned);
    const paths = tsconfig?.compilerOptions?.paths;
    if (paths) {
      // Look for alias patterns like "@/*"
      for (const key of Object.keys(paths)) {
        if (key.endsWith("/*")) {
          return key.replace("/*", "/");
        }
      }
    }
  } catch {
    // Fallback
  }

  return "@/";
}
