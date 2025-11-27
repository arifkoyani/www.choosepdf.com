import React from 'react';
import { FileBracesCorner} from "lucide-react";
export default function ExtractDataFromEmail() {
	return (
		<div className="mt-12">
			<div className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
            <FileBracesCorner className="w-8 h-12 text-[#ff911d] mb-1"  strokeWidth={1} />
                                <h1 className="text-2xl font-bold text-gray-900 mt-2">Extract Data From Email</h1>
				<p className="text-gray-600 text-base text-justify">
					Extract Data From Email with the easiest Extract Data From Email .
				</p>
			</div>
		</div>
	)
}



