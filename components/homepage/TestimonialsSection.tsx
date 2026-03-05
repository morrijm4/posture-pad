import { Badge } from "@/components/ui/badge"
import TestimonialCard from "@/components/homepage/testimonial-card"

const testimonials = [
    {
        quote: "I didn't realize how much I was slouching until I tried an early PosturePad prototype. The cues are subtle but effective—I finish the day with far less back and neck fatigue.",
        author: "Alex Rivera",
        role: "Product Manager, hybrid worker",
        avatarUrl: "/homepage/example0001.png"
    },
    {
        quote: "I've invested in chairs and pillows before, but nothing helped me actually change my behavior. The combination of the pad and the analytics finally made my posture feel \"trackable\".",
        author: "Morgan Lee",
        role: "Independent designer",
        avatarUrl: "/homepage/example0002.png"
    },
    {
        quote: "As someone who codes from home most of the week, back pain just felt \"normal\". The idea of an ambient system that nudges me instead of nagging me is exactly what I've been looking for.",
        author: "Jordan Patel",
        role: "Software engineer",
        avatarUrl: "/homepage/example0003.png"
    }
]

export default function TestimonialsSection() {
    return (
        <section className="py-20 md:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center gap-4 text-center md:gap-8">
                    <Badge variant="outline" className="mb-2">
                        Testimonials
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
                    <p className="max-w-[700px] text-muted-foreground text-lg">
                        Early testers and interviewees are already validating the need for more mindful, ergonomic sitting—especially in hybrid and remote roles.
                    </p>
                </div>
                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={index}
                            {...testimonial}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
