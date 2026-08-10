"use client";

import { Accordion, AccordionItem } from "@nextui-org/react";
import { motion } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="w-full max-w-4xl mx-auto mt-16"
    >
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold gradient-text mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 text-lg">
          Everything you need to know about Sromojibi worker directory
        </p>
      </div>

      <Accordion selectionMode="single" className="w-full space-y-4">
        {items.map((faq, index) => (
          <AccordionItem
            key={index}
            aria-label={faq.question}
            title={faq.question}
            className="glass border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            classNames={{
              title: "text-lg font-semibold text-gray-900",
              trigger: "py-6 px-6 hover:bg-emerald-50/50",
              content: "text-gray-600 pb-6 px-6",
            }}
          >
            {faq.answer}
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}
