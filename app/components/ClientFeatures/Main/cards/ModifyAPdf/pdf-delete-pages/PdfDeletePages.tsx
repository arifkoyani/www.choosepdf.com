import { CopyX } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
export default function PdfDeletePages() {
	return (
		<div className="mt-8">
			<Link href="/delete-pages-from-pdf">
				<button className="bg-white  h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Image 
						src="/icons/file_8157103.svg" // your SVG file in public folder
						alt="Delete Pages from PDF Icon"
						width={62} // adjust as needed
						height={64} // adjust as needed
						className="self-start"
					/>
					<h1 className="text-2xl font-bold text-gray-900 ">Delete Pages from PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Delete PDFs in the order you want with the easiest PDF Delete Pages service.
					</p>
				</button>
			</Link>
		</div>
	)
}


