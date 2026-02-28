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
export declare function detectProject(cwd: string): ProjectInfo;
//# sourceMappingURL=detect-project.d.ts.map
