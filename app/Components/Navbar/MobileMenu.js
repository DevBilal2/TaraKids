"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function MobileMenu({ navLinks }) {
  const [open, setOpen] = useState(false);
  const [featuredOpen, setFeaturedOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!featuredOpen) return;
    setLoading(true);
    fetch("/api/collections")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCollections(Array.isArray(data) ? data : []))
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, [featuredOpen]);

  return (
    <>
      {/* MENU BUTTON */}
      <button
        type="button"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-lg text-stone-900 touch-manipulation active:bg-stone-100"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "☰"}
      </button>

      {/* MENU PANEL */}
      {open && (
        <ul
          id="mobile-menu"
          className="
            fixed left-3 top-16 z-[9999]
            w-[min(20rem,calc(100vw-1.5rem))]
            max-h-[min(70vh,calc(100dvh-5rem))]
            overflow-y-auto
            p-4
            rounded-2xl
            shadow-2xl
            border border-stone-100
            bg-white
            backdrop-blur-xl
            animate-in fade-in zoom-in-95
          "
        >
          {navLinks.map((link) => (
            <li key={link.name} className="py-2">
              <a
                href={link.href}
                className="
                  flex items-center gap-3
                  px-3 py-2 rounded-lg
                  text-stone-800 font-medium text-sm tracking-wide
                  hover:bg-stone-50
                  transition-all duration-200
                "
                onClick={() => setOpen(false)}
              >
                {link.icon && (
                  <link.icon size={16} className="text-stone-500" />
                )}
                {link.name}
              </a>
            </li>
          ))}

          {/* Featured Products - Mobile */}
          <li className="py-2 border-t border-stone-100 mt-2">
            <button
              onClick={() => setFeaturedOpen(!featuredOpen)}
              className="
                w-full flex items-center justify-between
                px-3 py-2 rounded-lg
                text-stone-800 font-medium text-sm tracking-wide
                hover:bg-stone-50
                transition-all duration-200
              "
            >
              <span className="flex items-center gap-3">
                <span>Shop</span>
              </span>
              <ChevronDown
                size={16}
                className={`text-stone-500 transition-transform duration-200 ${
                  featuredOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {featuredOpen && (
              <div className="mt-2 px-3 space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-stone-400 py-2">Loading…</p>
                ) : collections.length === 0 ? (
                  <p className="text-sm text-stone-400 py-2">No collections yet.</p>
                ) : (
                  <ul className="space-y-1 pl-2">
                    {collections.map((c) => (
                      <li key={c.id || c.handle}>
                        <Link
                          href={`/collections/${c.handle}`}
                          className="block text-sm text-stone-700 hover:text-stone-900 hover:bg-stone-50 px-2 py-1.5 rounded transition-colors"
                          onClick={() => {
                            setOpen(false);
                            setFeaturedOpen(false);
                          }}
                        >
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        </ul>
      )}
    </>
  );
}
