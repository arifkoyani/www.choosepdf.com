import { ListPlus } from "lucide-react";

export default function AddPdf() {
	return (
		<div className="mt-12 w-full max-w-6xl">
			<div className="bg-white w-full sm:w-[360px] h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
            <ListPlus  className="w-8 h-12 text-[#ff911d] mb-1"  strokeWidth={1} />
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Add PDF</h1>
				<p className="text-gray-600 text-base text-justify">
                Add text, images, forms, other PDFs, fill forms, links to external sites and external PDF files. You can update or modify PDF and scanned PDF files.
				</p>
			</div>
		</div>
	)

}


