import { Merge } from "lucide-react";
import Link from "next/link";

export default function MergeAnyToPdf() {
	return (
		<div className="mt-8">
			<Link href="/merge-any-to-pdf">
				<button className="bg-green-400  h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 px-10 md:px-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Merge className="w-8 h-16 text-[#ff911d] "  strokeWidth={1} />
					<h1 className="text-2xl font-bold text-gray-900 ">Merge PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Merge PDF  two or more DOC, XLS, images, even ZIP with documents and images into a new PDF.
					</p>
				</button>
			</Link>
		</div>
	)
}

