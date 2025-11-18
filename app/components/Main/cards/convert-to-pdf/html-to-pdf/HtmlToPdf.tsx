import { Code  } from 'lucide-react'

export default function HtmlToPdf() {
	return (
		<div className="mt-12 w-full max-w-6xl">
			<div className="bg-white w-90 h-auto flex flex-col items-start gap-2 justify-center h-50 rounded-xl shadow-sm p-6 border   border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
            <Code   className="w-8 h-12 text-[#ff911d] mb-1"  strokeWidth={1} />
                <h1 className="text-2xl font-bold text-gray-900 mt-2">HTML to PDF</h1>
				<p className="text-gray-600 text-base">
					Convert HTML to PDF with the easiest PDF HTML to PDF service.
				</p>
			</div>
		</div>
	)
}
