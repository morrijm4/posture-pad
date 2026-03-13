"use client"

import Image from 'next/image';
import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import { Activity, Bell, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const processSteps = [
    {
        number: 1,
        title: "Set up PosturePad on your chair",
        description: "Place PosturePad on your existing office chair or seat. No tools or special hardware required.",
        icon: <Activity className="h-5 w-5" />,
    },
    {
        number: 2,
        title: "Sensors quietly learn your posture",
        description: "Embedded force sensors and on-device machine learning detect how you typically sit throughout the day.",
        icon: <BarChart3 className="h-5 w-5" />,
    },
    {
        number: 3,
        title: "Ambient cues nudge you into alignment",
        description: "PosturePad delivers gentle haptic or lighting cues (plus app insights) to help you maintain healthier posture—without nagging or intrusive wearables.",
        icon: <Bell className="h-5 w-5" />,
    }
]

function ProcessStep({ step, isActive, index }: { step: typeof processSteps[0], isActive: boolean, index: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })

    const renderVisual = () => {
        return (
            <motion.div
                className="aspect-square rounded-lg overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
            >
                <Image src={`/Artboard-${index + 1}.svg`} alt="Result example" className="w-full h-full object-cover" width={150} height={100} />
            </motion.div>
        )
    }

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className={cn(
                "group flex flex-col items-center text-center",
                "rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md",
                isActive && "border-primary"
            )}
        >
            <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {step.number}
                    </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-transform duration-200 group-hover:scale-110">
                    {step.icon}
                </div>
            </div>

            {renderVisual()}

            <div className="mt-6 space-y-2">
                <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
        </motion.div>
    )
}

export default function ProcessSection() {
    const ref = useRef(null);
    const [activeStep, setActiveStep] = useState(0)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;

            const timeout = setInterval(() => {
                setActiveStep((prev) => (prev + 1) % processSteps.length)
            }, 3000)

            return () => clearInterval(timeout);
        }, { threshold: 0.1 }); // triggers when 10% of element is visible

        if (ref.current != null) observer.observe(ref.current)

        return () => observer.disconnect();
    }, []);

    return (
        <section id="how-it-works" className="py-20 md:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center gap-4 text-center md:gap-8">
                    <Badge variant="outline" className="mb-2">
                        Simple setup
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                    <p className="max-w-[700px] text-muted-foreground text-lg">
                        PosturePad combines embedded sensors, ambient feedback, and software analytics to turn your everyday chair into a smarter, more ergonomic workstation.
                    </p>
                </div>
                <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-12" ref={ref}>
                    {processSteps.map((step, index) => (
                        <ProcessStep
                            key={step.number}
                            step={step}
                            isActive={activeStep === index}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
