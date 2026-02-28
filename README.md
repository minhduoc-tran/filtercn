# Project Base Setup

This is a [Next.js](https://nextjs.org) project bootstrapped with a focus on code quality and developer experience. It comes pre-configured with [Biome](https://biomejs.dev/) for linting and formatting, and [Husky](https://typicode.github.io/husky/) for pre-commit hooks.

## Getting Started

To get the project up and running, follow these steps:

### Prerequisites

You need to have [pnpm](https://pnpm.io/installation) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd project-base-setup
   ```
3. Install the dependencies:
   ```bash
   pnpm install
   ```

### Running the Development Server

To start the development server, run:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

This project includes the following scripts:

- `pnpm dev`: Starts the development server.
- `pnpm build`: Creates a production build of the application.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Checks the code for linting errors using Biome.
- `pnpm format`: Formats the code using Biome.
- `pnpm lint:fix`: Fixes linting errors automatically using Biome.

## Key Technologies

- [Next.js](https://nextjs.org/): A React framework for building server-side rendered and static web applications.
- [React](https://reactjs.org/): A JavaScript library for building user interfaces.
- [TypeScript](https://www.typescriptlang.org/): A typed superset of JavaScript that compiles to plain JavaScript.
- [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for rapidly building custom designs.
- [Biome](https://biomejs.dev/): A fast formatter and linter for web development.
- [Husky](https://typicode.github.io/husky/): A tool that makes it easy to work with Git hooks.

## Linting and Formatting

This project uses [Biome](https://biomejs.dev/) for both linting and formatting.

- To check for linting errors, run `pnpm lint`.
- To format the code, run `pnpm format`.
- To automatically fix linting errors, run `pnpm lint:fix`.

## Pre-commit Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality before committing. A pre-commit hook is configured to run `pnpm lint` on every commit, ensuring that no code with linting errors is committed to the repository.