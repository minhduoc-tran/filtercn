<div align="center">
  <br />
  <h1>FilterCN</h1>
  <p>
    <strong>A highly customizable, framework-agnostic, and type-safe conditional filter component.</strong>
  </p>
  <p>
    <a href="https://github.com/tmduoc/filtercn">Explore the docs</a> ·
    <a href="https://github.com/tmduoc/filtercn/issues">Report Bug</a> ·
    <a href="https://github.com/tmduoc/filtercn/issues">Request Feature</a>
  </p>
  <br />
</div>

FilterCN is the ultimate conditional filter component for robust data tables. It provides a unified, structured interface for end-users to construct complex queries and automatically serializes those query combinations into URL states or API parameters. 

Built beautifully on top of [shadcn/ui](https://ui.shadcn.com/), this headless-by-design component seamlessly drops into your Next.js application, granting your users the ability to find exactly what they need immediately without compromising your site's aesthetics.

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#key-features">Key Features</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#basic-usage">Basic Usage</a></li>
    <li><a href="#local-development">Local Development</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

## Key Features

- **💻 Developer Experience First:** Written completely in TypeScript. Enjoy robust autocompletion and strict type checking.
- **🔗 Automatic URL Synchronization:** Filter state is automatically synchronized with URL search parameters, preserving states natively on refresh and making your tables SEO-friendly and easily shareable.
- **🛠️ Fully Customizable Design:** Drop in your own operators, input fields, components, or entirely restructure the UI using simple context hooks.
- **⚡ CLI Installer:** Features a powerful, interactive CLI allowing rapid installation, dependency installation, and boilerplate scaffolding with one command.
- **📱 Responsive & Accessible:** Fully mobile-responsive out-of-the-box, keyboard navigable, and adhering to strict modern web patterns.

## Getting Started

### Prerequisites

To use FilterCN, you need a Next.js (or React) project with `shadcn/ui` configured.

You must install the following `shadcn/ui` components beforehand:
```bash
npx shadcn@latest add button input select popover calendar command badge
```

### Installation via CLI

The fastest way to install the component into your own project is using our CLI.

```bash
# Using npm
npx filtercn init

# Using pnpm
pnpm dlx filtercn init

# Using bun
bunx filtercn init
```

The CLI will detect your project configuration (like `components/` vs `src/components/`, `tsconfig.json` mappings) and scaffold the component logic automatically into your codebase.

## Basic Usage

Define your filter fields outside your component lifecycle to prevent unnecessary re-renders:

```tsx
import { FilterFieldDefinition } from "@/components/conditional-filter/types";

const fields: FilterFieldDefinition[] = [
  { 
    name: "status", 
    label: "Status", 
    type: "select", 
    options: [
      { label: "Active", value: "active" }, 
      { label: "Draft", value: "draft" }
    ] 
  },
  { name: "price", label: "Price", type: "number" },
  { name: "created_at", label: "Created At", type: "date" }
];
```

Wrap your Application or Table with the Provider:

```tsx
import { FilterProvider, FilterRoot } from "@/components/conditional-filter";

export default function DataPage() {
  return (
    <FilterProvider config={{ fields, paramStyle: "underscore" }}>
      <FilterRoot />
    </FilterProvider>
  );
}
```

## Project Structure

This repository acts as the central monorepo for the `filtercn` ecosystem. It comprises two distinct architectures:

1. **`packages/cli`**: The automated scaffolding utility. When developers run `npx filtercn init`, they are invoking this package, which resolves user project structures and injects the necessary React components correctly.
2. **`src/` (Web/Docs)**: The showcase application consisting of FilterCN's landing page, comprehensive integration documentation, and a fully interactive end-to-end playground testing the filter component against a mock REST API. 

## Local Development

If you wish to contribute to the FilterCN project, or interact with the demo locally:

```bash
# 1. Clone the repository
git clone https://github.com/tmduoc/filtercn.git

# 2. Navigate to directory
cd filtercn

# 3. Install dependencies
pnpm install

# 4. Start the development server
pnpm dev
```

### Command Scripts

*   `pnpm dev`: Starts the Next.js development and documentation server.
*   `pnpm build`: Creates a production build.
*   `pnpm test:e2e`: Runs the Playwright automated browser tests.
*   `pnpm lint`: Checks the code for linting errors using Biome.
*   `pnpm format`: Formats code utilizing Biome standard conventions.

## License

This project is open-sourced under the MIT License - see the `LICENSE` file for details.

---
Built with ❤️ by [tmduoc](https://github.com/tmduoc) using [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com/), and [shadcn/ui](https://ui.shadcn.com/).