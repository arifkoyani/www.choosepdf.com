import Image from "next/image";
import Link from "next/link";

export default function MergeAnyToPdf() {
	return (
		<div className="mt-8">
			<Link href="/merge-any-to-pdf">
				<button className="bg-white h-60 flex flex-col items-start gap-2 justify-center rounded-xl shadow-sm p-6 px-10 md:px-6 border border-[#f3f2f9] hover:border-[#ff911d] hover:shadow-md transition-all duration-200 cursor-pointer">
					<Image 
						src="/icons/merge.svg" // your SVG file in public folder
						alt="Merge Icon"
						color="#ff911d"
						width={32} // adjust as needed
						height={64} // adjust as needed
					/>
					<h1 className="text-2xl font-bold text-gray-900">Merge any to PDF</h1>
					<p className="text-gray-600 text-base text-justify">
						Merge PDF two or more DOC, XLS, images, even ZIP with documents and images into a new PDF.
					</p>
				</button>
			</Link>
		</div>
	)
}
