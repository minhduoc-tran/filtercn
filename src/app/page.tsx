"use client";

import { Github } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { type FilterFieldDefinition, FilterProvider, FilterRoot } from "@/components/conditional-filter";
import { Faq } from "@/features/landing/faq";
import { Features } from "@/features/landing/features";
import { Hero } from "@/features/landing/hero";
import { Installation } from "@/features/landing/installation";

const productFields: FilterFieldDefinition[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Draft", value: "draft" },
    ],
  },
  { name: "price", label: "Price", type: "number" },
  { name: "name", label: "Name", type: "text" },
  {
    name: "category",
    label: "Category",
    type: "combobox",
    fetchOptions: async (search) => {
      // Mock API call for combobox
      return new Promise((resolve) => {
        setTimeout(() => {
          const all = [
            { label: "Shirts", value: "shirts" },
            { label: "Shoes", value: "shoes" },
            { label: "Accessories", value: "accessories" },
          ];
          resolve(all.filter((i) => i.label.toLowerCase().includes(search.toLowerCase())));
        }, 500);
      });
    },
  },
  { name: "is_published", label: "Published", type: "boolean" },
  { name: "created_at", label: "Created At", type: "date" },
];

type DemoProduct = { id: number; name: string; category: string; status: string; price: number };

function FilterDemo() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<{ results: DemoProduct[]; total: number; count: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await fetch(`/api/products${query ? `?${query}` : ""}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl px-4 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data ? `Showing ${data.count} of ${data.total} products` : "Loading..."}
          </p>
        </div>
        <FilterProvider config={{ fields: productFields, paramStyle: "underscore", maxRows: 5 }}>
          <FilterRoot />
        </FilterProvider>
      </div>

      <div className="border rounded-lg bg-white dark:bg-zinc-950 shadow-sm overflow-hidden text-sm">
        <div className="grid grid-cols-6 items-center p-4 border-b font-medium bg-muted/50">
          <div>ID</div>
          <div className="col-span-2">Name</div>
          <div>Category</div>
          <div>Status</div>
          <div className="text-right">Price</div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading products...</div>
        ) : !data || data.count === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No products match the filters.</div>
        ) : (
          <div className="divide-y">
            {data.results.map((p) => (
              <div key={p.id} className="grid grid-cols-6 items-center p-4">
                <div className="text-muted-foreground">#{p.id}</div>
                <div className="col-span-2 font-medium">{p.name}</div>
                <div className="capitalize text-muted-foreground">{p.category}</div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800"}`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-right">${p.price}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900 border-dashed text-muted-foreground font-mono text-xs break-all">
        API URL: /api/products{searchParams?.toString() ? `?${searchParams.toString()}` : ""}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black selection:bg-indigo-500/30">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur">
        <div className="container px-4 md:px-6 mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-indigo-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold w-3 h-3 block border-t-2 border-l-2 border-white rounded-tl-sm opacity-80" />
            </span>
            <span className="font-bold tracking-tight">FilterCN</span>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/docs" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">
              Docs
            </Link>
            <a
              href="#features"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Features
            </a>
            <a href="#demo" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">
              Demo
            </a>
            <a
              href="#installation"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Install
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        <Hero />

        <Features />

        {/* Interactive Demo Section */}
        <section
          id="demo"
          className="w-full py-24 bg-white dark:bg-black relative overflow-hidden flex flex-col items-center"
        >
          <div className="absolute top-0 right-1/4 -z-10 w-[600px] h-[600px] bg-cyan-500/10 dark:bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="container px-4 md:px-6 mx-auto flex flex-col items-center">
            <div className="text-center mb-16 max-w-2xl px-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-zinc-900 dark:text-zinc-50">
                Play with the Demo
              </h2>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400 md:text-lg">
                This is a fully working example. Add filters, stack options, and watch the URL and mock API response
                update in real time.
              </p>
            </div>

            {/* Glowing Mac-like Window Wrapper */}
            <div className="w-full max-w-5xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden relative group">
              {/* Window Header */}
              <div className="h-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                </div>
                <div className="mx-auto text-xs font-mono text-zinc-400 bg-white dark:bg-zinc-950 px-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-800/80">
                  localhost:3000
                </div>
              </div>

              {/* Demo Content */}
              <div className="p-4 sm:p-8 flex justify-center bg-zinc-50/50 dark:bg-black/50">
                <Suspense
                  fallback={<div className="h-64 flex items-center justify-center text-zinc-400">Loading demo...</div>}
                >
                  <FilterDemo />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        <Installation />
        <Faq />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <span className="text-zinc-400 text-[10px] font-bold block">F</span>
            </span>
            <span className="font-semibold text-sm text-zinc-600 dark:text-zinc-400">FilterCN</span>
          </div>
          <p className="text-sm text-zinc-500">Open source under MIT License.</p>
          <div className="flex space-x-4 text-sm">
            <Link href="/docs" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Documentation
            </Link>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
