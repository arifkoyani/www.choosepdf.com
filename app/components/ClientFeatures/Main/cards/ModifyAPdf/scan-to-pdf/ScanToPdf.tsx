import Link from "next/link";
import Image from "next/image";

export default function ScanToPdf() {
	return (
		<div className="mt-8">
			<Link href="/scan-to-pdf">
				<button className="bg-white  h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
				<Image 
						src="/icons/scanpdf.svg" // your SVG file in public folder
						alt="Scan to PDF Icon"
						color="#ff911d"
						width={82} // adjust as needed
						height={64} // adjust as needed
					/>
					<h1 className="text-2xl font-bold text-gray-900 ">Scan to PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Scan documents and convert them to PDF with the easiest PDF Scan to PDF.
					</p>
				</button>
			</Link>
		</div>
	)
}
