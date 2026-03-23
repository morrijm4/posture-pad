import Link from "next/link";

export default async function Navbar() {
    return (
        <header className="sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="font-bold text-xl">
                    PosturePad
                </Link>

                {/* <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div> */}

                <nav className="flex flex-wrap gap-x-6 gap-y-1">
                    <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        How It Works
                    </Link>
                    <Link href="#examples" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Examples
                    </Link>
                    <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Reserve
                    </Link>
                    <Link href="mailto:jmm845@cornell.edu" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Contact
                    </Link>
                </nav>
            </div>
        </header>
    );
}
