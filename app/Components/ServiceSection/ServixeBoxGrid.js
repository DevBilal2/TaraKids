"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatProductPrice } from "../../lib/formatProductPrice";
import ProductCardImage from "../ProductCardImage";

const ProductsGrid = ({ data }) => {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(4);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let resizeTimeout;
    const updateCount = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
          const width = window.innerWidth;
          if (width < 640) setVisibleCount(1);
          else if (width < 768) setVisibleCount(2);
          else if (width < 1024) setVisibleCount(2);
          else setVisibleCount(3);
        });
      }, 150);
    };

    if (typeof window !== "undefined") {
      updateCount();
      window.addEventListener("resize", updateCount, { passive: true });
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateCount);
        clearTimeout(resizeTimeout);
      }
    };
  }, []);

  const visibleItems = expanded ? data : data.slice(0, visibleCount);

  const gridColsClass = expanded
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
    : visibleCount === 1
      ? "grid-cols-1"
      : visibleCount === 2
        ? "grid-cols-2"
        : "grid-cols-3";

  const handleViewDetails = (product) => {
    if (product.handle) {
      router.push(`/products/${product.handle}`);
    } else if (product.id) {
      router.push(`/products/${product.id}`);
    }
  };

  return (
    <div className="w-full">
      <div className={`grid min-w-0 gap-8 sm:gap-10 ${gridColsClass}`}>
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleViewDetails(item)}
            className="w-full min-w-0 cursor-pointer touch-manipulation text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
          >
            <div className="group/image relative aspect-[4/5] w-full overflow-hidden bg-stone-50">
              <ProductCardImage item={item} />
            </div>
            <div className="mt-4 flex flex-col items-center gap-1 px-1 text-center">
              <h3 className="font-serif text-base font-semibold text-stone-900 sm:text-[1.05rem]">
                {item.Heading || item.title}
              </h3>
              <p className="font-serif text-lg font-medium text-stone-800 sm:text-xl">
                {formatProductPrice(item)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {data.length > visibleCount && (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg bg-stone-800 px-8 py-3 font-medium text-white transition-colors hover:bg-stone-900"
          >
            {expanded ? "Show Less" : `View All ${data.length} Products`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;
