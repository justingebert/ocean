import React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader } from "@/components/common/PageHeader";

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

const FAQRoute: React.FC = () => {
  return (
    <>
      <PageHeader title="Frequently asked questions" />
      <Accordion multiple>
        {faqs.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
};

export default FAQRoute;
