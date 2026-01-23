"use client"

import type React from "react"
import { useMemo, useRef, useState } from "react"
import { Download, ImageIcon, PaintBucket, RotateCw, X, MonitorUp } from "lucide-react"
import Spinner from "../../ui/loader/loader"

type BarcodeType = "QRCode" | "DataMatrix" | "Aztec" | "MaxiCode"

type FrameKey = "no-frame" | "frame.png" | "frame2.png" | "frame3.png"

type FrameConfig = {
	container: React.CSSProperties
	qrCode: React.CSSProperties
	qrImage: React.CSSProperties
	preview: {
		container: React.CSSProperties
		qrCode: React.CSSProperties
		qrImage: React.CSSProperties
	}
}

const barcodeTypes: { id: BarcodeType; label: string }[] = [
	{ id: "QRCode", label: "QRCode" },
	{ id: "DataMatrix", label: "DataMatrix" },
	{ id: "Aztec", label: "Aztec" },
	{ id: "MaxiCode", label: "MaxiCode" },
]

export default function PdfToQrcode() {
	// PDF Upload State
	const [pdfFile, setPdfFile] = useState<File | null>(null)
	const [pdfUrl, setPdfUrl] = useState<string>("")
	const [uploadingPdf, setUploadingPdf] = useState(false)
	const pdfInputRef = useRef<HTMLInputElement>(null)

	// Barcode Type Selection
	const [selectedBarcodeType, setSelectedBarcodeType] = useState<BarcodeType>("QRCode")

	// Settings
	const [angle, setAngle] = useState<"0" | "1" | "2" | "3">("0")
	const [narrowBarWidth, setNarrowBarWidth] = useState(30)
	const [foreColor, setForeColor] = useState("#ff550d")
	const [backColor, setBackColor] = useState("#ffffff")
	const [logoFile, setLogoFile] = useState<File | null>(null)

	// Generation State
	const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)

	// Frame Selection
	const [selectedFrame, setSelectedFrame] = useState<FrameKey>("no-frame")
	const frameRef = useRef<HTMLDivElement>(null)

	const frameConfigs: Record<FrameKey, FrameConfig> = useMemo(
		() => ({
			"no-frame": {
				container: {
					width: "240px",
					height: "240px",
					backgroundColor: "transparent",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: "240px",
					height: "240px",
				},
				qrImage: { maxWidth: "240px", maxHeight: "240px" },
				preview: {
					container: { width: "80px", height: "80px" },
					qrCode: {
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: "80px",
						height: "80px",
					},
					qrImage: { maxWidth: "80px", maxHeight: "80px" },
				},
			},
			"frame.png": {
				container: {
					width: "240px",
					height: "280px",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundColor: "transparent",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -65%)",
					width: "195px",
					height: "195px",
				},
				qrImage: { maxWidth: "185px", maxHeight: "185px" },
				preview: {
					container: { width: "80px", height: "96px" },
					qrCode: {
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -56%)",
						width: "55px",
						height: "55px",
					},
					qrImage: { maxWidth: "55px", maxHeight: "55px" },
				},
			},
			"frame2.png": {
				container: {
					width: "240px",
					height: "280px",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundColor: "transparent",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "40%",
					left: "60%",
					transform: "translate(-63%, -55%)",
					width: "170px",
					height: "170px",
				},
				qrImage: { maxWidth: "170px", maxHeight: "170px" },
				preview: {
					container: { width: "80px", height: "96px" },
					qrCode: {
						position: "absolute",
						top: "40%",
						left: "60%",
						transform: "translate(-63%, -56%)",
						width: "55px",
						height: "55px",
					},
					qrImage: { maxWidth: "55px", maxHeight: "55px" },
				},
			},
			"frame3.png": {
				container: {
					width: "240px",
					height: "280px",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundColor: "white",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "5%",
					left: "20%",
					transform: "translate(-11%, 6%)",
					width: "185px",
					height: "185px",
				},
				qrImage: { maxWidth: "185px", maxHeight: "185px" },
				preview: {
					container: { width: "80px", height: "96px" },
					qrCode: {
						position: "absolute",
						top: "5%",
						left: "20%",
						transform: "translate(-11%, 8%)",
						width: "60px",
						height: "60px",
					},
					qrImage: { maxWidth: "60px", maxHeight: "60px" },
				},
			},
		}),
		[]
	)

	const getCurrentFrameConfig = () => frameConfigs[selectedFrame] || frameConfigs["no-frame"]

	const isValidPdfFile = (file: File): boolean => {
		const validTypes = ["application/pdf"]
		const validExtensions = ["pdf"]
		const fileExtension = file.name.toLowerCase().split(".").pop()
		return validTypes.includes(file.type) || validExtensions.includes(fileExtension || "")
	}

	const handlePdfSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files
		if (files && files.length > 0) {
			const file = files[0]
			if (isValidPdfFile(file)) {
				setUploadingPdf(true)
				setPdfFile(file)

				const formData = new FormData()
				formData.append("file", file)

				try {
					const response = await fetch("/api/upload", {
						method: "POST",
						body: formData,
					})

					if (!response.ok) {
						throw new Error("Upload failed")
					}

					const data = await response.json()

					if (data.error === false && data.url) {
						setPdfUrl(data.url)
					} else {
						alert("PDF upload failed. Please try again.")
						setPdfFile(null)
					}
				} catch (error) {
					console.error("Upload error:", error)
					alert("PDF upload failed. Please try again.")
					setPdfFile(null)
				} finally {
					setUploadingPdf(false)
				}
			} else {
				alert("Please select a valid PDF file (.pdf)")
			}
		}
		if (pdfInputRef.current) pdfInputRef.current.value = ""
	}

	const removePdf = () => {
		setPdfFile(null)
		setPdfUrl("")
		if (pdfInputRef.current) pdfInputRef.current.value = ""
	}

	const removeLogo = () => {
		setLogoFile(null)
	}

	const generateBarcode = async () => {
		if (!pdfUrl) {
			alert("Please upload a PDF file first")
			return
		}

		setLoading(true)
		setUploadProgress(0)

		try {
			const formData = new FormData()
			formData.append("name", "barcode.png")
			formData.append("type", selectedBarcodeType)
			formData.append("value", pdfUrl)
			formData.append("inline", "true")
			formData.append("async", "false")
			formData.append(
				"profiles",
				JSON.stringify({
					Angle: Number(angle),
					NarrowBarWidth: narrowBarWidth,
					ForeColor: foreColor,
					BackColor: backColor,
				})
			)

			if (logoFile) {
				formData.append("decorationImageFile", logoFile)
			}

			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10))
			}, 120)

			const response = await fetch("/api/pdftoqrcode", {
				method: "POST",
				body: formData,
			})

			clearInterval(progressInterval)
			setUploadProgress(100)

			const data = await response.json()

			if (data?.error === false && data?.url) {
				setBarcodeUrl(data.url)
			} else {
				alert(data?.message || "Barcode generation failed. Please try again.")
			}
		} catch (err) {
			console.error("Error:", err)
			alert("Barcode generation failed. Please try again.")
		} finally {
			setLoading(false)
			setTimeout(() => setUploadProgress(0), 800)
		}
	}

	const downloadBarcode = async () => {
		if (!barcodeUrl || !frameRef.current) return

		try {
			if (selectedFrame === "no-frame") {
				const response = await fetch(barcodeUrl)
				const blob = await response.blob()
				const url = window.URL.createObjectURL(blob)
				const a = document.createElement("a")
				a.href = url
				a.download = `barcode-${selectedBarcodeType}-no-frame.png`
				document.body.appendChild(a)
				a.click()
				window.URL.revokeObjectURL(url)
				document.body.removeChild(a)
				return
			}

			// Preload frame image to ensure it's loaded before capture
			const frameImageUrl = `/frames/${selectedFrame}`
			const frameImage = new Image()
			frameImage.crossOrigin = "anonymous"
			
			await new Promise<void>((resolve, reject) => {
				frameImage.onload = () => resolve()
				frameImage.onerror = () => reject(new Error("Failed to load frame image"))
				frameImage.src = frameImageUrl
			})

			// Small delay to ensure everything is rendered
			await new Promise((resolve) => setTimeout(resolve, 100))

			// @ts-ignore
			const html2canvasModule = await import("html2canvas")
			const html2canvas = html2canvasModule.default

			// Get background color from config (frame3.png has white background)
			const bgColor = selectedFrame === "frame3.png" ? "#ffffff" : "transparent"

			const canvas = await html2canvas(frameRef.current, {
				backgroundColor: bgColor,
				scale: 2,
				useCORS: true,
				allowTaint: false,
				logging: false,
				width: frameRef.current.offsetWidth,
				height: frameRef.current.offsetHeight,
				onclone: (clonedDoc) => {
					// Ensure background images are properly rendered in cloned document
					const clonedElement = clonedDoc.querySelector('[data-frame-container]') as HTMLElement
					if (clonedElement && frameRef.current) {
						// Copy all computed styles to ensure background image is preserved
						const originalStyle = frameRef.current.getAttribute("style") || ""
						clonedElement.setAttribute("style", originalStyle)
					}
				},
			})

			canvas.toBlob((blob: Blob | null) => {
				if (!blob) return
				const url = window.URL.createObjectURL(blob)
				const a = document.createElement("a")
				a.href = url
				a.download = `barcode-${selectedBarcodeType}-${selectedFrame.replace(".png", "")}.png`
				document.body.appendChild(a)
				a.click()
				window.URL.revokeObjectURL(url)
				document.body.removeChild(a)
			}, "image/png")
		} catch (error) {
			console.error("Download error:", error)
			// fallback: download raw barcode
			try {
				const response = await fetch(barcodeUrl)
				const blob = await response.blob()
				const url = window.URL.createObjectURL(blob)
				const a = document.createElement("a")
				a.href = url
				a.download = `barcode-${selectedBarcodeType}.png`
				document.body.appendChild(a)
				a.click()
				window.URL.revokeObjectURL(url)
				document.body.removeChild(a)
			} catch (fallbackError) {
				console.error("Fallback download error:", fallbackError)
			}
		}
	}

	const resetGenerator = () => {
		setPdfFile(null)
		setPdfUrl("")
		setSelectedBarcodeType("QRCode")
		setAngle("0")
		setNarrowBarWidth(30)
		setForeColor("#ff550d")
		setBackColor("#ffffff")
		setLogoFile(null)
		setBarcodeUrl(null)
		setSelectedFrame("no-frame")
		if (pdfInputRef.current) pdfInputRef.current.value = ""
	}

	// Show result view after generation
	const showResult = barcodeUrl !== null

	return (
		<div className="p-0 max-w-7xl mx-auto bg-transparent">
			<div className="text-center space-y-2 mb-0">
				<div className="flex flex-wrap justify-center items-center mx-auto text-neutral-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">
					Barcode Generator
				</div>
				<p className="text-gray-600">Generate barcode from PDF with styles, logo and frames</p>
			</div>

			{!showResult ? (
				<div className="space-y-6 relative min-h-[520px]">
					{/* Overlay loader (Generate click) - covers ONLY this details section, not navbar */}
					{loading && (
						<div className="absolute inset-0 z-50 bg-[#fef0e9]/90 backdrop-blur-sm flex items-center justify-center rounded-2xl">
							<Spinner />
						</div>
					)}

					{/* PDF Upload Section (hide after upload) */}
					{!pdfUrl ? (
						<div className="space-y-3">
							<label className="text-sm font-semibold text-gray-700">Upload PDF File</label>
							<div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#ff550d] transition-colors">
								<input
									ref={pdfInputRef}
									type="file"
									accept=".pdf"
									onChange={handlePdfSelect}
									className="hidden"
									id="pdf-upload"
								/>
								<label htmlFor="pdf-upload" className="cursor-pointer">
									{uploadingPdf ? (
										<div className="flex flex-col items-center justify-center gap-3">
											<div style={{ transform: "scale(0.6)" }}>
												<Spinner />
											</div>
											<p className="text-gray-600">Uploading PDF...</p>
										</div>
									) : (
										<>
											<MonitorUp className="mx-auto h-12 w-12 text-[#ff550d] mb-4" />
											<p className="text-gray-600">Click to upload a PDF file</p>
											<p className="text-sm text-gray-400 mt-1">PDF files only</p>
										</>
									)}
								</label>
							</div>
						</div>
					) : (
						<div className="flex items-center justify-between bg-white/70 border border-gray-200 rounded-xl px-4 py-3">
							<p className="text-sm text-gray-700">
								<span className="font-semibold">PDF uploaded:</span> {pdfFile?.name || "Your file"}
							</p>
							<button
								onClick={removePdf}
								className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
							>
								<X className="h-4 w-4" />
								Change
							</button>
						</div>
					)}

					{/* Barcode Type Tabs */}
					{pdfUrl && (
						<div className="space-y-3">
							<label className="text-sm font-semibold text-gray-700">Select Barcode Type</label>
							<div className="flex flex-wrap gap-3">
								{barcodeTypes.map((barcodeType) => (
									<button
										key={barcodeType.id}
										type="button"
										onClick={() => setSelectedBarcodeType(barcodeType.id)}
										className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border-2 ${
											selectedBarcodeType === barcodeType.id
												? "bg-[#ff911d] text-white border-[#ff911d] shadow-lg"
												: "bg-white text-gray-700 border-gray-300 hover:border-[#ff911d] hover:bg-[#fff5f0]"
										}`}
									>
										{barcodeType.label}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Settings Section */}
					{pdfUrl && (
						<>
							<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
								<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
									<PaintBucket className="h-5 w-5" />
									Styling
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-semibold text-gray-700">Foreground</label>
										<div className="flex items-center gap-2">
											<input
												type="color"
												value={foreColor}
												onChange={(e) => setForeColor(e.target.value)}
												className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-semibold text-gray-700">Background</label>
										<div className="flex items-center gap-2">
											<input
												type="color"
												value={backColor}
												onChange={(e) => setBackColor(e.target.value)}
												className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
											/>
										</div>
									</div>
								</div>

								<div className="space-y-3 mt-6">
									<label className="text-sm font-semibold text-gray-700">Barcode Pixel Size: {narrowBarWidth}</label>
									<input
										type="range"
										min={1}
										max={100}
										value={narrowBarWidth}
										onChange={(e) => setNarrowBarWidth(Number(e.target.value))}
										className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
										style={{
											background: `linear-gradient(to right, #ff550d 0%, #ff911d ${narrowBarWidth}%, #e5e7eb ${narrowBarWidth}%, #e5e7eb 100%)`,
										}}
									/>
								</div>

								<div className="space-y-2 mt-6">
									<label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
										<RotateCw className="h-4 w-4" />
										Rotation
									</label>
									<select
										value={angle}
										onChange={(e) => setAngle(e.target.value as "0" | "1" | "2" | "3")}
										className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#ff550d] focus:outline-none transition-colors"
									>
										<option value="0">0° (Normal)</option>
										<option value="1">90° (Right)</option>
										<option value="2">180° (Upside down)</option>
										<option value="3">270° (Left)</option>
									</select>
								</div>
							</div>

							<div className="space-y-3">
								<label className="text-sm font-semibold text-gray-700">Logo Image (Optional)</label>

								{!logoFile ? (
									<div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#ff550d] transition-colors">
										<input
											type="file"
											accept="image/*"
											onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
											className="hidden"
											id="logo-upload"
										/>
										<label htmlFor="logo-upload" className="cursor-pointer">
											<ImageIcon className="mx-auto h-12 w-12 text-[#ff550d] mb-4" />
											<p className="text-gray-600">Click to upload a logo image</p>
											<p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</p>
										</label>
									</div>
								) : (
									<div className="bg-gray-50 rounded-xl p-4 space-y-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<ImageIcon className="h-8 w-8 text-[#ff550d]" />
												<div>
													<p className="font-medium text-gray-900">{logoFile.name}</p>
													<p className="text-sm text-gray-500">Will upload on Generate</p>
												</div>
											</div>
											<button
												onClick={removeLogo}
												className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
											>
												<X className="h-5 w-5" />
											</button>
										</div>
									</div>
								)}
							</div>

							<button
								onClick={generateBarcode}
								disabled={loading || !pdfUrl}
								className="w-full py-4 bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white font-semibold rounded-xl hover:from-[#e6490b] hover:to-[#e6820a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
							>
								{loading ? (
									<div className="flex items-center justify-center gap-3">
										<div style={{ transform: "scale(0.45)" }}>
											<Spinner />
										</div>
										<span>Generating {selectedBarcodeType}...</span>
									</div>
								) : (
									`Generate ${selectedBarcodeType}`
								)}
							</button>

							{loading && (
								<div className="space-y-2">
									<div className="flex justify-between text-sm text-gray-600">
										<span>Generating barcode...</span>
										<span>{uploadProgress}%</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-gradient-to-r from-[#ff550d] to-[#ff911d] h-2 rounded-full transition-all duration-300"
											style={{ width: `${uploadProgress}%` }}
										/>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			) : (
				/* Result View - Show only barcode with frames */
				<div className="space-y-6">
					<div className="bg-gradient-to-br from-gray-50 to-white flex flex-col rounded-2xl border border-gray-200 p-6 overflow-hidden">
						<div className="text-center mb-6">
							<h3 className="text-xl font-semibold text-gray-800">Generated Barcode</h3>
						</div>

						<div className="flex-1 flex items-center justify-center min-h-0">
							<div className="w-full h-full overflow-hidden">
								<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full items-start">
									<div className="flex flex-col items-center justify-start p-4">
										<h4 className="text-sm font-semibold text-gray-700 mb-4">Choose Frame Style</h4>
										<div className="flex flex-col gap-4 items-center max-w-[160px]">
											{(["no-frame", "frame.png", "frame2.png", "frame3.png"] as FrameKey[]).map((frameFile, index) => {
												const frameConfig = frameConfigs[frameFile]
												const frameNames = ["Normal", "Classic", "Modern", "Elegant"]

												return (
													<div
														key={frameFile}
														onClick={() => setSelectedFrame(frameFile)}
														className={`cursor-pointer p-3 rounded-xl transition-all duration-300 w-full group ${
															selectedFrame === frameFile
																? "ring-4 ring-[#ff550d] border-2 border-[#ff911d] ring-opacity-30 bg-gradient-to-br from-[#fef0e9] to-white shadow-xl scale-105"
																: "hover:bg-gradient-to-br hover:from-gray-50 hover:to-white hover:shadow-lg border border-gray-200 hover:border-gray-300 transform"
														}`}
													>
														<div
															className="bg-white rounded-lg border border-gray-200 mb-3 relative mx-auto shadow-sm group-hover:shadow-md transition-shadow duration-100"
															style={{
																backgroundImage: frameFile !== "no-frame" ? `url('/frames/${frameFile}')` : "none",
																backgroundSize: "contain",
																backgroundRepeat: "no-repeat",
																backgroundPosition: "center",
																backgroundColor: frameFile === "no-frame" ? "transparent" : "white",
																border: frameFile === "no-frame" ? "none" : "1px solid #e5e7eb",
																position: "relative",
																...frameConfig.preview.container,
															}}
														>
															<div
																className="absolute inset-0 flex items-center justify-center"
																style={frameConfig.preview.qrCode}
															>
																<img
																	src={barcodeUrl}
																	alt="Barcode Preview"
																	className="w-full h-full object-contain filter drop-shadow-sm"
																	style={frameConfig.preview.qrImage}
																/>
															</div>
														</div>

														<div className="text-center">
															<p
																className={`text-xs font-semibold transition-colors duration-200 ${
																	selectedFrame === frameFile ? "text-[#ff550d]" : "text-gray-600 group-hover:text-gray-800"
																}`}
															>
																{frameNames[index]}
															</p>
														</div>
													</div>
												)
											})}
										</div>
									</div>

									<div className="flex flex-col items-center justify-center space-y-6 p-4">
										<div
											ref={frameRef}
											data-frame-container
											className={`inline-block p-4 rounded-2xl transition-shadow duration-300 qr-frame-container flex-shrink-0 ${
												selectedFrame === "no-frame" ? "shadow-none" : "shadow-xl hover:shadow-2xl"
											}`}
											style={{
												backgroundImage: selectedFrame !== "no-frame" ? `url('/frames/${selectedFrame}')` : "none",
												padding: selectedFrame === "no-frame" ? "0" : "16px",
												...getCurrentFrameConfig().container,
											}}
										>
											<div className="absolute inset-0 flex justify-center items-center" style={getCurrentFrameConfig().qrCode}>
												<img
													src={barcodeUrl}
													alt="Generated Barcode"
													className="w-full h-full object-contain filter drop-shadow-sm"
													style={getCurrentFrameConfig().qrImage}
												/>
											</div>
										</div>

										<button
											onClick={downloadBarcode}
											className="w-full max-w-sm cursor-pointer inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white font-semibold rounded-xl hover:from-[#e6490b] hover:to-[#e6820a] transition-all duration-300 shadow-lg hover:shadow-xl"
										>
											<Download className="h-5 w-5" />
											<span>Download Barcode</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					<button
						onClick={resetGenerator}
						className="w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-300"
					>
						Generate Another Barcode
					</button>
				</div>
			)}

			<style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff550d, #ff911d);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff550d, #ff911d);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .qr-frame-container {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .qr-frame-container img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          filter: contrast(1.1);
          transition: all 0.2s ease-in-out;
        }
      `}</style>
		</div>
	)
}
