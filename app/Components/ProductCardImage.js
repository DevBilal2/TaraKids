"use client";

import NextImage from "next/image";

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

const DEFAULT_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

/**
 * Listing card image: optional second gallery image fades in on hover (desktop).
 */
export default function ProductCardImage({
  item,
  sizes = DEFAULT_SIZES,
  quality = 70,
}) {
  const alt = item.altText || item.Heading || item.title || "Product";

  if (!item.image) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-stone-100 text-5xl text-stone-300">
        🌸
      </div>
    );
  }

  if (item.hoverImage) {
    return (
      <>
        <NextImage
          src={item.hoverImage}
          alt=""
          aria-hidden
          fill
          className="absolute inset-0 z-0 object-contain object-center p-1.5 sm:p-2"
          sizes={sizes}
          loading="lazy"
          quality={quality}
          placeholder="blur"
          blurDataURL={BLUR}
        />
        <NextImage
          src={item.image}
          alt={alt}
          fill
          className="absolute inset-0 z-[1] object-contain object-center p-1.5 transition-opacity duration-500 ease-out group-hover/image:opacity-0 sm:p-2 motion-reduce:transition-none motion-reduce:group-hover/image:opacity-100"
          sizes={sizes}
          loading="lazy"
          quality={quality}
          placeholder="blur"
          blurDataURL={BLUR}
        />
      </>
    );
  }

  return (
    <NextImage
      src={item.image}
      alt={alt}
      fill
      className="object-contain object-center p-1.5 transition-opacity duration-300 group-hover/image:opacity-95 sm:p-2"
      sizes={sizes}
      loading="lazy"
      quality={quality}
      placeholder="blur"
      blurDataURL={BLUR}
    />
  );
}
