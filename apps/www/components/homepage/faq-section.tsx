"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown } from "lucide-react"

interface FAQItemProps {
    question: string
    answer: string
    isOpen: boolean
    onClick: () => void
    index: number
}

function FAQItem({ question, answer, isOpen, onClick, index }: FAQItemProps) {
    return (
        <motion.div
            className="border-b last:border-b-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <button
                onClick={onClick}
                className="flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:text-primary hover:cursor-pointer"
            >
                <span>{question}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 text-muted-foreground">{answer}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const faqs = [
        {
            question: "What is PosturePad and how does it work?",
            answer:
                "PosturePad is a smart seat pad designed for work-from-home professionals. Embedded sensors track how you sit throughout the day and detect patterns like slouching, leaning, or asymmetrical weight distribution. Using on-device machine learning, it provides gentle ambient cues and software insights to help you stay aligned without intrusive wearables or bulky back braces.",
        },
        {
            question: "Do I need a special chair or desk setup?",
            answer:
                "No. PosturePad is designed to sit on top of most standard office chairs and seats. You don't need to replace your chair or buy a complex ergonomic setup—you simply place the pad on your existing seat and plug it in according to the instructions we'll share with early backers.",
        },
        {
            question: "How is this different from posture wearables or back braces?",
            answer:
                "Many existing solutions are either physically intrusive or easy to ignore. PosturePad focuses on ambient, environment-level cues and a comfortable cushion form factor. There's nothing strapped to your body, and the feedback is designed to be subtle enough to live with all day while still nudging you back into better alignment.",
        },
        {
            question: "What kind of data does PosturePad collect?",
            answer:
                "Our goal is to give you useful posture analytics without being invasive. We focus on posture-related patterns over time rather than identifying who you are. As we move toward launch, we'll share a detailed data and privacy policy with early subscribers so you can see exactly what is collected and how it is used.",
        },
        {
            question: "When will PosturePad be available to buy?",
            answer:
                "We are currently in the development and validation phase, preparing for an initial production run supported by crowdfunding (e.g. Kickstarter) and pre-orders. By joining the early access list, you'll be the first to hear when timelines firm up and when pre-orders open.",
        },
        {
            question: "How much will PosturePad cost?",
            answer:
                "Final pricing will depend on demonstrated interest and manufacturing costs, as prototyping and development are still ongoing. We will also conduct price polling in updates shared with the reservation list—so join to stay informed and shape the outcome.",
        },
    ]

    return (
        <div className="w-full max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
                <FAQItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openIndex === index}
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    index={index}
                />
            ))}
        </div>
    )
}

