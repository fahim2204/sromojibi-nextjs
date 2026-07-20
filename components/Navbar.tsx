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
  Button
} from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";

const brandFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Find Workers", href: "/workers" },
    { name: "Categories", href: "/categories" },
    { name: "Locations", href: "/locations" },
    { name: "About Us", href: "/about" },
    { name: "Join as Worker", href: "/join-worker" },
  ];

  return (
    <NextUINavbar 
      onMenuOpenChange={setIsMenuOpen} 
      className="bg-gray-950/80 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-50"
      maxWidth="xl"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden text-white"
        />
        <NavbarBrand>
          <Link 
            href="/" 
            className="flex items-center gap-1 font-extrabold text-white text-xl group transition-all duration-300"
          >
            <Image
              src="/icon-512.png"
              alt="Sromojibi Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] group-hover:drop-shadow-[0_0_14px_rgba(16,185,129,0.7)] brightness-200"
            />
            <span className={`${brandFont.className} bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-black text-2xl tracking-tight group-hover:from-emerald-300 group-hover:via-teal-200 group-hover:to-cyan-200 transition-all duration-300`}>
              Sromojibi
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-2" justify="center">
        <NavbarItem>
          <Link href="/" className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200 text-sm font-medium">
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/workers" className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200 text-sm font-medium">
            Workers
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/categories" className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200 text-sm font-medium">
            Categories
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/locations" className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200 text-sm font-medium">
            Locations
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/about" className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200 text-sm font-medium">
            About
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button 
            as={Link} 
            href="/join-worker" 
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-lg shadow-md shadow-emerald-900/30 transition-all hover:scale-[1.02]"
          >
            Join as Worker
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="bg-gray-950/95 backdrop-blur-xl pt-6 border-t border-gray-800">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              className="w-full text-gray-200 hover:text-emerald-400 text-lg py-2.5 font-medium border-b border-gray-800/50 block"
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </NextUINavbar>
  );
}
