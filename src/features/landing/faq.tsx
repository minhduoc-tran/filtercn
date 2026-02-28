"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What backend frameworks are supported?",
    answer:
      "Conditional Filter is completely framework agnostic. The query builder provides presets for popular REST API structures like `underscore` (e.g., `price__gt=100`) and `bracket` (e.g., `filter[price][gt]=100`), but you can easily write your own `customParamBuilder` to format the filter rows into any structure your backend expects.",
  },
  {
    question: "Is this a component library like MUI or Chakra UI?",
    answer:
      "No, this is a specialized filtering component built using Radix UI primitives and styled with Tailwind CSS (heavily inspired by shadcn/ui). It is designed to be copied into your project so you have full control over the code and styling.",
  },
  {
    question: "Can I use this with React Hook Form?",
    answer:
      "Conditional Filter manages its own internal state via `useReducer` to handle the complexity of dynamic rows, operators, and types. However, you can easily synchronize its output (`FilterState`) with React Hook Form or simply rely on the URL search params it generates.",
  },
  {
    question: "How do I add custom operators?",
    answer:
      "You can define your own fields and their supported operators in the `config` object passed to the `FilterProvider`. The component will automatically render only the operators you specify for each field.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="w-full py-24 bg-zinc-50 dark:bg-zinc-950/50">
      <div className="container px-4 md:px-6 mx-auto max-w-3xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-zinc-600 dark:text-zinc-400 md:text-lg"
          >
            Everything you need to know about the Conditional Filter component.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-lg hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
