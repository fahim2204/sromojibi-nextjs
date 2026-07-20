"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm border-t border-gray-800 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-extrabold text-xl">
            <Image
              src="/icon-512.png"
              alt="Sromojibi Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Sromojibi
            </span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Building Bangladesh&apos;s largest worker directory. Connecting everyday skilled workers with customers across the nation.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3 text-sm">Popular Categories</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/workers/electrician" className="hover:text-emerald-400 transition-colors">⚡ Electrician</Link>
            </li>
            <li>
              <Link href="/workers" className="hover:text-emerald-400 transition-colors">🚰 Plumber</Link>
            </li>
            <li>
              <Link href="/workers" className="hover:text-emerald-400 transition-colors">🧱 Tiles Worker</Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-emerald-400 transition-colors text-emerald-400 hover:underline">View All Categories →</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3 text-sm">Launch Areas</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/workers/dhaka" className="hover:text-emerald-400 transition-colors">Dhaka Division</Link>
            </li>
            <li>
              <Link href="/workers/mymensingh" className="hover:text-emerald-400 transition-colors">Mymensingh Division</Link>
            </li>
            <li>
              <Link href="/locations" className="hover:text-emerald-400 transition-colors text-emerald-400 hover:underline">View All Cities →</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3 text-sm">Quick Links</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link>
            </li>
            <li>
              <Link href="/join-worker" className="hover:text-emerald-400 transition-colors">Register as Worker</Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 border-t border-gray-800/80 pt-6 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Sromojibi. Find Trusted Local Workers in Bangladesh.</p>
        <p className="mt-1 text-gray-600">
          Sromojibi is an open directory platform for discovering local skilled professionals.
        </p>
      </div>
    </footer>
  );
}
