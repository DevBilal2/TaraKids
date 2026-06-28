// app/blog/[slug]/page.jsx
import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Bookmark,
  Tag,
  MessageCircle,
} from "lucide-react";
import BlogCard from "../../Components/BlogCard";
import BlogComments from "../../Components/BlogComments";
import { fetchShopifyArticleByHandle, fetchShopifyBlogArticles } from "../../lib/shopify";

const BLOG_HANDLE = "elor-scents-blog"; // Change this to match your Shopify blog handle

// Generate static paths for all blog posts
export async function generateStaticParams() {
  try {
    const posts = await fetchShopifyBlogArticles(BLOG_HANDLE, 50);
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await fetchShopifyArticleByHandle(BLOG_HANDLE, slug);

  if (!post) {
    return { title: "Post Not Found | Tara Kids Lahore" };
  }

  const description =
    (post.excerpt || "").replace(/<[^>]*>/g, "").trim().substring(0, 160) ||
    `${post.title} – Tara Kids blog. Kids fashion tips and inspiration from Tara Kids, Pakistan.`;
  const imageUrl = post.image;

  return {
    title: `${post.title} | Tara Kids Blog`,
    description: description,
    openGraph: {
      title: `${post.title} | Tara Kids Lahore Blog`,
      description: description,
      type: "article",
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: post.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Tara Kids`,
      description: description,
    },
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }) {
  // Await params before using it
  const { slug } = await params;
  const post = await fetchShopifyArticleByHandle(BLOG_HANDLE, slug);

  if (!post) {
    notFound();
  }

  // Fetch all posts to get related ones
  const allPosts = await fetchShopifyBlogArticles(BLOG_HANDLE, 50);
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Back Navigation */}
      <div className="px-5 lg:px-8 xl:px-[8%] py-6">
        <Link
          href="/blogpage"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Blog</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-4">
        {/* Article Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full mb-4 border border-stone-200">
            <span className="text-sm font-medium text-stone-700 uppercase tracking-wider">
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-stone-100 to-amber-100 rounded-full flex items-center justify-center border border-stone-200">
                  <User size={18} className="text-stone-700" />
                </div>
                <div>
                  <p className="font-medium text-stone-800">{post.author}</p>
                  <p className="text-sm text-stone-600">{post.authorRole}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-stone-600">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-stone-100 to-amber-100 mb-8 border border-stone-200">
            {post.image ? (
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                quality={70}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl text-stone-300">🌸</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Article Content */}
            <article className="prose prose-lg max-w-none mb-12">
              <div
                className="text-stone-700 leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* Tags */}
            <div className="mb-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={18} className="text-stone-600" />
                <h3 className="font-medium text-stone-800">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags && post.tags.length > 0 ? (
                  post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blogpage?search=${encodeURIComponent(tag)}`}
                      className="px-3 py-1.5 bg-white text-stone-700 rounded-full hover:bg-stone-100 transition-colors text-sm border border-stone-300"
                    >
                      {tag}
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">No tags available</p>
                )}
              </div>
            </div>

            {/* Share & Save */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 mb-12">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors">
                  <Share2 size={18} />
                  <span className="text-sm font-medium">Share</span>
                </button>
                <button className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors">
                  <Bookmark size={18} />
                  <span className="text-sm font-medium">Save</span>
                </button>
              </div>
              <a
                href="#comments"
                className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-colors text-sm font-medium"
              >
                <MessageCircle size={16} />
                <span>Leave a Comment</span>
              </a>
            </div>

            {/* Comments Section */}
            <div id="comments" className="mb-12 scroll-mt-8">
              <BlogComments articleId={post.id} articleHandle={post.slug} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-xl border border-stone-200 p-5">
                  <h3 className="font-bold text-stone-800 mb-4">
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        href={`/blog/${relatedPost.slug}`}
                        className="group block"
                      >
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-stone-100 to-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {relatedPost.image ? (
                              <Image
                                src={relatedPost.image}
                                alt={relatedPost.title}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="text-lg text-stone-300">🌸</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-stone-800 group-hover:text-stone-900 line-clamp-2">
                              {relatedPost.title}
                            </h4>
                            <p className="text-xs text-stone-500 mt-1">
                              {relatedPost.readTime}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="bg-gradient-to-r from-stone-50 to-amber-50 rounded-xl border border-stone-200 p-5">
                <h3 className="font-bold text-stone-800 mb-2">
                  Never Miss a Post
                </h3>
                <p className="text-sm text-stone-600 mb-4">
                  Subscribe for new arrivals, styling tips & kids fashion trends in Pakistan
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors font-medium"
                  >
                    Subscribe
                  </button>
                </form>
              </div>

              {/* Author Bio */}
              <div className="bg-white rounded-xl border border-stone-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-stone-100 to-amber-100 rounded-full flex items-center justify-center border border-stone-200">
                    <User size={20} className="text-stone-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800">{post.author}</h4>
                    <p className="text-sm text-stone-600">{post.authorRole}</p>
                  </div>
                </div>
                <p className="text-sm text-stone-700">
                  Passionate about kids fashion in Pakistan — sharing styling tips, outfit ideas, and the latest trends for little ones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
