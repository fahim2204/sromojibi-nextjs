import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import DeferredScripts from "@/components/DeferredScripts";
import GoogleAdsense from "@/components/GoogleAdsense";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://ezcalc.xyz'),
  title: {
    default: "EZCalc - Free Online Calculators (Age, BMI, Gold, Land & More)",
    template: "%s | EZCalc"
  },
  applicationName: "EZCalc",
  description: "Free online calculators for age, BMI, gold prices, land area, loans, mortgages, percentages, tips, and more. Fast, accurate, and easy-to-use calculators for all your needs.",
  keywords: [
    "EZCalc",
    "free online calculators",
    "age calculator",
    "BMI calculator",
    "gold price calculator",
    "land calculator",
    "loan calculator",
    "mortgage calculator",
    "percentage calculator",
    "tip calculator",
    "unit converter",
    "financial calculator",
    "health calculator",
    "measurement calculator"
  ],
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://ezcalc.xyz",
  },
  authors: [{ name: "EZCalc" }],
  creator: "EZCalc",
  publisher: "EZCalc",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ezcalc.xyz",
    title: "EZCalc - Free Online Calculators",
    description: "Calculate anything with our free online calculators. Age, BMI, gold prices, land area, loans, and more. Fast, accurate, and easy to use.",
    siteName: "EZCalc",
    images: [
      {
        url: "/images/ezcalc.webp",
        width: 1024,
        height: 1024,
        alt: "EZCalc - Free Online Calculators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EZCalc - Free Online Calculators",
    description: "Calculate anything with our free online calculators. Fast, accurate, and easy to use.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    "google-adsense-account": "ca-pub-7554208332966422",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {/* Structured Data - Critical, loads before interactive */}
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "EZCalc",
                "alternateName": ["EZ Calculator", "EZCalc XYZ"],
                "url": "https://ezcalc.xyz",
                "description": "Free online calculators for age, BMI, gold prices, land area, loans, mortgages, percentages, tips, and more"
              },
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "EZCalc - Free Online Calculators",
                "description": "Free online calculators for age, BMI, gold prices, land area, loans, mortgages, percentages, tips, and more",
                "url": "https://ezcalc.xyz",
                "applicationCategory": "UtilityApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "featureList": [
                  "Age calculator with life insights",
                  "BMI calculator",
                  "Gold price calculator",
                  "Land area calculator",
                  "Loan and mortgage calculators",
                  "Percentage calculator",
                  "Tip calculator",
                  "Free and easy to use"
                ]
              }
            ])
          }}
        />
        
        <Providers>
          <Navbar />
          {children}
        </Providers>
        
        {/* Deferred third-party scripts - loads after interaction or idle */}
        <GoogleAdsense />
        <DeferredScripts />
      </body>
    </html>
  );
}
