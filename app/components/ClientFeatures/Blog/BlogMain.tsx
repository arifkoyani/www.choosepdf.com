"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Calendar, Tag, ChevronLeft, ChevronRight, Mail, TrendingUp, Clock } from "lucide-react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publishDate: string;
  slug: string;
  thumbnail: string;
}

const BlogMain = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;

  // Mock blog data
  const allBlogPosts: BlogPost[] = [
    {
      id: "1",
      title: "How to Compress PDF Easily",
      description: "Learn step-by-step how to reduce PDF size without losing quality. Perfect for sharing large documents.",
      category: "Compress PDF",
      tags: ["Compress", "PDF", "Tips", "Guide"],
      publishDate: "2024-01-15",
      slug: "compress-pdf",
      thumbnail: "https://images.unsplash.com/photo-1614027164689-a18d3de8b893?w=400&h=250&fit=crop",
    },
    {
      id: "2",
      title: "Complete Guide to Merging PDFs",
      description: "Combine multiple PDF files into one document effortlessly. Follow our simple tutorial.",
      category: "Merge PDF",
      tags: ["Merge", "PDF", "Tutorial"],
      publishDate: "2024-01-20",
      slug: "merge-pdf",
      thumbnail: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=400&h=250&fit=crop",
    },
    {
      id: "3",
      title: "Convert Word to PDF: Best Practices",
      description: "Transform your Word documents to PDF format while maintaining formatting and quality.",
      category: "Convert to PDF",
      tags: ["Convert", "Word", "PDF", "Guide"],
      publishDate: "2024-01-25",
      slug: "word-to-pdf",
      thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=250&fit=crop",
    },
    {
      id: "4",
      title: "Securing PDFs with Passwords",
      description: "Protect sensitive documents by adding strong passwords to your PDF files.",
      category: "PDF Security",
      tags: ["Security", "Password", "Protect"],
      publishDate: "2024-02-01",
      slug: "password-protect-pdf",
      thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop",
    },
    {
      id: "5",
      title: "Split PDF Files Like a Pro",
      description: "Divide large PDF documents into smaller, manageable files with ease.",
      category: "Modify PDF",
      tags: ["Split", "PDF", "Tools"],
      publishDate: "2024-02-05",
      slug: "split-pdf",
      thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop",
    },
    {
      id: "6",
      title: "Excel to PDF Conversion Made Simple",
      description: "Convert your spreadsheets to PDF format while preserving all data and formatting.",
      category: "Convert to PDF",
      tags: ["Excel", "Convert", "PDF"],
      publishDate: "2024-02-10",
      slug: "excel-to-pdf",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
    },
    {
      id: "7",
      title: "Making PDFs Searchable: A Complete Guide",
      description: "Transform scanned documents into searchable PDF files using OCR technology.",
      category: "Optimize PDF",
      tags: ["Searchable", "OCR", "Optimize"],
      publishDate: "2024-02-15",
      slug: "searchable-pdf",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
    },
    {
      id: "8",
      title: "Remove Password from PDF Files",
      description: "Learn how to unlock password-protected PDF documents safely and securely.",
      category: "PDF Security",
      tags: ["Password", "Unlock", "Security"],
      publishDate: "2024-02-20",
      slug: "remove-password-pdf",
      thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop",
    },
    {
      id: "9",
      title: "JPG to PDF: Image Conversion Guide",
      description: "Convert multiple images into a single PDF document quickly and efficiently.",
      category: "Convert to PDF",
      tags: ["JPG", "Image", "Convert"],
      publishDate: "2024-02-25",
      slug: "jpg-to-pdf",
      thumbnail: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop",
    },
    {
      id: "10",
      title: "Rotate PDF Pages with AI",
      description: "Automatically detect and fix rotated pages in your PDF documents using AI technology.",
      category: "Modify PDF",
      tags: ["Rotate", "AI", "Auto-fix"],
      publishDate: "2024-03-01",
      slug: "rotate-pdf-ai",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
    },
    {
      id: "11",
      title: "PDF to Word Conversion Tips",
      description: "Convert PDF documents back to editable Word format while maintaining layout.",
      category: "Convert from PDF",
      tags: ["PDF to Word", "Convert", "Edit"],
      publishDate: "2024-03-05",
      slug: "pdf-to-word",
      thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=250&fit=crop",
    },
    {
      id: "12",
      title: "Search and Replace Text in PDFs",
      description: "Find and replace text across multiple pages in your PDF documents efficiently.",
      category: "Edit PDF",
      tags: ["Search", "Replace", "Edit"],
      publishDate: "2024-03-10",
      slug: "search-replace-pdf",
      thumbnail: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=400&h=250&fit=crop",
    },
    {
      id: "13",
      title: "Compress PDF for Email: Quick Tips",
      description: "Reduce PDF file size to make email attachments faster and easier to send.",
      category: "Compress PDF",
      tags: ["Compress", "Email", "Tips"],
      publishDate: "2024-03-15",
      slug: "compress-pdf-email",
      thumbnail: "https://images.unsplash.com/photo-1614027164689-a18d3de8b893?w=400&h=250&fit=crop",
    },
    {
      id: "14",
      title: "Merge Multiple PDFs Online",
      description: "Combine several PDF files into one document using our free online tool.",
      category: "Merge PDF",
      tags: ["Merge", "Online", "Free"],
      publishDate: "2024-03-20",
      slug: "merge-pdfs-online",
      thumbnail: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=400&h=250&fit=crop",
    },
    {
      id: "15",
      title: "PDF Compression: Quality vs Size",
      description: "Understand the balance between file size and quality when compressing PDFs.",
      category: "Compress PDF",
      tags: ["Compress", "Quality", "Size"],
      publishDate: "2024-03-25",
      slug: "pdf-compression-quality",
      thumbnail: "https://images.unsplash.com/photo-1614027164689-a18d3de8b893?w=400&h=250&fit=crop",
    },
  ];

  // Categories
  const categories = [
    "all",
    "Compress PDF",
    "Merge PDF",
    "Convert to PDF",
    "Convert from PDF",
    "PDF Security",
    "Modify PDF",
    "Optimize PDF",
    "Edit PDF",
  ];

  // Popular tags
  const popularTags = ["Compress", "Merge", "Convert", "PDF", "Tips", "Guide", "Security", "Tools"];

  // Filter and search logic
  const filteredPosts = useMemo(() => {
    return allBlogPosts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;

      const matchesTag = selectedTag === "" || post.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchQuery, selectedCategory, selectedTag]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Recent posts (last 5)
  const recentPosts = allBlogPosts.slice(0, 5);

  // Popular posts (mock - first 5)
  const popularPosts = allBlogPosts.slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 text-center">
            PDF Blog – Tips, Tricks & Guides
          </h1>
          <p className="text-lg md:text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Explore our blog for easy guides and tips on compressing, merging, converting, and securing PDFs. Find
            everything you need to master PDFs.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Search & Filter Section */}
            <div className="mb-8 space-y-4">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search blogs by keyword..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-[#ff911d] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {category === "all" ? "All Categories" : category}
                  </button>
                ))}
              </div>

              {/* Tag Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Popular Tags:</span>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(selectedTag === tag ? "" : tag);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                      selectedTag === tag
                        ? "bg-[#ff911d] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </button>
                ))}
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag("")}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Clear Tag
                  </button>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {currentPosts.length} of {filteredPosts.length} blog posts
              </p>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {currentPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full bg-white">
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/400x250?text=PDF+Blog";
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-[#ff911d] text-white text-xs font-medium rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#ff911d] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Date */}
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(post.publishDate)}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? "bg-[#ff911d] hover:bg-[#e67e0a]" : ""}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            {/* Recent Posts */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#ff911d]" />
                Recent Posts
              </h3>
              <ul className="space-y-3">
                {recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block hover:text-[#ff911d] transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(post.publishDate)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Popular Posts */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#ff911d]" />
                Popular Posts
              </h3>
              <ul className="space-y-3">
                {popularPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block hover:text-[#ff911d] transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(post.publishDate)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Categories */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <ul className="space-y-2">
                {categories.slice(1).map((category) => (
                  <li key={category}>
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category
                          ? "bg-[#ff911d] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Newsletter CTA */}
            <Card className="p-6 bg-gradient-to-br from-[#ff911d] to-[#e67e0a] text-white">
              <Mail className="w-8 h-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-sm mb-4 opacity-90">
                Subscribe to our newsletter for the latest PDF tips and guides.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button className="w-full bg-white text-[#ff911d] hover:bg-gray-100">
                  Subscribe
                </Button>
              </div>
            </Card>

            {/* Explore Tools CTA */}
            <Card className="p-6 bg-white border-2 border-[#ff911d]">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore PDF Tools</h3>
              <p className="text-sm text-gray-600 mb-4">
                Try our free PDF tools to compress, merge, convert, and more.
              </p>
              <Link href="/">
                <Button className="w-full bg-[#ff911d] hover:bg-[#e67e0a] text-white">
                  View All Tools
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer CTA Section */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Need More Help with PDFs?</h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Browse our complete collection of PDF tools and guides to master all your document needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/compress-pdf">
                <Button variant="outline" className="border-[#ff911d] text-[#ff911d] hover:bg-[#fff5f0]">
                  Compress PDF
                </Button>
              </Link>
              <Link href="/merge-any-to-pdf">
                <Button variant="outline" className="border-[#ff911d] text-[#ff911d] hover:bg-[#fff5f0]">
                  Merge PDF
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-[#ff911d] hover:bg-[#e67e0a] text-white">
                  View All Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogMain;

