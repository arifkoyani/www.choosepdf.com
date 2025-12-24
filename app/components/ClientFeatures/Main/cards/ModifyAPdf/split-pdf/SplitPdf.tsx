import Link from "next/link";
import Image from "next/image";

export default function SplitPdf() {
	return (
		<div className="mt-8">
			<Link href="/split-pdf">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Image 
						src="/icons/split_2088694.svg" // your SVG file in public folder
						alt="Split PDF Icon"
						width={50} // adjust as needed
						height={64} // adjust as needed
						className="self-start"
					/>
					<h1 className="text-2xl font-bold text-gray-900">Split PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Split PDFs into multiple files with the easiest PDF Split service.
					</p>
				</button>
			</Link>
		</div>
	)
}

