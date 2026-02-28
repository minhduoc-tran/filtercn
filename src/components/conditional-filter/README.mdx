import { MdxCodeTabs } from "@/components/mdx-code-tabs";

# Conditional Filter Documentation

This guide covers how to manually install, configure, and use the `Conditional Filter` component in your Next.js project.

---

## Installation

The easiest and recommended way to install FilterCN is via our dedicated CLI tool. It handles folder formatting, component scaffolding, and peer dependency installation automatically.

### 1. Prerequisites

Since this component is built on top of `shadcn/ui`, you must ensure your project is properly configured with it. You need the following core components:

```bash
npx shadcn@latest add button input select popover calendar command badge
```

### 2. Run the CLI Installer

Navigate to the root directory of your Next.js project and run the init command using your preferred package manager's executor:

<MdxCodeTabs 
  npm="npx filtercn init"
  pnpm="pnpm dlx filtercn init"
  bun="bunx filtercn init"
  yarn="yarn dlx filtercn init"
/>

### 3. Follow the Prompts

The CLI is designed to be completely hands-off but informative. When executed, it will:
1. **Detect** your project setup (whether you use `src/components` or just `components`, and what your `tsconfig.json` path alias is).
2. **Scaffold** a new folder at `components/conditional-filter` containing 19 files (hooks, helpers, UI logic).
3. **Install Dependencies**: It will check your `package.json` for `lucide-react` (icons) and `date-fns` (date formatting). If they are missing, it will ask for your permission to install them automatically.

Once the CLI prints `✨ FilterCN installed successfully!`, you are ready to write code.

---

### Alternative: Manual Installation


#### 1. Copy the Source Code
Copy the entire `conditional-filter` folder into your project's components directory (usually `src/components/conditional-filter`).

Your folder structure should look something like this:
```text
src/
  components/
    conditional-filter/
      helpers/
      hooks/
      provider/
      ui/
      index.ts
      types.ts
```

### Usage Examples

Learn how to integrate the conditional filter component into your pages step-by-step.

#### Step 1: Define your filterable fields

Start by defining the fields available to be filtered by your users. Define the array of `FilterFieldDefinition` outside of your component to prevent unnecessary re-renders.

```tsx
import { FilterFieldDefinition } from "@/components/conditional-filter/types";

const myFields: FilterFieldDefinition[] = [
  { 
    name: "status", 
    label: "Status", 
    type: "select", 
    options: [
      { label: "Active", value: "active" },
      { label: "Draft", value: "draft" }
    ]
  },
  { 
    name: "price", 
    label: "Price", 
    type: "number" 
  },
  {
    name: "created_at",
    label: "Created At",
    type: "date"
  }
];
```

#### Step 2: Wrap with Provider and Render

Next, use the `FilterProvider` to wrap the filter component, and pass the configuration to it.

```tsx
import { FilterProvider, FilterRoot } from "@/components/conditional-filter";

export default function MyPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <FilterProvider 
        config={{ 
          fields: myFields, 
          // Set serializing style: "underscore", "bracket", or "custom"
          paramStyle: "underscore" 
        }}
      >
        <FilterRoot />
      </FilterProvider>
    </div>
  );
}
```

#### Step 3: Read URL State (Optional)

Once the user configures the filters, the provider will automatically sync the URL search parameters using Next.js hooks. You can access the serialized string on the backend or in other Server Components by reading the `searchParams`.

---

## Configuration API (`FilterConfig`)

The `FilterProvider` accepts a `config` object with the following properties:

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `fields` | `FilterFieldDefinition[]` | **Required** | The list of fields available for filtering. |
| `maxRows` | `number` | `10` | The maximum number of filter rows a user can add. |
| `allowConjunctionToggle` | `boolean` | `true` | Allows the user to toggle between `AND` and `OR` for the entire query. |
| `paramStyle` | `"underscore" \\| "bracket" \\| "custom"` | `"underscore"` | Determines how the query string is formatted in the URL. |
| `locale` | `Locale` | `enUS` | Date-fns locale object for formatting the `date` picker. |
| `customParamBuilder` | `Function` | `undefined` | Required if `paramStyle` is set to `"custom"`. |

### Field Definition (`FilterFieldDefinition`)

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The key sent to the server (e.g. `price`). |
| `label` | `string` | The human-readable label shown in the dropdown. |
| `type` | `"string" \\| "number" \\| "boolean" \\| "date" \\| "select"` | Determines the input UI (e.g. text input vs date picker). |
| `options` | `{ label: string; value: string }[]` | **Required** if `type` is `"select"`. Populates the dropdown. |
| `operators` | `OperatorType[]` | Allows you to restrict which operators (e.g. `gt`, `lt`, `is`) are available for this specific field. |

---


## Built With 

- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [date-fns](https://date-fns.org/)
