"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { motion } from "framer-motion";

const faqs = [
  {
    question: "What is ScrapeStudio and what does it do?",
    answer:
      "ScrapeStudio is a browser extension and web app designed to streamline your web development workflow. It allows you to extract components from any website, convert them to various formats, and save them to your personal library or directly to your project. Say goodbye to manual recreation and screenshots!",
  },
  {
    question: "How do I use ScrapeStudio?",
    answer:
      "First, install the ScrapeStudio extension for Chrome or Firefox. Then, navigate to any website and click on the extension icon. Select any element on the page, and the code—in your chosen format—will be copied and ready to paste into your project. It's as simple as Browse, Click, and Create!",
  },
  {
    question: "How Does Component Extraction Work?",
    answer:
      "Instantly extract HTML and CSS from any website element using our browser extension. Click once to save components directly to your personal library, enabling developers to quickly capture and reuse design inspiration without complex coding or technical expertise.",
  },
  {
    question: "What Frameworks Can I Export Components To?",
    answer:
      "Export components seamlessly to popular web development frameworks including React, Vue.js, Angular, and Tailwind CSS. Our tool provides one-click conversion, supporting modern web development workflows and helping developers accelerate their design-to-code process.",
  },
  {
    question: "Are there any limitations to ScrapeStudio?",
    answer:
      "The biggest limitation is websites that use JavaScript to heavily modify the page content display. In such cases, the copied code may not be entirely correct. If you encounter any such element, please report it to us. Even if the element isn't copied perfectly, you can still use the code as a starting point and make adjustments.",
  },
  {
    question: "How Does Version Control Work?",
    answer:
      "Every component in your library is automatically versioned. Track changes, revert to previous versions, and maintain a complete history of your component evolution.",
  },
];

export function FAQSection() {
  return (
    <section className="w-full py-20" id="faq-section">
      <div className="relative z-10 mx-auto max-w-xl mb-16 space-y-4 text-center md:space-y-8">
        <h2 className="text-balance text-4xl font-medium lg:text-5xl">
          Frequently Asked Questions
        </h2>
        <p className="text-white/60">
          Everything you need to know about UiScraper
        </p>
      </div>
      <div className="mx-auto max-w-2xl text-center">
        {/* FAQ Accordion */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <Accordion
            collapsible
            className="w-full divide-y  divide-white/10"
            type="single"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                className="border-b border-white/10  space-y-4 "
                value={`item-${index}`}
              >
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="font-medium text-[16px] leading-[24px]  text-center transition-all ">
                    {faq.question}
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-left text-[16px] leading-[24px] font-normal text-white/60 bg-transparent">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
