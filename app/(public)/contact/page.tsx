import { Metadata } from "next";
import ContactForm from "@/components/landing/ContactForm";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Headstring Web",
  description:
    "Get in touch with Headstring Web. Tell us about your project and we'll help you build something amazing.",
};

export default function ContactPage() {
  return (
    <section className="bg-background py-16 md:py-20 lg:py-24">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="text-center mb-12">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Let&apos;s Talk
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Interested in Headstring Web? Have questions about how we can help
            with your project? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-sm">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
