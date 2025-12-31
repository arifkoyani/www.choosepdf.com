'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import MergeAnyToPdf from './cards/ModifyAPdf/MergeAnyToPdf/MergeAnyToPdf'
import PdfDeletePages from './cards/ModifyAPdf/pdf-delete-pages/PdfDeletePages'
import PdfsToPdf from './cards/ModifyAPdf/MergePdfs/MergePdfs'
import RotatePagesUsingaI from './cards/ModifyAPdf/rotate-pages-using-aI/RotatePagesUsingaI'
import RotateSelectedPages from './cards/ModifyAPdf/rotate-selected-pages/RotateSelectedPages'
import ScanToPdf from './cards/ModifyAPdf/scan-to-pdf/ScanToPdf'
import SplitPdf from './cards/ModifyAPdf/split-pdf/SplitPdf'
import SplitPdfbyText from './cards/ModifyAPdf/split-pdf-by-search/SplitPdfbySearch'
import CompressPdf from './cards/optimize-pdf/compress-pdf/CompressPdf'
import NotSearchablePdf from './cards/optimize-pdf/not-searchable-pdf/NotSearchablePdf'
import SearchablePdf from './cards/optimize-pdf/searchable-pdf/SearchablePdf'
import AddPasswordToPdf from './cards/pdf-security/add-password-to-pdf/AddPasswordToPdf'
import RemovePasswordFromPdf from './cards/pdf-security/remove-password-from-pdf/RemovePasswordFromPdf'
import SearchTextDelete from './cards/edit-pdf/search-text-&-delete/SearchText&Delete'
import SearchTextAndReplace from './cards/edit-pdf/search-text-&-replace/SearchTextAndReplace'
import SearchTextReplaceImage from './cards/edit-pdf/search-text-replace-Image/SearchTextReplaceImage'
import CsvToPdf from './cards/convert-to-pdf/csv-to-pdf/CsvToPdf'
import WordToPdf from './cards/convert-to-pdf/word-to-pdf/WordToPdf'
import EmailToPdf from './cards/convert-to-pdf/email-to-pdf/EmailToPdf'
import ExcelToText from './cards/general/ExcelToText/ExcelToText'
import HtmlToPdf from './cards/convert-to-pdf/html-to-pdf/HtmlToPdf'
import JpgToPdf from './cards/convert-to-pdf/jpg-to-pdf/JpgToPdf'
import PngToPdf from './cards/convert-to-pdf/png-to-pdf/PngToPdf'
import RtfToPdf from './cards/convert-to-pdf/rtf-to-pdf/RtfToPdf'
import TiffToPdf from './cards/convert-to-pdf/tiff-to-pdf/TiffToPdf'
import TxtToPdf from './cards/convert-to-pdf/txt-to-pdf/TxtToPdf'
import UrlToPdf from './cards/convert-to-pdf/url-to-pdf/UrlToPdf'
import ZipToPdf from './cards/convert-to-pdf/zip-to-pdf/ZipToPdf'
import PdfToHtml from './cards/convert-from-pdf/pdf-to-html/PdfToHtml'
import PdfToJpg from './cards/convert-from-pdf/pdf-to-jpg/PdfToJpg'
import PdfToJson from './cards/convert-from-pdf/pdf-to-json/PdfToJson'
import PdfToJsonByaI from './cards/convert-from-pdf/pdf-to-json-by-aI/PdfToJsonByaI'
import PdfToPng from './cards/convert-from-pdf/pdf-to-png/PdfToPng'
import PdfToTextClassifier from './cards/convert-from-pdf/pdf-to-text/PdfToText'
import PdfToTiff from './cards/convert-from-pdf/pdf-to-tiff/PdfToTiff'
import PdfToWebP from './cards/convert-from-pdf/pdf-to-webP/PdfToWebP'
import PdfToXlsx from './cards/convert-from-pdf/pdf-to-Xlsx/pdf-to-Xlsx'
import PdfToXml from './cards/convert-from-pdf/pdf-to-xml/PdfToXml'
import ChatToPdf from './cards/ai/ChatToPdf/ChatToPdf'
import AIInvoiceParser from './cards/ai/AIInvoiceParser/AIInvoiceParser'
import CsvToHtml from './cards/general/CsvToHtml/CsvToHtml'
import CsvToJson from './cards/general/CsvToJson/CsvToJson'
import ExcelToJson from './cards/general/ExcelToJson/ExcelToJson'
import ExcelToCsv from './cards/general/ExcelToCsv/ExcelToCsv'
import ExcelToHtml from './cards/general/ExcelToHtml/ExcelToHtml'
import ExcelToXml from './cards/general/ExcelToXml/ExcelToXml'
import CsvToXml from './cards/general/ExcelToXml/CsvToXml'
import ExtractAttachmentsFromPdf from './cards/general/ExtractAttachmentsFromPdf/ExtractAttachmentsFromPdf'
import ExtractDataFromEmail from './cards/general/ExtractDataFromEmail/ExtractDataFromEmail'
import ExtractEmailAttachments from './cards/general/ExtractEmailAttachments/ExtractEmailAttachments'
import JpgToJson from './cards/general/JpgToJson/JpgToJson'
import PngToJson from './cards/general/PngToJson/PngToJson'
import BeamBorder from '../../ui/BeamBorder'
import ExcelToPdf from './cards/convert-to-pdf/excel-to-pdf/ExcelToPdf'
import PdfToXls from './cards/convert-from-pdf/pdf-to-Xls/PdfToXls'
import EditPdf from './cards/edit-pdf/EditPdf/EditPdf'
import FindTextInTableWithAI from './cards/ai/FindTextInTableWithAI/FindTextInTableWithAI'

