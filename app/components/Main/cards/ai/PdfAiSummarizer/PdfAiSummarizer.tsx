import { BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function PdfAiSummarizer() {
	return (
		<div className="mt-12">
			<Link href="/pdf-ai-summarizer">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<BrainCircuit  className="w-8 h-12 text-[#ff911d] mb-1"  strokeWidth={1} />
					<h1 className="text-2xl font-bold text-gray-900 mt-2">PDF AI Summarizer</h1>
					<p className="text-gray-600 text-base text-justify">
						Summarize your PDF with the easiest PDF PDF AI Summarizer service.
					</p>
				</button>
			</Link>
		</div>
	)
}


