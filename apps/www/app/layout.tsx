import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Suspense } from "react";
import AnnouncementBar from "@/components/homepage/announcement-bar"
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/homepage/theme-provider"

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "http://localhost:3000";

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: "PosturePad",
    description: "Enabling Postural Alignment With Ambient Devices",
    openGraph: {
        images: [{ url: "/og-image.png", width: 1200, height: 630 }],
        title: "PosturePad",
        description: "Enabling Postural Alignment With Ambient Devices",
        type: "website",
    },
    twitter: {
        images: [{ url: "/og-image.png", width: 1200, height: 630 }],
        card: "summary_large_image",
        title: "PosturePad",
        description: "Enabling Postural Alignment With Ambient Devices",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen flex flex-col bg-background">
                <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
                    <AnnouncementBar />
                    <Navbar />
                    <main className="flex-1">
                        {children}
                    </main>
                    <Footer />
                    <Toaster />
                    <Analytics />
                </ThemeProvider>
            </body>
        </html>
    );
}
