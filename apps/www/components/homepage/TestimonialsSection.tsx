import TestimonialCard from "@/components/homepage/testimonial-card"

const testimonials = [
    {
        quote: "I really like the subtle reminders that blend into the background of my work. It helps me stay productive, while also conditioning me to change my posture habits for the better. Something I can really get behind.",
        author: "Product Manager",
        role: "New York, NY",
        // avatarUrl: "/homepage/example0001.png"
    },
    {
        quote: "I've tried using back braces and other posture devices before, but they were always too cumbersome to wear and walk around with. I would love for a product that can train me to sit upright on my own.",
        author: "UX/UI Designer",
        role: "New York, NY",
        // avatarUrl: "/homepage/example0002.png"
    },
    {
        quote: "As someone with lower back pain, I'm always mindful of how I'm sitting. I also work from home and spend a lot of time making my work space comfortable. I would love to add this product into my work-from-home setup.",
        author: " Software engineer",
        role: "New York, NY",
        // avatarUrl: "/homepage/example0003.png"
    }
]

export default function TestimonialsSection() {
    return (
        <section className="py-20 md:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center gap-4 text-center md:gap-8">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
                    <p className="max-w-[700px] text-muted-foreground text-lg">
                        Early testers and interviewees are already validating the need for more mindful, ergonomic sitting, especially in hybrid and remote roles.
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
