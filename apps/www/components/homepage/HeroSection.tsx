import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LoopRendering from "@/components/homepage/loop-rendering"

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-3xl text-center mb-8">
                    <Badge className="mb-4" variant="outline">
                        For work-from-home professionals who sit all day
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6">
                        PosturePad: Smart support for <span className="text-primary">better posture</span>
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-[800px] mx-auto">
                        A sensor-powered seat pad that detects how you sit, then uses gentle ambient cues and analytics to nudge you back into ergonomic alignment—without intrusive wearables or bulky braces.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/reserve" className="w-full sm:w-auto">
                            <Button size="lg" className="group hover:cursor-pointer">
                                Reserve your PosturePad
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-12 mx-auto max-w-4xl">
                    <LoopRendering />
                </div>
            </div>
        </section>
    )
}
