<br />

<div align="center">
  <h1 align="center">FilterCN</h1>

  <p align="center">
    A highly customizable, framework-agnostic, and type-safe conditional filter component built for modern React and Next.js applications.
    <br />
    <br />
    <a href="https://github.com/tmduoc/filtercn"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/tmduoc/filtercn/issues/new?assignees=&labels=bug&template=bug-report.md&title=Bug%3A+">Report Bug</a>
    ·
    <a href="https://github.com/tmduoc/filtercn/issues/new?assignees=&labels=enhancement&template=feature-request.md&title=Feature%3A+">Request Feature</a>
  </p>
</div>

---

## About FilterCN

FilterCN is the ultimate conditional filter component for robust data tables. It provides a unified, structured interface for end-users to construct complex queries, and automatically serializes those query combinations into URL states or API parameters. 

Built beautifully on top of [shadcn/ui](https://ui.shadcn.com/), this headless-by-design component seamlessly drops into your Next.js application, granting your users the ability to find exactly what they need immediately without compromising your site's aesthetics.

### Key Features

*   **💻 Developer Experience First:** Written completely in TypeScript. Enjoy robust autocompletion and strict type checking.
*   **🔗 Automatic URL Synchronization:** Filter state is automatically synchronized with URL search parameters, preserving states natively on refresh and making your tables SEO-friendly and easily shareable.
*   **🛠️ Fully Customizable Design:** Drop in your own operators, input fields, components, or entirely restructure the UI using simple context hooks.
*   **⚡ CLI Installer:** Features a powerful, interactive CLI allowing rapid installation, dependency installation, and boilerplate scaffolding with one command.
*   **📱 Responsive & Accessible:** Fully mobile-responsive out-of-the-box, keyboard navigable, and adhering to strict ARIA patterns.

---

## Project Ecosystem

This repository acts as the central monorepo for the `filtercn` ecosystem. It comprises two distinct architectures:

1. **`packages/cli`**: The automated scaffolding utility. When developers run `npx filtercn init`, they are invoking this package, which resolves user project structures and injects the necessary React components directly into their source. 
2. **`src/` (Web/Docs)**: The showcase application consisting of FilterCN's landing page, comprehensive integration documentation built with MDX, and a fully interactive end-to-end playground testing the filter component against a mock REST API. 

## Getting Started

### Installation via CLI

The fastest way to install the component into your own project is using the CLI:

```bash
# Using npm
npx filtercn init

# Using pnpm
pnpm dlx filtercn init

# Using bun
bunx filtercn init
```

The CLI will detect your project configuration (like `components/` vs `src/components/`, `tsconfig.json` mappings) and scaffold the component logic automatically.

### Basic Usage

Define your filter fields outside your component lifecycle:

```tsx
import { FilterFieldDefinition } from "@/components/conditional-filter/types";

const fields: FilterFieldDefinition[] = [
  { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Draft", value: "draft" }] },
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

## Local Development

If you wish to contribute to the FilterCN project, or interact with the demo locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/tmduoc/filtercn.git
   ```
2. Navigate into the directory and install dependencies:
   ```bash
   cd filtercn
   pnpm install
   ```
3. Start the documentation server:
   ```bash
   pnpm dev
   ```

### Command Scripts

*   `pnpm dev`: Starts the Next.js development and documentation server.
*   `pnpm build`: Creates a production build.
*   `pnpm test:e2e`: Runs the Playwright automated browser tests.
*   `pnpm lint`: Checks the code for linting errors using Biome.
*   `pnpm format`: Formats code utilizing Biome standard conventions.

## License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.

---
Built with ❤️ using [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com/), and [shadcn/ui](https://ui.shadcn.com/).