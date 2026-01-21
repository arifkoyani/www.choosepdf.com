import { useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { DraggableAnnotation } from '../DraggableAnnotation/DraggableAnnotation';
import type { Annotation } from '@/app/types/annotations';

// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfUrl: string;
  annotations: Annotation[];
  selectedId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  onDropAnnotation: (type: 'text' | 'formTextField' | 'checkbox' | 'checkedCheckbox' | 'image', x: number, y: number) => void;
}

export function PDFViewer({
  pdfUrl,
  annotations,
  selectedId,
  onSelectAnnotation,
  onUpdateAnnotation,
  onDropAnnotation,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onPageLoadSuccess = (page: { width: number; height: number }) => {
    setPageSize({ width: page.width, height: page.height });
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectAnnotation(null);
    }
  }, [onSelectAnnotation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const type = e.dataTransfer.getData('annotation-type') as 'text' | 'formTextField' | 'checkbox' | 'checkedCheckbox' | 'image';
    if (type) {
      onDropAnnotation(type, x, y);
    }
  }, [scale, onDropAnnotation]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const pageAnnotations = annotations.filter(a => a.page === currentPage - 1);

  return (
    <div className="flex-1 flex flex-col bg-muted/30 overflow-hidden">
      {/* Page controls */}
      <div className="flex items-center justify-between p-2 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="h-8 w-8 text-gray-700 bg-white/90 cursor-pointer hover:text-[#ff911d] hover:bg-[#fff5f0] disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[100px]  text-center text-gray-900 font-medium">
            Page {currentPage} of {numPages || '...'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
            className="h-8 w-8 text-gray-700 bg-white/90 cursor-pointer  hover:text-[#ff911d] hover:bg-[#fff5f0] disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
            disabled={scale <= 0.5}
            className="h-8 w-8 text-gray-700 cursor-pointer  bg-white/90 hover:text-[#ff911d] hover:bg-[#fff5f0] disabled:opacity-50"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[60px] text-center text-gray-900">{Math.round(scale * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScale(s => Math.min(2, s + 0.25))}
            disabled={scale >= 2}
            className="h-8 w-8 text-gray-700 bg-white/90 cursor-pointer hover:text-[#ff911d] hover:bg-[#fff5f0] disabled:opacity-50"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div ref={containerRef} className="flex-1 overflow-auto p-8 flex items-start justify-center">
        <div
          className="relative bg-white shadow-lg"
          style={{
            width: pageSize.width * scale || 'auto',
            height: pageSize.height * scale || 'auto',
          }}
          onClick={handleCanvasClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading=""
            error={
              <div className="flex items-center justify-center p-8 text-destructive">
                Failed to load PDF
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              onLoadSuccess={onPageLoadSuccess}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>

          {/* Annotations overlay */}
          <div 
            className="absolute inset-0"
            style={{ pointerEvents: 'none' }}
          >
            <div 
              className="absolute inset-0"
              style={{ pointerEvents: 'auto' }}
            >
              {pageAnnotations.map(annotation => (
                <DraggableAnnotation
                  key={annotation.id}
                  annotation={annotation}
                  isSelected={selectedId === annotation.id}
                  onSelect={() => onSelectAnnotation(annotation.id)}
                  onUpdate={(updates) => onUpdateAnnotation(annotation.id, updates)}
                  scale={scale}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}