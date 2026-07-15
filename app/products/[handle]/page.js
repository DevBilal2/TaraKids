// app/products/[handle]/page.js
import ProductDetail from "../../Components/DetailPage/ProductDetail";
import { fetchProductByHandle, fetchShopifyProducts } from "../../lib/shopify";
import { formatMoney, FREE_SHIPPING_PKR_THRESHOLD } from "../../lib/formatProductPrice";
import { notFound } from "next/navigation";

// Note: Cannot use runtime: 'edge' with generateStaticParams
// Static generation provides better performance for product pages

function buildProductKeywords(title, description, tags) {
  const plain = (description || "").replace(/<[^>]*>/g, "");

  // If description contains "seo: ..." line, use those exact phrases
  const seoMatch = plain.match(/seo:\s*(.+)/i);
  if (seoMatch) {
    const seoKeywords = seoMatch[1]
      .split(",")
      .map(k => k.trim())
      .filter(Boolean);
    return [
      `${title} Lahore`,
      `${title} Pakistan`,
      ...seoKeywords,
    ].slice(0, 20);
  }

  // Fallback: use tags + individual words from description
  const stopWords = new Set(["with", "and", "the", "for", "that", "this", "from", "have", "our", "your", "are", "also", "will", "very", "each", "been", "their", "they"]);
  const descWords = plain
    .split(/[\s,.\-\/|()]+/)
    .map(w => w.toLowerCase().trim())
    .filter(w => w.length >= 4 && !stopWords.has(w));
  const uniqueDescWords = [...new Set(descWords)].slice(0, 6);
  const tagKeywords = (tags || []).flatMap(tag => [
    `${tag} Lahore`,
    `${tag} Pakistan`,
    `kids ${tag}`,
  ]);

  return [
    `${title} Lahore`,
    `${title} Pakistan`,
    `buy ${title} Pakistan`,
    `kids ${title}`,
    `${title} Tara Kids`,
    ...uniqueDescWords.map(w => `${w} Lahore`),
    ...uniqueDescWords.map(w => `kids ${w} Pakistan`),
    ...tagKeywords,
  ].slice(0, 15);
}

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const product = await fetchProductByHandle(handle);
  if (!product) return { title: "Product Not Found" };
  const title = product.title;
  const plainDesc =
    product.description?.replace(/<[^>]*>/g, "").trim().substring(0, 160) ||
    `Buy ${title} — premium kids fashion by Tara Kids, Pakistan.`;
  const imageUrl = product.featuredImage?.url;
  const keywords = buildProductKeywords(title, product.description, product.tags);
  return {
    title: `${title} | Tara Kids Lahore`,
    description: plainDesc,
    keywords,
    openGraph: {
      title: `${title} | Tara Kids Lahore`,
      description: plainDesc,
      images: imageUrl ? [{ url: imageUrl, width: 800, height: 800, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Tara Kids`,
      description: plainDesc,
    },
    alternates: { canonical: `/products/${handle}` },
  };
}

export default async function ProductPage({ params }) {
  const { handle } = await params;

  // Fetch product data from Shopify
  const product = await fetchProductByHandle(handle);

  if (!product) {
    notFound();
  }

  // Transform Shopify data to match component structure
  const variants = product.variants?.edges?.map((edge) => ({
    id: edge.node.id,
    availableForSale: edge.node.availableForSale,
    price: edge.node.price?.amount,
    compareAtPrice: edge.node.compareAtPrice?.amount || null,
    selectedOptions: edge.node.selectedOptions || [],
  })) || [];
  const firstVariantId = variants[0]?.id || null;
  const minPrice = product.priceRange?.minVariantPrice;
  const currency = minPrice?.currencyCode || "PKR";
  const amount = minPrice?.amount || "0";
  const compareAtAmount = variants[0]?.compareAtPrice;
  const cleanDescription = product.description
    ?.replace(/<[^>]*>/g, "")
    .replace(/seo:\s*.+$/im, "")
    .trim();

  const transformedProduct = {
    id: product.id,
    variantId: firstVariantId,
    variants,
    Heading: product.title,
    handle: product.handle,
    description: cleanDescription?.substring(0, 150),
    fullDescription: cleanDescription,
    brand: product.vendor || "Tara Kids",
    image: product.featuredImage?.url,
    images: product.images?.edges?.map((edge) => edge.node.url) || [],
    price: amount,
    currency,
    priceFormatted: formatMoney(amount, currency),
    compareAtAmount: compareAtAmount || null,
    compareAtFormatted: compareAtAmount ? formatMoney(compareAtAmount, currency) : null,
    tags: product.tags || [],
    colors: product.options?.find((opt) => opt.name === "Color")?.values || [],
    sizes: product.options?.find((opt) => opt.name === "Size")?.values || [],
    isNew: product.tags?.includes("new") || false,
    bestSeller: product.tags?.includes("best-seller") || false,
    discount: compareAtAmount
      ? Math.round(
          (1 - parseFloat(amount) / parseFloat(compareAtAmount)) * 100
        )
      : null,
    shipping: `Free delivery on orders over ${formatMoney(FREE_SHIPPING_PKR_THRESHOLD, "PKR")}`,
    inStock: variants[0]?.availableForSale || false,
  };

  return <ProductDetail product={transformedProduct} />;
}

// Generate static paths for product pages
export async function generateStaticParams() {
  // Fetch all product handles from Shopify
  const products = await fetchShopifyProducts(100);
  return products.map((product) => ({
    handle: product.handle,
  }));
}
