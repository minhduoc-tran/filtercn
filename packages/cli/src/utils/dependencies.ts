import { execSync } from "node:child_process";
import path from "node:path";
import fs from "fs-extra";
import type { ProjectInfo } from "./detect-project.js";
import { logger } from "./logger.js";

const PEER_DEPENDENCIES = ["lucide-react", "date-fns"];

const SHADCN_COMPONENTS = ["button", "input", "select", "popover", "calendar", "command", "badge", "scroll-area"];

export function checkPeerDependencies(cwd: string): string[] {
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) return PEER_DEPENDENCIES;

  const pkg = fs.readJsonSync(pkgPath);
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  return PEER_DEPENDENCIES.filter((dep) => !allDeps[dep]);
}

export function installDependencies(deps: string[], projectInfo: ProjectInfo, cwd: string): void {
  if (deps.length === 0) return;

  const installCmd = getInstallCommand(projectInfo.packageManager, deps);
  logger.info(`Installing: ${deps.join(", ")}...`);

  try {
    execSync(installCmd, { cwd, stdio: "pipe" });
    logger.success("Dependencies installed.");
  } catch (_error) {
    logger.error(`Failed to install dependencies. Run manually:`);
    logger.info(`  ${installCmd}`);
  }
}

function getInstallCommand(pm: ProjectInfo["packageManager"], deps: string[]): string {
  const depStr = deps.join(" ");
  switch (pm) {
    case "pnpm":
      return `pnpm add ${depStr}`;
    case "yarn":
      return `yarn add ${depStr}`;
    case "bun":
      return `bun add ${depStr}`;
    default:
      return `npm install ${depStr}`;
  }
}

export function getShadcnInstallHint(pm: ProjectInfo["packageManager"]): string {
  const runner = pm === "npm" ? "npx" : pm === "pnpm" ? "pnpm dlx" : pm === "yarn" ? "npx" : "bunx";
  return `${runner} shadcn@latest add ${SHADCN_COMPONENTS.join(" ")}`;
}
