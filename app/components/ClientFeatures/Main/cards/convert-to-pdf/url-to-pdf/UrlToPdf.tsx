import Link from "next/link";
import Image from "next/image";
export default function UrlToPdf() {
	return (
		<div className="mt-8">
			<Link href="/url-to-pdf">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Image 
						src="/icons/web-link_18572283.svg" // your SVG file in public folder
						alt="URL to PDF Icon"
						width={62} // adjust as needed
						height={64} // adjust as needed
						className="self-start"
					/>
					<h1 className="text-2xl font-bold text-gray-900 ">URL to PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Convert URL to PDF with the easiest PDF URL to PDF service.
					</p>
				</button>
			</Link>
		</div>
	)
}
