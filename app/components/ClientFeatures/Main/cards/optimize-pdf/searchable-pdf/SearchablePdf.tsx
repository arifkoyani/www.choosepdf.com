import Link from "next/link";
import Image from "next/image";
export default function SearchablePdf() {
	return (
		<div>
			<Link href="/make-pdf-searchable">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Image 
						src="/icons/ocr_5261894.svg" // your SVG file in public folder
						alt="Search PDF Icon"
						width={52} // adjust as needed
						height={64} // adjust as needed
						className="self-start"
					/>
					<h1 className="text-2xl font-bold text-gray-900 mb-3">Searchable PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Make PDFs searchable with the easiest PDF searchable service.
					</p>
				</button>
			</Link>
		</div>
	)
}