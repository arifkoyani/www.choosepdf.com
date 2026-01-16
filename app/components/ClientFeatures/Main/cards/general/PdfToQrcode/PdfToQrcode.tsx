import Link from "next/link";
import Image from "next/image";

export default function PdfToQrcode() {
	return (
		<div className="mt-8">
			<Link href="/pdf-to-qrcode">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-start rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Image 
						src="/icons/attach_9668871.svg" // your SVG file in public folder
						alt="Extract Attachments From Pdf Icon"
						width={62} // adjust as needed
						height={64} // adjust as needed
						className="self-start"
					/>
					<h1 className="text-2xl font-bold text-gray-900 text-left">Pdf to Qrcode</h1>
					<p className="text-gray-600 text-base text-left">
					upload your pdf and get a qrcode easiest Pdf to Qrcode.
					</p>
				</button>
			</Link>
		</div>
	)
}



