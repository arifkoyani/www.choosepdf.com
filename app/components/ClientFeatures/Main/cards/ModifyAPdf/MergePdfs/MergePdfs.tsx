import { SquareEqual } from "lucide-react";
import Link from "next/link";

export default function MergePdfs() {
	return (
		<div>
			<Link href="/merge-pdfs">
				<button className="bg-white  h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<SquareEqual className="w-8 h-16 text-[#ff911d] mb-2"  strokeWidth={1} />
					<h1 className="text-2xl font-bold text-gray-900 mb-3">Merge PDFs to PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Merge multiple PDF files into a single PDF document.
					</p>
				</button>
			</Link>
		</div>
	)
}
