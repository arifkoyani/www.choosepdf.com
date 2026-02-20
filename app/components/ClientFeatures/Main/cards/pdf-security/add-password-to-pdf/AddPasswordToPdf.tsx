import Link from "next/link";
import Image from "next/image";
export default function AddPasswordToPdf() {
	return (
		<div>
			<Link href="/add-password-to-pdf">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
				<Image 
						src="/icons/lock_16625537.svg" // your SVG file in public folder
						alt="Unlock PDF Icon"
						color="#ff911d"
						width={52} // adjust as needed
						height={64} // adjust as needed
					/>
					<h1 className="text-2xl font-bold text-gray-900 mb-3"> Add Password to PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Add a password to PDFs with the easiest PDF add password service.
					</p>
				</button>
			</Link>
		</div>
	)
}