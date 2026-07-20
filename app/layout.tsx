import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sromojibi - Find Trusted Local Workers in Bangladesh",
    template: "%s | Sromojibi",
  },
  applicationName: "Sromojibi",
  description:
    "Find trusted local workers in Bangladesh including electricians, plumbers, tiles mistri, rajmistri, painters and home service professionals. Sromojibi is building Bangladesh's largest worker directory.",
  keywords: [
    "worker directory bangladesh",
    "mistri bangladesh",
    "rajmistri",
    "electrician bangladesh",
    "plumber bangladesh",
    "tiles mistri",
    "home service bangladesh",
    "local workers near me",
    "kajer lok",
    "shromik",
  ],
  icons: {
    icon: "/icon-512.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
  authors: [{ name: "Sromojibi Platform" }],
  creator: "Sromojibi",
  publisher: "Sromojibi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Sromojibi - Find Trusted Local Workers in Bangladesh",
    description:
      "Find trusted local workers in Bangladesh including electricians, plumbers, tiles mistri, rajmistri, painters and home service professionals. Sromojibi is building Bangladesh's largest worker directory.",
    siteName: "Sromojibi",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sromojibi - Find Trusted Local Workers in Bangladesh",
    description:
      "Find trusted local workers in Bangladesh including electricians, plumbers, tiles mistri, rajmistri, painters and home service professionals.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen flex flex-col antialiased`}>
        {/* Structured Data for Search Engine Optimization */}
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Sromojibi",
                "alternateName": ["Sromojibi Bangladesh", "Sromojibi Directory"],
                "url": siteUrl,
                "description":
                  "Find trusted local workers in Bangladesh including electricians, plumbers, tiles mistri, rajmistri, painters and home service professionals.",
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Sromojibi",
                "url": siteUrl,
                "description":
                  "Bangladesh's largest worker directory connecting skilled local professionals with customers.",
              },
            ]),
          }}
        />

        <Providers>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
