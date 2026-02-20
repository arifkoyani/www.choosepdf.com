import Link from "next/link";
import Image from "next/image";

export default function RtfToPdf() {
	return (
		<div>
			<Link href="/rtf-to-pdf">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Image 
						src="/icons/rtf_10235140.svg" // your SVG file in public folder
						alt="RTF to PDF Icon"
						width={62} // adjust as needed
						height={64} // adjust as needed
						className="self-start"
					/>
					<h1 className="text-2xl font-bold text-gray-900 ">RTF to PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Convert RTF to PDF with the easiest PDF RTF to PDF service.
					</p>
				</button>
			</Link>
		</div>
	)
}

