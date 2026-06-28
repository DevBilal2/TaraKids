// app/Components/NavBar.jsx
"use client";

import { useState, useEffect } from "react";
import MobileMenu from "./MobileMenu";
import CartButton from "./CartButton";
import FeaturedProductsDropdown from "../FeaturedProductDropdown";
import Link from "next/link";
import Image from "next/image";
import { checkAuthStatus } from "../../lib/auth";
import { Home, BookOpen, Mail, User, Search } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Blogs", href: "/blogpage", icon: BookOpen },
  { name: "Contact Us", href: "/contact", icon: Mail },
];

export default function NavBar({ className }) {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(!!checkAuthStatus());
  }, []);

  const accountHref = mounted && isLoggedIn ? "/Account" : "/register";
  const accountTitle = mounted && isLoggedIn ? "My account" : "Create account";

  return (
    <nav
      className={`relative z-[1000] px-5 lg:px-8 xl:px-[8%] py-3 flex items-center gap-4 transition-all duration-300 ease-in-out w-full
        bg-white/98 backdrop-blur-sm border-b border-stone-100 ${className}`}
    >
      {/* Mobile Menu Button */}
      <div className="shrink-0 md:hidden">
        <MobileMenu navLinks={navLinks} theme="light" />
      </div>

      {/* Logo */}
      <Link href="/" className="shrink-0 flex items-center">
        <Image
          src="/Logo.png"
          alt="Tara Kids"
          width={220}
          height={72}
          priority
          sizes="(max-width: 640px) 55vw, 180px"
          className="h-14 w-auto max-h-16 max-w-[min(220px,55vw)] object-contain object-left sm:h-16"
        />
      </Link>

      {/* Desktop Nav Links — centered */}
      <ul className="hidden md:flex flex-1 items-center justify-center gap-8">
        <li className="flex items-center">
          <FeaturedProductsDropdown />
        </li>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isExternal = link.href.startsWith("http") || link.href.startsWith("mailto:");
          const isHash = link.href.startsWith("#");
          const cls = "no-underline whitespace-nowrap text-stone-700 hover:text-stone-900 transition-all duration-300 flex items-center gap-1.5 group text-sm tracking-wide";
          const inner = (
            <>
              <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[1px] after:w-0 after:bg-stone-900 after:transition-all after:duration-300 group-hover:after:w-full">
                {link.name}
              </span>
              <Icon size={14} className="text-stone-500 group-hover:text-stone-900 transition-all group-hover:translate-x-0.5" aria-hidden="true" />
            </>
          );
          return (
            <li key={link.name} className="flex items-center">
              {isExternal || isHash
                ? <a href={link.href} className={cls}>{inner}</a>
                : <Link href={link.href} className={cls}>{inner}</Link>
              }
            </li>
          );
        })}
      </ul>

      {/* Search bar — right of links on desktop */}
      <div className="hidden lg:flex min-w-0 w-56 xl:w-72 shrink-0">
        <form action="/allproducts" method="GET" className="relative w-full">
          <input
            type="search"
            name="search"
            placeholder="Search..."
            className="w-full px-4 py-2 pl-10 text-stone-700 bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all text-sm"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search size={16} className="text-stone-400" aria-hidden="true" />
          </div>
        </form>
      </div>

      {/* Right Icons */}
      <div className="ml-auto md:ml-0 flex shrink-0 items-center gap-2">
        <CartButton className="text-stone-700 hover:text-stone-900 hover:scale-105 transition-all" />
        <Link
          href={accountHref}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 touch-manipulation transition-colors hover:bg-stone-100"
          title={accountTitle}
          aria-label={accountTitle}
        >
          <User size={20} className="text-stone-700" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}
