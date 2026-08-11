import Link from "next/link";
import { MapPin, Search, Home, ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] bg-slate-50 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        {/* 404 Icon & Badge */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-inner">
              <AlertCircle className="w-12 h-12" />
            </div>
            <span className="absolute -top-2 -right-2 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-full border-2 border-white shadow-sm">
              404
            </span>
          </div>
        </div>

        {/* Heading & Messages */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Page or Location Not Found
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 font-bengali">
            দুঃখিত! আপনার অনুসন্ধান করা পৃষ্ঠা বা লোকেশনটি পাওয়া যায়নি।
          </p>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto pt-1 leading-relaxed">
            ইউআরএলটি (URL) সঠিক কিনা পরীক্ষা করে দেখুন, অথবা নিচের লিংকগুলো ব্যবহার করে কাঙ্ক্ষিত সেবা খুঁজে নিন।
          </p>
        </div>

        {/* Action Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 max-w-lg mx-auto">
          <Link
            href="/locations"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MapPin className="w-4 h-4" />
            <span>সকল লোকেশন (Locations)</span>
          </Link>

          <Link
            href="/workers"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            <span>মিস্ত্রি খুঁজুন (Find Workers)</span>
          </Link>

          <Link
            href="/categories"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>ক্যাটাগরি সমূহ (Categories)</span>
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4 text-slate-600" />
            <span>হোমপেজ (Home)</span>
          </Link>
        </div>

        <div className="pt-4 text-xs text-slate-400 font-medium">
          Sromojibi • শ্রমজীবী - Local Worker & Service Directory
        </div>
      </div>
    </main>
  );
}
