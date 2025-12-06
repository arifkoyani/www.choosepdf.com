import { BookType } from "lucide-react";
import Link from "next/link";

export default function TiffToPdf() {
	return (
		<div className="mt-12">
			<Link href="/tiff-to-pdf">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<BookType  className="w-8 h-12 text-[#ff911d] mb-1"  strokeWidth={1} />
					<h1 className="text-2xl font-bold text-gray-900 mt-2">TIFF to PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Convert TIFF to PDF with the easiest PDF TIFF to PDF service.
					</p>
				</button>
			</Link>
		</div>
	)
}
