import Link from "next/link"
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
                        We&apos;re preparing our first production run of PosturePad for US work-from-home professionals. Join the early access list to get updates on timing, pricing (target launch around $179), and pre-order availability.
                    </p>
                    <Link href="/reserve" className="mt-4">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                            Join the early access list
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
