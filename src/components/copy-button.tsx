"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  content: string;
}

export function CopyButton({ content }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      size="icon"
      variant="outline"
      className="h-7 w-7 bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 backdrop-blur-sm"
      onClick={copyToClipboard}
    >
      {hasCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      <span className="sr-only">Copy code</span>
    </Button>
  );
}
