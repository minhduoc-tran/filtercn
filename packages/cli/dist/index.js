#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";

const program = new Command();
program
  .name("filtercn")
  .description("CLI to scaffold the FilterCN conditional filter component into your project")
  .version("0.1.0");
program
  .command("init")
  .description("Initialize the conditional-filter component in your project")
  .option("-f, --force", "Overwrite existing files", false)
  .option("-c, --cwd <path>", "The working directory (defaults to current directory)", process.cwd())
  .action(async (opts) => {
    await initCommand({
      force: opts.force,
      cwd: opts.cwd,
    });
  });
program.parse();
//# sourceMappingURL=index.js.map
