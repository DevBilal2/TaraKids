import Link from "next/link";

export default function AboutSection() {
  return (
    <section
      className="w-full border-t border-stone-100 bg-stone-50 px-6 py-20 sm:px-8 md:py-28 xl:px-[8%]"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          About us
        </p>
        <h2
          id="about-heading"
          className="mt-3 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl lg:text-5xl"
        >
          Tara Kids
        </h2>
        <p className="mt-5 text-base leading-relaxed text-stone-500 md:text-lg">
          We create premium fashion for children — elegant wedding dresses,
          function outfits, and formal wear crafted for life&apos;s most special
          moments. Every piece is designed with meticulous attention to detail,
          quality fabrics, and timeless silhouettes.
        </p>
        <p className="mt-4 text-base leading-relaxed text-stone-500 md:text-lg">
          Whether dressing your child for a wedding, Eid, or a grand
          celebration, Tara Kids ensures they arrive in style — looking and
          feeling extraordinary.
        </p>
        <div className="mt-8">
          <Link
            href="/allproducts"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-stone-900 px-7 py-2.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-black touch-manipulation"
          >
            Shop the collection
          </Link>
        </div>
      </div>
    </section>
  );
}
