import Image from 'next/image'
import Link from 'next/link'

export default function LandingPageBlogCards() {
	return (
		<section className="max-h-[800px] bg-neutral-50 py-12 sm:py-16 lg:py-20 overflow-hidden w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">Latest from Our Blog</h2>
					<p className="text-lg text-neutral-600">Tips, tutorials, and insights about PDF tools</p>
				</div>
				
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* Blog Card 1 */}
					<article className="tool-card-hover bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
						<Image 
							src="/blogThumbnail/PDF Conversion.png" 
							alt="PDF Compression Guide" 
							width={400}
							height={250}
							className="w-full h-48 object-cover"
						/>
						<div className="p-5">
							<span className="inline-block px-3 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full mb-3">Tutorial</span>
							<h3 className="text-lg font-semibold text-neutral-900 mb-2">How to Compress PDF Files Without Losing Quality</h3>
							<p className="text-sm text-neutral-600 mb-4">Learn the best techniques to reduce PDF file size while maintaining document quality.</p>
							<Link href="/blog/compress-pdf-guide" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors duration-150">Read More →</Link>
						</div>
					</article>
					
					{/* Blog Card 2 */}
					<article className="tool-card-hover bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
						<Image 
							src="/blogThumbnail/PDF Conversion.png" 
							alt="PDF Security" 
							width={400}
							height={250}
							className="w-full h-48 object-cover"
						/>
						<div className="p-5">
							<span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full mb-3">Security</span>
							<h3 className="text-lg font-semibold text-neutral-900 mb-2">Protecting Your PDFs: Password Best Practices</h3>
							<p className="text-sm text-neutral-600 mb-4">Essential tips for securing sensitive PDF documents with strong passwords.</p>
							<Link href="/blog/pdf-security-guide" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors duration-150">Read More →</Link>
						</div>
					</article>
					
					{/* Blog Card 3 */}
					<article className="tool-card-hover bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
						<Image 
							src="/blogThumbnail/PDF Conversion.png" 
							alt="AI PDF Tools" 
							width={400}
							height={250}
							className="w-full h-48 object-cover"
						/>
						<div className="p-5">
							<span className="inline-block px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full mb-3">AI</span>
							<h3 className="text-lg font-semibold text-neutral-900 mb-2">AI-Powered PDF Tools: The Future is Here</h3>
							<p className="text-sm text-neutral-600 mb-4">Discover how artificial intelligence is revolutionizing PDF document processing.</p>
							<Link href="/blog/ai-pdf-tools" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors duration-150">Read More →</Link>
						</div>
					</article>
					
					{/* Blog Card 4 */}
					<article className="tool-card-hover bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
						<Image 
							src="/blogThumbnail/PDF Conversion.png" 
							alt="PDF Conversion" 
							width={400}
							height={250}
							className="w-full h-48 object-cover"
						/>
						<div className="p-5">
							<span className="inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full mb-3">Guide</span>
							<h3 className="text-lg font-semibold text-neutral-900 mb-2">Complete Guide to PDF File Conversion</h3>
							<p className="text-sm text-neutral-600 mb-4">Everything you need to know about converting files to and from PDF format.</p>
							<Link href="/blog/pdf-conversion-guide" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors duration-150">Read More →</Link>
						</div>
					</article>
				</div>
				
				<div className="mt-12 text-center">
					<Link href="/blog" className="inline-block px-8 py-3 bg-white hover:bg-neutral-50 text-neutral-900 font-medium rounded-xl border-2 border-neutral-200 hover:border-neutral-300 transition-all duration-150">
						View All Articles
					</Link>
				</div>
			</div>
		</section>
	)
}
