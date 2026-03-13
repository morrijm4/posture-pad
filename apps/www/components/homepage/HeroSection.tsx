import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import LoopRendering from "@/components/homepage/loop-rendering"

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-16 md:pt-24">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-3xl text-center mb-8">
                    <h1 className="text-6xl font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl mb-6">
                        PosturePad
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-[800px] mx-auto">
                        Enabling Postural Alignment With Ambient Devices
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
