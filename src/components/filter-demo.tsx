"use client";

import dynamic from "next/dynamic";

// Loaded only on the client — avoids SSG prerender failure for hooks like useRouter
const FilterDemoInner = dynamic(() => import("./filter-demo-inner").then((m) => ({ default: m.FilterDemoInner })), {
  ssr: false,
  loading: () => (
    <div className="not-prose rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 h-48 animate-pulse" />
  ),
});

export function FilterDemo() {
  return <FilterDemoInner />;
}
