import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "How does AI theme generation work?",
      answer:
        "Simply describe your brand, target audience, and style preferences in plain language. Our AI analyzes your input and generates a complete theme including color palette, typography, and component styles that match your vision.",
    },
    {
      question: "Can I use my own domain?",
      answer:
        "Yes! You can connect your custom domain to any published site. We handle SSL certificates automatically, so your site is secure from day one.",
    },
    {
      question: "Do I need coding experience?",
      answer:
        "Not at all. Headstring Web is designed for content managers and creators who want full control without writing code. Everything is visual - drag sections, click to edit text, and see changes in real-time.",
    },
    {
      question: "What types of pages can I create?",
      answer:
        "You can create any type of page using our 9 block types: Hero, Text, Image, Gallery, Features, CTA, Testimonials, Contact, and Footer sections. Combine them in any order to build landing pages, about pages, portfolios, and more.",
    },
    {
      question: "Can I preview before publishing?",
      answer:
        "Absolutely. Our preview mode lets you see exactly how your page will look on desktop, tablet, and mobile devices before you publish. No surprises for your visitors.",
    },
    {
      question: "Is my content secure?",
      answer:
        "Yes. All content is stored securely with enterprise-grade encryption. Your sites and data are backed up regularly, and you maintain full ownership of everything you create.",
    },
  ];

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
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="mb-4">
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
};

export default FAQSection;
