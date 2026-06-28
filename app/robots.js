const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tarakids.com.pk";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/Account/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
