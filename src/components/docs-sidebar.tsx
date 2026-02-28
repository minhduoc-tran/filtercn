"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNav } from "@/config/docs-nav";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-full">
      {docsNav.map((section) => (
        <div key={section.title} className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {section.title}
          </p>
          <ul className="space-y-1">
            {section.pages.map((page) => {
              const href = `/docs/${page.slug}`;
              const isActive = pathname === href;
              return (
                <li key={page.slug}>
                  <Link
                    href={href}
                    className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
