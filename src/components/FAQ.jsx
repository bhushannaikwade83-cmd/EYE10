import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import './FAQ.css'

const faqData = [
  {
    question: 'What types of eyewear do you offer?',
    answer:
      'We offer a wide range of premium eyewear including prescription glasses, sunglasses, reading glasses, and specialty frames. Our collection features various styles from classic to modern designs.',
  },
  {
    question: 'Do you provide eye examinations?',
    answer:
      'Yes, we offer comprehensive eye examinations conducted by certified optometrists. You can book an appointment through our contact page or by calling us directly.',
  },
  {
    question: 'What is your return policy?',
    answer:
      'We offer a 30-day return policy on all eyewear purchases. Products must be in original condition with all packaging. Please contact us for return authorization.',
  },
  {
    question: 'Do you offer lens replacement services?',
    answer:
      'Yes, we provide lens replacement services for all types of frames. Whether you need prescription updates or lens repairs, our expert technicians can help.',
  },
  {
    question: 'What brands do you carry?',
    answer:
      'We carry premium brands including Ray-Ban, Oakley, Gucci, Prada, Versace, and our own EYE10 collection. We regularly update our inventory with the latest styles.',
  },
  {
    question: 'How long does frame adjustment take?',
    answer:
      'Frame adjustments are typically done on the spot during your visit. Our technicians can adjust nose pads, temple arms, and frame fit to ensure perfect comfort.',
  },
  {
    question: 'Do you offer warranty on eyewear?',
    answer:
      'Yes, all our eyewear comes with a manufacturer warranty. We also offer extended warranty options for additional protection. Details are provided at the time of purchase.',
  },
  {
    question: 'Can I try frames before purchasing?',
    answer:
      'Absolutely! We encourage you to visit our showroom to try on frames. Our expert consultants will help you find the perfect fit and style that complements your face shape.',
  },
]

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="faq-section">
      <div className="container">
        <div className="faq-header">
          <HelpCircle size={48} className="faq-icon" />
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-subtitle">
            Find answers to common questions about our products and services
          </p>
        </div>

        <div className="faq-list">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleFAQ(index)
                  }
                }}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`faq-icon-chevron ${openIndex === index ? 'open' : ''}`}
                  aria-hidden="true"
                />
              </button>
              <div 
                className="faq-answer"
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
