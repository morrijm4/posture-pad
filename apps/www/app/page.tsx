import HeroSection from "@/components/homepage/HeroSection"
import WhatIsPosturePadSection from "@/components/homepage/WhatIsPosturePadSection"
import ProcessSection from "@/components/homepage/ProcessSection"
import FeaturesSection from "@/components/homepage/FeaturesSection"
import ExamplesSection from "@/components/homepage/ExamplesSection"
import TestimonialsSection from "@/components/homepage/TestimonialsSection"
import PricingSection from "@/components/homepage/PricingSection"
import FAQSection from "@/components/homepage/FAQSection"
import CTASection from "@/components/homepage/CTASection"
import PosturePadArmy from "@/components/homepage/PosturePadArmy"

export default async function Index() {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <HeroSection />
                <WhatIsPosturePadSection />
                <ProcessSection />
                <FeaturesSection />
                <ExamplesSection />
                <TestimonialsSection />
                <PricingSection />
                <FAQSection />
                <PosturePadArmy />
                <CTASection />
            </div>
        </div>
    )
}
