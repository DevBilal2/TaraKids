// app/Components/CompactBlogSection.jsx
import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import BlogCard from "./BlogCard";
import { fetchShopifyBlogArticles, fetchShopifyBlogs } from "../lib/shopify";

const CompactBlogSection = async ({ showTitle = true, limit = 3, blogHandle = "elor-scents-blog" }) => {
  // Fetch blog posts on the server (non-blocking with timeout)
  let blogPosts = [];
  
  try {
    blogPosts = await Promise.race([
      fetchShopifyBlogArticles(blogHandle, limit),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ]).catch(async () => {
      // If no posts found with default handle, try to find any blog
      try {
        const blogs = await fetchShopifyBlogs(10);
        if (blogs.length > 0) {
          return await fetchShopifyBlogArticles(blogs[0].handle, limit);
        }
      } catch (err) {
        console.error("Error loading blog posts:", err);
      }
      return [];
    });
  } catch (error) {
    console.error("Error loading blog posts:", error);
  }

  const latestPosts = blogPosts.slice(0, limit);

  return (
    <section id="blog" className="py-12 px-5 bg-white">
      <div className="max-w-7xl mx-auto">
        {showTitle && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <BookOpen size={18} className="text-stone-400" />
                <span className="text-sm font-medium text-stone-400 uppercase tracking-wider">
                  Latest Articles
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800">
                From Our Blog
              </h2>
            </div>
            <Link
              href="/blogpage"
              className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 text-sm font-medium"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <BlogCard key={post.id} post={post} compact={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-600">
            <p>No blog posts available at the moment.</p>
          </div>
        )}

        {showTitle && (
          <div className="text-center mt-8">
            <Link
              href="/blogpage"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-stone-300 text-stone-700 rounded-full hover:bg-stone-50 transition-colors font-medium"
            >
              Browse All Articles
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CompactBlogSection;
