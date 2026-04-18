import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

// Inter Variable — Linear's primary typeface
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Sanad — finance that thinks",
  description:
    "A multi-agent credit passport platform built for Tunisia. Watch specialized AI agents collaborate to answer financial questions in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <SiteNav />
        <div id="main-content" className="flex-1">{children}</div>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
