import { ChevronsLeftRightEllipsis } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
export default function PdfToWebP() {
	return (
		<div>
			<Link href="/pdf-to-webp">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Image 
						src="/icons/webp_15162435.svg" // your SVG file in public folder
						alt="PDF to WebP Icon"
						width={62} // adjust as needed
						height={64} // adjust as needed
						className="self-start"
					/>
					<h1 className="text-2xl font-bold text-gray-900 ">PDF to WebP</h1>
					<p className="text-gray-600 text-base text-justify">
						Convert PDF to WebP with the easiest PDF PDF to WebP service.
					</p>
				</button>
			</Link>
		</div>
	)
}





