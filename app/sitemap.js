import {
  fetchShopifyProducts,
  fetchShopifyCollections,
  fetchShopifyBlogArticles,
} from "./lib/shopify";

const BLOG_HANDLE = "news";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tarakids.com.pk";

export default async function sitemap() {
  const staticRoutes = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/allproducts`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blogpage`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/checkout`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/Account`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  let products = [];
  let collections = [];
  let blogSlugs = [];

  try {
    products = await fetchShopifyProducts(200);
  } catch (e) {
    console.warn("Sitemap: could not fetch products", e?.message);
  }
  try {
    collections = await fetchShopifyCollections(50);
  } catch (e) {
    console.warn("Sitemap: could not fetch collections", e?.message);
  }
  try {
    const posts = await fetchShopifyBlogArticles(BLOG_HANDLE, 100);
    blogSlugs = (posts || []).map((p) => p.slug).filter(Boolean);
  } catch (e) {
    console.warn("Sitemap: could not fetch blog articles", e?.message);
  }

  const productUrls = (products || []).map((p) => ({
    url: `${BASE_URL}/products/${p.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const collectionUrls = (collections || []).map((c) => ({
    url: `${BASE_URL}/collections/${c.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const blogUrls = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...collectionUrls,
    ...productUrls,
    ...blogUrls,
  ];
}
