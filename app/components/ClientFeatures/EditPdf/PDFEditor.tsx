'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Upload, FileText, X, Loader2, Download } from 'lucide-react';
import { useAnnotations } from '@/hooks/useAnnotations';
import { Toolbar } from './editor/Toolbar/Toolbar';
import { ElementsSidebar } from './editor/ElementsSidebar/ElementsSidebar';
import { PropertiesPanel } from './editor/PropertiesPanel/PropertiesPanel';
import { Button } from '@/app/components/ui/button';
import Spinner from '../../ui/loader/loader';
import { toast } from 'sonner';
import type { PDFPayload, Annotation, TextFieldAnnotation } from '@/app/types/annotations';

// Dynamically import PDFViewer with SSR disabled to prevent DOMMatrix error
const PDFViewer = dynamic(() => import('./editor/PDFViewer/PDFViewer').then(mod => ({ default: mod.PDFViewer })), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col bg-[#f4f4f5] overflow-hidden items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-[#ff911d] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600">Loading PDF Viewer...</p>
      </div>
    </div>
  ),
});

export function EditPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modifiedPdfUrl, setModifiedPdfUrl] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    annotations,
    selectedId,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    clearAllAnnotations,
    selectAnnotation,
    getSelectedAnnotation,
    createTextField,
    createCheckbox,
    createImageAnnotation,
  } = useAnnotations();

  const handleAddTextField = useCallback(() => {
    const annotation = createTextField(100, 100, currentPage);
    addAnnotation(annotation);
    toast.success('Text field added');
  }, [createTextField, currentPage, addAnnotation]);

  const handleAddCheckbox = useCallback(() => {
    const annotation = createCheckbox(100, 100, currentPage, false);
    addAnnotation(annotation);
    toast.success('Checkbox added');
  }, [createCheckbox, currentPage, addAnnotation]);

  const handleAddCheckedCheckbox = useCallback(() => {
    const annotation = createCheckbox(100, 100, currentPage, true);
    addAnnotation(annotation);
    toast.success('Checked checkbox added');
  }, [createCheckbox, currentPage, addAnnotation]);

  const uploadImageFile = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const data = await response.json();

      if (data.error === false && data.url) {
        return data.url;
      } else {
        throw new Error(data.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Image upload failed. Please try again.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate image file
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG, PNG, GIF, or WebP)');
        if (imageInputRef.current) imageInputRef.current.value = '';
        return;
      }

      // Get drop position if available (from drag and drop)
      const input = imageInputRef.current;
      const dropX = (input as any)?.dropX;
      const dropY = (input as any)?.dropY;
      
      // Clear drop position
      if (input) {
        (input as any).dropX = undefined;
        (input as any).dropY = undefined;
      }

      const imageUrl = await uploadImageFile(file);
      if (imageUrl) {
        const annotation = createImageAnnotation(dropX ?? 100, dropY ?? 100, currentPage, imageUrl);
        addAnnotation(annotation);
        toast.success('Image added');
      }
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleAddImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleDropAnnotation = useCallback((
    type: 'text' | 'checkbox' | 'checkedCheckbox' | 'image',
    x: number,
    y: number
  ) => {
    if (type === 'image') {
      // Trigger file input for image upload at drop position
      const input = imageInputRef.current;
      if (input) {
        // Store drop position temporarily
        (input as any).dropX = x;
        (input as any).dropY = y;
        input.click();
      }
      return;
    }

    let annotation: Annotation;
    switch (type) {
      case 'text':
        annotation = createTextField(x, y, currentPage);
        break;
      case 'checkbox':
        annotation = createCheckbox(x, y, currentPage, false);
        break;
      case 'checkedCheckbox':
        annotation = createCheckbox(x, y, currentPage, true);
        break;
      default:
        return;
    }
    addAnnotation(annotation);
  }, [createTextField, createCheckbox, createImageAnnotation, currentPage, addAnnotation]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedId) {
      deleteAnnotation(selectedId);
      toast.success('Annotation deleted');
    }
  }, [selectedId, deleteAnnotation]);

  // Handle keyboard delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Delete or Backspace key is pressed
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        // Don't delete if user is typing in an input field
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        
        e.preventDefault();
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedId, handleDeleteSelected]);

  const isValidPdfFile = (file: File): boolean => {
    const validTypes = ['application/pdf'];
    const validExtensions = ['pdf'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    return validTypes.includes(file.type) || validExtensions.includes(fileExtension || '');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidPdfFile(file)) {
        await uploadFile(file);
      } else {
        toast.error('Please select a valid PDF file (.pdf)');
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setPdfFile(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      if (data.error === false && data.url) {
        setPdfUrl(data.url);
        toast.success('PDF uploaded successfully');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'PDF upload failed. Please try again.');
      setPdfFile(null);
      setPdfUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfUrl(null);
    setModifiedPdfUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadPdf = async () => {
    if (modifiedPdfUrl) {
      setDownloadingPdf(true);
      try {
        // Fetch the PDF file
        const response = await fetch(modifiedPdfUrl);
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modified-pdf.pdf';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Wait a bit to ensure download starts
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Clear all annotations and reset states
        clearAllAnnotations();
        setModifiedPdfUrl(null);
        
        toast.success('PDF downloaded successfully!');
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Failed to download PDF');
      } finally {
        setDownloadingPdf(false);
      }
    }
  };

  const handleModifyAnotherPdf = () => {
    setModifiedPdfUrl(null);
    handleRemovePdf();
  };

  const handleCloseModal = () => {
    setModifiedPdfUrl(null);
  };

  const handleExportJson = useCallback(() => {
    if (!pdfUrl) return;
    const payload = buildPayload();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON exported');
  }, [annotations, pdfUrl]);

  const buildPayload = useCallback((): PDFPayload => {
    if (!pdfUrl) throw new Error('No PDF URL');
    const textAnnotations = annotations.filter(a => a.type === 'TextField' || a.type === 'Checkbox' || a.type === 'CheckedCheckbox');
    const imageAnnotations = annotations.filter(a => a.type === 'Image');

    return {
      url: pdfUrl,
      inline: false,
      annotations: textAnnotations.map(a => {
        const baseAnnotation = {
          text: a.type === 'TextField' ? (a as any).text : (a.type === 'CheckedCheckbox' ? '✓' : ''),
          x: a.x,
          y: a.y,
          width: a.width,
          height: a.height,
          pages: String(a.page),
          type: a.type === 'TextField' ? 'text' : (a.type === 'CheckedCheckbox' ? 'CheckboxChecked' : a.type),
          id: a.id,
        };

        // Add font properties for TextField annotations
        if (a.type === 'TextField') {
          const tf = a as TextFieldAnnotation;
          return {
            text: tf.text,
            x: tf.x,
            y: tf.y,
            size: tf.fontSize,
            pages: `${tf.page}-`,
            fontName: tf.fontFamily,
            fontBold: tf.fontBold,
            fontItalic: tf.fontItalic,
            fontStrikeout: tf.fontStrikeout,
            fontUnderline: tf.fontUnderline,
            color: tf.color,
            alignment: tf.alignment,
            transparent: tf.transparent,
          };
        }

        return baseAnnotation;
      }),
      images: imageAnnotations.map(a => ({
        url: (a as any).url,
        x: a.x,
        y: a.y,
        width: a.width,
        height: a.height,
        pages: String(a.page),
      })),
    };
  }, [annotations, pdfUrl]);

  const handleApplyToPdf = useCallback(async () => {
    if (!pdfUrl) {
      toast.error('No PDF uploaded');
      return;
    }
    if (annotations.length === 0) {
      toast.error('No annotations to apply');
      return;
    }

    setIsApplying(true);
    const payload = buildPayload();

    try {
      const response = await fetch('/api/editpdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message || 'Failed to apply annotations');
      }

      if (data.url) {
        setModifiedPdfUrl(data.url);
        toast.success('PDF generated successfully!');
      }
    } catch (error) {
      console.error('PDF edit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to apply annotations');
    } finally {
      setIsApplying(false);
    }
  }, [annotations, buildPayload, pdfUrl]);

  const selectedAnnotation = getSelectedAnnotation();

  // Show upload UI if no PDF is uploaded
  if (!pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f5] p-4">
        <div className="w-full max-w-2xl">
          {uploading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-[#ff911d] animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Uploading PDF...</p>
              <p className="text-sm text-gray-600">{pdfFile?.name}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit PDF</h1>
                <p className="text-gray-600">Upload a PDF file to start editing</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#ff911d] transition-colors bg-[#fff5f0]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-16 w-16 text-[#ff911d] mb-4" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">Click to upload a PDF file</p>
                  <p className="text-sm text-gray-500">PDF files only</p>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show editor after PDF is uploaded
  return (
    <div className="h-screen flex flex-col bg-[#f4f4f5]">
      {/* Hidden image input for file selection */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleImageFileSelect}
        className="hidden"
        id="image-upload"
      />

      {uploadingImage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-lg font-medium text-white">Uploading image...</p>
          </div>
        </div>
      )}

      <Toolbar
        onAddTextField={handleAddTextField}
        onAddCheckbox={handleAddCheckbox}
        onAddCheckedCheckbox={handleAddCheckedCheckbox}
        onAddImage={handleAddImage}
        onApplyToPdf={handleApplyToPdf}
        onDeleteSelected={handleDeleteSelected}
        hasSelection={!!selectedId}
        isApplying={isApplying}
        isApplyDisabled={!!modifiedPdfUrl}
      />

      {/* Download and Modify Another PDF Modal */}
      {modifiedPdfUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 relative max-w-md w-full mx-4">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Modal content */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">PDF Modified Successfully!</h3>
                <p className="text-gray-600">Your PDF has been modified with all annotations.</p>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <Button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="gap-2 bg-[#ff911d] cursor-pointer hover:bg-[#ff7a00] text-white font-medium shadow-lg px-6 py-3 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingPdf ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download PDF
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleModifyAnotherPdf}
                  variant="outline"
                  className="gap-2 cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50 font-medium shadow-md px-6 py-3 w-full"
                >
                  Modify Another PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <ElementsSidebar
          annotations={annotations}
          selectedId={selectedId}
          onSelectAnnotation={selectAnnotation}
          onExportJson={handleExportJson}
        />

        <PDFViewer
          pdfUrl={pdfUrl}
          annotations={annotations}
          selectedId={selectedId}
          onSelectAnnotation={selectAnnotation}
          onUpdateAnnotation={updateAnnotation}
          onDropAnnotation={handleDropAnnotation}
        />

        <PropertiesPanel
          selectedAnnotation={selectedAnnotation}
          onUpdate={(updates) => selectedId && updateAnnotation(selectedId, updates)}
          onDelete={handleDeleteSelected}
        />
      </div>
    </div>
  );
}
