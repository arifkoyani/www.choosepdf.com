"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from 'lucide-react'
import { ChevronUp } from 'lucide-react'


function classNames(...classes) {
	return classes.filter(Boolean).join(" ")
}

export default function Navbar() {
	const pathname = usePathname()
	const [isConvertOpen, setIsConvertOpen] = useState(false)
	const [isAllToolsOpen, setIsAllToolsOpen] = useState(false)
	const hoverTimeoutRef = useRef(null)
	const allToolsHoverTimeoutRef = useRef(null)

	const navItems = useMemo(
		() => [
			{ label: "CHAT TO PDF", href: "/chat-to-pdf-using-ai" },
			{ label: "MERGE PDF", href: "/merge-any-to-pdf" },
			{ label: "AI INVOICE PARSER", href: "/ai-invoice-parser" },
			// "Convert PDF" handled separately for dropdown
			{ label: "PDF Lab", href: "/PDF Lab" },
			{ label: "Blog", href: "/blog" },
		],
		[]
	)

	const convertToPdfItems = useMemo(
		() => [
			{ label: "EXCEL to PDF", href: "/excel-to-pdf" },
			{ label: "HTML to PDF", href: "/html-to-pdf" },
			{ label: "EMAIL to PDF", href: "/email-to-pdf" },
			{ label: "ZIP to PDF", href: "/zip-to-pdf" },
			{ label: "XLSX to PDF", href: "/xlsx-to-pdf" },
			{ label: "Word to PDF", href: "/docx-to-pdf" },
			{ label: "MERGE ANY to PDF", href: "/merge-any-to-pdf" },
			{ label: "PDFS to PDF", href: "/merge-pdfs" },
			{ label: "CSV to PDF", href: "/csv-to-pdf" },
			{ label: "JPG to PDF", href: "/jpg-to-pdf" },
			{ label: "TIFF to PDF", href: "/tiff-to-pdf" },
			{ label: "PNG to PDF", href: "/png-to-pdf" },
			{ label: "TXT to PDF", href: "/txt-to-pdf" },
			{ label: "RTF to PDF", href: "/rtf-to-pdf" },
			{ label: "DOC to PDF", href: "/doc-to-pdf" },
			{ label: "URL to PDF", href: "/url-to-pdf" },
		],
		[]
	)

	const convertFromPdfItems = useMemo(
		() => [
			{ label: "PDF to HTML", href: "/pdf-to-html" },
			{ label: "PDF to JPG", href: "/pdf-to-jpg" },
			{ label: "PDF to JSON", href: "/pdf-to-json" },
			{ label: "PDF to JSON by AI", href: "/pdf-to-json-by-ai" },
			{ label: "PDF to PNG", href: "/pdf-to-png" },
			{ label: "PDF to Text", href: "/pdf-to-text" },
			{ label: "PDF to TIFF", href: "/pdf-to-tiff" },
			{ label: "PDF to WebP", href: "/pdf-to-webp" },
			{ label: "PDF to XLS", href: "/pdf-to-xls" },
			{ label: "PDF to XLSX", href: "/pdf-to-xlsx" },
			{ label: "PDF to XML", href: "/pdf-to-xml" },
		],
		[]
	)

	

	const optimizePdfItems = useMemo(
		() => [
			{ label: "Searchable PDF", href: "/searchable-pdf" },
			{ label: "Not Searchable PDF", href: "/make-pdf-unsearchable" },
			{ label: "Compress PDF", href: "/compress-pdf" },
		],
		[]
	)


	const modifyPdfItems = useMemo(
		() => [
			{ label: "MERGE ANY to PDF", href: "/merge-any-to-pdf" },
			{ label: "Scan to PDF", href: "/scan-to-pdf" },
			{ label: "PDFS to PDF", href: "/merge-pdfs" },
			{ label: "Split PDF", href: "/split-pdf" },
			{ label: "Split PDF by Text", href: "/split-pdf-by-text" },
			{ label: "Rotate Pages using AI", href: "/rotate-pages-ai" },
			{ label: "Rotate Selected Pages", href: "/rotate-selected-pages" },
			{ label: "PDF Delete Pages", href: "/delete-pages" }
		],
		[]
	)

	const editPdfLabItems = useMemo(
		() => [
			{ label: "Search Text & Delete", href: "/search-text-delete-in-pdf" },
			{ label: "Search Text & Replace", href: "/search-text-replace" },
			{ label: "Search Text Replace Image", href: "/search-text-replace-image" },
		],
		[]
	)

	const pdfSecurityLabItems = useMemo(
		() => [
			{ label: "Add Password to PDF", href: "/add-password" },
			{ label: "Remove Password from PDF", href: "/remove-password" },
		],
		[]
	)

	// Delayed hover handlers to prevent flicker when moving to panel
	const openWithDelay = useCallback(() => {
		if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
		hoverTimeoutRef.current = setTimeout(() => setIsConvertOpen(true), 80)
	}, [])
	const closeWithDelay = useCallback(() => {
		if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
		hoverTimeoutRef.current = setTimeout(() => setIsConvertOpen(false), 180)
	}, [])

	// Delayed hover handlers for All Tools dropdown
	const openAllToolsWithDelay = useCallback(() => {
		if (allToolsHoverTimeoutRef.current) clearTimeout(allToolsHoverTimeoutRef.current)
		allToolsHoverTimeoutRef.current = setTimeout(() => setIsAllToolsOpen(true), 80)
	}, [])
	const closeAllToolsWithDelay = useCallback(() => {
		if (allToolsHoverTimeoutRef.current) clearTimeout(allToolsHoverTimeoutRef.current)
		allToolsHoverTimeoutRef.current = setTimeout(() => setIsAllToolsOpen(false), 180)
	}, [])

	return (
		<nav className="w-full border-b border-gray-200 bg-white backdrop-blur supports-[backdrop-filter]:bg-white relative z-40">
			<div className="mx-auto w-full  px-4  lg:px-8">
				<div className="flex w-full h-20 gap-4 md:gap-6 lg:gap-10 items-center justify-between">
					{/* Left: Logo */}
					<div className="flex items-center flex-shrink-0 bg-white">
						<Link href="/" className="flex items-center gap-2">
							<span className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white bg-primary-600">
								P
							</span>
							<span className="text-base font-semibold tracking-tight text-gray-900">
								ChoosePDF
							</span>
						</Link>
					</div>

					{/* Center: Navigation */}
					<div className="hidden md:flex  flex-1 items-center justify-center mx-2 md:mx-4 lg:mx-10 whitespace-nowrap min-w-0 bg-white">
						<ul className="flex items-center gap-3 md:gap-6 lg:gap-12 justify-start w-full">
							{navItems.slice(0, 3).map((item) => {
								const isActive = pathname === item.href
								return (
									<li key={item.label}>
										<Link
											href={item.href}
											className={`text-sm md:text-base lg:text-lg font-medium cursor-pointer leading-tight transition-colors ${
												isActive ? "text-[#ff911d]" : "text-gray-700 hover:text-[#ff911d]"
											}`}
										>
											{item.label}
										</Link>
									</li>
								)
							})}

							{/* Convert PDF with hover panel */}
							<li
								className="relative"
								onMouseEnter={openWithDelay}
								onMouseLeave={closeWithDelay}
							>
								<button
									type="button"
									className={`flex items-center  gap-1 text-sm md:text-base lg:text-lg font-medium cursor-pointer transition-colors ${
										(convertToPdfItems.some(item => pathname === item.href) || convertFromPdfItems.some(item => pathname === item.href))
											? "text-[#ff911d]" 
											: isConvertOpen 
											? "text-[#ff911d]" 
											: "text-gray-700 hover:text-[#ff911d]"
									}`}
									aria-haspopup="menu"
									aria-expanded={isConvertOpen}
								>
									CONVERT PDF
									{isConvertOpen ? <ChevronUp className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" color="#f26924" strokeWidth={1.5} absoluteStrokeWidth  /> : <ChevronDown className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" color="#f26924" strokeWidth={1.5} absoluteStrokeWidth  />}
								</button>

								{/* Hover window (mega dropdown) */}
								<div
									onMouseEnter={openWithDelay}
									onMouseLeave={closeWithDelay}
									className={`absolute left-1/2 z-50 mt-8 w-[min(90vw,450px)] md:w-[min(85vw,450px)] lg:w-[min(75vw,450px)] -translate-x-1/2 rounded-xl py-6 px-4 shadow-xl border border-gray-200 bg-white ${
										isConvertOpen ? "block" : "hidden"
									}`}
									role="menu"
								>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-white pl-10">
										<section>
											<h3 className="mb-2 text-xs font-semibold leading-tight text-left uppercase tracking-wider text-gray-500">
												Convert to PDF
											</h3>
											<ul className="space-y-0">
												{convertToPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="flex items-center text-sm font-medium justify-start rounded-md px-3 py-1 leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
										</section>
										<section>
											<h3 className="mb-2 text-xs font-semibold leading-tight text-left uppercase tracking-wider text-gray-500">
												Convert from PDF
											</h3>
											<ul className="space-y-0">
												{convertFromPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="flex items-center justify-start rounded-md px-3 py-1 font-medium text-sm leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
										</section>
									</div>
								</div>
							</li>

							{/* All PDF TOOLS with hover panel */}
							<li
								className="relative"
								onMouseEnter={openAllToolsWithDelay}
								onMouseLeave={closeAllToolsWithDelay}
							>
								<button
									type="button"
									className={`flex items-center gap-1 text-sm md:text-base lg:text-lg font-medium cursor-pointer transition-colors ${
										pathname === navItems[3].href
											? "text-[#ff911d]"
											: isAllToolsOpen 
											? "text-[#ff911d]" 
											: "text-gray-700 hover:text-[#ff911d]"
									}`}
									aria-haspopup="menu"
									aria-expanded={isAllToolsOpen}
								>
									{navItems[3].label}
									{isAllToolsOpen ? <ChevronUp className="h-4 w-4  md:h-5 md:w-5 lg:h-6 lg:w-6" color="#f26924" strokeWidth={1.5} absoluteStrokeWidth /> : <ChevronDown className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" color="#f26924" strokeWidth={1.5} absoluteStrokeWidth />}
								</button>

								{/* Hover window (mega dropdown) */}
								<div
									onMouseEnter={openAllToolsWithDelay}
									onMouseLeave={closeAllToolsWithDelay}
									className={`fixed left-1/2 z-50 top-20   w-[min(95vw,1200px)] md:w-[min(90vw,1000px)] lg:w-[min(95vw,1200px)] -translate-x-1/2 rounded-xl py-6 px-4 shadow-xl border border-gray-200 bg-white ${
										isAllToolsOpen ? "block" : "hidden"
									}`}
									role="menu"
								>
									<div className="grid grid-cols-1   gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
										<section>
											<h3 className="mb-1 text-xs font-semibold leading-tight cursor-pointer uppercase tracking-wider text-gray-500">
												MODIFY a PDF
											</h3>
											<ul className="space-y-0">
												{modifyPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="flex items-center text-sm font-medium justify-between rounded-md px-2 py-1 leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															<span className="flex items-center gap-2">
																{item.label}
															</span>
														</Link>
													</li>
												))}
											</ul>
											<h3 className="mb-1 mt-4 text-xs font-semibold leading-tight cursor-pointer uppercase tracking-wider text-gray-500">
												PDF Security
											</h3>
											<ul className="space-y-0">
												{pdfSecurityLabItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="flex items-center text-sm font-medium justify-between rounded-md px-2 py-1 leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
										</section>
										<section>
											<h3 className="mb-1 text-xs font-semibold leading-tight cursor-pointer uppercase tracking-wider text-gray-500">
												Optimize PDF
											</h3>
											<ul className="space-y-0">
												{optimizePdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="flex items-center text-sm font-medium justify-between rounded-md px-2 py-1 leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
											<h3 className="mb-1 mt-4 text-xs font-semibold leading-tight cursor-pointer uppercase tracking-wider text-gray-500">
												Edit PDF
											</h3>
											<ul className="space-y-0">
												{editPdfLabItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="flex items-center text-sm font-medium justify-between rounded-md px-2 py-1 leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
										</section>
										<section>
											<h3 className="mb-1 text-xs font-semibold leading-tight cursor-pointer uppercase tracking-wider text-gray-500">
												Convert to PDF
											</h3>
											<ul className="space-y-0">
												{convertToPdfItems
													.filter((item) => 
														item.href !== "/convert/merge-any-to-pdf" && 
														item.href !== "/convert/pdfs-to-pdf"
													)
													.map((item) => (
														<li key={item.label}>
															<Link
																href={item.href}
																className="flex items-center text-sm font-medium justify-between rounded-md px-2 py-1 leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
															>
																{item.label}
															</Link>
														</li>
													))}
											</ul>
										</section>
										<section>
											<h3 className="mb-1 text-xs font-semibold leading-tight cursor-pointer uppercase tracking-wider text-gray-500">
												Convert from PDF
											</h3>
											<ul className="space-y-0">
												{convertFromPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="flex items-center justify-between rounded-md px-2 py-1 font-medium text-sm leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
										</section>
									</div>
								</div>
							</li>

							{/* Blog */}
							{navItems.slice(4, 5).map((item) => {
								const isActive = pathname === item.href
								return (
									<li key={item.label}>
										<Link
											href={item.href}
											className={`text-sm md:text-base lg:text-lg font-medium cursor-pointer leading-tight transition-colors ${
												isActive ? "text-[#ff911d]" : "text-gray-700 hover:text-[#ff911d]"
											}`}
										>
											{item.label}
										</Link>
									</li>
								)
							})}
						</ul>
					</div>
				</div>
			</div>

			{/* Mobile center nav (below bar) */}
			<div className="md:hidden border-t border-gray-200">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex flex-wrap items-center justify-center gap-4 py-3">
						{navItems.slice(0, 3).map((item) => {
							const isActive = pathname === item.href
							return (
								<Link
									key={item.label}
									href={item.href}
									className={`text-sm font-medium cursor-pointer transition-colors ${
										isActive ? "text-[#ff911d]" : "text-gray-700 hover:text-[#ff911d]"
									}`}
								>
									{item.label}
								</Link>
							)
						})}
						<div className="relative">
							<button
								type="button"
								onClick={() => setIsConvertOpen((v) => !v)}
								className={`flex items-center gap-1 text-sm font-medium cursor-pointer transition-colors ${
									(convertToPdfItems.some(item => pathname === item.href) || convertFromPdfItems.some(item => pathname === item.href))
										? "text-[#ff911d]" 
										: isConvertOpen 
										? "text-[#ff911d]" 
										: "text-gray-700 hover:text-[#ff911d]"
								}`}
								aria-haspopup="menu"
								aria-expanded={isConvertOpen}
							>
								Convert PDF
								{isConvertOpen ? <ChevronUp className="h-6 w-6"  color="#ff911d" strokeWidth={1} absoluteStrokeWidth  /> : <ChevronDown className="h-6 w-6"  color="#ff911d" strokeWidth={1} absoluteStrokeWidth />}
							</button>
							{isConvertOpen && (
								<div className="mt-2 w-[min(92vw,640px)] rounded-xl p-4 shadow-xl border border-gray-200 bg-white">
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<section>
											<h3 className="mb-2 text-xs font-semibold text-left uppercase tracking-wider text-gray-500">
												Convert to PDF
											</h3>
											<ul className="space-y-0">
												{convertToPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="block text-left rounded-md px-3 py-1 text-sm leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
										</section>
										<section>
											<h3 className="mb-2 text-xs font-semibold text-left uppercase tracking-wider text-gray-500">
												Convert from PDF
											</h3>
											<ul className="space-y-0">
												{convertFromPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="block text-left rounded-md px-3 py-1 text-sm leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
										</section>
									</div>
								</div>
							)}
						</div>
						<div className="relative">
							<button
								type="button"
								onClick={() => setIsAllToolsOpen((v) => !v)}
								className={`flex items-center gap-1 text-sm font-medium cursor-pointer transition-colors ${
									pathname === navItems[3].href
										? "text-[#ff911d]"
										: isAllToolsOpen 
										? "text-[#ff911d]" 
										: "text-gray-700 hover:text-[#ff911d]"
								}`}
								aria-haspopup="menu"
								aria-expanded={isAllToolsOpen}
							>
								{navItems[3].label}
								{isAllToolsOpen ? <ChevronUp className="h-6 w-6" color="#f26924" strokeWidth={1} absoluteStrokeWidth /> : <ChevronDown className="h-6 w-6" color="#f26924" strokeWidth={1} absoluteStrokeWidth />}
							</button>
							{isAllToolsOpen && (
								<div className="mt-2 w-[min(95vw,1200px)] rounded-xl p-4 shadow-xl border border-gray-200 bg-white">
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
										<section>
											<h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
												MODIFY a PDF
											</h3>
											<ul className="space-y-0">
												{modifyPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="flex items-center gap-2 rounded-md px-2 py-1 text-sm leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
											<h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
												PDF Security
											</h3>
											<ul className="space-y-0">
												{pdfSecurityLabItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="block rounded-md px-2 py-1 text-sm leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
										</section>
										<section>
											<h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
												Optimize PDF
											</h3>
											<ul className="space-y-0">
												{optimizePdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="block rounded-md px-2 py-1 text-sm leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
											<h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
												Edit PDF
											</h3>
											<ul className="space-y-0">
												{editPdfLabItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="block rounded-md px-2 py-1 text-sm leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
										</section>
										<section>
											<h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
												Convert to PDF
											</h3>
											<ul className="space-y-0">
												{convertToPdfItems
													.filter((item) => 
														item.href !== "/merge-any-to-pdf" && 
														item.href !== "/pdfs-to-pdf"
													)
													.map((item) => (
														<li key={item.label}>
															<Link
																href={item.href}
																className="block rounded-md px-2 py-1 text-sm leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
															>
																{item.label}
															</Link>
														</li>
													))}
											</ul>
										</section>
										<section>
											<h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
												Convert from PDF
											</h3>
											<ul className="space-y-0">
												{convertFromPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="block rounded-md px-2 py-1 text-sm leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
										</section>
									</div>
								</div>
							)}
						</div>
						{navItems.slice(4, 5).map((item) => {
							const isActive = pathname === item.href
							return (
								<Link
									key={item.label}
									href={item.href}
									className={`text-sm font-medium cursor-pointer transition-colors ${
										isActive ? "text-[#ff911d]" : "text-gray-700 hover:text-[#ff911d]"
									}`}
								>
									{item.label}
								</Link>
							)
						})}
					</div>
				</div>
			</div>
		</nav>
	)
}
