"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { formatProductPrice } from "../lib/formatProductPrice";
import ProductCardImage from "./ProductCardImage";

const ProductGrid = ({ data }) => {
  const router = useRouter();

  const handleViewDetails = (product) => {
    if (product.handle) {
      router.push(`/products/${product.handle}`);
    } else if (product.id) {
      router.push(`/products/${product.id}`);
    }
  };

  return (
    <div className="grid min-w-0 grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-2 lg:gap-10 xl:grid-cols-3 xl:gap-12">
      {data.map((item, index) => (
        <button
          key={item.id || index}
          type="button"
          onClick={() => handleViewDetails(item)}
          className="w-full min-w-0 cursor-pointer touch-manipulation text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
        >
          <div className="group/image relative aspect-square w-full overflow-hidden bg-stone-50">
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
  );
};

export default ProductGrid;
