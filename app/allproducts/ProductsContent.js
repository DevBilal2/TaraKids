import ProductGrid from "../Components/productGrid";
import FiltersClient from "../Components/FilterClient";
import SearchSortBar from "../Components/SearchBar";
import PaginationClient from "../Components/PaginationClient";
import Link from "next/link";
import { ProductsData } from "./ProductsData";

export default async function ProductsContent({ searchParams }) {
  const data = await ProductsData({ searchParams });

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-800 to-stone-900 text-white py-12 px-4 sm:py-16 sm:px-5">
        <div className="mx-auto max-w-7xl min-w-0">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 text-stone-300 touch-manipulation transition-colors hover:text-white"
            >
              ← Back to Home
            </Link>
          </div>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            All Products
          </h1>
          <p className="max-w-3xl text-base text-stone-300 sm:text-lg md:text-xl">
            Discover our complete collection of {data.totalProducts} premium kids outfits — wedding wear, event suits & girls dresses in Pakistan
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl min-w-0 px-4 py-8 sm:px-5">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <div className="min-w-0 lg:w-1/4">
            <FiltersClient categories={data.categories} allTags={data.allTags} />
          </div>

          {/* Main Content */}
          <div className="min-w-0 lg:w-3/4">
            <SearchSortBar />

            {/* Results Info */}
            <div className="mb-6">
              <p className="text-stone-600">
                Showing{" "}
                <span className="font-bold text-stone-800">
                  {data.paginatedProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-stone-800">
                  {data.totalProducts}
                </span>{" "}
                products
                {searchParams?.category !== "all" && (
                  <span className="ml-2 text-stone-700 font-medium">
                    in &quot;{data.categories.find((c) => c.id === searchParams?.category)?.name ||
                      searchParams?.category}&quot;
                  </span>
                )}
              </p>
            </div>

            {/* Products Grid */}
            {data.paginatedProducts.length > 0 ? (
              <>
                <ProductGrid data={data.paginatedProducts} />
                <PaginationClient
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  totalProducts={data.totalProducts}
                  limit={data.limit}
                />
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 text-stone-300">🌸</div>
                <h3 className="text-2xl font-bold text-stone-800 mb-2">
                  No products found
                </h3>
                <p className="text-stone-600 mb-6">
                  {searchParams?.category !== "all"
                    ? `No products found in &quot;${data.categories.find((c) => c.id === searchParams?.category)?.name ||
                        searchParams?.category}&quot;. Try another collection.`
                    : "Try adjusting your search or filter criteria"}
                </p>
                <Link
                  href="/allproducts"
                  className="inline-block px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors border border-stone-900"
                >
                  {searchParams?.category !== "all"
                    ? "View All Products"
                    : "Clear All Filters"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

