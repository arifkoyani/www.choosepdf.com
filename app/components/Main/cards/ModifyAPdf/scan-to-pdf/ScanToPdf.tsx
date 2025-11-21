import { Scan } from "lucide-react";

export default function ScanToPdf() {
	return (
		<div className="mt-12 w-full max-w-6xl">
			<div className="bg-white w-full sm:w-[360px] h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
            <Scan className="w-8 h-12 text-[#ff911d] mb-1"  strokeWidth={1} />
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Scan to PDF</h1>
				<p className="text-gray-600 text-base text-justify">
					Scan documents and convert them to PDF with the easiest PDF Scan to PDF.
				</p>
			</div>
		</div>
	)

}
