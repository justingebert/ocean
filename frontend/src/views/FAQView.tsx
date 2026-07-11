import React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AppLayout from "@/layouts/AppLayout";
import { FAQNavigation } from "@/navigation/navigation.ts";

const faqs = [
  {
    question: "Wo finde ich die Datenschutzerklärung?",
    answer: (
      <div>
        Aufrufbar unter{" "}
        <a href="https://www.htw-berlin.de/datenschutz/">https://www.htw-berlin.de/datenschutz/</a>
      </div>
    ),
  },
  {
    question: "Wo finde ich das Impressum?",
    answer: (
      <div>
        Aufrufbar unter{" "}
        <a href="https://www.htw-berlin.de/impressum/">https://www.htw-berlin.de/impressum/</a>
      </div>
    ),
  },
];

const FAQView: React.FC = () => {
  return (
    <AppLayout selectedNavigation={FAQNavigation.name}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-3xl font-extrabold sm:text-4xl">
            Frequently asked questions
          </h2>
          <Accordion className="mt-6" multiple>
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </AppLayout>
  );
};

export default FAQView;
