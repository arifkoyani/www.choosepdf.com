import { Italic } from "lucide-react";

export default function PdfToTiff() {
	return (
		<div className="mt-12">
			<div className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
            <Italic   className="w-8 h-12 text-[#ff911d] mb-1"  strokeWidth={1} />
                        <h1 className="text-2xl font-bold text-gray-900 mt-2">PDF to TIFF</h1>
				<p className="text-gray-600 text-base text-justify">
					Convert PDF to TIFF with the easiest PDF PDF to TIFF service.
				</p>
			</div>
		</div>
	)
}




