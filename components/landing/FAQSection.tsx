import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getActiveFaqs } from "@/lib/queries/landing-content";

export default async function FAQSection() {
  const faqs = await getActiveFaqs();

  // Hide section if no FAQs
  if (faqs.length === 0) {
    return null;
  }

  return (
    <section
      id="faq"
      className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-background"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to know about building with Headstring Web.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="mb-4">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400 text-base leading-relaxed pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Still have questions?{" "}
            <Link
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
