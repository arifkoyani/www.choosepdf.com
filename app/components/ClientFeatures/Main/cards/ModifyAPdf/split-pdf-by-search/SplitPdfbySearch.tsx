import {  SeparatorHorizontal } from "lucide-react";
import Link from "next/link";

export default function SplitPdfbyText() {
	return (
		<div>
			<Link href="/split-pdf-by-search">
				<button className="bg-white  h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<SeparatorHorizontal className="w-8 h-12 text-[#ff911d] "  strokeWidth={1} />
					<h1 className="text-2xl font-bold text-gray-900 ">Split PDF by Search</h1>
					<p className="text-gray-600 text-base text-justify">
						Split PDFs by text with the easiest PDF Split by Text service.
					</p>
				</button>
			</Link>
		</div>
	)
}

