"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface GalleryItem {
    before: string
    after: string
    label: string
}

export default function ThreeDBeforeAfterGallery() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isFlipping, setIsFlipping] = useState(false)
    const [direction, setDirection] = useState(0) // -1 for left, 1 for right
    const containerRef = useRef<HTMLDivElement>(null)
    const autoplayRef = useRef<NodeJS.Timeout | null>(null)

    const galleryItems: GalleryItem[] = [
        {
            before: "/homepage/before0001.png",
            after: "/homepage/example0001.png",
            label: "Typical desk posture vs. more aligned sitting",
        },
        {
            before: "/homepage/before0002.png",
            after: "/homepage/example0002.png",
            label: "Hybrid workday posture concept",
        },
        {
            before: "/homepage/before0001.png",
            after: "/homepage/example0004.png",
            label: "Reducing slouch over time",
        },
        {
            before: "/homepage/before0001.png",
            after: "/homepage/example0005.png",
            label: "From \"end-of-day slump\" to upright focus",
        },
        {
            before: "/homepage/before0002.png",
            after: "/homepage/example0006.png",
            label: "Awareness of leaning and weight shifts",
        },
        {
            before: "/homepage/before0002.png",
            after: "/homepage/example0007.png",
            label: "Exploring different desk environments",
        },
        {
            before: "/homepage/before0001.png",
            after: "/homepage/example0008.png",
            label: "Imagining posture-friendly home offices",
        },
        {
            before: "/homepage/before0002.png",
            after: "/homepage/example0009.png",
            label: "Design explorations for remote workers",
        },
    ]

    const nextSlide = () => {
        if (isFlipping) return
        setDirection(1)
        setIsFlipping(true)
        setTimeout(() => {
            setActiveIndex((prev) => (prev + 1) % galleryItems.length)
            setIsFlipping(false)
        }, 600)
    }

    const prevSlide = () => {
        if (isFlipping) return
        setDirection(-1)
        setIsFlipping(true)
        setTimeout(() => {
            setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)
            setIsFlipping(false)
        }, 600)
    }

    // 3D effect on mouse move
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current || isFlipping) return

            const { left, top, width, height } = containerRef.current.getBoundingClientRect()
            const x = (e.clientX - left) / width - 0.5
            const y = (e.clientY - top) / height - 0.5

            containerRef.current.style.transform = `
        perspective(1000px) 
        rotateY(${x * 5}deg) 
        rotateX(${-y * 5}deg)
      `
        }

        const handleMouseLeave = () => {
            if (!containerRef.current) return
            containerRef.current.style.transform = `
        perspective(1000px) 
        rotateY(0deg) 
        rotateX(0deg)
      `
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener("mousemove", handleMouseMove)
            container.addEventListener("mouseleave", handleMouseLeave)
        }

        return () => {
            if (container) {
                container.removeEventListener("mousemove", handleMouseMove)
                container.removeEventListener("mouseleave", handleMouseLeave)
            }
        }
    }, [isFlipping])

    // Autoplay
    useEffect(() => {
        autoplayRef.current = setInterval(() => {
            if (!isFlipping) {
                nextSlide()
            }
        }, 5000)

        return () => {
            if (autoplayRef.current) {
                clearInterval(autoplayRef.current)
            }
        }
    }, [isFlipping])

    return (
        <div className="relative w-full rounded-xl overflow-hidden shadow-xl">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
            >
                <source src="/homepage/Rotation.mov" />
            </video>
        </div>
    )
}

