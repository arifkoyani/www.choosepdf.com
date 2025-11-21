import {  SquareSplitVertical } from "lucide-react";

export default function SplitPdf() {
	return (
		<div className="mt-12 w-full max-w-6xl">
			<div className="bg-white w-full sm:w-[360px] h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
            <SquareSplitVertical className="w-8 h-12 text-[#ff911d] mb-1"  strokeWidth={1} />
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Split PDF</h1>
				<p className="text-gray-600 text-base text-justify">
					Split PDFs into multiple files with the easiest PDF Split service.
				</p>
			</div>
		</div>
	)

}

