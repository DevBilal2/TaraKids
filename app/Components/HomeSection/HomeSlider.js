import Link from "next/link";
import { ShoppingBag, Phone } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-[92dvh] w-full flex-col items-center justify-center bg-white px-6 py-24 text-center">
      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(214,211,209,0.25),transparent)]" />

      <div className="relative z-10 max-w-3xl">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
          Premium Kids Fashion · Pakistan
        </p>

        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-stone-900 sm:text-6xl md:text-7xl">
          Dressed for
          <br />
          <span className="text-stone-500">Every Occasion</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-stone-500 sm:text-lg">
          Elegant wedding dresses, formal outfits, and function wear — crafted
          for your little ones&apos; most special moments.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/allproducts"
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-black"
          >
            <ShoppingBag size={16} aria-hidden="true" />
            Shop Collection
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-900"
          >
            <Phone size={16} aria-hidden="true" />
            Wholesale Enquiry
          </Link>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-1/2 h-px w-24 -translate-x-1/2 bg-stone-200" />
    </section>
  );
}
