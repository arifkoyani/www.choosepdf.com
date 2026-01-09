import Link from "next/link";
import Image from "next/image";
export default function RemovePasswordFromPdf() {
	return (
		<div className="mt-8">
			<Link href="/remove-password-from-pdf">
				<button className="bg-white h-60 flex flex-col items-start gap-2 rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
				<Image 
						src="/icons/unlockpdf.svg" // your SVG file in public folder
						alt="Unlock PDF Icon"
						width={62} // adjust as needed
						height={64} // adjust as needed
					/>
					<h1 className="text-2xl font-bold text-gray-900 mb-3">Remove Password from PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Remove a password from PDFs with the easiest PDF remove password .
					</p>
				</button>
			</Link>
		</div>
	)
}