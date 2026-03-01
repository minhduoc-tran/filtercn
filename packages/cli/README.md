# FilterCN CLI

The official CLI tool to automatically install the [FilterCN](https://github.com/tmduoc/filtercn) component into your Next.js project.

FilterCN is a comprehensive, fully-customizable filter component built on top of [shadcn/ui](https://ui.shadcn.com/). It provides a visual filter builder UI that syncs state to URL search parameters, ideal for REST API-powered data tables.

## Requirements

Before using this CLI, your project must have **Next.js**, **React**, and **shadcn/ui** installed and configured. 

You also need the following shadcn/ui components installed in your project:
```bash
npx shadcn@latest add button input select popover calendar command badge
```

---

## Installation

You do not need to install this CLI globally. Instead, run it directly using your preferred package manager's executor:

**Using npm:**
```bash
npx filtercn init
```

**Using pnpm:**
```bash
pnpm dlx filtercn init
```

**Using bun:**
```bash
bunx filtercn init
```

**Using yarn:**
```bash
yarn dlx filtercn init
```

### What happens when I run this?

The CLI will interactively guide you through the setup:
1. **Detects Environment:** It automatically finds your `src/components` (or `components`) folder and your TypeScript import aliases (e.g., `@/`).
2. **Prompts for Confirmation:** It asks if you want to proceed with writing files.
3. **Scaffolds Files:** It creates a `conditional-filter` folder with all 19 necessary files (Types, Hooks, Helpers, Context Provider, and UI components).
4. **Installs Dependencies:** It checks if you have `lucide-react` and `date-fns` installed. If you don't, it will ask to automatically install them for you using your detected package manager.

## Post-Installation Usage

Once the CLI finishes, you can immediately start using the component in your pages. 

Here is a quick example of how to wrap your data table with the filter:

```tsx
"use client";

import { FilterProvider, FilterBar } from "@/components/conditional-filter";
import type { FilterFieldDefinition } from "@/components/conditional-filter";

// 1. Define the fields your users can filter by
const filterFields: FilterFieldDefinition[] = [
  { name: "title", label: "Project Title", type: "text" },
  { 
    name: "status", 
    label: "Status", 
    type: "select", 
    options: [
      { label: "Active", value: "active" },
      { label: "Archived", value: "archived" },
    ]
  },
  { name: "price", label: "Budget", type: "number" },
  { name: "created_at", label: "Created", type: "date" }, // Now supports shadcn Calendar
];

export default function MyPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Projects</h1>
      
      {/* 2. Wrap the toolbar in the provider */}
      <FilterProvider 
        config={{ 
          fields: filterFields, 
          paramStyle: "underscore",
          allowConjunctionToggle: true, // Show AND/OR toggle
          searchParamName: "q" // Global search param tracking
        }}
      >
        <FilterBar searchPlaceholder="Search projects..." />
      </FilterProvider>

      {/* Your data table goes here. It should read from the URL parameters. */}
    </div>
  );
}
```

### New in v0.2.0
- **Global Search:** `FilterBar` now includes a full-text search input with a built-in 300ms debounce.
- **Date Pickers:** Date fields now automatically render using the `shadcn/ui` Calendar component.
- **Param Prefixes:** Use `paramPrefix: "filter_"` in your config to namespace all query params.
- **AND/OR Conjunction:** Users can now toggle between mapping filters with `AND` or `OR` logic.
- **Async Comboboxes:** Full debounce support for `useFilterOptions` when fetching dynamic records from your API.

## Options

If you have modified the component files and want to reset them to their original state, or if the installation failed halfway and you want to try again, use the `--force` flag:

```bash
npx filtercn init --force
```

## License

MIT
