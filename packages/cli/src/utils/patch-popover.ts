import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";
import type { ProjectInfo } from "./detect-project.js";
import { logger } from "./logger.js";

/**
 * Ensures the user's popover.tsx exports PopoverClose.
 * shadcn/ui does not include PopoverClose by default, but FilterCN needs it.
 */
export function patchPopoverClose(projectInfo: ProjectInfo, cwd: string): boolean {
  const popoverPath = path.join(cwd, projectInfo.componentsDir, "ui", "popover.tsx");

  if (!fs.existsSync(popoverPath)) {
    logger.warn(`Could not find ${chalk.cyan("popover.tsx")} at ${popoverPath}. Skipping patch.`);
    logger.info(`Make sure your popover component exports ${chalk.cyan("PopoverClose")} for FilterCN to work.`);
    return false;
  }

  let content = fs.readFileSync(popoverPath, "utf-8");

  // Already has PopoverClose — nothing to do
  if (content.includes("PopoverClose")) {
    return true;
  }

  // Detect which Radix import style is used
  const usesRadixUi = content.includes('"radix-ui"');
  const usesRadixPopover = content.includes('"@radix-ui/react-popover"');

  if (!usesRadixUi && !usesRadixPopover) {
    logger.warn("Unrecognized popover.tsx structure. Please manually add PopoverClose export.");
    return false;
  }

  // Add PopoverClose definition before the export block
  const closeLine = usesRadixUi
    ? "const PopoverClose = PopoverPrimitive.Close;\n"
    : "const PopoverClose = PopoverPrimitive.Close;\n";

  // Find the export block and add PopoverClose to it
  if (content.includes("export {")) {
    // Add the const before the export block
    content = content.replace("export {", `${closeLine}\nexport {`);
    // Add PopoverClose to the export list
    content = content.replace("export {", "export {\n  PopoverClose,");
  } else {
    // Append as named export at the end
    content += `\n${closeLine}\nexport { PopoverClose };\n`;
  }

  fs.writeFileSync(popoverPath, content, "utf-8");
  logger.success(`Patched ${chalk.cyan("popover.tsx")} to export ${chalk.cyan("PopoverClose")}.`);
  return true;
}
