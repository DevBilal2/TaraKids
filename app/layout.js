import { CartProvider } from "./context/CartContext";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Use ClientOnlyWrapper for client-only components (handles ssr: false internally)
const ClientOnlyWrapper = dynamic(
  () => import("./Components/ClientOnlyWrapper"),
  {
    loading: () => null,
  }
);

// Navbar can be server-rendered (above fold)
const NavBarScrollEffect = dynamic(
  () => import("./Components/Navbar/NavBarScrollEffect")
);

// Footer is below fold - lazy load for mobile
const Footer = dynamic(
  () => import("./Components/Footer/Footer").then((mod) => ({ default: mod.Footer })),
  {
    loading: () => <div className="min-h-[200px]" />,
  }
);


// Optimize font loading for better LCP
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Defer font preload to improve initial load
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tarakids.com.pk";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: "/tablogo.png", type: "image/png", sizes: "any" }],
    shortcut: "/tablogo.png",
    apple: "/tablogo.png",
  },
  title: {
    default: "Tara Kids | Premium Kids Wedding & Function Wear in Pakistan",
    template: "%s | Tara Kids",
  },
  description:
    "Pakistan's premier kids fashion brand. Shop luxury wedding dresses, function outfits, and premium formal wear for children. Elegant designs crafted for special occasions.",
  keywords: [
    "kids wedding dresses Pakistan",
    "kids formal wear Lahore",
    "children wedding outfits Pakistan",
    "kids function dresses",
    "premium kids fashion Pakistan",
    "luxury kids wear",
    "kids sherwani Pakistan",
    "kids lehenga Pakistan",
    "children formal dresses Lahore",
    "Tara Kids",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: "Tara Kids",
    title: "Tara Kids | Premium Kids Wedding & Function Wear Pakistan",
    description:
      "Luxury wedding dresses and function wear for children. Elegant premium designs for your little ones' most special moments.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Tara Kids - Premium Kids Fashion Pakistan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tara Kids | Premium Kids Fashion Pakistan",
    description: "Luxury wedding dresses and function wear for children in Pakistan.",
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
  verification: {
    google: "yP5qZEXyUfyoIonluGUQswL0xn6Uq5qqsiLdgAo9WeY",
  },
};

export default function RootLayout({ children }) {
  return (
    <CartProvider>
      <html lang="en">
        <head>
          {/* Resource hints - removed unused preconnect for cdn.shopify.com */}
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
          {/* Critical CSS inline for above-the-fold content - defer non-critical */}
          <style dangerouslySetInnerHTML={{
            __html: `
              /* Critical above-the-fold styles */
              body{margin:0;font-family:var(--font-geist-sans),system-ui,-apple-system,sans-serif}
              .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
              .scrollbar-hide::-webkit-scrollbar{display:none}
            `
          }} />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <NavBarScrollEffect />
          {children}
          {/* Client-only components loaded after page is interactive */}
          <ClientOnlyWrapper />
          <Footer />
          <SpeedInsights />
        </body>
      </html>
    </CartProvider>
  );
}
