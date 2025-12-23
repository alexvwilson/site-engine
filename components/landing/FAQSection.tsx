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
      question: "What file formats do you support?",
      answer:
        "We support all common audio and video formats including MP3, MP4, WAV, MOV, and M4A. Both audio-only and video files work perfectly - we automatically extract audio from video files during processing.",
    },
    {
      question: "How accurate is the transcription?",
      answer:
        "We use OpenAI's Whisper API, which provides industry-leading accuracy of 95%+ across multiple languages. The system automatically detects the language and adapts to different accents, audio quality, and speaking styles for optimal results.",
    },
    {
      question: "Are my files secure and private?",
      answer:
        "Absolutely. All files are encrypted in transit and at rest using enterprise-grade security (Supabase Storage). Your files are only accessible to you and are automatically deleted from our servers after processing if you choose. We never train AI models on your content.",
    },
    {
      question: "How long does transcription take?",
      answer:
        "Processing time is typically 0.3x your file duration. For example, a 30-minute audio file takes approximately 9 minutes to transcribe. You can watch real-time progress updates while your file processes, and you'll be notified when it's ready.",
    },
    {
      question: "What export formats are available?",
      answer:
        "All users have access to TXT, SRT, VTT, JSON, and verbose JSON export formats. All exports maintain timestamp accuracy for subtitle creation and video editing workflows.",
    },
    {
      question: "What is the maximum file size?",
      answer:
        "You can upload files up to 2GB in size. This allows for processing of long-form content like podcasts, interviews, and lectures without any limitations.",
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
            Everything you need to know about transcription.
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
