import Link from "next/link";
import { Aperture } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t py-12 md:py-16">
            <div className="container px-4 md:px-6">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                            <Aperture className="h-5 w-5 text-primary" />
                            <span>PosturePad</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Enabling Postural Alignment With Ambient Devices
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Product</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link href="#examples" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Examples
                                </Link>
                            </li>
                            <li>
                                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Pricing
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="https://www.ncbi.nlm.nih.gov/books/NBK559512/"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    target="_blank"
                                >
                                    NIH: Low Back Pain
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/reserve"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Join early access list
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Legal</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="mailto:jmm845@cornell.edu"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://choosealicense.com/licenses/mit/"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    target="_blank"
                                >
                                    License
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} PosturePad. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
