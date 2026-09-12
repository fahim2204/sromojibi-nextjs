import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Sromojibi",
  description: "Sromojibi Administration Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function SrAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-600 selection:text-white antialiased">
      {children}
    </div>
  );
}
