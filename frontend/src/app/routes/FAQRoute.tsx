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
    question: "Where can I find the privacy policy?",
    answer: (
      <div>
        On the HTW website:{" "}
        <a href="https://www.htw-berlin.de/datenschutz/">https://www.htw-berlin.de/datenschutz/</a>
      </div>
    ),
  },
  {
    question: "Where can I find the legal notice (Impressum)?",
    answer: (
      <div>
        On the HTW website:{" "}
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
