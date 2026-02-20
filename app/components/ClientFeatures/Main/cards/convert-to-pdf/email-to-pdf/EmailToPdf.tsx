import { MailCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EmailToPdf() {
	return (
		<div>
			<Link href="/email-to-pdf">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Image 
						src="/icons/mail_7285684.svg" // your SVG file in public folder
						alt="Email to PDF Icon"
						width={50} // adjust as needed
						height={64} // adjust as needed
						className="self-start"
					/>
					<h1 className="text-2xl font-bold text-gray-900 ">EMAIL to PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Convert EMAIL to PDF with the easiest PDF EMAIL to PDF service.
					</p>
				</button>
			</Link>
		</div>
	)
}

