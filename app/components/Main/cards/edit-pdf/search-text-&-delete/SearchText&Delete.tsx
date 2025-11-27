import { RemoveFormatting } from "lucide-react";

export default function SearchTextDelete() {
	return (
		<div className="mt-12">
			<div className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
            <RemoveFormatting className="w-8 h-12 text-[#ff911d] mb-1"  strokeWidth={1} />
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Search Text & Delete</h1>
				<p className="text-gray-600 text-base text-justify">
					Search text and delete it with the easiest PDF Search Text & Delete service.
				</p>
			</div>
		</div>
	)

}


