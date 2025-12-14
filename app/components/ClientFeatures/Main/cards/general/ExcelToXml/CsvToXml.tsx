import { FileBracesCorner} from "lucide-react";
import Link from "next/link";

export default function CsvToXml() {
	return (
		<div className="mt-8">
			<Link href="/csv-to-xml">
				<button className="bg-green-400 h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<FileBracesCorner className="w-8 h-12 text-[#ff911d] "  strokeWidth={1} />
					<h1 className="text-2xl font-bold text-gray-900 ">Csv to Xml</h1>
					<p className="text-gray-600 text-base text-justify">
						Convert Csv to Xml with the easiest Csv to Xml converter.
					</p>
				</button>
			</Link>
		</div>
	)
}



