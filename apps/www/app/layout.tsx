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

export const metadata = {
    title: "PosturePad",
    description: "Enabling Postural Alignment With Ambient Devices",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen flex flex-col bg-background">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
