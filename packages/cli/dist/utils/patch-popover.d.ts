import type { ProjectInfo } from "./detect-project.js";
/**
 * Ensures the user's popover.tsx exports PopoverClose.
 * shadcn/ui does not include PopoverClose by default, but FilterCN needs it.
 */
export declare function patchPopoverClose(projectInfo: ProjectInfo, cwd: string): boolean;
//# sourceMappingURL=patch-popover.d.ts.map
