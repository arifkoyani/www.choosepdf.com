import Link from "next/link";
import Image from "next/image";

export default function ZipToPdf() {
	return (
		<div>
			<Link href="/zip-to-pdf">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					
					<Image 
						src="/icons/zip-file_18361914.svg" // your SVG file in public folder
						alt="ZIP to PDF Icon"
						width={62} // adjust as needed
						height={64} // adjust as needed
						className="self-start"
					/>
					<h1 className="text-2xl font-bold text-gray-900 ">ZIP to PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Convert ZIP to PDF with the easiest PDF ZIP to PDF service.
					</p>
				</button>
			</Link>
		</div>
	)
}


