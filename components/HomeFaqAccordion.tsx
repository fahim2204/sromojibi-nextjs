"use client";

import React, { useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

export default function HomeFaqAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openFaq === index;
        return (
          <div
            key={index}
            className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden transition-all"
          >
            <button
              onClick={() => setOpenFaq(isOpen ? null : index)}
              className="w-full p-6 text-left flex items-center justify-between font-bold text-white text-base hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <span>{faq.question}</span>
              <span className="text-xl text-emerald-400 ml-4">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="px-6 pb-6 text-sm text-gray-300 leading-relaxed border-t border-gray-800/60 pt-4">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
