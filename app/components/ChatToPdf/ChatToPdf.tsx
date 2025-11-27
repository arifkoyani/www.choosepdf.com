'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, FileText, Send, Plus, Loader2 } from 'lucide-react'

interface Message {
	id: string
	role: 'user' | 'assistant'
	content: string
	timestamp: Date
}

export default function ChatToPdfUsingAI() {
	const [uploadedPdf, setUploadedPdf] = useState<File | null>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [inputMessage, setInputMessage] = useState('')
	const [isDragging, setIsDragging] = useState(false)
	const [isUploading, setIsUploading] = useState(false)
	const [isPdfReady, setIsPdfReady] = useState(false)
	const [webhookResponse, setWebhookResponse] = useState<any>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const chatInputRef = useRef<HTMLTextAreaElement>(null)

	const WEBHOOK_URL = 'https://automation.uconnect.work/webhook-test/9473e43d-9399-4511-96d3-39e52e926f32'

	// Scroll to bottom when new messages are added
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	// Focus input when PDF is ready
	useEffect(() => {
		if (isPdfReady && chatInputRef.current) {
			// Small delay to ensure the chat interface is rendered
			setTimeout(() => {
				chatInputRef.current?.focus()
			}, 100)
		}
	}, [isPdfReady])

	// Convert File to Base64
	const fileToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => {
				const base64String = reader.result as string
				// Remove data:application/pdf;base64, prefix
				const base64 = base64String.split(',')[1]
				resolve(base64)
			}
			reader.onerror = (error) => reject(error)
		})
	}

	// Send PDF to webhook
	const sendPdfToWebhook = async (file: File) => {
		try {
			setIsUploading(true)
			setIsPdfReady(false)

			// Convert PDF to base64
			const base64Pdf = await fileToBase64(file)

			// Prepare JSON payload
			const payload = {
				pdf: base64Pdf,
				fileName: file.name,
				fileSize: file.size,
				fileType: file.type,
			}

			// Send POST request to webhook
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`)
			}

			const responseData = await response.json()
			setWebhookResponse(responseData)
			setIsPdfReady(true)
			setIsUploading(false)
		} catch (error) {
			console.error('Error sending PDF to webhook:', error)
			alert('Failed to upload PDF. Please try again.')
			setIsUploading(false)
			setIsPdfReady(false)
			setUploadedPdf(null)
		}
	}

	// Handle file upload
	const handleFileUpload = async (file: File) => {
		if (file.type === 'application/pdf') {
			setUploadedPdf(file)
			setMessages([])
			setIsPdfReady(false)
			// Send PDF to webhook
			await sendPdfToWebhook(file)
		} else {
			alert('Please upload a PDF file')
		}
	}

	// Handle drag and drop
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
		const file = e.dataTransfer.files[0]
		if (file) {
			handleFileUpload(file)
		}
	}

	// Handle file input change
	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			handleFileUpload(file)
		}
	}

	// Remove PDF
	const handleRemovePdf = () => {
		setUploadedPdf(null)
		setMessages([])
		setIsPdfReady(false)
		setIsUploading(false)
		setWebhookResponse(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	// Handle send message
	const handleSendMessage = () => {
		if (!inputMessage.trim() || !uploadedPdf || !isPdfReady) return

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: inputMessage,
			timestamp: new Date(),
		}

		setMessages((prev) => [...prev, userMessage])
		setInputMessage('')

		// Focus input after sending message
		setTimeout(() => {
			chatInputRef.current?.focus()
		}, 50)

		// Simulate AI response (replace with actual API call)
		setTimeout(() => {
			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: 'This is a placeholder response. Connect to your AI API to get real responses based on the PDF content.',
				timestamp: new Date(),
			}
			setMessages((prev) => [...prev, aiMessage])
			// Focus input after AI response
			setTimeout(() => {
				chatInputRef.current?.focus()
			}, 50)
		}, 1000)
	}

	// Handle Enter key (with Shift for new line)
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSendMessage()
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
			<div className="max-w-6xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
						Chat with PDF using AI
					</h1>
					<p className="text-lg text-gray-600">
						Upload your PDF and start chatting with AI-powered insights
					</p>
				</div>

				{/* PDF Upload Section */}
				{!uploadedPdf ? (
					<div
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						className={`relative mb-8 border-2 border-dashed rounded-2xl p-12 transition-all duration-200 ${
							isDragging
								? 'border-[#ff911d] bg-[#fff5f0]'
								: 'border-gray-300 bg-white hover:border-[#ff911d] hover:bg-gray-50'
						}`}
					>
						<div className="flex flex-col items-center justify-center text-center">
							<div className="mb-4 p-4 bg-[#fff5f0] rounded-full">
								<Upload className="w-12 h-12 text-[#ff911d]" strokeWidth={1.5} />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								Upload your PDF file
							</h3>
							<p className="text-gray-600 mb-6 max-w-md">
								Drag and drop your PDF here, or click the button below to browse
							</p>
							<button
								onClick={() => fileInputRef.current?.click()}
								className="px-6 py-3 bg-[#ff911d] text-white font-medium rounded-xl hover:bg-[#e67e0a] transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
							>
								<Upload className="w-5 h-5" />
								Choose PDF File
							</button>
							<input
								ref={fileInputRef}
								type="file"
								accept=".pdf"
								onChange={handleFileInputChange}
								className="hidden"
							/>
						</div>
					</div>
				) : (
					<div className="mb-6">
						<div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 flex items-center justify-between">
							<div className="flex items-center gap-3 flex-1 min-w-0">
								<div className="p-2 bg-[#fff5f0] rounded-lg flex-shrink-0">
									{isUploading ? (
										<Loader2 className="w-6 h-6 text-[#ff911d] animate-spin" />
									) : (
										<FileText className="w-6 h-6 text-[#ff911d]" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-gray-900 truncate">
										{uploadedPdf.name}
									</p>
									<p className="text-sm text-gray-500">
										{isUploading
											? 'Uploading and processing PDF...'
											: isPdfReady
											? 'Ready for chat'
											: `${(uploadedPdf.size / 1024 / 1024).toFixed(2)} MB`}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 flex-shrink-0">
								<button
									onClick={() => fileInputRef.current?.click()}
									className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2 text-sm"
								>
									<Plus className="w-4 h-4" />
									Upload New
								</button>
								<button
									onClick={handleRemovePdf}
									className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
									title="Remove PDF"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
							<input
								ref={fileInputRef}
								type="file"
								accept=".pdf"
								onChange={handleFileInputChange}
								className="hidden"
							/>
						</div>
					</div>
				)}

				{/* Chat Interface */}
				{uploadedPdf && (
					<div className="overflow-hidden flex flex-col h-[600px]">
						{/* Messages Area */}
						<div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent">
							{isUploading ? (
								<div className="flex flex-col items-center justify-center h-full text-center py-12">
									<Loader2 className="w-12 h-12 text-[#ff911d] animate-spin mb-4" />
									<h3 className="text-xl font-semibold text-gray-900 mb-2">
										Processing your PDF...
									</h3>
									<p className="text-gray-600 max-w-md">
										Please wait while we upload and process your PDF document
									</p>
								</div>
							) : messages.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-full text-center py-12">
									<h3 className="text-xl font-semibold text-gray-900 mb-2">
										Start chatting with your PDF
									</h3>
									<p className="text-gray-600 max-w-md">
										Ask questions about your PDF document and get AI-powered
										answers
									</p>
								</div>
							) : (
								<>
									{messages.map((message) => (
										<div
											key={message.id}
											className={`flex gap-4 ${
												message.role === 'user' ? 'justify-end' : 'justify-start'
											}`}
										>
											<div
												className={`max-w-[80%] rounded-2xl px-4 py-3 ${
													message.role === 'user'
														? 'bg-[#ff911d] text-white'
														: 'bg-transparent text-black'
												}`}
											>
												<p className="text-sm leading-relaxed whitespace-pre-wrap">
													{message.content}
												</p>
											</div>
										</div>
									))}
									<div ref={messagesEndRef} />
								</>
							)}
						</div>

						{/* Input Area */}
						<div className="border-t border-gray-200 p-4 bg-transparent shadow-xl">
							<div className="flex items-end gap-3">
								<div className="flex-1 relative">
									<textarea
										ref={chatInputRef}
										value={inputMessage}
										onChange={(e) => setInputMessage(e.target.value)}
										onKeyDown={handleKeyDown}
										placeholder={
											isPdfReady
												? 'Ask a question about your PDF...'
												: 'Processing PDF...'
										}
										disabled={!isPdfReady || isUploading}
										className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent resize-none max-h-32 bg-gray-50 text-gray-900 placeholder-gray-500 caret-[#ff911d] disabled:opacity-50 disabled:cursor-not-allowed"
										rows={1}
										autoFocus
									/>
								</div>
								<button
									onClick={handleSendMessage}
									disabled={!inputMessage.trim() || !isPdfReady || isUploading}
									className="p-3 bg-[#ff911d] text-white rounded-xl hover:bg-[#e67e0a] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:shadow-xl"
									title="Send message"
								>
									<Send className="w-5 h-5" />
								</button>
							</div>
							<p className="text-xs text-gray-500 mt-2 text-center">
								Press Enter to send, Shift + Enter for new line
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

