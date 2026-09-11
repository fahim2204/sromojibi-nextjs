import React, { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

const brandFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

interface AuthPageShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 group transition-all">
            <Image
              src="/icon-512.png"
              alt="Sromojibi Logo"
              width={38}
              height={38}
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
            />
            <span
              className={`${brandFont.className} text-gray-900 font-black text-2xl tracking-tight group-hover:text-emerald-600 transition-colors`}
            >
              Sromojibi
            </span>
          </Link>
          <h1 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-sm p-6 sm:p-8">
          {children}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-600">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
