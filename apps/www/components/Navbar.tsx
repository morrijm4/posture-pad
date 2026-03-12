import { Aperture } from "lucide-react"
import Link from "next/link";

export default async function Navbar() {
    return (
        <header className="sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <Aperture className="h-5 w-5 text-primary" />
                    <span>PosturePad</span>
                </Link>

                {/* <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div> */}
            </div>
        </header>
    );
}
