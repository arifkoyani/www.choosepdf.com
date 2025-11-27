import { FileCode } from "lucide-react";

export default function WordToPdf() {
	return (
		<div className="mt-12">
			<div className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
            <FileCode   className="w-8 h-12 text-[#ff911d] mb-1"  strokeWidth={1} />
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Word to PDF</h1>
				<p className="text-gray-600 text-base text-justify">
					Convert Word to PDF with the easiest PDF Word to PDF service.
				</p>
			</div>
		</div>
	)
}