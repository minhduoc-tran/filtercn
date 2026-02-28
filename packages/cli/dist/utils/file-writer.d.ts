export interface WriteFileOptions {
  /** Base directory (cwd) */
  cwd: string;
  /** Force overwrite existing files */
  force: boolean;
}
export declare function writeTemplateFile(
  relativePath: string,
  content: string,
  options: WriteFileOptions,
): Promise<boolean>;
export declare function writeAllTemplates(files: Record<string, string>, options: WriteFileOptions): Promise<number>;
//# sourceMappingURL=file-writer.d.ts.map
