import { FileBracesCorner} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ExcelToCsv() {
	return (
		<div className="mt-8">
			<Link href="/excel-to-csv">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-start rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Image 
						src="/icons/csv_6159450.svg" // your SVG file in public folder
						alt="Excel to Csv Icon"
						width={52} // adjust as needed
						height={64} // adjust as needed
						className="self-start"
					/>
					<h1 className="text-2xl font-bold text-gray-900 ">Excel to Csv</h1>
					<p className="text-gray-600 text-base text-justify">
						Convert Excel to Csv with the easiest Excel to Csv converter.
					</p>
				</button>
			</Link>
		</div>
	)
}



