"use client";
import { useState, useRef } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { X, Download, FileText, File, Image, Archive, MoveUpRight, Merge, Loader2, MonitorUp } from 'lucide-react';
import Spinner from '../../ui/loader/loader';
import { toast } from 'sonner';

type AppState = 'select' | 'uploading' | 'merging' | 'ready';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

const MergeAnyToPdf = () => {
  const [state, setState] = useState<AppState>('select');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [mergedFileUrl, setMergedFileUrl] = useState('');
  const [downloadingMerged, setDownloadingMerged] = useState(false);
  const [toEmail, setToEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    const extension = fileName.toLowerCase().split('.').pop();

    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(extension || '')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    if (fileType === 'application/pdf' || extension === 'pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (['doc', 'docx'].includes(extension || '') || fileType.includes('word')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (['xls', 'xlsx'].includes(extension || '') || fileType.includes('sheet')) {
      return <FileText className="w-5 h-5 text-green-600" />;
    }
    if (['zip', 'rar', '7z'].includes(extension || '') || fileType.includes('zip')) {
      return <Archive className="w-5 h-5 text-purple-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/zip',
      'application/x-zip-compressed'
    ];

    const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];
    const fileExtension = file.name.toLowerCase().split('.').pop();

    return validTypes.includes(file.type) || validExtensions.includes(fileExtension || '');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      if (isValidFileType(file)) {
        await uploadFile(file);
      } else {
        alert(`Please select a valid file (PDF, DOC, XLS, Images, or ZIP). Invalid file: ${file.name}`);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setState('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      if (data.error === false) {
        const newFile: UploadedFile = {
          id: fileId,
          name: file.name,
          url: data.url,
          size: formatFileSize(file.size),
          type: file.type
        };

        setUploadedFiles(prev => [...prev, newFile]);
        setState('select');
      } else {
        setState('select');
        alert('contact choosepdf support team');
      }
    } catch (error) {
      console.error('Upload error: contact choosepdf support team', error);
      setState('select');
      alert('contact choosepdf support team');
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const filtered = prev.filter(file => file.id !== fileId);
      if (filtered.length === 0) {
        setState('select');
        setMergedFileUrl('');
      }
      return filtered;
    });
  };

  const mergeDocuments = async () => {
    if (uploadedFiles.length < 2) {
      alert('Please upload at least 2 files to merge. contact choosepdf support team');
      return;
    }

    setState('merging');

    try {
      const urlsString = uploadedFiles.map(file => file.url).join(',');

      const response = await fetch('/api/mergeanytopdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlsString,
        }),
      });

      if (!response.ok) {
        throw new Error('Merge failed');
      }

      const data = await response.json();

      if (data.error === false && data.url) {
        console.log('Merge completed successfully.');
        setMergedFileUrl(data.url);
        setState('ready');
      } else {
        console.error('Document merge failed: contact choosepdf support team');
        alert('contact choosepdf support team');
        setState('select');
      }
    } catch (error) {
      console.error('Merge error: contact choosepdf support team');
      alert('contact choosepdf support team');
      setState('select');
    }
  };

  const resetConverter = () => {
    setState('select');
    setUploadedFiles([]);
    setMergedFileUrl('');
    setToEmail('');
  };

  const handleSendEmail = async () => {
    if (!toEmail || !mergedFileUrl) {
      alert("Recipient email and file URL are required");
      return;
    }

    setSendingEmail(true);

    try {
      const response = await fetch('/api/send-email', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toEmail,
          fileUrl: mergedFileUrl,
        }),
      });

      // Check if response is OK
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Email send failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      
      // Check if email was sent successfully (route returns { error: false } on success)
      if (!data.error) {
        toast.success("Email sent successfully", {
          description: "Your email has been delivered.",
          duration: 5000,
          position: "bottom-right"
        });
        setToEmail('');
      } else {
        // Show error message from route if available
        const errorMessage = data.message || "contact choosepdf support team";
        toast.error("Failed to send email", {
          description: errorMessage,
          duration: 3000,
          position: "bottom-right"
        });
      }
    } catch (err) {
      console.error('Email send error:', err);
      const errorMessage = err instanceof Error ? err.message : "contact choosepdf support team";
      toast.error("Failed to send email", {
        description: errorMessage,
        duration: 3000,
        position: "bottom-right"
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const downloadMergedFile = async () => {
    setDownloadingMerged(true);
    try {
      const response = await fetch(mergedFileUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "merged-document.pdf";
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert("contact choosepdf support team");
    } finally {
      setDownloadingMerged(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f4f4f5] flex flex-col items-center justify-start py-8">

      <div className='pb-8 flex flex-col justify-center items-center space-y-3'>
        <h1 className="text-gray-600 text-xl font-medium">Merge Various Document Types Into Single PDF</h1>

      </div>

      <Card className="w-full max-w-6xl p-6 sm:p-8 shadow-none  border-none bg-transparent">
        <div className="space-y-6">

          {/* Upload Section */}
          {(state === 'select' || uploadedFiles.length > 0) && !mergedFileUrl && state !== 'merging' && state !== 'uploading' && (
            <div className="space-y-4 bg-transparent rounded-xl p-4 flex flex-col items-center justify-between">
              <div className="w-full mx-auto min-h-16 bg-[#f4f4f5] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="relative w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ fontSize: 0 }}
                    multiple
                  />
                  <div className="w-full min-h-16 flex justify-center items-center cursor-pointer bg-[#ff911d] border-2 border-solid border-[#ff911d] rounded-lg hover:border-[#ff911d] transition-colors">
                    <MonitorUp className="w-6 h-6 text-[#f4f4f5]" />
                  </div>
                </div>
              </div>
             
             {uploadedFiles.length === 0 && (
               <span>
                 <p className="text-sm text-gray-600 text-center">
                   Merge PDF from two or more PDF, DOC, XLS, images, even ZIP with documents and images into a new PDF.
                 </p>

                 <p className="text-sm text-gray-600 text-center">
                   Supported: PDF, DOC, DOCX, XLS, XLSX, Images (JPG, PNG), ZIP
                 </p>
               </span>
             )} 
          
            </div>
          )}

          {/* Upload Progress */}
          {state === 'uploading' && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && !mergedFileUrl && state !== 'merging' && (
            <div className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(file.name, file.type)}
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{index + 1}. {file.name}</p>
                        <p className="text-xs text-gray-600">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                        title="Open in new tab"
                        className="border-gray-300 hover:bg-gray-100 cursor-pointer"
                      >
                        <MoveUpRight className="w-4 h-4 text-gray-700" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        title="Remove file"
                        className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Merge Button */}
              {uploadedFiles.length >= 2 && (
                <Button
                  onClick={mergeDocuments}
                  className="w-full bg-green-600 hover:bg-green-700 cursor-pointer text-white text-lg py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                >
                  <Merge  className="w-5 h-5 mr-2" />
                  Merge {uploadedFiles.length} Document{uploadedFiles.length > 1 ? 's' : ''} Now
                </Button>
              )}
            </div>
          )}

          {/* Merging Process */}
          {state === 'merging' && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Converting and merging documents...</p>
              <p className="text-sm text-gray-600">
                This may take a few moments for document conversion...
              </p>
            </div>
          )}

          {/* Ready State - Download Merged File */}
          {state === 'ready' && mergedFileUrl && (
            <div className="space-y-5">
              <div className="p-5 bg-transparent border-2 border-transparent rounded-xl">
                <p className="text-[#8f969c]  text-center">Successfully merged {uploadedFiles.length} document{uploadedFiles.length > 1 ? 's' : ''} into PDF!</p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={downloadMergedFile}
                  disabled={downloadingMerged}
                  className="flex-1 bg-[#ff911d] hover:bg-[#e67e0a] shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6 h-auto text-white rounded-xl font-semibold cursor-pointer"
                >
                  {downloadingMerged ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-4 mr-2" />
                      Download Merged PDF
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(mergedFileUrl, '_blank')}
                  title="Open in new tab"
                  className="border-gray-300 hover:bg-gray-100 h-18 cursor-pointer w-12"
                >
                  <MoveUpRight className="w-5 h-5 text-gray-700" />
             
                </Button>
              </div>

              {/* Email Input and Send Button */}
              <div className="pt-2">
                <h3 className="text-sm mb-3 text-gray-900">Share and Receive PDF via Email</h3>
                <div className="flex gap-3 items-center">
                  <input
                    type="email"
                    placeholder="Enter recipient email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className="border-1 border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:border-[#ff911d] text-gray-900"
                  />
                  <Button
                    onClick={handleSendEmail}
                    disabled={sendingEmail || !mergedFileUrl || !toEmail}
                    className="bg-[#f16625] text-white cursor-pointer"
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-2 w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-6 cursor-pointer">
                Merge More Documents
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MergeAnyToPdf;