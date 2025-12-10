import { Bot } from "lucide-react";
import Link from "next/link";

export default function ChatToPdf() {
	return (
		<div className="mt-8">
			<Link href="/chat-to-pdf-using-ai">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Bot  className="w-8 h-12 text-[#ff911d] "  strokeWidth={1} />
					<h1 className="text-2xl font-bold text-gray-900 ">Chat to PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Chat to PDF with the easiest PDF Chat to PDF service.
					</p>
				</button>
			</Link>
		</div>
	)
}