export default function Main() {
	const [activeTab, setActiveTab] = useState('all')
	const [searchQuery, setSearchQuery] = useState('')
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
	const searchInputRef = useRef<HTMLInputElement>(null)
	const suggestionsRef = useRef<HTMLDivElement>(null)
	const isManualTabSelection = useRef(false)

	const tabs = [
		{ id: 'all', label: 'All' },
		{ id: 'modify', label: 'Modify a PDF' },
		{ id: 'optimize', label: 'Optimize PDF' },
		{ id: 'convert-to', label: 'Convert to PDF' },
		{ id: 'convert-from', label: 'Convert from PDF' },
		{ id: 'security', label: 'PDF Security' },
		{ id: 'edit', label: 'Edit PDF' },
		{ id: 'excel-conversion', label: 'Excel Conversion' },
	]

	// Define all cards with their categories
	const allCards = [
		// Modify a PDF (in the specified order)
		{ id: 'merge-any-to-pdf', component: <MergeAnyToPdf key="merge-any-to-pdf" />, category: 'modify' },
		{ id: 'scan-to-pdf', component: <ScanToPdf key="scan-to-pdf" />, category: 'modify' },
		{ id: 'pdfs-to-pdf', component: <PdfsToPdf key="pdfs-to-pdf" />, category: 'modify' },
		{ id: 'split-pdf', component: <SplitPdf key="split-pdf" />, category: 'modify' },
		{ id: 'split-pdf-by-text', component: <SplitPdfbyText key="split-pdf-by-text" />, category: 'modify' },
		{ id: 'rotate-pages-using-ai', component: <RotatePagesUsingaI key="rotate-pages-using-ai" />, category: 'modify' },
		{ id: 'rotate-selected-pages', component: <RotateSelectedPages key="rotate-selected-pages" />, category: 'modify' },
		{ id: 'pdf-delete-pages', component: <PdfDeletePages key="pdf-delete-pages" />, category: 'modify' },
		// Optimize PDF
		{ id: 'compress-pdf', component: <CompressPdf key="compress-pdf" />, category: 'optimize' },
		{ id: 'un-searchable-pdf', component: <NotSearchablePdf key="un-searchable-pdf" />, category: 'optimize' },
		{ id: 'searchable-pdf', component: <SearchablePdf key="searchable-pdf" />, category: 'optimize' },
		// PDF Security
		{ id: 'add-password-to-pdf', component: <AddPasswordToPdf key="add-password-to-pdf" />, category: 'security' },
		{ id: 'remove-password-from-pdf', component: <RemovePasswordFromPdf key="remove-password-from-pdf" />, category: 'security' },
		// Edit PDF
		{ id: 'add-pdf', component: <EditPdf key="add-pdf" />, category: 'edit' },
		{ id: 'search-text-delete', component: <SearchTextDelete key="search-text-delete" />, category: 'edit' },
		{ id: 'search-text-and-replace', component: <SearchTextAndReplace key="search-text-and-replace" />, category: 'edit' },
		{ id: 'search-text-replace-image', component: <SearchTextReplaceImage key="search-text-replace-image" />, category: 'edit' },
		// Convert to PDF
		{ id: 'csv-to-pdf', component: <CsvToPdf key="csv-to-pdf" />, category: 'convert-to' },
		{ id: 'word-to-pdf', component: <WordToPdf key="word-to-pdf" />, category: 'convert-to' },
		{ id: 'email-to-pdf', component: <EmailToPdf key="email-to-pdf" />, category: 'convert-to' },
		{ id: 'html-to-pdf', component: <HtmlToPdf key="html-to-pdf" />, category: 'convert-to' },
		{ id: 'jpg-to-pdf', component: <JpgToPdf key="jpg-to-pdf" />, category: 'convert-to' },
		{ id: 'png-to-pdf', component: <PngToPdf key="png-to-pdf" />, category: 'convert-to' },
		{ id: 'rtf-to-pdf', component: <RtfToPdf key="rtf-to-pdf" />, category: 'convert-to' },
		{ id: 'tiff-to-pdf', component: <TiffToPdf key="tiff-to-pdf" />, category: 'convert-to' },
		{ id: 'txt-to-pdf', component: <TxtToPdf key="txt-to-pdf" />, category: 'convert-to' },
		{ id: 'url-to-pdf', component: <UrlToPdf key="url-to-pdf" />, category: 'convert-to' },
		{ id: 'zip-to-pdf', component: <ZipToPdf key="zip-to-pdf" />, category: 'convert-to' },
		// Convert from PDF
		{ id: 'pdf-to-html', component: <PdfToHtml key="pdf-to-html" />, category: 'convert-from' },
		{ id: 'pdf-to-jpg', component: <PdfToJpg key="pdf-to-jpg" />, category: 'convert-from' },
		{ id: 'pdf-to-json', component: <PdfToJson key="pdf-to-json" />, category: 'convert-from' },
		{ id: 'pdf-to-json-by-ai', component: <PdfToJsonByaI key="pdf-to-json-by-ai" />, category: 'convert-from' },
		{ id: 'pdf-to-png', component: <PdfToPng key="pdf-to-png" />, category: 'convert-from' },
		{ id: 'pdf-to-text', component: <PdfToTextClassifier key="pdf-to-text" />, category: 'convert-from' },
		{ id: 'pdf-to-tiff', component: <PdfToTiff key="pdf-to-tiff" />, category: 'convert-from' },
		{ id: 'pdf-to-webp', component: <PdfToWebP key="pdf-to-webp" />, category: 'convert-from' },
		{ id: 'pdf-to-xls', component: <PdfToXls key="pdf-to-xls" />, category: 'convert-from' },
		{ id: 'pdf-to-xlsx', component: <PdfToXlsx key="pdf-to-xlsx" />, category: 'convert-from' },
		{ id: 'pdf-to-xml', component: <PdfToXml key="pdf-to-xml" />, category: 'convert-from' },
		// AI
		{ id: 'chat-to-pdf', component: <ChatToPdf key="chat-to-pdf" />, category: 'all' },
		{ id: 'ai-invoice-parser', component: <AIInvoiceParser key="ai-invoice-parser" />, category: 'all' },
		{ id: 'find-text-in-table-with-ai', component: <FindTextInTableWithAI key="find-text-in-table-with-ai" />, category: 'all' },
		// Excel Conversion
		{ id: 'excel-to-csv', component: <ExcelToCsv key="excel-to-csv" />, category: 'excel-conversion' },
		{ id: 'excel-to-json', component: <ExcelToJson key="excel-to-json" />, category: 'excel-conversion' },
		{ id: 'excel-to-html', component: <ExcelToHtml key="excel-to-html" />, category: 'excel-conversion' },
		{ id: 'excel-to-text', component: <ExcelToText key="excel-to-text" />, category: 'excel-conversion' },
		{ id: 'excel-to-xml', component: <ExcelToXml key="excel-to-xml" />, category: 'excel-conversion' },
		{ id: 'excel-to-pdf', component: <ExcelToPdf key="excel-to-pdf" />, category: 'excel-conversion' },
		// General
		{ id: 'csv-to-html', component: <CsvToHtml key="csv-to-html" />, category: 'all' },
		{ id: 'csv-to-json', component: <CsvToJson key="csv-to-json" />, category: 'all' },
		{ id: 'csv-to-xml', component: <CsvToXml key="csv-to-xml" />, category: 'all' },
		{ id: 'extract-attachments-from-pdf', component: <ExtractAttachmentsFromPdf key="extract-attachments-from-pdf" />, category: 'all' },
		{ id: 'extract-data-from-email', component: <ExtractDataFromEmail key="extract-data-from-email" />, category: 'all' },
		{ id: 'extract-email-attachments', component: <ExtractEmailAttachments key="extract-email-attachments" />, category: 'all' },
		{ id: 'jpg-to-json', component: <JpgToJson key="jpg-to-json" />, category: 'all' },
		{ id: 'png-to-json', component: <PngToJson key="png-to-json" />, category: 'all' },
	]

	// Generate search suggestions from card IDs
	const generateSuggestions = (query: string): string[] => {
		if (query.trim() === '') return []
		
		const queryLower = query.toLowerCase().trim()
		const suggestions: string[] = []
		const seen = new Set<string>()
		
		// Convert card IDs to readable format and filter
		allCards.forEach(card => {
			const readableText = card.id.replace(/-/g, ' ')
			const words = readableText.split(' ')
			
			// Check if query matches the card
			if (readableText.includes(queryLower)) {
				// Add the full readable text
				if (!seen.has(readableText)) {
					suggestions.push(readableText)
					seen.add(readableText)
				}
				
				// Add individual relevant words that match
				words.forEach(word => {
					if (word.startsWith(queryLower) && word.length > queryLower.length && !seen.has(word)) {
						suggestions.push(word)
						seen.add(word)
					}
				})
			}
		})
		
		// Also add common search terms
		const commonTerms = [
			'merge pdf', 'split pdf', 'compress pdf', 'convert pdf', 'rotate pdf',
			'word to pdf', 'excel to pdf', 'jpg to pdf', 'png to pdf', 'html to pdf',
			'pdf to word', 'pdf to excel', 'pdf to jpg', 'pdf to png', 'pdf to html',
			'add password', 'remove password', 'edit pdf', 'search text', 'delete pages'
		]
		
		commonTerms.forEach(term => {
			if (term.includes(queryLower) && !seen.has(term)) {
				suggestions.push(term)
				seen.add(term)
			}
		})
		
		// Limit to 8 suggestions and sort by relevance
		return suggestions
			.sort((a, b) => {
				// Prioritize exact matches and shorter matches
				const aStarts = a.toLowerCase().startsWith(queryLower)
				const bStarts = b.toLowerCase().startsWith(queryLower)
				if (aStarts && !bStarts) return -1
				if (!aStarts && bStarts) return 1
				return a.length - b.length
			})
			.slice(0, 8)
	}

	const suggestions = generateSuggestions(searchQuery)

	// Filter cards based on active tab and search query
	const filteredCards = allCards.filter(card => {
		// Filter by tab
		const matchesTab = activeTab === 'all' || card.category === activeTab
		
		// Filter by search query
		if (searchQuery.trim() === '') {
			return matchesTab
		}
		
		// Convert card id to readable format for searching (e.g., "merge-any-to-pdf" -> "merge any to pdf")
		const searchableText = card.id.replace(/-/g, ' ').toLowerCase()
		const query = searchQuery.toLowerCase().trim()
		
		// First check if the query appears as a whole phrase in- the searchable text
		if (searchableText.includes(query)) {
			return matchesTab
		}
		
		// Split query into words for flexible matching
		// This allows "doc to pdf" to match "docx to pdf" since we check each word individually
		const queryWords = query.split(/\s+/).filter(word => word.length > 0)
		
		// Filter out common words that don't add meaning to the search
		const commonWords = ['to', 'from', 'and', 'or', 'the', 'a', 'an']
		const meaningfulWords = queryWords.filter(word => !commonWords.includes(word))
		
		// If we have meaningful words, check if all of them match
		// If only common words, check if all words match
		const wordsToCheck = meaningfulWords.length > 0 ? meaningfulWords : queryWords
		
		// Check if all query words are present in the searchable text
		const allWordsMatch = wordsToCheck.every(word => {
			// Direct match - check if word is a substring of searchableText
			// This handles cases like "doc" matching "docx", "xls" matching "xlsx", etc.
			if (searchableText.includes(word)) {
				return true
			}
			
			// Handle common file extension variations where shorter search terms should match longer extensions
			// "doc" should explicitly match "docx", "xls" should match "xlsx", etc.
			const variations: { [key: string]: string[] } = {
				'doc': ['docx'],
				'xls': ['xlsx', 'excel'],
				'xlsx': ['xls', 'excel'],
				'excel': ['xls', 'xlsx'],
				'pdf': ['pdfs']
			}
			
			// Check if the search word has variations that exist in searchableText
			// For example, if user searches "doc", check if searchableText contains "docx"
			if (variations[word]) {
				return variations[word].some(variation => searchableText.includes(variation))
			}
			
			// Reverse check: if searchableText contains variations of the search word
			// For example, if searchableText is "xls to pdf" and user searches "excel", it should match
			for (const [key, values] of Object.entries(variations)) {
				if (values.includes(word) && searchableText.includes(key)) {
					return true
				}
			}
			
			return false
		})
		
		return matchesTab && allWordsMatch
	})

	// Sort filtered cards to prioritize exact matches (only when searching)
	const sortedCards = searchQuery.trim() === '' 
		? filteredCards 
		: [...filteredCards].sort((a, b) => {
			const aText = a.id.replace(/-/g, ' ').toLowerCase()
			const bText = b.id.replace(/-/g, ' ').toLowerCase()
			const query = searchQuery.toLowerCase().trim()
			
			// Exact match gets highest priority
			const aExact = aText === query
			const bExact = bText === query
			if (aExact && !bExact) return -1
			if (!aExact && bExact) return 1
			
			// Starts with query gets second priority
			const aStarts = aText.startsWith(query)
			const bStarts = bText.startsWith(query)
			if (aStarts && !bStarts) return -1
			if (!aStarts && bStarts) return 1
			
			// Contains query as whole phrase gets third priority
			const aContainsPhrase = aText.includes(query)
			const bContainsPhrase = bText.includes(query)
			if (aContainsPhrase && !bContainsPhrase) return -1
			if (!aContainsPhrase && bContainsPhrase) return 1
			
			// Shorter matches get priority (more specific)
			if (aContainsPhrase && bContainsPhrase) {
				return aText.length - bText.length
			}
			
			// Otherwise maintain original order
			return 0
		})

	// Handle suggestion selection
	const handleSuggestionClick = (suggestion: string) => {
		setSearchQuery(suggestion)
		setShowSuggestions(false)
		setSelectedSuggestionIndex(-1)
		searchInputRef.current?.focus({ preventScroll: true })
	}

	// Handle clear search
	const handleClearSearch = () => {
		setSearchQuery('')
		// Only switch to 'all' if tab wasn't manually selected
		if (!isManualTabSelection.current) {
			setActiveTab('all')
		}
		setShowSuggestions(false)
		setSelectedSuggestionIndex(-1)
		isManualTabSelection.current = false
		searchInputRef.current?.focus({ preventScroll: true })
	}

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!showSuggestions || suggestions.length === 0) {
			if (e.key === 'ArrowDown' && suggestions.length > 0) {
				setShowSuggestions(true)
				setSelectedSuggestionIndex(0)
			}
			return
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault()
				setSelectedSuggestionIndex(prev => 
					prev < suggestions.length - 1 ? prev + 1 : prev
				)
				break
			case 'ArrowUp':
				e.preventDefault()
				setSelectedSuggestionIndex(prev => 
					prev > 0 ? prev - 1 : -1
				)
				break
			case 'Enter':
				e.preventDefault()
				if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
					handleSuggestionClick(suggestions[selectedSuggestionIndex])
				}
				break
			case 'Escape':
				setShowSuggestions(false)
				setSelectedSuggestionIndex(-1)
				searchInputRef.current?.blur()
				break
		}
	}

	// Close suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target as Node) &&
				searchInputRef.current &&
				!searchInputRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false)
				setSelectedSuggestionIndex(-1)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	// Update suggestions visibility
	useEffect(() => {
		setShowSuggestions(searchQuery.trim() !== '' && suggestions.length > 0)
		setSelectedSuggestionIndex(-1)
	}, [searchQuery, suggestions.length])

	// Auto-switch tab based on search results
	useEffect(() => {
		// Don't auto-switch if tab was manually selected
		if (isManualTabSelection.current) {
			return
		}

		if (searchQuery.trim() === '') {
			// If search is cleared, switch to "all" tab
			if (activeTab !== 'all') {
				setActiveTab('all')
			}
			return
		}

		const query = searchQuery.toLowerCase().trim()

		// Find all cards that match the search query (ignoring current tab filter)
		const matchingCards = allCards.filter(card => {
			const searchableText = card.id.replace(/-/g, ' ').toLowerCase()
			
			// Check if query matches
			if (searchableText.includes(query)) {
				return true
			}
			
			// Split query into words for flexible matching
			const queryWords = query.split(/\s+/).filter(word => word.length > 0)
			const commonWords = ['to', 'from', 'and', 'or', 'the', 'a', 'an']
			const meaningfulWords = queryWords.filter(word => !commonWords.includes(word))
			const wordsToCheck = meaningfulWords.length > 0 ? meaningfulWords : queryWords
			
			// Check if all query words are present
			const allWordsMatch = wordsToCheck.every(word => {
				if (searchableText.includes(word)) {
					return true
				}
				
				const variations: { [key: string]: string[] } = {
					'doc': ['docx'],
					'xls': ['xlsx', 'excel'],
					'xlsx': ['xls', 'excel'],
					'excel': ['xls', 'xlsx'],
					'pdf': ['pdfs']
				}
				
				if (variations[word]) {
					return variations[word].some(variation => searchableText.includes(variation))
				}
				
				for (const [key, values] of Object.entries(variations)) {
					if (values.includes(word) && searchableText.includes(key)) {
						return true
					}
				}
				
				return false
			})
			
			return allWordsMatch
		})

		// If we have matching cards, find the most common category
		if (matchingCards.length > 0) {
			// Count categories
			const categoryCount: { [key: string]: number } = {}
			matchingCards.forEach(card => {
				categoryCount[card.category] = (categoryCount[card.category] || 0) + 1
			})

			// Find the category with the most matches
			const mostCommonCategory = Object.entries(categoryCount).reduce((a, b) => 
				b[1] > a[1] ? b : a
			)[0]

			// Only switch if we have a clear category match and it's different from current tab
			// Also prioritize exact matches - if search exactly matches a card ID, use that card's category
			const exactMatch = matchingCards.find(card => 
				card.id.replace(/-/g, ' ').toLowerCase() === query
			)

			if (exactMatch) {
				// If there's an exact match, use that card's category
				if (activeTab !== exactMatch.category) {
					setActiveTab(exactMatch.category)
				}
			} else if (mostCommonCategory && activeTab !== mostCommonCategory) {
				// Otherwise use the most common category
				setActiveTab(mostCommonCategory)
			}
		}
	}, [searchQuery, allCards, activeTab])

	// Keep search input always focused (without scrolling)
	useEffect(() => {
		// Focus on mount without scrolling
		if (searchInputRef.current) {
			searchInputRef.current.focus({ preventScroll: true })
		}

		// Keep focus when clicking outside (without scrolling)
		const handleBlur = () => {
			setTimeout(() => {
				if (searchInputRef.current) {
					searchInputRef.current.focus({ preventScroll: true })
				}
			}, 0)
		}

		const input = searchInputRef.current
		if (input) {
			input.addEventListener('blur', handleBlur)
			return () => {
				input.removeEventListener('blur', handleBlur)
			}
		}
	}, [])

	return (
		<div className="flex flex-col items-center bg-[#f4f4f5] justify-start pt-20 px-2 min-h-screen text-center px-4">
			<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 select-text">
				Every tool you need to work with PDFs in one place
			</h1>
			<h2 className="text-lg md:text-xl mt-6 lg:mt-6 lg:text-2xl text-gray-600 max-w-3xl mb-8 select-text">
				Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
			</h2>
            
            <div className="flex flex-wrap gap-8 mt-14 justify-center">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            isManualTabSelection.current = true
                            setActiveTab(tab.id)
                        }}
                        className={`px-4 py-2 cursor-pointer border border-gray-300 shadow-xl rounded-2xl text-sm font-medium transition-all duration-200 select-text ${
                            activeTab === tab.id
                                ? 'bg-[#ff911d] text-white shadow-xl border-none'
                                : 'bg-[#fff5f0] text-gray-700 hover:text-gray-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            
            {/* Search bar */}
            <div className="w-full max-w-[806px] mt-14 mb-18 md:mb-24 lg:mb-32 relative">
                <BeamBorder>
                    <div className="relative flex items-center justify-center">
                        {!searchQuery && (
                            <div className="absolute flex items-center gap-3 pointer-events-none z-10 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                <span className="text-gray-400 text-base whitespace-nowrap">Search 100+ tools features...</span>
                            </div>
                        )}
                        <Search 
                            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none transition-all duration-700 ease-in-out ${
                                searchQuery 
                                    ? 'hidden' 
                                    : 'left-1/2 -translate-x-[calc(50%+130px)]'
                            }`} 
                        />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder=""
                            value={searchQuery}
                            onChange={(e) => {
                                // Reset manual selection flag when user types, allowing auto-switching
                                isManualTabSelection.current = false
                                setSearchQuery(e.target.value)
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                                if (searchQuery.trim() !== '' && suggestions.length > 0) {
                                    setShowSuggestions(true)
                                }
                            }}
                            className={`w-full py-4 rounded-2xl border-0 focus:outline-none focus:ring-0 text-gray-900 transition-all duration-300 ease-in-out bg-transparent caret-[#ff901d] ${
                                searchQuery ? 'px-4 pr-12 text-center' : 'px-12 text-center'
                            }`}
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute top-1/2 shadow-xl  -translate-y-1/2 right-4 z-20 p-1.5 text-white hover:text-white/80 transition-colors duration-200 rounded-xl hover:bg-[#ff911d]/90 focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:ring-offset-2 bg-[#ff911d]/85 cursor-pointer"
                                aria-label="Clear search"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </BeamBorder>
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div
                        ref={suggestionsRef}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-transparent rounded-xl max-h-80 overflow-y-auto z-50 w-full max-w-md"
                    >
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleSuggestionClick(suggestion)}
                                onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                className={`w-full px-4 py-0 text-center text-sm cursor-pointer transition-colors duration-150 select-text ${
                                    index === selectedSuggestionIndex
                                        ? 'text-[#ff911d]'
                                        : 'text-gray-700 hover:text-gray-900'
                                } ${index === 0 ? 'rounded-t-xl' : ''} ${
                                    index === suggestions.length - 1 ? 'rounded-b-xl' : ''
                                }`}
                            >
                                <span className="font-medium">{suggestion}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
           
           {/* Cards grid */}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-y-2 mt-14 mb-10 w-fit gap-x-10 px-10 md:px-10" >
                {sortedCards.map(card => card.component)}
            </div>
		</div>
	)
}

