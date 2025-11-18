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
			{ label: "CHAT TO PDF", href: "/chat-with-pdf" },
			{ label: "AI SUMMARIZER", href: "/ai-summarizer" },
			{ label: "COMPRESS PDF", href: "/compress-pdf" },
			// "Convert PDF" handled separately for dropdown
			{ label: "PDF Lab", href: "/PDF Lab" },
		],
		[]
	)

	const convertToPdfItems = useMemo(
		() => [
			{ label: "EXCEL to PDF", href: "/convert/excel-to-pdf" },
			{ label: "HTML to PDF", href: "/convert/html-to-pdf" },
			{ label: "EMAIL to PDF", href: "/convert/email-to-pdf" },
			{ label: "ZIP to PDF", href: "/convert/zip-to-pdf" },
			{ label: "XLSX to PDF", href: "/convert/xlsx-to-pdf" },
			{ label: "DOCX to PDF", href: "/convert/docx-to-pdf" },
			{ label: "MERGE ANY to PDF", href: "/convert/merge-any-to-pdf" },
			{ label: "PDFS to PDF", href: "/convert/pdfs-to-pdf" },
			{ label: "CSV to PDF", href: "/convert/csv-to-pdf" },
			{ label: "JPG to PDF", href: "/convert/jpg-to-pdf" },
			{ label: "TIFF to PDF", href: "/convert/tiff-to-pdf" },
			{ label: "PNG to PDF", href: "/convert/png-to-pdf" },
			{ label: "TXT to PDF", href: "/convert/txt-to-pdf" },
			{ label: "RTF to PDF", href: "/convert/rtf-to-pdf" },
			{ label: "DOC to PDF", href: "/convert/doc-to-pdf" },
			{ label: "URL to PDF", href: "/convert/url-to-pdf" },
		],
		[]
	)

	const convertFromPdfItems = useMemo(
		() => [
			{ label: "PDF to XML", href: "/convert/pdf-to-xml" },
			{ label: "PDF to Text Classifier", href: "/convert/pdf-to-text-classifier" },
			{ label: "PDF to JSON by AI", href: "/convert/pdf-to-json-ai" },
			{ label: "PDF to JSON", href: "/convert/pdf-to-json" },
			{ label: "PDF to HTML", href: "/convert/pdf-to-html" },
			{ label: "PDF to PNG", href: "/convert/pdf-to-png" },
			{ label: "PDF to TIFF", href: "/convert/pdf-to-tiff" },
			{ label: "PDF to JPG", href: "/convert/pdf-to-jpg" },
			{ label: "PDF to WebP", href: "/convert/pdf-to-webp" },
			{ label: "PDF to XLSX", href: "/convert/pdf-to-xlsx" },
			{ label: "PDF to XLS", href: "/convert/pdf-to-xls" },
		],
		[]
	)

	

	const optimizePdfItems = useMemo(
		() => [
			{ label: "Searchable PDF", href: "/optimize/searchable-pdf" },
			{ label: "Not Searchable PDF", href: "/optimize/not-searchable-pdf" },
			{ label: "Compress PDF", href: "/compress-pdf" },
		],
		[]
	)


	const modifyPdfItems = useMemo(
		() => [
			{ label: "MERGE ANY to PDF", href: "/convert/merge-any-to-pdf" },
			{ label: "Scan to PDF", href: "/organize/scan-to-pdf" },
			{ label: "PDFS to PDF", href: "/convert/pdfs-to-pdf" },
			{ label: "Split PDF", href: "/modify/split-pdf" },
			{ label: "Split PDF by Text", href: "/modify/split-pdf-by-text" },
			{ label: "Rotate Pages using AI", href: "/modify/rotate-pages-ai" },
			{ label: "Rotate Selected Pages", href: "/modify/rotate-selected-pages" },
			{ label: "PDF Delete Pages", href: "/modify/delete-pages" }
		],
		[]
	)

	const editPdfLabItems = useMemo(
		() => [
			{ label: "Search Text & Delete", href: "/edit/search-text-delete" },
			{ label: "Search Text & Replace", href: "/edit/search-text-replace" },
			{ label: "Search Text Replace Image", href: "/edit/search-text-replace-image" },
		],
		[]
	)

	const pdfSecurityLabItems = useMemo(
		() => [
			{ label: "Add Password to PDF", href: "/security/add-password" },
			{ label: "Remove Password from PDF", href: "/security/remove-password" },
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
		<nav className="w-full border-b border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white">
			<div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
				<div className="flex w-full h-20 gap-10 items-center justify-between">
					{/* Left: Logo */}
					<div className="flex items-center">
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
					<div className="hidden md:flex flex-1 items-center justify-center mx-10 whitespace-nowrap">
						<ul className="flex items-center gap-12 w-full justif-between">
							{navItems.slice(0, 3).map((item) => {
								const isActive = pathname === item.href
								return (
									<li key={item.label}>
										<Link
											href={item.href}
											className={`text-lg font-medium cursor-pointer leading-tight transition-colors ${
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
									className={`flex items-center gap-1  text-lg font-medium cursor-pointer transition-colors ${
										pathname?.startsWith("/convert") 
											? "text-[#ff911d]" 
											: isConvertOpen 
											? "text-[#ff911d]" 
											: "text-gray-700 hover:text-[#ff911d]"
									}`}
									aria-haspopup="menu"
									aria-expanded={isConvertOpen}
								>
									CONVERT PDF
									{isConvertOpen ? <ChevronUp className="h-6 w-6" color="#f26924" strokeWidth={1.5} absoluteStrokeWidth  /> : <ChevronDown className="h-6 w-6" color="#f26924" strokeWidth={1.5} absoluteStrokeWidth  />}
								</button>

								{/* Hover window (mega dropdown) */}
								<div
									onMouseEnter={openWithDelay}
									onMouseLeave={closeWithDelay}
									className={`absolute left-1/2 z-30 mt-8 w-[min(75vw,450px)] -translate-x-1/2 rounded-xl py-6 px-4 shadow-xl border border-gray-200 bg-white ${
										isConvertOpen ? "block" : "hidden"
									}`}
									role="menu"
								>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<section>
											<h3 className="mb-1 text-xs font-semibold leading-tight cursor-pointer uppercase tracking-wider text-gray-500">
												Convert to PDF
											</h3>
											<ul className="space-y-0">
												{convertToPdfItems.map((item) => (
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
											<h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
												Convert from PDF
											</h3>
											<ul className="space-y-0">
												{convertFromPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className="flex items-center justify-between rounded-md px-2 py-1  font-medium text-sm leading-tight cursor-pointer text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
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
									className={`flex items-center gap-1 text-lg font-medium cursor-pointer transition-colors ${
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
									{isAllToolsOpen ? <ChevronUp className="h-6 w-6" color="#f26924" strokeWidth={1.5} absoluteStrokeWidth /> : <ChevronDown className="h-6 w-6" color="#f26924" strokeWidth={1.5} absoluteStrokeWidth />}
								</button>

								{/* Hover window (mega dropdown) */}
								<div
									onMouseEnter={openAllToolsWithDelay}
									onMouseLeave={closeAllToolsWithDelay}
									className={`fixed left-1/2 z-30 w-[min(95vw,1200px)] -translate-x-1/2 rounded-xl py-6 px-4 shadow-xl border border-gray-200 bg-white ${
										isAllToolsOpen ? "block" : "hidden"
									}`}
									style={{ top: '5.5rem' }}
									role="menu"
								>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
									pathname?.startsWith("/convert") 
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
											<h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
												Convert to PDF
											</h3>
											<ul className="space-y-0">
												{convertToPdfItems.map((item) => (
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
														item.href !== "/convert/merge-any-to-pdf" && 
														item.href !== "/convert/pdfs-to-pdf"
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
					</div>
				</div>
			</div>
		</nav>
	)
}
