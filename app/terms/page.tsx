import { Card, CardBody as CardContent } from "@nextui-org/react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for EZCalc. Please read our terms and conditions carefully.",
  alternates: {
    canonical: "https://ezcalc.xyz/terms",
  },
  openGraph: {
    url: "https://ezcalc.xyz/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Terms of Service</h1>
          <p className="text-xl text-gray-400">Last Updated: December 15, 2025</p>
        </div>

        <Card className="glass-strong mb-8">
          <CardContent className="p-8 text-gray-300 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">1. Agreement to Terms</h2>
              <p>
                By accessing or using EZCalc, you agree to be bound by these Terms of Service and our Privacy Policy. 
                If you disagree with any part of the terms, then you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on EZCalc's website 
                for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">3. Disclaimer</h2>
              <p>
                The materials on EZCalc's website are provided on an 'as is' basis. EZCalc makes no warranties, expressed or implied, 
                and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions 
                of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <p className="mt-2 text-yellow-500/80">
                <strong>Note:</strong> While we strive for accuracy, the results provided by our calculators should be used for informational purposes only. 
                They should not be considered as professional financial, medical, or legal advice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">4. Limitations</h2>
              <p>
                In no event shall EZCalc or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, 
                or due to business interruption) arising out of the use or inability to use the materials on EZCalc's website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">5. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the 
                exclusive jurisdiction of the courts in that location.
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
