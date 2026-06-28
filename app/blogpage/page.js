"use client"; // Add this at the top since we need client-side interactivity

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  BookOpen,
  Tag,
  Search,
  X,
} from "lucide-react";
import BlogCard from "../Components/BlogCard";
import { fetchShopifyBlogArticles, fetchShopifyBlogs } from "../lib/shopify";

export default function BlogPage({ blogHandle = "elor-scents-blog" }) {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Defer blog loading aggressively to avoid blocking initial render
    let cancelled = false;

    async function loadBlogPosts() {
      try {
        // Use requestIdleCallback with longer timeout to defer non-critical data loading
        const loadData = async () => {
          if (cancelled) return;
          
          // Split into smaller chunks to avoid blocking
          let posts = await fetchShopifyBlogArticles(blogHandle, 50);
          
          if (cancelled) return;
          
          // If no posts found with default handle, try to find any blog
          if (posts.length === 0) {
            const blogs = await fetchShopifyBlogs(10);
            
            if (blogs.length > 0 && !cancelled) {
              posts = await fetchShopifyBlogArticles(blogs[0].handle, 50);
            }
          }
          
          if (!cancelled) {
            // Use requestAnimationFrame to batch state updates
            requestAnimationFrame(() => {
              if (!cancelled) {
                setBlogPosts(posts);
                setLoading(false);
              }
            });
          }
        };

        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          // Increase timeout to defer more aggressively
          requestIdleCallback(loadData, { timeout: 3000 });
        } else {
          // Fallback: defer with longer setTimeout
          setTimeout(loadData, 500);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading blog posts:", error);
          requestAnimationFrame(() => {
            if (!cancelled) {
              setBlogPosts([]);
              setLoading(false);
            }
          });
        }
      }
    }

    // Defer initial load even more
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(loadBlogPosts, { timeout: 2000 });
      } else {
        setTimeout(loadBlogPosts, 200);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [blogHandle]);

  // Extract categories and tags from blog posts
  const categories = React.useMemo(() => {
    const categoryMap = new Map();
    blogPosts.forEach((post) => {
      const count = categoryMap.get(post.category) || 0;
      categoryMap.set(post.category, count + 1);
    });
    const cats = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
    return [{ name: "All", count: blogPosts.length }, ...cats];
  }, [blogPosts]);

  const tags = React.useMemo(() => {
    const tagSet = new Set();
    blogPosts.forEach((post) => {
      post.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [blogPosts]);

  // Filter posts based on selected category and search query
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;

    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const featuredPosts = filteredPosts.filter((post) => post.featured);
  const recentPosts = filteredPosts.slice(0, 3);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-stone-800 to-stone-900 text-white py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-stone-300 hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4 border border-white/30">
              <BookOpen size={18} />
              <span className="text-sm font-medium uppercase tracking-wider">
                Style Journal
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Tara Kids Blog
            </h1>
            <p className="text-xl text-stone-300 max-w-3xl mx-auto">
              Discover kids fashion inspiration, styling tips, and the latest
              trends in children&apos;s premium wear
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search articles, tutorials, tips..."
                className="w-full px-5 py-3 pl-12 pr-10 text-stone-800 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search size={20} className="text-stone-500" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <X
                    size={20}
                    className="text-stone-400 hover:text-stone-600"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-8 shadow-sm">
              {/* Categories Filter */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <BookOpen size={18} />
                    Categories
                  </h3>
                  {(selectedCategory !== "All" || searchQuery) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-stone-600 hover:text-stone-800 flex items-center gap-1"
                    >
                      <X size={14} />
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category.name)}
                      className={`w-full text-left flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                        selectedCategory === category.name
                          ? "bg-stone-800 text-white font-medium"
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-800"
                      }`}
                    >
                      <span>{category.name}</span>
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          selectedCategory === category.name
                            ? "bg-white/20 text-white"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Tag size={18} />
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1.5 text-sm bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-colors border border-stone-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory !== "All" || searchQuery) && (
                <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm font-medium text-amber-800 mb-2">
                    Active Filters:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory !== "All" && (
                      <span className="px-2 py-1 bg-white text-amber-700 text-xs rounded-full border border-amber-300">
                        Category: {selectedCategory}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="px-2 py-1 bg-white text-amber-700 text-xs rounded-full border border-amber-300">
                        Search: &quot;{searchQuery}&quot;
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Results Count */}
              <div className="mb-6 p-3 bg-stone-50 rounded-xl">
                <p className="text-sm text-stone-700">
                  Showing{" "}
                  <span className="font-bold">{filteredPosts.length}</span> of{" "}
                  <span className="font-bold">{blogPosts.length}</span> articles
                </p>
              </div>

              {/* Newsletter Signup */}
              <div className="p-4 bg-gradient-to-r from-stone-50 to-amber-50 rounded-xl border border-stone-200">
                <h3 className="font-bold text-stone-800 mb-2">Stay Updated</h3>
                <p className="text-sm text-stone-600 mb-3">
                  Get the latest kids fashion tips & new arrivals delivered to your inbox
                </p>
                <form className="space-y-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors font-medium"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
                    <div className="h-48 bg-stone-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-stone-200 rounded mb-2"></div>
                    <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
            {/* Results Summary */}
            {(selectedCategory !== "All" || searchQuery) && (
              <div className="mb-6 p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-700">
                      Filtered results for{" "}
                      {selectedCategory !== "All" && (
                        <span className="font-medium text-stone-800">
                          &quot;{selectedCategory}&quot;{" "}
                        </span>
                      )}
                      {searchQuery && (
                        <>
                          {selectedCategory !== "All" && "and "}
                          <span className="font-medium text-stone-800">
                            &quot;{searchQuery}&quot;
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-sm text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear filters
                  </button>
                </div>
              </div>
            )}

            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-stone-800">
                    Featured Articles
                    {selectedCategory !== "All" && (
                      <span className="text-stone-600 text-lg ml-2">
                        in {selectedCategory}
                      </span>
                    )}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} featured={true} />
                  ))}
                </div>
              </div>
            )}

            {/* All Filtered Posts */}
            {filteredPosts.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-stone-800">
                    {selectedCategory !== "All" ? selectedCategory : "All"}{" "}
                    Articles
                    <span className="text-stone-600 text-lg ml-2">
                      ({filteredPosts.length})
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </>
            ) : (
              // No results message
              <div className="text-center py-16">
                <div className="text-6xl mb-4 text-stone-300">🌸</div>
                <h3 className="text-2xl font-bold text-stone-800 mb-2">
                  No articles found
                </h3>
                <p className="text-stone-600 mb-6">
                  {searchQuery
                    ? `No articles found matching &quot;${searchQuery}&quot;`
                    : `No articles found in &quot;${selectedCategory}&quot;`}
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-colors font-medium"
                >
                  <X size={18} />
                  Clear filters and show all articles
                </button>
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}