import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ExamplesSection() {
    return (
        <section id="examples" className="border-t py-20 md:py-32 bg-muted/30">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center gap-4 text-center md:gap-8">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Exploring the PosturePad experience</h2>
                    <p className="max-w-[700px] text-muted-foreground text-lg">
                        Digital renderings showcasing PosturePad from different angles and perspectives.
                    </p>
                </div>
                <div className="mt-16 flex flex-col gap-4 sm:gap-6 md:gap-8">
                    {Array.from({ length: 4 }, (_, i) => `/homepage/Rendering_${i + 1}.png`).map((src, i) => (
                        <div
                            key={i}
                            className="group relative w-full overflow-hidden rounded-lg border bg-background transition-all hover:shadow-lg"
                        >
                            <div className="relative w-full transition-all group-hover:scale-105">
                                <Image
                                    src={src || "/placeholder.svg"}
                                    alt="PosturePad product perspective"
                                    width={1920}
                                    height={1080}
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-12 flex justify-center">
                    <Link href="/reserve">
                        <Button variant="outline" size="lg" className="group hover:cursor-pointer">
                            Get early access
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
