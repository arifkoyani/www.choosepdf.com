import {  SearchCheck } from "lucide-react";
export default function SearchablePdf() {
	return (
		<div className="mt-12 w-full max-w-6xl">
			<div className="bg-white w-90 h-auto flex flex-col items-start gap-2 justify-center h-50 rounded-xl shadow-sm p-6 border   border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
            <SearchCheck className="w-8 h-12 text-[#ff911d]"  strokeWidth={1} />
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Searchable PDF</h1>
				<p className="text-gray-600 text-base">
					Make PDFs searchable with the easiest PDF searchable service.
				</p>
			</div>
		</div>
	)
}