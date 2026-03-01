"use client";

import { motion } from "framer-motion";
import { Blocks, Pipette, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    name: "Framework Agnostic",
    description:
      "Generates queries perfectly suited for popular REST API structures out of the box. Supports param prefixes and name spaces.",
    icon: Blocks,
  },
  {
    name: "Beautiful UI & DatePickers",
    description:
      "Built on top of Radix UI and styled with Tailwind CSS via shadcn/ui. Comes with an elegant Calendar DatePicker and Debounced Combobox built-in.",
    icon: Pipette,
  },
  {
    name: "Global Search & Logic",
    description:
      "Includes a sleek FilterBar with full-text search, auto-debounce, and a seamless toggle for complex AND/OR conditional statements.",
    icon: ShieldCheck,
  },
  {
    name: "URL State Synchronization",
    description:
      "Deeply integrated with Next.js router. Every filter and search query is instantly synced with the URL without unneeded page reloads.",
    icon: Zap,
  },
];

export function Features() {
  return (
    <section id="features" className="w-full py-24 bg-zinc-50 dark:bg-zinc-950">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
          >
            Everything you need. <span className="text-zinc-500 dark:text-zinc-400">Nothing you don't.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-[700px] text-zinc-600 dark:text-zinc-400 md:text-lg"
          >
            Designed to cover 99% of filtering use cases while staying incredibly lightweight and easy to integrate.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 mb-4 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
