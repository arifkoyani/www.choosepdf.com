"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import Link from "next/link"
import { Sun } from 'lucide-react';
import { Moon } from 'lucide-react';
import { MonitorCog } from 'lucide-react';

function classNames(...classes) {
	return classes.filter(Boolean).join(" ")
}

export default function Navbar() {
	const [theme, setTheme] = useState("system")
	const [isConvertOpen, setIsConvertOpen] = useState(false)
	const [systemDark, setSystemDark] = useState(false)
	const hoverTimeoutRef = useRef(null)
    
 
    
	// Initialize theme from localStorage or system
	useEffect(() => {
		const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null
		if (stored === "light" || stored === "dark") {
			setTheme(stored)
		} else {
			setTheme("system")
		}
	}, [])

	// Track OS color scheme and update when it changes
	useEffect(() => {
		if (typeof window === "undefined") return
		const mql = window.matchMedia("(prefers-color-scheme: dark)")
		const update = () => setSystemDark(Boolean(mql.matches))
		update()
		mql.addEventListener?.("change", update)
		// Safari/old Chrome fallback
		mql.addListener?.(update)
		return () => {
			mql.removeEventListener?.("change", update)
			mql.removeListener?.(update)
		}
	}, [])

	// Resolve theme locally (navbar-only)
	const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme
	const isDark = resolvedTheme === "dark"

	const setLight = useCallback(() => {
		setTheme("light")
		if (typeof window !== "undefined") localStorage.setItem("theme", "light")
	}, [])
	const setDark = useCallback(() => {
		setTheme("dark")
		if (typeof window !== "undefined") localStorage.setItem("theme", "dark")
	}, [])
	const setSystem = useCallback(() => {
		setTheme("system")
		if (typeof window !== "undefined") localStorage.setItem("theme", "system")
	}, [])

	const navItems = useMemo(
		() => [
			{ label: "CHAT TO PDF", href: "/chat-with-pdf" },
			{ label: "AI SUMMARIZER", href: "/ai-summarizer" },
			{ label: "COMPRESS PDF", href: "/compress-pdf" },
			// "Convert PDF" handled separately for dropdown
			{ label: "All PDF tools", href: "/all-tools" },
		],
		[]
	)

	const convertToPdfItems = useMemo(
		() => [
			{ label: "EXCEL to PDF", href: "/convert/excel-to-pdf" },
			{ label: "TXTS to PDF", href: "/convert/txts-to-pdf" },
			{ label: "RTFS to PDF", href: "/convert/rtfs-to-pdf" },
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

	const isLightActive = theme === "light" || (theme === "system" && !systemDark)
	const isDarkActive = theme === "dark" || (theme === "system" && systemDark)
	const activeBg = "bg-[#f57222] text-white"
	const inactiveText = isDark ? "text-gray-300" : "text-gray-600"

	// Delayed hover handlers to prevent flicker when moving to panel
	const openWithDelay = useCallback(() => {
		if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
		hoverTimeoutRef.current = setTimeout(() => setIsConvertOpen(true), 80)
	}, [])
	const closeWithDelay = useCallback(() => {
		if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
		hoverTimeoutRef.current = setTimeout(() => setIsConvertOpen(false), 180)
	}, [])

	return (
		<nav
			className={classNames(
				"w-full border-b backdrop-blur",
				isDark
					? "border-gray-800 bg-neutral-900/70 supports-[backdrop-filter]:bg-neutral-900/60"
					: "border-gray-200 bg-white/70 supports-[backdrop-filter]:bg-white"
			)}
		>
			<div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
				<div className="flex w-full h-16 items-center  justify-between">
					{/* Left: Logo */}
					<div className="flex items-center ">
						<Link href="/" className="flex items-center gap-2">
							<span
								className={classNames(
									"inline-flex h-8 w-8 items-center justify-center rounded-md text-white",
									isDark ? "bg-primary-500" : "bg-primary-600"
								)}
							>
								P
							</span>
							<span
								className={classNames(
									"text-base font-semibold tracking-tight",
									isDark ? "text-gray-100" : "text-gray-900"
								)}
							>
								ChoosePDF
							</span>
						</Link>
					</div>

					{/* Center: Navigation */}
					<div className="hidden md:flex flex-1 items-center justify-center  mx-10 whitespace-nowrap">
						<ul className="flex items-center gap-12 w-full justify-center">
							{navItems.slice(0, 3).map((item) => (
								<li key={item.label}>
									<Link
										href={item.href}
										className={classNames(
											"text-sm font-medium cursor-pointer leading-tight transition-colors",
											isDark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
										)}
									>
										{item.label}
									</Link>
								</li>
							))}

							{/* Convert PDF with hover panel */}
							<li
								className="relative"
								onMouseEnter={openWithDelay}
								onMouseLeave={closeWithDelay}
							>
								<button
									type="button"
									className={classNames(
										"text-sm font-medium cursor-pointer transition-colors",
										isDark
											? isConvertOpen
												? "text-white"
												: "text-gray-300 hover:text-white"
											: isConvertOpen
											? "text-gray-900"
											: "text-gray-700 hover:text-gray-900"
									)}
									aria-haspopup="menu"
									aria-expanded={isConvertOpen}
								>
									CONVERT PDF
								</button>

								{/* Hover window (mega dropdown) */}
								<div
									onMouseEnter={openWithDelay}
									onMouseLeave={closeWithDelay}
									className={classNames(
										"absolute left-1/2 z-30 mt-6 w-[min(75vw,450px)] -translate-x-1/2 rounded-xl py-6 px-4 shadow-xl",
										isDark ? "border border-gray-800 bg-neutral-900" : "border border-gray-200 bg-white",
										isConvertOpen ? "block" : "hidden"
									)}
									role="menu"
								>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<section>
											<h3
												className={classNames(
													"mb-2 text-xs font-semibold leading-tight cursor-pointer uppercase tracking-wider",
													isDark ? "text-gray-400" : "text-gray-500"
												)}
											>
												Convert to PDF
											</h3>
											<ul className="space-y-0">
												{convertToPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className={classNames(
																"flex items-center justify-between rounded-md px-2 py-1 text-xs leading-tight cursor-pointer",
																isDark ? "text-gray-300 hover:bg-[#fff5f0] hover:text-white" : "text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
															)}
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
										</section>
										<section>
											<h3
												className={classNames(
													"mb-2 text-xs font-semibold uppercase tracking-wider",
													isDark ? "text-gray-400" : "text-gray-500"
												)}
											>
												Convert from PDF
											</h3>
											<ul className="space-y-0">
												{convertFromPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className={classNames(
																"flex items-center justify-between rounded-md px-2 py-1 text-sm leading-tight cursor-pointer",
																isDark ? "text-gray-300 hover:bg-[#fff5f0] hover:text-white" : "text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
															)}
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

							<li>
								<Link
									href={navItems[3].href}
									className={classNames(
										"text-sm font-medium cursor-pointer transition-colors",
										isDark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
									)}
								>
									{navItems[3].label}
								</Link>
							</li>
						</ul>
					</div>

					{/* Right: Theme toggles */}
					<div className="flex flex-1 items-center justify-end gap-2">
						<div
							className={classNames(
								"hidden sm:flex items-center overflow-hidden rounded-lg p-0.5",
								isDark ? "border border-gray-800 bg-neutral-900" : "border border-gray-200 bg-white"
							)}
						>
							<button
								type="button"
								onClick={setLight}
								aria-pressed={isLightActive}
								className={classNames(
									"group flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
									isLightActive ? activeBg : inactiveText
								)}
							>
								<Sun className="h-4 w-4" />
								<span className="hidden md:inline">Light</span>
							</button>
							<button
								type="button"
								onClick={setDark}
								aria-pressed={isDarkActive}
								className={classNames(
									"group flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
									isDarkActive ? activeBg : inactiveText
								)}
							>
								<Moon className="h-4 w-4" />
								<span className="hidden md:inline">Dark</span>
							</button>
							<button
								type="button"
								onClick={setSystem}
								aria-pressed={theme === "system"}
								className={classNames(
									"group flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
									inactiveText
								)}
								title="Use system theme"
							>
								<span className="inline-flex"><MonitorCog className="h-4 w-4" /></span>
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile center nav (below bar) */}
			<div
				className={classNames("md:hidden border-t", isDark ? "border-gray-800" : "border-gray-200")}
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex flex-wrap items-center justify-center gap-4 py-3">
						{navItems.map((item) => (
							<Link
								key={item.label}
								href={item.href}
								className={classNames(
									"text-sm font-medium cursor-pointer transition-colors",
									isDark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
								)}
							>
								{item.label}
							</Link>
						))}
						<div className="relative">
							<button
								type="button"
								onClick={() => setIsConvertOpen((v) => !v)}
								className={classNames(
									"text-sm font-medium cursor-pointer transition-colors",
									isDark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
								)}
								aria-haspopup="menu"
								aria-expanded={isConvertOpen}
							>
								Convert PDF
							</button>
							{isConvertOpen && (
								<div
									className={classNames(
										"mt-2 w-[min(92vw,640px)] rounded-xl p-4 shadow-xl",
										isDark ? "border border-gray-800 bg-neutral-900" : "border border-gray-200 bg-white"
									)}
								>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<section>
											<h3
												className={classNames(
													"mb-2 text-xs font-semibold uppercase tracking-wider",
													isDark ? "text-gray-400" : "text-gray-500"
												)}
											>
												Convert to PDF
											</h3>
											<ul className="space-y-0">
												{convertToPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className={classNames(
																"block rounded-md px-2 py-1 text-sm leading-tight cursor-pointer",
																isDark ? "text-gray-300 hover:bg-[#fff5f0] hover:text-white" : "text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
															)}
														>
															{item.label}
														</Link>
													</li>
												))}
											</ul>
										</section>
										<section>
											<h3
												className={classNames(
													"mb-2 text-xs font-semibold uppercase tracking-wider",
													isDark ? "text-gray-400" : "text-gray-500"
												)}
											>
												Convert from PDF
											</h3>
											<ul className="space-y-0">
												{convertFromPdfItems.map((item) => (
													<li key={item.label}>
														<Link
															href={item.href}
															className={classNames(
																"block rounded-md px-2 py-1 text-sm leading-tight cursor-pointer",
																isDark ? "text-gray-300 hover:bg-[#fff5f0] hover:text-white" : "text-gray-700 hover:bg-[#fff5f0] hover:text-gray-900"
															)}
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


