import type { MDXComponents } from "mdx/types";
import React from "react";
import { CodeBlock } from "@/components/code-block";
import { FilterDemo } from "@/components/filter-demo";
import { MdxCodeTabs } from "@/components/mdx-code-tabs";

const extractText = (children: React.ReactNode): string => {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    if (props && "children" in props) return extractText(props.children);
  }
  return "";
};

const extractLang = (className?: string): string => {
  const match = className?.match(/language-(\w+)/);
  return match?.[1] ?? "text";
};

// This file is required to use @next/mdx in the `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    MdxCodeTabs,
    FilterDemo,
    pre: (props) => {
      const { children } = props;

      // remark-mdx-code-meta forwards meta attributes (e.g. filename="...") to the <code> element
      const codeEl = React.isValidElement(children)
        ? (children as React.ReactElement<{
            className?: string;
            children?: React.ReactNode;
            filename?: string;
            [key: string]: unknown;
          }>)
        : null;

      const lang = extractLang(codeEl?.props?.className);
      const filename = codeEl?.props?.filename as string | undefined;
      const code = extractText(codeEl?.props?.children ?? children).trim();

      return <CodeBlock code={code} lang={lang} filename={filename ?? undefined} />;
    },
  };
}
