import Link from "next/link";
import Image from "next/image";

export default function ExtractEmailAttachments() {
	return (
		<div className="mt-8">
			<Link href="/extract-email-attachments">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
				<Image 
						src="/icons/mail_7285684.svg" // your SVG file in public folder
						alt="Unlock PDF Icon"
						width={52} // adjust as needed
						height={64} // adjust as needed
						className="self-start"
					/>
					<h1 className="text-xl font-bold text-gray-900 ">Extract Email Attachments</h1>
					<p className="text-gray-600 text-base text-justify">
						Extract Email Attachments with the easiest Extract Email Attachments .
					</p>
				</button>
			</Link>
		</div>
	)
}



