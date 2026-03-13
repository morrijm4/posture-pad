import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t py-8 md:py-10">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <Link href="/" className="font-bold text-xl">
                            PosturePad
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Enabling Postural Alignment With Ambient Devices
                        </p>
                    </div>
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
            </div>
        </footer>
    );
}
