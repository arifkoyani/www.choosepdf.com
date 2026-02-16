'use client';
import dynamic from 'next/dynamic';
import Spinner from '../../ui/loader/loader';

const MergeAnyToPdf = dynamic(
  () => import('./MergeAnyToPdf'),
  {
    loading: () => (
      <div className="min-h-[calc(100vh-65px)] bg-[#f4f4f5] flex flex-col items-center justify-center py-8">
        <Spinner />
        <p className="text-sm text-gray-600 mt-4">Loading Merge Any to PDF...</p>
      </div>
    ),
    ssr: false
  }
);

export default function MergeClient() {
  return <MergeAnyToPdf />;
}
