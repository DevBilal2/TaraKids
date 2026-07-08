import dynamic from "next/dynamic";
import { Suspense } from "react";
import HomeSection from "./Components/HomeSection/HomeSection";
import AboutSection from "./Components/AboutSection/AboutSection";
// import Contact from "./contact/Contact";
import NavBarScrollEffect from "./Components/Navbar/NavBarScrollEffect";
// import CategoryNav from "./Components/CatogaryNav";

// Loading skeleton for CompaniesSection
function CompaniesSectionSkeleton() {
  return (
    <div className="py-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="h-12 bg-stone-200 rounded-lg w-64 mx-auto mb-6 animate-pulse"></div>
          <div className="h-6 bg-stone-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-stone-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Lazy load below-the-fold components for mobile (still lazy-loaded, just without ssr: false)
const CompaniesSection = dynamic(
  () => import("./Components/CompaniesSection/CompaniesSection"),
  { loading: () => <CompaniesSectionSkeleton /> }
);

// Services loading skeleton
function ServicesSkeleton() {
  return (
    <div className="py-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-4">
        <div className="h-12 bg-stone-200 rounded-lg w-64 mx-auto mb-12 animate-pulse"></div>
      </div>
    </div>
  );
}

// Split Services component - defer loading for mobile
const Services = dynamic(() => import("./Components/ServiceSection/Services"), {
  loading: () => <ServicesSkeleton />,
});

const CompactBlogSection = dynamic(
  () => import("./Components/compactblogsection"),
  {
    loading: () => (
      <div className="py-12 px-5 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 bg-stone-200 rounded-lg w-48 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-stone-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

const Testimonials = dynamic(() => import("./Components/Testimonials"), {
  loading: () => (
    <div className="py-20 bg-gradient-to-b from-white to-stone-50">
      <div className="container mx-auto px-4">
        <div className="h-12 bg-stone-200 rounded-lg w-64 mx-auto mb-12 animate-pulse"></div>
      </div>
    </div>
  ),
});

export const metadata = {
  title: "Tara Kids | Premium Kids Wedding & Function Wear Lahore Pakistan",
  description:
    "Tara Kids Lahore — Pakistan's premier kids fashion brand. Shop luxury wedding dresses, kids suits, girls party dresses & function outfits. Premium kids wedding wear delivered across Pakistan.",
  keywords: [
    "Tara Kids Lahore",
    "kids wedding dress Lahore",
    "kids wedding wear Pakistan",
    "kids suits Pakistan",
    "girls party dress Lahore",
    "children wedding outfit Pakistan",
    "kids sherwani Lahore",
    "kids lehenga Pakistan",
    "kids function dress Lahore",
    "kids event wear Pakistan",
    "kids Eid dresses Pakistan",
    "Eid collection for kids Lahore",
    "kids festival wear Pakistan",
    "girls gharara Lahore",
    "boys kurta pajama Pakistan",
    "kids designer wear Lahore",
    "kids fashion brand Pakistan",
    "kids boutique Lahore",
    "baby girl dresses online Pakistan",
    "kids clothes online Lahore",
  ],
  openGraph: {
    title: "Tara Kids | Premium Kids Wedding & Function Wear Lahore",
    description:
      "Luxury wedding dresses, kids suits & girls party wear for children in Lahore, Pakistan. Premium designs for your little ones' most special moments.",
    url: "/",
  },
};

export default function Home() {
  return (
    <>
      {/* <NavBarScrollEffect /> */}
      {/* <CategoryNav /> */}
      <main>
        <HomeSection />
        {/* Use Suspense to prevent blocking - page renders immediately */}
        <Suspense fallback={<CompaniesSectionSkeleton />}>
          <CompaniesSection />
        </Suspense>
        <Services />
        <AboutSection />
        <CompactBlogSection />
        {/* <Contact /> */}
        <Testimonials />
      </main>
      {/* <Footer /> */}
    </>
  );
}
