import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ThreeDBeforeAfterGallery from "@/components/homepage/3d-before-after-gallery"

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-3xl text-center mb-8">
                    <Badge className="mb-4" variant="outline">
                        THE #1 RANKED POSTURAL ALIGNMENT COMPANY
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6">
                        Enabling Postural Alignment With <span className="text-primary">Ambient Devices</span>
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-[800px] mx-auto">
                        A portable haptic sleeve that detects posture using embedded sensors and machine learning.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/buy-now" className="w-full sm:w-auto">
                            <Button size="lg" className="group hover:cursor-pointer">
                                Buy now
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-12">
                    <ThreeDBeforeAfterGallery />
                </div>
            </div>
        </section>
    )
}
