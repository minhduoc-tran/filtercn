"use client";

import { motion } from "framer-motion";
import { Check, Copy, Terminal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const codeSnippet = `import { FilterProvider, FilterRoot } from "@/components/conditional-filter";

const fields = [
  { name: "status", label: "Status", type: "select", options: [...] },
  { name: "price", label: "Price", type: "number" },
];

export default function MyPage() {
  return (
    <FilterProvider config={{ fields, paramStyle: "underscore" }}>
      <FilterRoot />
    </FilterProvider>
  );
}`;

const manualSnippet = `1. Ensure you have shadcn/ui installed.
2. Copy the conditional-filter directory.
3. Drop it into your components directory.`;

export function Installation() {
  const [copied, setCopied] = useState<"code" | "bash" | "cli" | "manual" | null>(null);

  const copyToClipboard = (text: string, type: "code" | "bash" | "cli" | "manual") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section
      id="installation"
      className="w-full py-24 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800"
    >
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-zinc-900 dark:text-zinc-50">
                Install in seconds
              </h2>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400 md:text-lg">
                Use the CLI to automatically scaffold the components into your Next.js application, or copy them
                manually.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <Tabs defaultValue="cli" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="cli">CLI</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                </TabsList>

                <TabsContent value="cli">
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Run the automated CLI using your preferred package manager. It will scaffold 19 files and install
                      required dependencies.
                    </p>

                    <div className="w-full relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 overflow-hidden">
                      <div className="flex items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex items-center gap-4">
                          <div className="bg-zinc-600 dark:bg-zinc-700 text-white rounded text-[10px] font-mono h-6 w-6 flex items-center justify-center font-bold">
                            &gt;_
                          </div>

                          <Tabs defaultValue="pnpm" className="w-auto h-auto">
                            <TabsList className="bg-transparent h-auto p-0 flex space-x-2">
                              {["pnpm", "npm", "yarn", "bun"].map((pm) => (
                                <TabsTrigger
                                  key={pm}
                                  value={pm}
                                  className="h-7 text-sm font-mono rounded-md px-3 border border-transparent data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm data-[state=active]:border-zinc-200 dark:data-[state=active]:bg-zinc-950 dark:data-[state=active]:text-zinc-100 dark:data-[state=active]:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-transparent hover:text-zinc-700 dark:hover:text-zinc-300 transition-all"
                                >
                                  {pm}
                                </TabsTrigger>
                              ))}
                            </TabsList>

                            {/* PNPM */}
                            <TabsContent value="pnpm" className="mt-0 absolute left-0 right-0 top-[53px] bottom-0">
                              <div className="h-full bg-zinc-50 dark:bg-zinc-950/50 p-4">
                                <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto w-full">
                                  <code>pnpm dlx filtercn init</code>
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  type="button"
                                  onClick={() => copyToClipboard("pnpm dlx filtercn init", "cli")}
                                  className="absolute top-2 right-2 h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                  aria-label="Copy code"
                                >
                                  {copied === "cli" ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </TabsContent>

                            {/* NPM */}
                            <TabsContent value="npm" className="mt-0 absolute left-0 right-0 top-[53px] bottom-0">
                              <div className="h-full bg-zinc-50 dark:bg-zinc-950/50 p-4">
                                <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto w-full">
                                  <code>npx filtercn init</code>
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  type="button"
                                  onClick={() => copyToClipboard("npx filtercn init", "cli")}
                                  className="absolute top-2 right-2 h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                  aria-label="Copy code"
                                >
                                  {copied === "cli" ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </TabsContent>

                            {/* BUN */}
                            <TabsContent value="bun" className="mt-0 absolute left-0 right-0 top-[53px] bottom-0">
                              <div className="h-full bg-zinc-50 dark:bg-zinc-950/50 p-4">
                                <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto w-full">
                                  <code>bunx filtercn init</code>
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  type="button"
                                  onClick={() => copyToClipboard("bunx filtercn init", "cli")}
                                  className="absolute top-2 right-2 h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                  aria-label="Copy code"
                                >
                                  {copied === "cli" ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </TabsContent>

                            {/* YARN */}
                            <TabsContent value="yarn" className="mt-0 absolute left-0 right-0 top-[53px] bottom-0">
                              <div className="h-full bg-zinc-50 dark:bg-zinc-950/50 p-4">
                                <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto w-full">
                                  <code>yarn dlx filtercn init</code>
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  type="button"
                                  onClick={() => copyToClipboard("yarn dlx filtercn init", "cli")}
                                  className="absolute top-2 right-2 h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                  aria-label="Copy code"
                                >
                                  {copied === "cli" ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </div>
                      <div className="h-14 bg-zinc-50 dark:bg-zinc-950/50"></div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="manual">
                  <div className="relative group">
                    <pre className="p-4 bg-zinc-950 text-zinc-50 rounded-lg overflow-x-auto text-sm font-mono border border-zinc-800">
                      <code>{manualSnippet}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => copyToClipboard(manualSnippet, "manual")}
                      className="absolute top-2 right-2 h-8 w-8 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all border border-zinc-700"
                      aria-label="Copy code"
                    >
                      {copied === "manual" ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 w-full"
          >
            <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50">2. Wrap your components</h3>
            <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">
              <div className="flex items-center px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>
                <div className="ml-4 text-xs font-medium text-zinc-500 font-mono flex items-center">
                  <Terminal className="w-3 h-3 mr-1" /> page.tsx
                </div>
              </div>
              <pre className="p-6 bg-white dark:bg-black text-sm font-mono overflow-x-auto">
                <code className="text-zinc-800 dark:text-zinc-300">{codeSnippet}</code>
              </pre>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => copyToClipboard(codeSnippet, "code")}
                className="absolute top-14 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Copy code"
              >
                {copied === "code" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-400" />
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
