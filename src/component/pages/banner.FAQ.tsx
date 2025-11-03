
import { useState } from 'react';
import { styles } from '../../styles/common';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "How far in advance should I book my move?",
    answer: "We recommend booking at least 2-3 weeks in advance for the best availability. However, we can accommodate last-minute moves when possible."
  },
  {
    id: 2,
    question: "Do you provide packing materials?",
    answer: "Yes! We provide all necessary packing materials including boxes, tape, bubble wrap, and furniture blankets. These can be included in your quote."
  },
  {
    id: 3,
    question: "What areas do you service?",
    answer: "We service all of Orange County and surrounding areas including Los Angeles, Long Beach, and parts of Riverside County. Contact us to confirm your specific location."
  },
  {
    id: 4,
    question: "Are you licensed and insured?",
    answer: "Absolutely! We are fully licensed, bonded, and insured. Your belongings are protected throughout the entire moving process."
  },
  {
    id: 5,
    question: "Do you offer storage services?",
    answer: "Yes, we offer both short-term and long-term storage solutions. Our secure facilities are climate-controlled and monitored 24/7."
  },
  {
    id: 6,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, cash, and bank transfers. Payment is typically due upon completion of the move."
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([1]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className={`${styles.section.default} bg-white`}>
      <div className={styles.container}>
        <div className="text-center mb-16">
          <h2 className={styles.heading.h2}>Frequently Asked Questions</h2>
          <p className={`${styles.text.body} max-w-3xl mx-auto`}>
            Get answers to the most common questions about our moving services.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                >
                  <span className="font-semibold text-gray-900">{item.question}</span>
                  <span className={`text-blue-600 transition-transform duration-200 ${
                    openItems.includes(item.id) ? 'rotate-180' : ''
                  }`}>
                    ▼
                  </span>
                </button>
                {openItems.includes(item.id) && (
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button className={`${styles.button.primary}`}>
                Contact Us
              </button>
              <button className={`${styles.button.secondary}`}>
                View All FAQs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

FAQ.displayName = 'FAQ'; 