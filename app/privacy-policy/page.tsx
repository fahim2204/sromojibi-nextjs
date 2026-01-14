import { Card, CardBody as CardContent } from "@nextui-org/react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for EZCalc. Learn how we handle your data.",
  alternates: {
    canonical: "https://ezcalc.xyz/privacy-policy",
  },
  openGraph: {
    url: "https://ezcalc.xyz/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Privacy Policy</h1>
          <p className="text-xl text-gray-400">Last Updated: December 15, 2025</p>
        </div>

        <Card className="glass-strong mb-8">
          <CardContent className="p-8 text-gray-300 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">1. Introduction</h2>
              <p>
                Welcome to EZCalc. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our website 
                (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">2. Data We Collect</h2>
              <p>
                We do not collect any personal data directly. Our calculators run client-side in your browser, 
                meaning the data you input (like age, weight, or loan amount) stays on your device and is not sent to our servers.
              </p>
              <p className="mt-2">
                However, we may use third-party services like Google Analytics and Google AdSense which may collect:
              </p>
              <ul className="list-disc list-inside mt-2 ml-4">
                <li>Device information (browser type, OS)</li>
                <li>Usage data (pages visited, time spent)</li>
                <li>IP address</li>
                <li>Cookies for ad personalization and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">3. Cookies</h2>
              <p>
                We use cookies to enhance your experience. You can choose to disable cookies through your browser settings, 
                but this may affect the functionality of our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">4. Third-Party Links</h2>
              <p>
                Our website may include links to third-party websites, plug-ins, and applications. Clicking on those links 
                or enabling those connections may allow third parties to collect or share data about you. We do not control 
                these third-party websites and are not responsible for their privacy statements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">5. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at: 
                <a href="mailto:support@ezcalc.xyz" className="text-purple-400 ml-1 hover:text-purple-300">support@ezcalc.xyz</a>
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link 
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
