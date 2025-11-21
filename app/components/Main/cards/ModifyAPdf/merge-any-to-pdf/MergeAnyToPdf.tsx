import { Merge } from "lucide-react";
export default function MergeAnyToPdf() {
	return (
		<div className="mt-12 w-full max-w-6xl">
			<div className="bg-white w-full sm:w-[360px] h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
            <Merge className="w-8 h-16 text-[#ff911d] "  strokeWidth={1} />
                <h1 className="text-2xl font-bold text-gray-900 ">Merge PDF</h1>
				<p className="text-gray-600 text-xs text-justify">
				Merge PDF  two or more DOC, XLS, images, even ZIP with documents and images into a new PDF.
				it supports zip, doc, docx, xls, xlsx, rtf, txt, png, jpg 
				</p>
			</div>
		</div>
	)
}

