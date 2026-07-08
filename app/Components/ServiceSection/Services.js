// Products.jsx (Server Component)
import React from "react";
import ProductsGrid from "./ServixeBoxGrid"; // Client component
import SlideInAnimation from "./SlideInAnimation";
import Link from "next/link";
import {
  fetchShopifyCollections,
  fetchShopifyProducts,
} from "../../lib/shopify";
import { Sparkles, ShoppingBag, ChevronRight } from "lucide-react";

const Products = async () => {
  // Fetch collections from Shopify with timeout to prevent blocking
  const shopifyCollections = await Promise.race([
    fetchShopifyCollections(4),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )
  ]).catch(() => []); // Return empty array on timeout/error

  // If no Shopify collections, use fallback data
  let collectionsData =
    shopifyCollections.length > 0
      ? shopifyCollections
      : [
          {
            id: "1",
            title: "Wedding & Nikah Wear",
            handle: "wedding",
            description: "Premium kids wedding outfits",
            products: [
              {
                id: "101",
                Heading: "Boys Sherwani Set",
                description: "Elegant sherwani with matching trousers for weddings",
                price: "35000",
                currency: "PKR",
                tags: ["Wedding", "Boys", "Premium"],
                inStock: true,
                category: "Wedding",
              },
              {
                id: "102",
                Heading: "Girls Lehenga",
                description: "Embroidered lehenga choli for special occasions",
                price: "38000",
                currency: "PKR",
                tags: ["Wedding", "Girls", "Formal"],
                inStock: true,
                category: "Wedding",
              },
              {
                id: "103",
                Heading: "Girls Frock Suit",
                description: "Formal embroidered frock for weddings and functions",
                price: "28000",
                currency: "PKR",
                tags: ["Wedding", "Girls", "Frock"],
                inStock: true,
                category: "Wedding",
              },
              {
                id: "104",
                Heading: "Boys Kurta Pajama",
                description: "Classic kurta pajama with intricate embroidery",
                price: "22000",
                currency: "PKR",
                tags: ["Wedding", "Boys", "Kurta"],
                inStock: true,
                category: "Wedding",
              },
            ],
          },
          {
            id: "2",
            title: "Eid Collection",
            handle: "eid",
            description: "Festive Eid wear for children",
            products: [
              {
                id: "201",
                Heading: "Girls Eid Frock",
                description: "Elegant printed frock perfect for Eid celebrations",
                price: "18000",
                currency: "PKR",
                tags: ["Eid", "Girls", "Festive"],
                inStock: true,
                category: "Eid",
              },
              {
                id: "202",
                Heading: "Boys Eid Kurta",
                description: "Stylish kurta set for Eid festivities",
                price: "15000",
                currency: "PKR",
                tags: ["Eid", "Boys", "Festive"],
                inStock: true,
                category: "Eid",
              },
              {
                id: "203",
                Heading: "Girls Sharara Set",
                description: "Festive sharara with embroidered dupatta",
                price: "22000",
                currency: "PKR",
                tags: ["Eid", "Girls", "Sharara"],
                inStock: true,
                category: "Eid",
              },
              {
                id: "204",
                Heading: "Boys Waistcoat Set",
                description: "Smart waistcoat with matching shirt and trousers",
                price: "19000",
                currency: "PKR",
                tags: ["Eid", "Boys", "Formal"],
                inStock: true,
                category: "Eid",
              },
            ],
          },
          {
            id: "3",
            title: "Premium Formal",
            handle: "premium",
            description: "Luxury formal wear for children",
            products: [],
          },
          {
            id: "4",
            title: "Custom Orders",
            handle: "custom",
            description: "Bespoke designs for your child",
            products: [],
          },
        ];

  // If we have real Shopify collections, fetch products for each collection
  if (shopifyCollections.length > 0) {
    for (const collection of collectionsData) {
      if (collection.handle) {
        try {
          const products = await fetchShopifyProducts(4, collection.handle);
          collection.products = products;
        } catch (error) {
          console.error(
            `Error fetching products for ${collection.title}:`,
            error
          );
          collection.products = [];
        }
      }
    }
  }

  // Filter out collections with no products
  const collectionsWithProducts = collectionsData.filter(
    (collection) =>
      collection.products &&
      Array.isArray(collection.products) &&
      collection.products.length > 0
  );

  // If no collections have products, show a fallback message
  if (collectionsWithProducts.length === 0) {
    return (
      <div
        id="products"
        className="scroll-mt-16 py-20 bg-white px-4"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-stone-200 shadow-sm mb-6">
              <Sparkles size={20} className="text-stone-700" />
              <span className="text-sm font-medium text-stone-700 tracking-wide">
                Featured Collections
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">
              Our Featured Collections
            </h2>
            <p className="text-stone-500 text-lg">
              Discover our curated collections of premium kids wedding and function wear
            </p>
          </div>

          <div className="py-20 text-center bg-stone-50/50 rounded-2xl border border-stone-200">
            <div className="text-8xl mb-6 opacity-20">✦</div>
            <h3 className="text-2xl font-bold text-stone-700 mb-4">
              No Products Available
            </h3>
            <p className="text-stone-500 max-w-md mx-auto mb-8">
              Our collections are currently being updated. Please check back soon!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-8 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              <ShoppingBag size={20} />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="products"
      className="scroll-mt-16 py-20 bg-white px-4"
    >
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-stone-200 shadow-sm mb-6">
            <Sparkles size={20} className="text-stone-700" />
            <span className="text-sm font-medium text-stone-700">
              Featured Collections
            </span>
          </div>

          <SlideInAnimation
            delay={400}
            className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6"
          >
            Our Featured Collections
          </SlideInAnimation>
          <SlideInAnimation delay={800} className="text-stone-500 text-lg">
            Discover our curated collections of premium kids wedding and function wear
          </SlideInAnimation>
        </div>

        {/* Collections with Products */}
        <div className="space-y-20">
          {collectionsWithProducts.map((collection, collectionIndex) => (
            <div key={collection.id} className="space-y-8">
              {/* Collection Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-2">
                    {collection.title}
                  </h2>
                </div>

                {collection.handle && (
                  <a
                    href={`/collections/${collection.handle}`}
                    className="group inline-flex items-center gap-2 text-stone-800 hover:text-stone-900 font-medium"
                  >
                    <span>View Collection</span>
                    <ChevronRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </a>
                )}
              </div>

              {/* Products Grid for this Collection */}
              <div>
                <ProductsGrid
                  data={collection.products.slice(0, 4)} // Limit to 4 products per collection
                  collectionName={collection.title}
                />
              </div>

              {/* Divider between collections */}
              {collectionIndex < collectionsWithProducts.length - 1 && (
                <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>
              )}
            </div>
          ))}
        </div>

        {/* View All Collections Button */}
        <div className="mt-20 pt-8 border-t border-stone-200">
          <div className="text-center">
            <div className="inline-flex flex-col items-center gap-6">
              <p className="text-stone-600 text-lg">Ready to explore more?</p>
              <a
                href="/allproducts"
                className="group inline-flex items-center gap-4 px-10 py-4 bg-gradient-to-r from-stone-800 to-stone-900 text-white rounded-xl hover:from-stone-900 hover:to-stone-950 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold text-lg"
              >
                <ShoppingBag size={24} />
                <span>View All Products</span>
                <ChevronRight
                  size={24}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
