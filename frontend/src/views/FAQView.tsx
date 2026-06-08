import React from 'react';

import AppLayout from '../layouts/AppLayout';
import { FAQNavigation } from '../constants/menu.ts';
import {Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react';
import {ChevronDownIcon} from "@heroicons/react/20/solid";
/**
 * List of frequently asked questions (FAQs) and their corresponding answers.
 */
const faqs = [
    {
        question: "Wo finde ich die Datenschutzerklärung?",
        answer:
            <div>Aufrufbar unter <a href="https://www.htw-berlin.de/datenschutz/">https://www.htw-berlin.de/datenschutz/</a></div>,
    },
    {
        question: "Wo finde ich das Impressum?",
        answer:
        <div>Aufrufbar unter <a href="https://www.htw-berlin.de/impressum/">https://www.htw-berlin.de/impressum/</a></div>,
    }
  ]
  /**
   * Utility function to merge class names dynamically.
   * Removes falsy values and joins the remaining class names into a single string.
   *
   * @param classes - An array of class names.
   * @returns A string containing the filtered class names.
   */
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }
/**
 * View component for displaying frequently asked questions (FAQs).
 * - Uses `headlessui` for collapsible FAQ sections.
 * - Wrapped in `AppLayout` for consistent navigation.
 */
const FAQView: React.FC = () => {
  return (
    <AppLayout selectedNavigation={FAQNavigation.name}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto divide-y-2 divide-gray-200">
                <h2 className="text-center text-3xl font-extrabold text-gray-900 sm:text-4xl">Frequently asked questions</h2>
                <dl className="mt-6 space-y-6 divide-y divide-gray-200">
                    {faqs.map((faq) => (
                    <Disclosure as="div" key={faq.question} className="pt-6">
                        {({ open }) => (
                        <>
                            <dt className="text-lg">
                            <DisclosureButton className="text-left w-full flex justify-between items-start text-gray-400">
                                <span className="font-medium text-gray-900">{faq.question}</span>
                                <span className="ml-6 h-7 flex items-center">
                                <ChevronDownIcon
                                    className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-6 w-6 transform')}
                                    aria-hidden="true"
                                />
                                </span>
                            </DisclosureButton>
                            </dt>
                            <DisclosurePanel as="dd" className="mt-2 pr-12">
                            <p className="text-base text-gray-500">{faq.answer}</p>
                            </DisclosurePanel>
                        </>
                        )}
                    </Disclosure>
                    ))}
                </dl>
            </div>
        </div>
    </AppLayout>
  );
}

export default FAQView;
