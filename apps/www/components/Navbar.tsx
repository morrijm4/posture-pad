"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#examples", label: "Examples" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "#pricing", label: "Reserve" },
    { href: "mailto:jmm845@cornell.edu", label: "Contact" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="font-bold text-xl">
                    PosturePad
                </Link>

                {/* <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div> */}

                {/* Desktop nav */}
                <nav className="hidden md:flex gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Mobile hamburger button */}
                <button
                    className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu"
                >
                    {open ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <nav className="md:hidden border-t bg-background">
                    <div className="container flex flex-col py-4 gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </nav>
            )}
        </header>
    );
}
