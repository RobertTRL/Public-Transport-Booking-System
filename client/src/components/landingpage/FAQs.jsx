import { useState } from "react";

const faqs = [
  {
    question: "Is HopOn free to use?",
    answer:
      "Yes. Searching for routes and stops is completely free — there's no signup or subscription required.",
  },
  {
    question: "Which areas does HopOn cover?",
    answer:
      "HopOn currently focuses on major routes and stops around Nairobi, with more areas planned as the project grows.",
  },
  {
    question: "Do I need an account to search routes?",
    answer:
      "No. You can search for routes and view the map right away — no account needed.",
  },
  {
    question: "How accurate are the routes shown?",
    answer:
      "Routes and stops are based on common public transport paths and are meant as a helpful guide rather than live, real-time tracking.",
  },
  {
    question: "Can I use HopOn on my phone?",
    answer:
      "Yes, the site works on both desktop and mobile browsers, so you can plan your route on the go.",
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="faq-item">
      <button
        type="button"
        className="faq-item__trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{faq.question}</span>
        <svg
          className={`faq-item__icon ${isOpen ? "open" : ""}`}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className={`faq-item__content-wrapper ${isOpen ? "open" : ""}`}>
        <div className="faq-item__content-inner">
          <p>{faq.answer}</p>
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  function handleToggle(index) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <section className="faq">
      <div className="faq__inner">
        <h2 className="faq__title">Frequently asked questions</h2>
        <p className="faq__description">A few things people usually want to know before getting started.</p>

        <div className="faq__list">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;