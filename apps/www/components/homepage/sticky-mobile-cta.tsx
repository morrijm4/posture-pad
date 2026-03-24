"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StickyMobileCTA() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const hero = document.getElementById("hero")
        if (!hero) return

        const observer = new IntersectionObserver(
            ([entry]) => setVisible(!entry.isIntersecting),
            { threshold: 0 }
        )

        observer.observe(hero)
        return () => observer.disconnect()
    }, [])

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background/80 backdrop-blur-md border-t md:hidden transition-transform duration-300 ${
                visible ? "translate-y-0" : "translate-y-full"
            }`}
        >
            <Link href="/reserve" className="block">
                <Button size="lg" className="w-full group hover:cursor-pointer">
                    Reserve your PosturePad
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </Link>
        </div>
    )
}
