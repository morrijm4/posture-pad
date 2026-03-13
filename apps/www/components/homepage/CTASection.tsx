import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CTASection() {
    return (
        <section className="py-20 md:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center gap-4 text-center md:gap-8">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Ready to change how you sit?
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground text-lg">
                        We&apos;re preparing our first product run of PosturePad for work-from-home professionals. Join the early access list to get updates on timing and pre-order availability.
                    </p>
                    <Link href="/reserve" className="mt-4">
                        <Button size="lg" className="group bg-primary hover:bg-primary/90 text-white hover:cursor-pointer">
                            Join the early access list
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
