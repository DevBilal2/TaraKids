import dynamic from "next/dynamic";

const testimonials = [
  {
    name: "Umer",
    title: "Customer",
    text: "Absolutely stunning wedding outfit for my son from Tara Kids. The quality and craftsmanship are unmatched — he looked like royalty.",
    rating: 5,
    avatarColor: "bg-stone-200 text-stone-700",
    icon: "U",
  },
  {
    name: "Bilal",
    title: "Customer",
    text: "Ordered a function dress for my daughter and the fabric, stitching and finishing were all top tier. Fast delivery and beautiful packaging.",
    rating: 5,
    avatarColor: "bg-stone-200 text-stone-700",
    icon: "B",
  },
  {
    name: "Ahmad",
    title: "Customer",
    text: "Tara Kids never disappoints. My kids wore their outfits to a wedding and everyone was asking where we got them from. Highly recommend.",
    rating: 5,
    avatarColor: "bg-stone-100 text-stone-700",
    icon: "A",
  },
  {
    name: "Maniha",
    title: "Customer",
    text: "So happy with my purchase! The wedding dress for my daughter is elegant and timeless. Thank you Tara Kids for making her day so special.",
    rating: 5,
    avatarColor: "bg-stone-100 text-stone-600",
    icon: "M",
  },
];

const TestimonialsSlider = dynamic(() => import("./Testimonials/TestimonialsSlider"), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-[380px] bg-white rounded-2xl p-6 border border-stone-100 animate-pulse">
          <div className="h-12 w-12 rounded-full bg-stone-200 mb-4"></div>
          <div className="h-4 bg-stone-200 rounded mb-2"></div>
          <div className="h-4 bg-stone-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  ),
});

export default function Testimonials() {
  return (
    <section className="relative py-16 md:py-20 px-5 lg:px-8 xl:px-[8%] bg-stone-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3">
            What Our Customers Say
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Hear from families who chose Tara Kids for their little ones&apos; most special moments
          </p>
        </div>

        <div className="relative px-14 sm:px-16 md:px-20">
          {testimonials.length > 0 ? (
            <TestimonialsSlider testimonials={testimonials} />
          ) : (
            <p className="text-center text-stone-500 py-8">
              Customer reviews will appear here once they start coming in.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
