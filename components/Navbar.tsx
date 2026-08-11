"use client";

import React from "react";
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { UserPlus, Sparkles } from "lucide-react";

const brandFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Workers", href: "/workers" },
    { name: "Categories", href: "/categories" },
    { name: "Locations", href: "/locations" },
    { name: "Guides", href: "/guides" },
    { name: "About", href: "/about" },
  ];

  const mobileMenuItems = [
    ...navLinks,
    { name: "Contact", href: "/contact" },
  ];

  return (
    <NextUINavbar
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      className="bg-white/90 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50"
      maxWidth="xl"
    >
      {/* Mobile Menu Toggle & Brand Logo */}
      <NavbarContent justify="start" className="gap-2 sm:gap-4">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden text-gray-800 cursor-pointer"
        />
        <NavbarBrand>
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 font-extrabold text-gray-900 group transition-all"
          >
            <Image
              src="/icon-512.png"
              alt="Sromojibi Logo"
              width={32}
              height={32}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform group-hover:scale-105 shrink-0"
            />
            <span
              className={`${brandFont.className} text-gray-900 font-black text-lg sm:text-2xl tracking-tight group-hover:text-emerald-600 transition-colors`}
            >
              Sromojibi
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Links (Visible on Tablets & Laptops: md+) */}
      <NavbarContent className="hidden md:flex gap-1" justify="center">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));

          return (
            <NavbarItem key={link.href}>
              <Link
                href={link.href}
                className={`px-3 py-1.5 lg:px-3.5 rounded-lg text-xs lg:text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-emerald-700 bg-emerald-50 font-bold"
                    : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      {/* Primary Action Button (Responsive for all screen sizes) */}
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            as={Link}
            href="/join-worker"
            className="h-9 sm:h-10 px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer border border-emerald-400/30"
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200 shrink-0" />
            <span className="truncate">Join as Worker</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0 hidden sm:inline-block" />
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Drawer Navigation (Visible on mobile/tablets when toggled) */}
      <NavbarMenu className="bg-white/98 backdrop-blur-md pt-4 border-t border-gray-200 space-y-2">
        <div className="px-3 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          Navigation Menu
        </div>

        {mobileMenuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

          return (
            <NavbarMenuItem key={item.href}>
              <Link
                className={`w-full text-base py-3 px-4 rounded-xl font-semibold flex items-center justify-between transition-colors ${
                  isActive
                    ? "text-emerald-700 bg-emerald-50 font-bold border border-emerald-200/80"
                    : "text-gray-800 hover:bg-gray-50"
                }`}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{item.name}</span>
                {isActive && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    Active
                  </span>
                )}
              </Link>
            </NavbarMenuItem>
          );
        })}

        <div className="pt-4 px-2">
          <Button
            as={Link}
            href="/join-worker"
            onClick={() => setIsMenuOpen(false)}
            className="w-full bg-emerald-600 text-white font-extrabold text-sm py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-emerald-200" />
            <span>Join as Worker Free</span>
          </Button>
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
}
