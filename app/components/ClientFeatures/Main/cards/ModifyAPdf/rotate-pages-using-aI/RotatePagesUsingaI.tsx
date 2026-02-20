import { RotateCcwSquare } from "lucide-react";
import Link from "next/link";

export default function RotatePdfPagesUsingAI() {
	return (
		<div>
			<Link href="/rotate-pdf-pages-using-ai">
				<button className="bg-white h-auto min-h-[200px] sm:h-56 md:h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<RotateCcwSquare className="w-6 h-8 sm:w-7 sm:h-10 md:w-8 md:h-12 text-[#ff911d] "  strokeWidth={1} />
					<h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 ">Rotate Pages using AI</h1>
					<p className="text-gray-600 text-sm sm:text-base text-justify">
						Rotate PDFs in the order you want with the easiest PDF Rotate Pages using AI.
					</p>
				</button>
			</Link>
		</div>
	)
}
