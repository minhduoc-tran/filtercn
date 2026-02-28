import type { ProjectInfo } from "./detect-project.js";
export declare function checkPeerDependencies(cwd: string): string[];
export declare function installDependencies(deps: string[], projectInfo: ProjectInfo, cwd: string): void;
export declare function getShadcnInstallHint(pm: ProjectInfo["packageManager"]): string;
//# sourceMappingURL=dependencies.d.ts.map
