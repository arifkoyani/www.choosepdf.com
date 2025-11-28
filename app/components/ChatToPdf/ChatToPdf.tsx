'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, FileText, Send, Plus, Loader2, CheckCircle2, Copy, ThumbsUp, ThumbsDown, Check, MoveUp, CircleStop } from 'lucide-react'

interface Message {
	id: string
	role: 'user' | 'assistant'
	content: string
	suggested_question?: string
	timestamp: Date
}

export default function ChatToPdfUsingAI() {
	const [uploadedPdf, setUploadedPdf] = useState<File | null>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [inputMessage, setInputMessage] = useState('')
	const [isDragging, setIsDragging] = useState(false)
	const [isUploading, setIsUploading] = useState(false)
	const [isPdfReady, setIsPdfReady] = useState(false)
	const [isSendingMessage, setIsSendingMessage] = useState(false)
	const [webhookResponse, setWebhookResponse] = useState<any>(null)
	const [userId, setUserId] = useState<string>('')
	const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const chatInputRef = useRef<HTMLTextAreaElement>(null)

	const WEBHOOK_URL = 'https://automation.uconnect.work/webhook/9473e43d-9399-4511-96d3-39e52e926f32'

	// Generate unique user_id
	const generateUserId = () => {
		// Generate 9 random digits
		const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString()
		return `user_pdf_${randomDigits}`
	}

	// Generate new user_id on component mount (page refresh)
	useEffect(() => {
		const newUserId = generateUserId()
		setUserId(newUserId)
	}, [])

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

			// Generate new unique user_id for this PDF upload
			const newUserId = generateUserId()
			setUserId(newUserId)

			// Convert PDF to base64
			const base64Pdf = await fileToBase64(file)

			// Prepare JSON payload in the required format
			const payload = {
				user_id: newUserId,
				data_send: {
					file: base64Pdf,
				},
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
				const errorText = await response.text()
				throw new Error(`Webhook request failed: ${response.status} ${response.statusText}. ${errorText}`)
			}

			// Get response text first to check if it's valid JSON
			const responseText = await response.text()
			let responseData
			
			try {
				responseData = JSON.parse(responseText)
			} catch (parseError) {
				console.error('Invalid JSON response:', responseText)
				throw new Error('Invalid JSON response from server')
			}
			
			// Check if response is successful and upload is true
			if (responseData.success && responseData.upload === true) {
				setWebhookResponse(responseData)
				
				// Add the upload response message to chat
				if (responseData.answer) {
					const uploadMessage: Message = {
						id: Date.now().toString(),
						role: 'assistant',
						content: responseData.answer,
						suggested_question: responseData.suggested_question || undefined,
						timestamp: new Date(),
					}
					setMessages([uploadMessage])
				}
				
				setIsPdfReady(true)
				setIsUploading(false)
			} else {
				throw new Error('PDF upload was not successful')
			}
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
		// Generate new user_id for next PDF upload
		const newUserId = generateUserId()
		setUserId(newUserId)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	// Send message to webhook
	const sendMessageToWebhook = async (message: string) => {
		try {
			setIsSendingMessage(true)

			// Prepare JSON payload in the required format
			const payload = {
				user_id: userId,
				data_send: {
					message: message,
				},
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
				const errorText = await response.text()
				throw new Error(`Webhook request failed: ${response.status} ${response.statusText}. ${errorText}`)
			}

			// Get response text first to check if it's valid JSON
			const responseText = await response.text()
			let responseData
			
			try {
				// Trim whitespace and parse JSON
				const trimmedText = responseText.trim()
				responseData = JSON.parse(trimmedText)
			} catch (parseError) {
				console.error('Invalid JSON response:', responseText)
				throw new Error('Invalid JSON response from server')
			}

			// Handle array format: [{ "output": { "answer": "...", "suggested_question": "..." } }]
			if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
				const output = responseData[0].output
				if (output.answer) {
					return {
						answer: output.answer,
						suggested_question: output.suggested_question || undefined,
					}
				}
			}
			
			// Handle direct format: { "success": true, "answer": "...", "suggested_question": "..." }
			if (responseData.success && responseData.answer) {
				return {
					answer: responseData.answer,
					suggested_question: responseData.suggested_question || undefined,
				}
			}
			
			throw new Error('Invalid response from webhook')
		} catch (error) {
			console.error('Error sending message to webhook:', error)
			throw error
		} finally {
			setIsSendingMessage(false)
		}
	}

	// Handle send message
	const handleSendMessage = async (messageToSend?: string) => {
		const messageText = (messageToSend || inputMessage).trim()
		if (!messageText || !uploadedPdf || !isPdfReady || isSendingMessage) return

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: messageText,
			timestamp: new Date(),
		}

		setMessages((prev) => [...prev, userMessage])
		setInputMessage('')

		// Focus input after sending message
		setTimeout(() => {
			chatInputRef.current?.focus()
		}, 50)

		try {
			// Send message to webhook and get response
			const response = await sendMessageToWebhook(messageText)

			// Add AI response to messages
			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: response.answer,
				suggested_question: response.suggested_question,
				timestamp: new Date(),
			}
			setMessages((prev) => [...prev, aiMessage])

			// Focus input after AI response
			setTimeout(() => {
				chatInputRef.current?.focus()
			}, 50)
		} catch (error) {
			// Show error message
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: 'Sorry, I encountered an error while processing your message. Please try again.',
				timestamp: new Date(),
			}
			setMessages((prev) => [...prev, errorMessage])

			// Focus input after error
			setTimeout(() => {
				chatInputRef.current?.focus()
			}, 50)
		}
	}

	// Handle copy message
	const handleCopyMessage = async (text: string, messageId: string) => {
		try {
			await navigator.clipboard.writeText(text)
			// Set copied state to show checkmark
			setCopiedMessageId(messageId)
			// Reset after 2 seconds
			setTimeout(() => {
				setCopiedMessageId(null)
			}, 2000)
		} catch (error) {
			console.error('Failed to copy text:', error)
		}
	}

	// Handle suggested question click
	const handleSuggestedQuestionClick = (question: string) => {
		// Send the suggested question directly
		handleSendMessage(question)
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
									) : isPdfReady && webhookResponse?.upload === true ? (
										<CheckCircle2 className="w-6 h-6 text-blue-500" />
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
											: isPdfReady && webhookResponse?.upload === true
											? 'PDF is parsed successfully'
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
					<div className="flex flex-col">
						{/* Messages Area */}
						<div className="p-6 pb-4 space-y-6 bg-transparent">
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
														? 'bg-transparent'
														: 'bg-transparent text-black'
												}`}
											>
												<p className={`text-sm leading-relaxed whitespace-pre-wrap ${
													message.role === 'user' ? 'text-black' : 'text-black'
												}`}>
													{message.content}
												</p>
												
												{/* Action icons below message - only for assistant messages */}
												{message.role === 'assistant' && (
													<div className="flex items-center gap-3 mt-2">
														<button
															onClick={() => handleCopyMessage(message.content, message.id)}
															className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer"
															title={copiedMessageId === message.id ? "Copied!" : "Copy message"}
														>
															{copiedMessageId === message.id ? (
																<Check className="w-4 h-4 text-green-600" />
															) : (
																<Copy className="w-4 h-4 text-gray-600" />
															)}
														</button>
														<button
															onClick={() => {
																// Handle like functionality
																console.log('Message liked:', message.id)
															}}
															className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer"
															title="Like"
														>
															<ThumbsUp className="w-4 h-4 text-gray-600" />
														</button>
														<button
															onClick={() => {
																// Handle dislike functionality
																console.log('Message disliked:', message.id)
															}}
															className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer"
															title="Dislike"
														>
															<ThumbsDown className="w-4 h-4 text-gray-600" />
														</button>
													</div>
												)}

												{message.role === 'assistant' && message.suggested_question && (
													<div className="mt-3 pt-3 border-t border-gray-200">
														<button
															onClick={() => handleSuggestedQuestionClick(message.suggested_question!)}
															className="text-sm text-black font-semibold hover:text-gray-700 transition-colors duration-200 cursor-pointer hover:underline"
														>
															{message.suggested_question}
														</button>
													</div>
												)}
											</div>
										</div>
									))}
									<div ref={messagesEndRef} />
								</>
							)}
						</div>

						{/* Input Area */}
						<div className="sticky bottom-0 border-none pt-2 pb-4 px-4 bg-gray-50 z-10">
							<div className="flex items-end gap-4 p-2">
								<div className="flex-1 relative ">
									<textarea
										ref={chatInputRef}
										value={inputMessage}
										onChange={(e) => setInputMessage(e.target.value)}
										onKeyDown={handleKeyDown}
										placeholder={
											isSendingMessage
												? 'Sending message...'
												: isPdfReady
												? 'Ask a question about your PDF...'
												: 'Processing PDF...'
										}
										disabled={!isPdfReady || isUploading || isSendingMessage}
										className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent resize-none max-h-32 bg-gray-50 text-gray-900 placeholder-gray-500 caret-[#ff911d] disabled:opacity-50 disabled:cursor-not-allowed shadow-4xl"
										rows={1}
										autoFocus
									/>
								</div>
								<button
									onClick={() => handleSendMessage()}
									disabled={!inputMessage.trim() || !isPdfReady || isUploading || isSendingMessage}
									className="p-4 bg-[#ff911d] mb-2 text-white rounded-4xl hover:bg-[#e67e0a] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:shadow-xl"
									title="Send message"
								>
									{isSendingMessage ? (
										<CircleStop  className="w-5 h-5" />
									) : (
										<MoveUp className="w-5 h-5" />
									)}
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

