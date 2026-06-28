"use client";
import React from "react";

export default function SlidingAnimation({ collections, direction = "left" }) {
  const duplicatedCollections = [
    ...collections,
    ...collections,
    ...collections,
  ];
  const animationClass =
    direction === "left"
      ? "animate-infinite-scroll-left"
      : "animate-infinite-scroll-right";

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className={`flex ${animationClass} gap-8`}>
        {duplicatedCollections.map((collection, index) => (
          <div key={`${collection.id}-${index}`} className="mx-4 flex-shrink-0">
            <a
              href={
                collection.handle ? `/collections/${collection.handle}` : "#"
              }
              className="group block"
            >
              <div className="px-8 py-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-stone-100 hover:border-stone-300 hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg text-stone-400">✦</span>
                  <h3 className="text-base font-semibold text-stone-800 group-hover:text-stone-900 transition-colors tracking-wide">
                    {collection.title}
                  </h3>
                </div>
                <div className="mt-2 text-xs text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity tracking-wider uppercase">
                  Shop collection →
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
