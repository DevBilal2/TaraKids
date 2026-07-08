"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { formatMoney, formatProductPrice } from "@/app/lib/formatProductPrice";
import {
  ShoppingBag,
  Heart,
  Star,
  Truck,
  Shield,
  Leaf,
  ChevronLeft,
  Plus,
  Minus,
  Share2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Calendar,
} from "lucide-react";

export default function ProductDetail({ product }) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [mobileImage, setMobileImage] = useState(0);
  const mobileScrollRef = React.useRef(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || "Classic White"
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || "Standard"
  );
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const { addToCart } = useCart();
  const images = product.images || [product.image];

  const reviews = [];

  const displayPrice =
    product.priceFormatted ||
    formatProductPrice({ price: product.price, currency: product.currency });
  const displayCompareAt =
    product.compareAtFormatted ||
    (product.compareAtAmount
      ? formatMoney(product.compareAtAmount, product.currency || "PKR")
      : null);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleWishlist = () => {
    setAddedToWishlist(!addedToWishlist);
    alert(
      `${product.Heading} ${
        addedToWishlist ? "removed from" : "added to"
      } wishlist!`
    );
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // If no product data, show loading/error
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-stone-500 text-xl">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white">
      {/* Back Navigation */}
      <div className="px-5 lg:px-8 xl:px-[8%] py-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <div className="mx-auto px-0 py-4 lg:px-8 lg:py-4 xl:px-[8%]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Mobile: swipeable single-image carousel */}
          <div className="relative lg:hidden">
            <div
              ref={mobileScrollRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                const index = Math.round(el.scrollLeft / el.clientWidth);
                setMobileImage(index);
              }}
              className="flex w-full snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {(images.filter(Boolean).length > 0
                ? images.filter(Boolean)
                : [null]
              ).map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/5] w-full flex-shrink-0 snap-center overflow-hidden bg-stone-100"
                >
                  {img ? (
                    <Image
                      src={img}
                      alt={`${product.Heading} - ${index + 1}`}
                      fill
                      className="object-contain object-center"
                      sizes="100vw"
                      priority={index === 0}
                      quality={75}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-8xl text-stone-300">🌸</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {product.isNew && (
                <span className="rounded-full border border-emerald-700 bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                  New Arrival
                </span>
              )}
              {product.bestSeller && (
                <span className="rounded-full border border-stone-900 bg-stone-900 px-3 py-1 text-xs font-medium text-white">
                  Best Seller
                </span>
              )}
              {product.discount && (
                <span className="rounded-full border border-stone-900 bg-stone-800 px-3 py-1 text-xs font-medium text-white">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={
                addedToWishlist
                  ? `Remove ${product.Heading} from wishlist`
                  : `Add ${product.Heading} to wishlist`
              }
              className="absolute right-3 top-3 rounded-full border border-stone-200 bg-white/90 p-3 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:shadow-md"
            >
              <Heart
                size={22}
                aria-hidden="true"
                className={
                  addedToWishlist
                    ? "fill-stone-700 text-stone-700"
                    : "text-stone-600"
                }
              />
            </button>

            {images.filter(Boolean).length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.filter(Boolean).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Go to image ${index + 1}`}
                    onClick={() => {
                      const el = mobileScrollRef.current;
                      if (el) el.scrollTo({ left: el.clientWidth * index, behavior: "smooth" });
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      mobileImage === index
                        ? "w-5 bg-white"
                        : "w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop: main + thumbnails */}
          <div className="hidden lg:block">
            <div className="relative mb-3 aspect-[4/5] w-full overflow-hidden bg-stone-100">
              {images[selectedImage] ? (
                <Image
                  src={images[selectedImage]}
                  alt={`${product.Heading} - Image ${selectedImage + 1}`}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 1280px) 50vw, 40vw"
                  priority
                  quality={75}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl text-stone-300">🌸</div>
                </div>
              )}

              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="rounded-full border border-emerald-700 bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                    New Arrival
                  </span>
                )}
                {product.bestSeller && (
                  <span className="rounded-full border border-stone-900 bg-stone-900 px-3 py-1 text-xs font-medium text-white">
                    Best Seller
                  </span>
                )}
                {product.discount && (
                  <span className="rounded-full border border-stone-900 bg-stone-800 px-3 py-1 text-xs font-medium text-white">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleWishlist}
                aria-label={
                  addedToWishlist
                    ? `Remove ${product.Heading} from wishlist`
                    : `Add ${product.Heading} to wishlist`
                }
                className="absolute right-4 top-4 rounded-full border border-stone-200 bg-white/90 p-3 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:shadow-md"
              >
                <Heart
                  size={22}
                  aria-hidden="true"
                  className={
                    addedToWishlist
                      ? "fill-stone-700 text-stone-700"
                      : "text-stone-600"
                  }
                />
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex gap-0.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden transition-all md:h-20 md:w-20 ${
                      selectedImage === index
                        ? "ring-2 ring-stone-800 ring-offset-1"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover object-center"
                        sizes="80px"
                        loading="lazy"
                        quality={70}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-stone-100">
                        <span className="text-xl text-stone-300">🌸</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="px-5 lg:px-0">
            {/* Brand & Category */}
            <div className="mb-4">
              <span className="text-sm font-medium text-stone-600 uppercase tracking-wider">
                {product.brand || "Tara Kids"}
              </span>
              <div className="flex items-center gap-2 mt-1">
                {product.tags?.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-stone-100 text-stone-700 text-xs rounded-full border border-stone-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-4">
              {product.Heading}
            </h1>

            {/* Stock */}
            <div className="flex items-center gap-3 mb-6">
              {product.inStock ? (
                <span className="text-emerald-600 font-medium">In Stock</span>
              ) : (
                <span className="text-stone-500 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-bold text-stone-800">
                  {displayPrice}
                </span>
                {displayCompareAt && (
                  <>
                    <span className="text-xl text-stone-400 line-through">
                      {displayCompareAt}
                    </span>
                    <span className="px-3 py-1 bg-stone-100 text-stone-700 text-sm font-medium rounded-full border border-stone-200">
                      Save {product.discount || "20"}%
                    </span>
                  </>
                )}
              </div>
              {product.shipping && (
                <p className="text-stone-500 mt-2">{product.shipping}</p>
              )}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-3">
                  Color: <span className="font-normal">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-stone-700 bg-stone-50 text-stone-800 font-medium"
                          : "border-stone-300 hover:border-stone-400 text-stone-600"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-3">
                  Size: <span className="font-normal">{selectedSize}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        selectedSize === size
                          ? "border-stone-700 bg-stone-50 text-stone-800 font-medium"
                          : "border-stone-300 hover:border-stone-400 text-stone-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-3">
                Quantity
              </h3>
              <div className="flex items-center border-2 border-stone-300 rounded-full p-1 w-fit">
                <button
                  onClick={decrementQuantity}
                  className="p-3 text-stone-600 hover:text-stone-800 hover:bg-stone-50 rounded-full"
                >
                  <Minus size={20} />
                </button>
                <span className="px-6 text-xl font-semibold text-stone-800 min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  className="p-3 text-stone-600 hover:text-stone-800 hover:bg-stone-50 rounded-full"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mb-8">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-all duration-300 shadow-sm hover:shadow-md font-semibold flex items-center justify-center gap-3 border border-stone-900"
              >
                <ShoppingBag size={22} />
                <span>Add to Cart • {displayPrice}</span>
              </button>
            </div>

            {/* Features */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200">
                <div className="p-2 bg-stone-100 rounded-lg">
                  <Truck className="text-stone-700" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-stone-800">Free Delivery</h4>
                  <p className="text-sm text-stone-600">24-48 hours</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200">
                <div className="p-2 bg-stone-100 rounded-lg">
                  <Shield className="text-stone-700" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-stone-800">
                    Freshness Guarantee
                  </h4>
                  <p className="text-sm text-stone-600">7-day guarantee</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200">
                <div className="p-2 bg-stone-100 rounded-lg">
                  <Leaf className="text-stone-700" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-stone-800">Eco-Friendly</h4>
                  <p className="text-sm text-stone-600">Sustainable</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Tabs Section - Description & Reviews */}
        <div className="mb-16 mt-12 px-5 lg:px-0">
          {/* Tabs Navigation */}
          <div className="flex border-b border-stone-200 mb-8">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-3 text-lg font-medium transition-colors relative ${
                activeTab === "description"
                  ? "text-stone-800"
                  : "text-stone-500 hover:text-stone-600"
              }`}
            >
              Description
              {activeTab === "description" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-800"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-3 text-lg font-medium transition-colors relative ${
                activeTab === "reviews"
                  ? "text-stone-800"
                  : "text-stone-500 hover:text-stone-600"
              }`}
            >
              Reviews
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-800"></div>
              )}
            </button>
          </div>

          {/* Description Tab Content */}
          {activeTab === "description" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-stone-800 mb-4">
                  Product Details
                </h3>
                <p className="text-stone-700 leading-relaxed text-lg">
                  {product.fullDescription ||
                    product.description ||
                    "This exquisite piece is crafted with premium quality fabrics and meticulous attention to detail. Designed for life's most special moments — weddings, Eid, and grand celebrations — it ensures your child looks and feels extraordinary."}
                </p>
              </div>
            </div>
          )}

          {/* Reviews Tab Content */}
          {activeTab === "reviews" && (
            <div>
              <h3 className="text-2xl font-bold text-stone-800 mb-4">
                Customer Reviews
              </h3>
              {reviews.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white rounded-2xl p-6 border border-stone-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-stone-100 to-amber-100 rounded-full flex items-center justify-center border border-stone-200">
                              <span className="text-stone-700 font-semibold">
                                {review.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-stone-800">
                                {review.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={`${
                                        i < review.rating
                                          ? "fill-stone-900 text-stone-900"
                                          : "text-stone-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-stone-500 text-sm">
                                  {review.date}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-stone-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-stone-600 py-8">
                  No reviews yet. Be the first to leave a review after your purchase!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
