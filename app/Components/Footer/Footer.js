import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

const navLinkClass =
  "inline-flex min-h-10 items-center text-stone-500 touch-manipulation transition-colors hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 rounded-sm py-2 text-sm tracking-wide";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-stone-100 bg-white px-6 py-12 text-stone-800 sm:px-8 lg:px-10 lg:py-14 xl:px-[8%]">
      <div className="w-full max-w-none">
        {/* Brand */}
        <div className="flex items-start gap-4">
          <Image
            src="/Logo.png"
            alt="Tara Kids"
            width={160}
            height={48}
            sizes="180px"
            className="h-11 w-auto max-w-[180px] shrink-0 object-contain object-left"
          />
          <div className="min-w-0 pt-0.5">
            <p className="text-lg font-semibold text-stone-900 tracking-widest uppercase sm:text-xl">
              Tara Kids
            </p>
            <p className="mt-1 w-full text-xs leading-relaxed text-stone-500 sm:text-sm">
              Premium kids wedding & function wear. Pakistan.
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav
          className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-stone-100 pb-6 text-xs font-medium sm:gap-x-4 sm:text-sm"
          aria-label="Footer"
        >
          {[
            { href: "/", label: "Home" },
            { href: "/allproducts", label: "Shop" },
            { href: "/blogpage", label: "Blog" },
            { href: "/contact", label: "Contact" },
          ].map((item, i) => (
            <React.Fragment key={item.href}>
              {i > 0 && (
                <span className="select-none text-stone-300" aria-hidden>
                  ·
                </span>
              )}
              <Link href={item.href} className={navLinkClass}>
                {item.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>

        {/* Contact + Social */}
        <div className="mt-8">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
            <div className="flex flex-col items-center gap-1 text-center text-sm text-stone-700 sm:items-start sm:text-left">
              <a
                href="tel:+923284114902"
                className="min-h-10 font-medium touch-manipulation hover:text-stone-900 inline-flex items-center justify-center sm:justify-start"
              >
                +92 328 4114902
              </a>
              <span className="text-stone-300 select-none" aria-hidden>
                ·
              </span>
              <a
                href="mailto:tarakidswearofficial@gmail.com"
                className="break-all font-medium touch-manipulation hover:text-stone-900"
              >
                tarakidswearofficial@gmail.com
              </a>
              <span className="text-stone-300 select-none" aria-hidden>
                ·
              </span>
              <span className="font-medium">Lahore, Pakistan</span>
            </div>

            <div className="flex shrink-0 items-center justify-center gap-3 sm:justify-end">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white shadow-md transition-transform hover:scale-105 hover:bg-black hover:shadow-lg"
              >
                <Facebook size={20} strokeWidth={2} aria-hidden />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white shadow-md transition-transform hover:scale-105 hover:bg-black hover:shadow-lg"
              >
                <Instagram size={20} strokeWidth={2} aria-hidden />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-4 border-t border-stone-100 pt-8 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p>© {new Date().getFullYear()} Tara Kids. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a
              href="#"
              className="inline-flex min-h-10 items-center touch-manipulation hover:text-stone-700"
            >
              Privacy
            </a>
            <a
              href="#"
              className="inline-flex min-h-10 items-center touch-manipulation hover:text-stone-700"
            >
              Terms
            </a>
            <a
              href="#"
              className="inline-flex min-h-10 items-center touch-manipulation hover:text-stone-700"
            >
              Shipping
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
