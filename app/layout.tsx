import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootProvider } from "@/app/providers/RootProvider";
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
    locale: "bn_BD",
    url: siteUrl,
    title: "Sromojibi - Find Trusted Local Workers in Bangladesh",
    description:
      "Find trusted local workers in Bangladesh including electricians, plumbers, tiles mistri, rajmistri, painters and home service professionals. Sromojibi is building Bangladesh's largest worker directory.",
    siteName: "Sromojibi",
    images: [
      {
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
        alt: "Sromojibi Worker Directory Network Bangladesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sromojibi - Find Trusted Local Workers in Bangladesh",
    description:
      "Find trusted local workers in Bangladesh including electricians, plumbers, tiles mistri, rajmistri, painters and home service professionals.",
    images: [`${siteUrl}/icon-512.png`],
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
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased`}>
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
                "@id": `${siteUrl}/#website`,
                "name": "Sromojibi",
                "alternateName": ["Sromojibi Bangladesh", "Sromojibi Directory"],
                "url": siteUrl,
                "description":
                  "Find trusted local workers in Bangladesh including electricians, plumbers, tiles mistri, rajmistri, painters and home service professionals.",
                "publisher": {
                  "@type": "Organization",
                  "@id": `${siteUrl}/#organization`,
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": `${siteUrl}/#organization`,
                "name": "Sromojibi",
                "url": siteUrl,
                "logo": `${siteUrl}/icon-512.png`,
                "description":
                  "Bangladesh's largest worker directory connecting skilled local professionals with customers.",
              },
            ]),
          }}
        />

        <RootProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </RootProvider>
      </body>
    </html>
  );
}
