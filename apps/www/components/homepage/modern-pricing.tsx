"use client"

import Link from "next/link"
import type React from "react"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PricingFeature {
    icon: React.ReactNode
    text: string
    tooltip?: string
}

interface PricingTier {
    title: string
    description: string
    features: string[]
    buttonText: string
}

export default function ModernPricing() {
    const tiers: PricingTier[] = [
        {
            title: "Early Backer",
            description: "Limited prelaunch availability for PosturePad's first production run.",
            features: [
                "Smart seat pad with embedded pressure sensors",
                "Gentle ambient cues (haptics / lighting integrations)",
                "Posture history, behavioral insights, and scoring",
                "Priority access to future app features and integrations",
            ],
            buttonText: "Reserve your spot",
        },
    ]

    return (
        <div className="mx-auto max-w-4xl px-4">
            <div className="flex flex-col items-center justify-center space-y-8">
                {/* Pricing Cards */}
                <div className="mt-8 flex gap-6 justify-center lg:gap-8">
                    {tiers.map((tier, index) => (
                        <div
                            key={index}
                            className="pricing-card"
                        >
                            <h3 className="text-xl font-bold">{tier.title}</h3>

                            <p className="mt-4 text-sm text-muted-foreground">{tier.description}</p>

                            <ul className="my-6 space-y-4">
                                {tier.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="pricing-feature">
                                        <Check className="h-5 w-5 text-primary" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/reserve" className="mt-8 block w-full" aria-label={`Select ${tier.title} plan`}>
                                <Button
                                    className="group w-full bg-primary hover:bg-primary/90 text-primary-foreground hover:cursor-pointer"
                                    aria-label={`Select ${tier.title} plan`}
                                >
                                    {tier.buttonText}
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                    No payment is collected today. Join the early backer list to signal demand and receive updates as we validate timelines and integrations.
                </p>
            </div>
        </div>
    )
}



