import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import './Faq.css';

const faqData = [
    { question: "What is SportX?", answer: "SportX is an online platform for buying, selling, and auctioning sports-related items securely and efficiently." },
        { question: "Do I need an account to buy or sell?", answer: "Yes, you need to create an account to participate in auctions, make purchases, or list items for sale." },
        { question: "How do I place an order?", answer: "Simply browse the listings, select the item you want, and proceed to checkout. If it's an auction, place your bid and wait for the results." },
        { question: "How long does delivery take?", answer: "Delivery times vary depending on the seller and shipping method chosen. Estimated delivery dates are provided at checkout." },
        { question: "Can I track my order?", answer: "Yes! Once your order is shipped, you'll receive a tracking number to monitor its status." },
        { question: "How do auctions work?", answer: "You can place bids on auctioned items. The highest bid at the end of the auction wins the item." },
        { question: "What happens if I win an auction?", answer: "If you win, you will receive an email confirmation with payment details. Complete the payment within the given time to secure your purchase." },
        { question: "Are the products on SportX authentic?", answer: "Yes! We ensure that all listed products go through a verification process to guarantee authenticity." },
        { question: "Can I return or exchange an item?", answer: "Return and exchange policies depend on the seller. Check the product listing for specific return policies before purchasing." },
        { question: "How do I sell an item on SportX?", answer: "Simply create an account, list your item with details and images, set a price or auction format, and wait for buyers to bid or purchase." },
        { question: "Is my payment information secure?", answer: "Yes, we use advanced encryption and secure payment gateways to protect your data." },
        { question: "What if I have an issue with my order?", answer: "You can contact our customer support team through the “Help” section for any order-related concerns." },
  ];
export default function Faq(){
    const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

    return(
        <div className="faq-container">
            <h2>Frequently Asked questions</h2>
            <p>Find answers to the most common questions.</p>
            <div className="faq-list">
            {faqData.map((faq,index)=>(
                <div
                key={index}
                className={`faq-item ${openIndex === index ? "open" : ""}`}
                onClick={()=>toggleFAQ(index)}
                >
                    <div className="faq-question">
                        {faq.question}
                        {openIndex === index ? <FontAwesomeIcon icon={faChevronUp}/> : <FontAwesomeIcon icon={faChevronDown}/>}
                    </div>
                    {openIndex === index && <div className="faq-answer">{faq.answer}</div>}
                </div>
            ))}
            </div>     
            <div className="faq-contact">
                <p>Didn't find your question? Contact us for more help!</p>
                <button className="contact-button" onClick={() => window.location.href = "/contactus"}>
                    Contact Us
                </button>
                </div>       
        </div>
    )
}