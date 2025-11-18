'use client'

import { useState } from 'react'
import MergeAnyToPdf from './cards/ModifyAPdf/merge-any-to-pdf/MergeAnyToPdf'
import PdfDeletePages from './cards/ModifyAPdf/pdf-delete-pages/PdfDeletePages'
import PdfsToPdf from './cards/ModifyAPdf/pdfs-to-pdf/PdfsToPdf'
import RotatePagesUsingaI from './cards/ModifyAPdf/rotate-pages-using-aI/RotatePagesUsingaI'
import RotateSelectedPages from './cards/ModifyAPdf/rotate-selected-pages/RotateSelectedPages'
import ScanToPdf from './cards/ModifyAPdf/scan-to-pdf/ScanToPdf'
import SplitPdf from './cards/ModifyAPdf/split-pdf/SplitPdf'
import SplitPdfbyText from './cards/ModifyAPdf/split-pdf-by-text/SplitPdfbyText'
import CompressPdf from './cards/optimize-pdf/compress-pdf/CompressPdf'
import NotSearchablePdf from './cards/optimize-pdf/not-searchable-pdf/NotSearchablePdf'
import SearchablePdf from './cards/optimize-pdf/searchable-pdf/SearchablePdf'
import AddPasswordToPdf from './cards/pdf-security/add-password-to-pdf/AddPasswordToPdf'
import RemovePasswordFromPdf from './cards/pdf-security/remove-password-from-pdf/RemovePasswordFromPdf'
import SearchTextDelete from './cards/edit-pdf/search-text-&-delete/SearchText&Delete'
import SearchTextAndReplace from './cards/edit-pdf/search-text-&-replace/SearchTextAndReplace'
import SearchTextReplaceImage from './cards/edit-pdf/search-text-replace-Image/SearchTextReplaceImage'
import CsvToPdf from './cards/convert-to-pdf/csv-to-pdf/CsvToPdf'
import DocxToPdf from './cards/convert-to-pdf/docx-to-pdf/DocxToPdf'
import EmailToPdf from './cards/convert-to-pdf/email-to-pdf/EmailToPdf'
import ExcelToPdf from './cards/convert-to-pdf/excel-to-pdf/ExcelToPdf'
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
import PdfToTextClassifier from './cards/convert-from-pdf/pdf-to-text-classifier/PdfToTextClassifier'
import PdfToTiff from './cards/convert-from-pdf/pdf-to-tiff/PdfToTiff'
import PdfToWebP from './cards/convert-from-pdf/pdf-to-webP/PdfToWebP'
import PdfToXls from './cards/convert-from-pdf/pdf-to-xls/PdfToXls'
import PdfToXlsx from './cards/convert-from-pdf/pdf-to-xlsx/PdfToXlsx'
import PdfToXml from './cards/convert-from-pdf/pdf-to-xml/PdfToXml'
import AiPdfHealthScore from './cards/ai/AiPdfHealthScore/AiPdfHealthScore'
import ChatToPdf from './cards/ai/ChatToPdf/ChatToPdf'
import PdfAiSummarizer from './cards/ai/PdfAiSummarizer/PdfAiSummarizer'

export default function Main() {
	const [activeTab, setActiveTab] = useState('all')

	const tabs = [
		{ id: 'all', label: 'All' },
		{ id: 'modify', label: 'Modify a PDF' },
		{ id: 'optimize', label: 'Optimize PDF' },
		{ id: 'convert-to', label: 'Convert to PDF' },
		{ id: 'convert-from', label: 'Convert from PDF' },
		{ id: 'security', label: 'PDF Security' },
		{ id: 'edit', label: 'Edit PDF' },
	]

	return (
		<div className="flex flex-col items-center bg-[#f4f4f5] justify-start pt-20 px-30 min-h-screen text-center px-4">
			<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
				Every tool you need to work with PDFs in one place
			</h1>
			<h2 className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mb-8">
				Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
			</h2>
            
            <div className="flex flex-wrap gap-10 mt-14 justify-center">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 cursor-pointer  rounded-2xl text-sm font-medium transition-all duration-200 ${
                            activeTab === tab.id
                                ? 'bg-[#ff911d] text-white shadow-sm'
                                : 'bg-[#fff5f0] text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
           
           {/* this is the modify a pdf section */}
            <div className="grid grid-cols-3  mt-14 mb-10 w-full max-w-7xl">
            <MergeAnyToPdf />
            <PdfDeletePages />
            <PdfsToPdf />
            <RotateSelectedPages />
            <RotatePagesUsingaI />
            <ScanToPdf />
            <SplitPdf />
            <SplitPdfbyText />
            <CompressPdf />
            <NotSearchablePdf />
            <SearchablePdf />
            <AddPasswordToPdf />
            <RemovePasswordFromPdf />
            <SearchTextDelete />
            <SearchTextAndReplace />
            <SearchTextReplaceImage />
            <CsvToPdf /> 
            <DocxToPdf />
            <EmailToPdf />
            <ExcelToPdf />
            <HtmlToPdf/>
            <JpgToPdf/>
            <PngToPdf/>
            <RtfToPdf/>
            <TiffToPdf/>
            <TxtToPdf/>
            <UrlToPdf/>
            <ZipToPdf/>
            <PdfToHtml/>
            <PdfToJpg/>
            <PdfToJson/>
            <PdfToJsonByaI/>
            <PdfToPng/>
            <PdfToTextClassifier/>
            <PdfToTiff/>
            <PdfToWebP/>
            <PdfToXls/>
            <PdfToXlsx/>
            <PdfToXml/>
            <AiPdfHealthScore/>
            <ChatToPdf/>
            <PdfAiSummarizer/>
            </div> 
{/* <------------------------------------> */}


		</div>
	)
}
