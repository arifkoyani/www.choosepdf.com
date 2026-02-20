import Link from "next/link";
import Image from "next/image";

export default function PdfToXlsx() {
	return (
		<div>
			<Link href="/pdf-to-xlsx">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Image 
						src="/icons/excel_732089.svg" // your SVG file in public folder
						alt="PDF to XLSX Icon"
						width={52} // adjust as needed
						height={64} // adjust as needed
						className="self-start"
					/>
					<h1 className="text-2xl font-bold text-gray-900 ">PDF to XLSX</h1>
					<p className="text-gray-600 text-base text-justify">
						Convert PDF to  XLSX with the easiest PDF PDF to excel service.
					</p>
				</button>
			</Link>
		</div>
	)
}





