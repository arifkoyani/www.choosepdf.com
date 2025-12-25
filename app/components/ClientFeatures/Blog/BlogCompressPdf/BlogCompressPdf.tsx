"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  User,
  Tag,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  ArrowLeft,
  ArrowRight,
  Download,
  CheckCircle,
  TrendingUp,
  Clock,
  Play,
  Lightbulb,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";

const BlogCompressPdf = () => {
  const [email, setEmail] = useState("");

  // Mock data for this blog post
  const blogPost = {
    title: "How to Compress PDF Easily",
    publishDate: "January 15, 2024",
    author: "John Doe",
    category: "Compress PDF",
    tags: ["Compress", "PDF", "Tips", "Guide", "Tools"],
    featuredImage: "https://images.unsplash.com/photo-1614027164689-a18d3de8b893?w=1200&h=600&fit=crop",
    readingTime: "5 min read",
  };

  // Related posts
  const relatedPosts = [
    {
      id: "2",
      title: "Complete Guide to Merging PDFs",
      slug: "merge-pdf",
      thumbnail: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=300&h=200&fit=crop",
      publishDate: "January 20, 2024",
    },
    {
      id: "13",
      title: "Compress PDF for Email: Quick Tips",
      slug: "compress-pdf-email",
      thumbnail: "https://images.unsplash.com/photo-1614027164689-a18d3de8b893?w=300&h=200&fit=crop",
      publishDate: "March 15, 2024",
    },
    {
      id: "15",
      title: "PDF Compression: Quality vs Size",
      slug: "pdf-compression-quality",
      thumbnail: "https://images.unsplash.com/photo-1614027164689-a18d3de8b893?w=300&h=200&fit=crop",
      publishDate: "March 25, 2024",
    },
  ];

  // Popular posts
  const popularPosts = [
    {
      id: "4",
      title: "Securing PDFs with Passwords",
      slug: "password-protect-pdf",
      publishDate: "February 1, 2024",
    },
    {
      id: "7",
      title: "Making PDFs Searchable: A Complete Guide",
      slug: "searchable-pdf",
      publishDate: "February 15, 2024",
    },
    {
      id: "3",
      title: "Convert Word to PDF: Best Practices",
      slug: "word-to-pdf",
      publishDate: "January 25, 2024",
    },
  ];

  // Social share links
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blogPost.title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(blogPost.title)}&body=${encodeURIComponent(currentUrl)}`,
  };

  const handleShare = (platform: string) => {
    const url = shareLinks[platform as keyof typeof shareLinks];
    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      {/* Header / Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back to Blog Link */}
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#ff911d] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>

          {/* Category Badge */}
          <div className="mb-4">
            <Link
              href="/blog?category=Compress PDF"
              className="inline-block px-4 py-2 bg-[#fff5f0] text-[#ff911d] rounded-full text-sm font-medium hover:bg-[#ffe8d9] transition-colors"
            >
              {blogPost.category}
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {blogPost.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{blogPost.publishDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{blogPost.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{blogPost.readingTime}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Tag className="w-4 h-4 text-gray-500" />
            {blogPost.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/blog?tag=${tag}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-[#fff5f0] hover:text-[#ff911d] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Featured Image */}
          <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-xl overflow-hidden mb-8 bg-gray-200">
            <img
              src={blogPost.featuredImage}
              alt={blogPost.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/1200x600?text=PDF+Compression";
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Intro Paragraph */}
            <div className="bg-white rounded-xl p-6 md:p-8 mb-8 border border-gray-200">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Learn step-by-step how to reduce PDF size without losing quality. This comprehensive guide will walk you
                through various methods to compress PDF files, making them perfect for sharing via email, uploading to
                websites, or storing on your device. Whether you're a beginner or looking for advanced techniques, we've
                got you covered.
              </p>
            </div>

            {/* Main Content */}
            <article className="bg-white rounded-xl p-6 md:p-8 mb-8 border border-gray-200 prose prose-lg max-w-none">
              {/* Section 1 */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 mt-0">Why Compress PDF Files?</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  PDF compression is essential for several reasons. Large PDF files can be difficult to share, especially
                  via email where file size limits often apply. Compressed PDFs load faster on websites and take up less
                  storage space on your devices. Additionally, smaller files are easier to upload and download, saving
                  both time and bandwidth.
                </p>

                {/* Image */}
                <div className="my-6 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop"
                    alt="PDF file comparison"
                    className="w-full h-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x400?text=PDF+Comparison";
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center italic">
                    Before and after compression comparison
                  </p>
                </div>
              </section>

              {/* Section 2 - Step by Step */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Step-by-Step Guide to Compress PDF</h2>

                {/* Step 1 */}
                <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-[#ff911d]">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#ff911d] text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your PDF File</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Start by selecting the PDF file you want to compress. You can drag and drop it onto our platform
                        or click the upload button to browse your files. Make sure the file isn't password-protected or
                        corrupted.
                      </p>
                      <div className="mt-4 rounded-lg overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=300&fit=crop"
                          alt="Upload PDF file"
                          className="w-full h-auto"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x300?text=Upload+PDF";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-[#ff911d]">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#ff911d] text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Compression Level</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        Our tool offers three compression levels to choose from:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                        <li>
                          <strong>Low Compression:</strong> Maintains highest quality, reduces size by 20-30%
                        </li>
                        <li>
                          <strong>Medium Compression:</strong> Balanced quality and size, reduces by 40-50%
                        </li>
                        <li>
                          <strong>High Compression:</strong> Maximum size reduction, reduces by 60-70%
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-[#ff911d]">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#ff911d] text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Process and Download</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Click the "Compress PDF" button and wait for the processing to complete. This usually takes only
                        a few seconds. Once done, you can preview the compressed file and download it to your device.
                        The original file quality is preserved while significantly reducing the file size.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Embedded Video Section */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Video Tutorial</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Watch this quick video tutorial to see the PDF compression process in action:
                </p>
                <div className="relative w-full h-0 pb-[56.25%] bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="How to Compress PDF Easily - Video Tutorial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Step-by-step video guide for compressing PDF files
                </p>
              </section>

              {/* Tips Section */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Pro Tips for Best Results</h2>

                {/* Tip 1 */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Optimize Images First</h4>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        If your PDF contains many images, consider optimizing them before compression. This can lead to
                        better compression ratios while maintaining visual quality.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tip 2 */}
                <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Remove Unnecessary Elements</h4>
                      <p className="text-green-800 text-sm leading-relaxed">
                        Delete any unused pages, annotations, or embedded fonts that aren't essential. This can
                        significantly reduce file size without affecting the core content.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tip 3 */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-2">Test Different Compression Levels</h4>
                      <p className="text-yellow-800 text-sm leading-relaxed">
                        Experiment with different compression settings to find the perfect balance between file size and
                        quality for your specific needs. What works for one document may not work for another.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Additional Content Section */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Compression Techniques</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For power users, there are several advanced techniques to achieve even better compression results:
                </p>

                <div className="my-6 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop"
                    alt="Advanced compression settings"
                    className="w-full h-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x400?text=Compression+Settings";
                    }}
                  />
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Font Subsetting</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Font subsetting involves including only the characters actually used in your PDF, rather than the
                  entire font file. This technique can reduce file size by up to 50% for documents with custom fonts.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Image Downsampling</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Downsampling reduces the resolution of images in your PDF. For screen viewing, 150-200 DPI is usually
                  sufficient, while print documents may need 300 DPI. This can dramatically reduce file size.
                </p>
              </section>

              {/* Conclusion */}
              <section className="mb-8 bg-gradient-to-r from-[#fff5f0] to-[#ffe8d9] p-6 rounded-lg border border-[#ff911d]">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Conclusion</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Compressing PDF files doesn't have to be complicated. With the right tools and techniques, you can
                  significantly reduce file sizes while maintaining quality. Remember to choose the appropriate
                  compression level based on your needs and always test the compressed file to ensure it meets your
                  requirements.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Ready to compress your PDF?{" "}
                  <Link href="/compress-pdf" className="text-[#ff911d] font-semibold hover:underline">
                    Try our free PDF compression tool
                  </Link>{" "}
                  and see the difference for yourself!
                </p>
              </section>
            </article>

            {/* Share Section */}
            <Card className="p-6 mb-8 bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-[#ff911d]" />
                    Share this Article
                  </h3>
                  <p className="text-sm text-gray-600">Help others discover this helpful guide</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("facebook")}
                    className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("twitter")}
                    className="flex items-center gap-2 border-blue-400 text-blue-500 hover:bg-blue-50"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("linkedin")}
                    className="flex items-center gap-2 border-blue-700 text-blue-700 hover:bg-blue-50"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("email")}
                    className="flex items-center gap-2 border-gray-400 text-gray-600 hover:bg-gray-50"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                </div>
              </div>
            </Card>

            {/* Call-to-Action: PDF Tools */}
            <Card className="p-8 mb-8 bg-gradient-to-br from-[#ff911d] to-[#e67e0a] text-white">
              <div className="text-center">
                <Download className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3">Try Our Free PDF Compression Tool</h3>
                <p className="text-lg mb-6 opacity-90">
                  Compress your PDF files instantly with our easy-to-use online tool. No registration required!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/compress-pdf">
                    <Button size="lg" className="bg-white text-[#ff911d] hover:bg-gray-100">
                      Compress PDF Now
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      View All Tools
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Previous/Next Navigation */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <Card className="flex-1 p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
                <div className="flex items-center gap-3 text-gray-600 mb-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Previous Article</span>
                </div>
                <Link href="/blog/merge-pdf" className="text-gray-900 font-semibold hover:text-[#ff911d] transition-colors">
                  Complete Guide to Merging PDFs
                </Link>
              </Card>
              <Card className="flex-1 p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
                <div className="flex items-center gap-3 text-gray-600 mb-2 justify-end">
                  <span className="text-sm font-medium">Next Article</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
                <Link
                  href="/blog/compress-pdf-email"
                  className="text-gray-900 font-semibold hover:text-[#ff911d] transition-colors text-right block"
                >
                  Compress PDF for Email: Quick Tips
                </Link>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            {/* Related Posts */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#ff911d]" />
                Related Posts
              </h3>
              <div className="space-y-4">
                {relatedPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/80x80?text=Blog";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#ff911d] transition-colors">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{post.publishDate}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Popular Posts */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#ff911d]" />
                Popular Posts
              </h3>
              <ul className="space-y-3">
                {popularPosts.map((post, index) => (
                  <li key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-start gap-3 group hover:text-[#ff911d] transition-colors"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-[#fff5f0] text-[#ff911d] rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#ff911d] transition-colors">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{post.publishDate}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Newsletter Signup */}
            <Card className="p-6 bg-gradient-to-br from-[#ff911d] to-[#e67e0a] text-white">
              <Mail className="w-8 h-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-sm mb-4 opacity-90">
                Subscribe to our newsletter for the latest PDF tips, tricks, and guides delivered to your inbox.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button className="w-full bg-white text-[#ff911d] hover:bg-gray-100">
                  Subscribe Now
                </Button>
              </div>
            </Card>

            {/* Categories */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <ul className="space-y-2">
                {["Compress PDF", "Merge PDF", "Convert to PDF", "PDF Security", "Modify PDF"].map((category) => (
                  <li key={category}>
                    <Link
                      href={`/blog?category=${category}`}
                      className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-[#fff5f0] hover:text-[#ff911d] transition-colors group"
                    >
                      <span>{category}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tags & Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags & Categories</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-gray-600 font-medium">Tags:</span>
              {blogPost.tags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/blog?tag=${tag}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-[#fff5f0] hover:text-[#ff911d] transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 font-medium">Category:</span>
              <Link
                href={`/blog?category=${blogPost.category}`}
                className="px-3 py-1 bg-[#fff5f0] text-[#ff911d] rounded-md text-sm hover:bg-[#ffe8d9] transition-colors font-medium"
              >
                {blogPost.category}
              </Link>
            </div>
          </div>

          {/* Comment Section Placeholder */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">
                Have questions or want to share your experience? Leave a comment below!
              </p>
              <Button className="bg-[#ff911d] hover:bg-[#e67e0a] text-white">
                Add a Comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCompressPdf;
