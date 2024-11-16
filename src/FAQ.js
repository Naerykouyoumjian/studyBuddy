import React from 'react';
import './FAQ.css';
import questionIcon from './iconmonstr-question-thin-240.png';
import Navbar from './Navbar';

const FAQ = () => {
    const faqData = [
        {
            question: "Is StudyBuddy really free?",
            answer: "Yes, StudyBuddy is completely free to use. There are no hidden fees or subscription charges.",
        },
        {
            question: "What kind of reminders will I receive?",
            answer: "You'll receive reminders for upcoming study sessions, deadlines for assignments, and exams.",
        },
        {
            question: "Can StudyBuddy help me prepare for exams?",
            answer: "Yes! StudyBuddy generates a study plan that focuses on exam preparation.",
        },
        {
            question: "Do I need to download any software to use StudyBuddy?",
            answer: "No downloads are necessary. StudyBuddy is fully web-based and accessible on any device.",
        },
    ];

    return (
        <>
            <Navbar isSignedIn={false} />
            <div className="faq-container">
                <h1 className="faq-header">Frequently Asked Questions</h1>
                {faqData.map((item, index) => (
                    <div key={index} className="faq-item">
                        <img src={questionIcon} alt="Question icon" className="faq-icon" />
                        <div className="faq-content">
                            <h3>{item.question}</h3>
                            <p>{item.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default FAQ;
