import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import { getTemplateFiles } from "../templates/index.js";
import { checkPeerDependencies, getShadcnInstallHint, installDependencies } from "../utils/dependencies.js";
import { detectProject } from "../utils/detect-project.js";
import { writeAllTemplates } from "../utils/file-writer.js";
import { logger } from "../utils/logger.js";
import { patchPopoverClose } from "../utils/patch-popover.js";

interface InitOptions {
  force: boolean;
  cwd: string;
}

export async function initCommand(options: InitOptions) {
  const cwd = path.resolve(options.cwd);

  logger.title("🎛️  FilterCN — Component Installer");

  // Step 1: Detect project
  const spinner = ora("Detecting project structure...").start();
  const projectInfo = detectProject(cwd);
  spinner.succeed("Project detected");

  console.log("");
  console.log(chalk.dim("  Project root:    ") + cwd);
  console.log(chalk.dim("  Components dir:  ") + projectInfo.componentsDir);
  console.log(chalk.dim("  Package manager: ") + projectInfo.packageManager);
  console.log(chalk.dim("  Import alias:    ") + projectInfo.alias);
  console.log("");

  // Step 2: Confirm
  const targetDir = path.join(projectInfo.componentsDir, "conditional-filter");

  const { proceed } = await prompts({
    type: "confirm",
    name: "proceed",
    message: `This will create files in ${chalk.cyan(targetDir)}. Continue?`,
    initial: true,
  });

  if (!proceed) {
    logger.info("Cancelled.");
    return;
  }

  // Step 3: Write template files
  logger.break();
  const writeSpinner = ora("Scaffolding component files...").start();
  const templates = getTemplateFiles(projectInfo.alias);

  // Prefix each template path with the target directory
  const prefixedTemplates: Record<string, string> = {};
  for (const [relativePath, content] of Object.entries(templates)) {
    prefixedTemplates[path.join(targetDir, relativePath)] = content;
  }

  writeSpinner.stop();

  const fileCount = await writeAllTemplates(prefixedTemplates, {
    cwd,
    force: options.force,
  });

  logger.break();
  logger.success(`${fileCount} files created.`);

  // Step 4: Install peer dependencies
  logger.break();
  const missingDeps = checkPeerDependencies(cwd);

  if (missingDeps.length > 0) {
    const { installDeps } = await prompts({
      type: "confirm",
      name: "installDeps",
      message: `Install missing dependencies (${missingDeps.join(", ")})?`,
      initial: true,
    });

    if (installDeps) {
      installDependencies(missingDeps, projectInfo, cwd);
    } else {
      logger.warn("Skipped dependency installation. Install manually:");
      logger.info(`  ${missingDeps.join(" ")}`);
    }
  } else {
    logger.success("All peer dependencies already installed.");
  }

  // Step 5: Remind about shadcn/ui components
  logger.break();
  logger.info(chalk.yellow("Don't forget to install the required shadcn/ui components:"));
  console.log("");
  console.log(chalk.dim("  ") + chalk.cyan(getShadcnInstallHint(projectInfo.packageManager)));
  console.log("");

  // Step 6: Patch popover.tsx to export PopoverClose (required by FilterCN)
  logger.break();
  patchPopoverClose(projectInfo, cwd);

  // Done!
  logger.break();
  console.log(chalk.bold.green("  ✨ FilterCN installed successfully!"));
  console.log("");
  console.log(chalk.dim("  Quick start:"));
  console.log("");
  console.log(
    chalk.dim("  ") +
      chalk.white(`import { FilterProvider, FilterRoot } from "${projectInfo.alias}components/conditional-filter";`),
  );
  console.log("");
}
