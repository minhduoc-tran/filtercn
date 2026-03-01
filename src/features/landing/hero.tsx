"use client";

import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } },
  };

  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-full"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8"
      >
        <motion.div variants={itemVariants}>
          <Badge
            variant="outline"
            className="px-3 py-1 text-sm font-medium bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>v{siteConfig.version} is now live
          </Badge>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-4xl"
        >
          The Ultimate <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-cyan-500">
            Conditional Filter
          </span>{" "}
          for React
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-[700px] text-lg sm:text-xl text-zinc-600 dark:text-zinc-400"
        >
          A highly customizable, URL-driven filtering component built for modern web applications. Packed with Global
          Search, DatePickers, and Debounced Async Selects. Drop it in and let your users find exactly what they need.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
          <Button
            size="lg"
            className="px-8"
            onClick={() => {
              document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Try the Demo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 shadow-sm" asChild>
            <a href={siteConfig.repoUrl} target="_blank" rel="noreferrer">
              <Github className="mr-2 h-4 w-4" /> GitHub
            </a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
