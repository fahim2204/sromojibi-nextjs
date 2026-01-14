import { Card, CardBody as CardContent } from "@nextui-org/react";
import Link from "next/link";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with the EZCalc team for support, suggestions, or inquiries.",
  alternates: {
    canonical: "https://ezcalc.xyz/contact",
  },
  openGraph: {
    url: "https://ezcalc.xyz/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Contact Us</h1>
          <p className="text-xl text-gray-400">We'd love to hear from you.</p>
        </div>

        <Card className="glass-strong mb-8">
          <CardContent className="p-8 text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-white">Get in Touch</h2>
                <p className="mb-6">
                  Have a suggestion for a new calculator? Found a bug? Or just want to say hi? 
                  Feel free to reach out to us. We try our best to respond to all inquiries within 24-48 hours.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📧</span>
                    <div>
                      <h3 className="font-semibold text-white">Email</h3>
                      <a href="mailto:support@ezcalc.xyz" className="text-purple-400 hover:text-purple-300 transition-colors">
                        support@ezcalc.xyz
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                 {/* Placeholder for a functional form if backend is added later */}
                 <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-semibold mb-4 text-white">Send a Message</h3>
                    <p className="text-sm text-gray-400 mb-6">
                      For now, the best way to reach us is via email directly. 
                      We are working on a contact form for easier communication!
                    </p>
                    <a 
                      href="mailto:support@ezcalc.xyz"
                      className="block w-full text-center py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                      Email Us
                    </a>
                 </div>
              </div>
            </div>
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
