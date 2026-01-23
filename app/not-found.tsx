"use client"

import Link from "next/link"
import { Home, Search, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NotFound() {
	const router = useRouter()

	const handleRefresh = () => {
		router.refresh()
		window.location.reload()
	}
	return (
		<div className="min-h-screen bg-[#f4f4f5] flex flex-col items-center justify-center px-4">
			<div className="text-center max-w-2xl mx-auto">
				{/* 404 Number */}
				<div className="mb-8">
					<h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff550d] to-[#ff911d] leading-none">
						Sorry!
					</h1>
				</div>

				{/* Error Message */}
				<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
					Page Not Reachable
				</h2>
				<p className="text-lg md:text-xl text-gray-600 mb-4 max-w-xl mx-auto">
					Oops! The page you're looking for doesn't reachable or has been moved.
                     check your internet connection and Please try again 
				</p>
				<button
					onClick={handleRefresh}
					className="inline-flex cursor-pointer items-center justify-center gap-2 px-6 py-3  text-black font-semibold rounded-xl border-2 border-gray-300 hover:border-[#ff911d] hover:bg-[#fff5f0] transition-all duration-300 mb-8"
				>
					<RefreshCw className="h-5 w-5" />
					<span>Try Again</span>
				</button>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<Link
						href="/"
						className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white font-semibold rounded-xl hover:from-[#e6490b] hover:to-[#e6820a] transition-all duration-300 shadow-lg hover:shadow-xl"
					>
						<Home className="h-5 w-5" />
						<span>Go to Home</span>
					</Link>
					<Link
						href="/blog"
						className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-[#ff911d] hover:bg-[#fff5f0] transition-all duration-300"
					>
						<Search className="h-5 w-5" />
						<span>Browse Tools</span>
					</Link>
				</div>

				{/* Helpful Links */}
				<div className="mt-12 pt-8 border-t border-gray-200">
					<p className="text-sm text-gray-500 mb-4">Popular Pages:</p>
					<div className="flex flex-wrap gap-3 justify-center">
						<Link
							href="/merge-pdfs"
							className="text-sm text-[#ff550d] hover:text-[#ff911d] hover:underline transition-colors"
						>
							Merge PDFs
						</Link>
						<Link
							href="/compress-pdf"
							className="text-sm text-[#ff550d] hover:text-[#ff911d] hover:underline transition-colors"
						>
							Compress PDF
						</Link>
						<Link
							href="/pdf-to-jpg"
							className="text-sm text-[#ff550d] hover:text-[#ff911d] hover:underline transition-colors"
						>
							PDF to JPG
						</Link>
						<Link
							href="/word-to-pdf"
							className="text-sm text-[#ff550d] hover:text-[#ff911d] hover:underline transition-colors"
						>
							Word to PDF
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

