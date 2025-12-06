"use client";
import React, { useState } from 'react';
import { Progress } from '../../ui/progress';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Copy, X, Download, FileText, File, Image, Archive } from 'lucide-react';
import { FlipWords } from '../../ui/flip-words/flipWords';
import Spinner from '../../ui/loader/loader';
import { Loader2 } from 'lucide-react';
import SendPdfEmail from '../../Email/email';
import { FileUpload } from '../../ui/file-upload/file-upload'; 

const API_KEY = process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";

type AppState = 'select' | 'uploading' | 'merging' | 'processing' | 'ready';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

const MergeAnyToPdf = () => {
  const words = ["Better", "Merged", "Perfect", "Combined"];
  const [state, setState] = useState<AppState>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [mergedFileUrl, setMergedFileUrl] = useState('');
  const [downloadingMerged, setDownloadingMerged] = useState(false);
  const [toEmail, setToEmail] = useState('');

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
    
    const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png','zip'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    return validTypes.includes(file.type) || validExtensions.includes(fileExtension || '');
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach((file) => {
      if (isValidFileType(file)) {
        uploadFile(file);
      } else {
        alert(`Please select a valid file (PDF, DOC, XLS, Images, or ZIP). Invalid file: ${file.name}`);
      }
    });
  };

  const uploadFile = async (file: File) => {
    const fileId = Date.now().toString();
    setState('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(uploadInterval);
            return 95;
          }
          return prev + Math.random() * 30;
        });
      }, 150);

      const response = await fetch(process.env.NEXT_PUBLIC_CHOOSE_PDF_API_UPLOAD_URL || "", {
        method: 'POST',
        headers: { 'x-api-key': API_KEY },
        body: formData,
      });

      const data = await response.json();
      clearInterval(uploadInterval);
      setUploadProgress(100);

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
        setUploadProgress(0);
      } else {
        setState('select');
        setUploadProgress(0);
        alert('contact choosepdf support team');
      }
    } catch (error) {
      console.error('Upload error: contact choosepdf support team');
      setState('select');
      setUploadProgress(0);
      alert('contact choosepdf support team');
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    if (uploadedFiles.length === 1) {
      setState('select');
      setMergedFileUrl('');
    }
  };

  const mergeDocuments = async () => {
    if (uploadedFiles.length < 1) {
      alert('Please upload at least 1 file to merge. contact choosepdf support team');
      return;
    }

    setState('merging');
    
    try {
      const urlsString = uploadedFiles.map(file => file.url).join(',');
      
      const response = await fetch(process.env.NEXT_PUBLIC_CHOOSE_PDF_API_MERGE_URL as string, {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlsString,
          async: false
        }),
      });

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
    setUploadProgress(0);
    setUploadedFiles([]);
    setMergedFileUrl('');
    setToEmail('');
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
        <div className="h-[5rem] flex justify-center items-center px-4">
          <div className="flex flex-wrap justify-center items-center mx-auto text-gray-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gap-3">
            <span className="text-gray-800">Merge To</span>
            <div className="min-w-[240px] sm:min-w-[180px] md:min-w-[220px] text-left h-[4rem] flex items-center">
            <div className="w-[240px] sm:w-[150px] md:w-[180px] text-left">
              <FlipWords words={words} />
            </div>
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-lg font-medium">Merge Various Document Types</p>
        <p className="text-gray-700 text-sm mt-1 font-normal text-center max-w-2xl px-4">
          Merge PDF from two or more PDF, DOC, XLS, images, even ZIP with documents and images into a new PDF.
        </p>
      </div>

      <Card className="w-full max-w-6xl p-6 sm:p-8 shadow-none  border-none bg-[#f4f4f5]">
        <div className="space-y-6">
          
          {/* Upload Section */}
          {(state === 'select' || uploadedFiles.length > 0) && !mergedFileUrl && state !== 'merging' && (
            <div className="space-y-4">
              <div className="w-full mx-auto min-h-96 border-2 border-dashed bg-[#f4f4f5] border-[#ff911d] rounded-xl shadow-md">
                <FileUpload 
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                />
              </div>
              
              <p className="text-sm text-gray-600 text-center">
                Supported: PDF, DOC, DOCX, XLS, XLSX, Images (JPG, PNG), ZIP
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {state === 'uploading' && (
            <div className="space-y-3 py-8">
              <Progress value={uploadProgress} className="h-3" />
              <p className="text-sm text-gray-700 font-medium text-center">
                {Math.round(uploadProgress)}% uploaded
              </p>
            </div>
          )}

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && !mergedFileUrl && state !== 'merging' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Uploaded Files ({uploadedFiles.length})</h3>
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
                        onClick={() => navigator.clipboard.writeText(file.url)}
                        title="Copy link"
                        className="border-gray-300 hover:bg-gray-100"
                      >
                        <Copy className="w-4 h-4 text-gray-700" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        title="Remove file"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Merge Button */}
              {uploadedFiles.length >= 1 && (
                <Button
                  onClick={mergeDocuments}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Merge {uploadedFiles.length} Document{uploadedFiles.length > 1 ? 's' : ''} to PDF
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
                <p className="text-black  text-center">Successfully merged {uploadedFiles.length} document{uploadedFiles.length > 1 ? 's' : ''} into PDF!</p>
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
                      <Download className="w-5 h-5 mr-2" />
                      Download Merged PDF
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(mergedFileUrl)}
                  title="Copy link"
                  className="border-gray-300 hover:bg-gray-100 h-12 w-12"
                >
                  <Copy className="w-5 h-5 text-gray-700" />
                </Button>
              </div>

              {/* Email Input and Send Button */}
              <div className="pt-2">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Send PDF via Email</h3>
                <div className="flex gap-3 items-center">
                  <input
                    type="email"
                    placeholder="Enter recipient email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className="border-1 border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:border-[#ff911d] text-gray-900"
                  />
                  <SendPdfEmail 
                    toEmail={toEmail} 
                    fileUrl={mergedFileUrl}
                    onSuccess={() => setToEmail('')}
                  />
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