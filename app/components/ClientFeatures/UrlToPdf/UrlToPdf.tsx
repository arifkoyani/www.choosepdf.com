"use client";
import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Download, MoveUpRight, Loader2, ClipboardPaste, X } from 'lucide-react';
import Spinner from '../../../components/ui/loader/loader';
import { toast } from 'sonner';

type AppState = 'select' | 'converting' | 'ready';

const UrlToPdf = () => {
  const [state, setState] = useState<AppState>('select');
  const [convertedFileUrls, setConvertedFileUrls] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [downloadingFile, setDownloadingFile] = useState(false);
  const [toEmail, setToEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const convertUrlToPdf = async () => {
    if (!inputUrl.trim()) {
      setErrorMessage('Please enter a valid URL');
      return;
    }

    setErrorMessage('');
    setState('converting');

    try {
      const response = await fetch('/api/urltopdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: inputUrl,
        }),
      });

      const data = await response.json();

      if (data.error === false && data.urls && data.urls.length > 0) {
        setConvertedFileUrls(data.urls);
        setState('ready');
        setErrorMessage('');
      } else {
        setState('select');
        setErrorMessage('Please enter public accessible url and valid url');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      setState('select');
      setErrorMessage('Please enter public accessible url and valid url');
    }
  };

  const downloadFile = async (url: string, fileName: string) => {
    setDownloadingFile(true);
    try {
      const response = await fetch(url, { credentials: 'omit' });
      if (!response.ok) {
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert("contact choosepdf support team");
    } finally {
      setDownloadingFile(false);
    }
  };

  const handleSendEmail = async () => {
    if (!toEmail || !convertedFileUrls[0]) {
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
          fileUrl: convertedFileUrls[0],
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Email send failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      
      if (!data.error) {
        toast.success("Email sent successfully", {
          description: "Your email has been delivered.",
          duration: 5000,
          position: "bottom-right"
        });
        setToEmail('');
      } else {
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

  const resetConverter = () => {
    setState('select');
    setConvertedFileUrls([]);
    setInputUrl('');
    setToEmail('');
    setErrorMessage('');
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
        if (errorMessage) {
          setErrorMessage('');
        }
      }
    } catch (err) {
      console.error('Failed to paste from clipboard:', err);
    }
  };

  const handleClear = () => {
    setInputUrl('');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f4f4f5] flex flex-col items-center justify-start py-8">

      <div className='pb-8 flex flex-col justify-center items-center space-y-3'>
        <h1 className="text-gray-600 text-xl font-medium">Convert URL to High-Quality PDF</h1>
      </div>

      <Card className="w-full max-w-6xl p-6 sm:p-8 shadow-none border-none bg-transparent ">
        <div className="space-y-6 bg-transparent">

          {/* URL Input Section */}
          {state === 'select' && (
            <div className="space-y-4 bg-transparent rounded-xl p-4  flex flex-col items-center justify-between">
              <div className="w-full mx-auto min-h-16 bg-[#f4f4f5]  rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="relative w-full p-4 bg-transparent">
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="absolute left-3 z-10 p-2 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
                      title="Paste from clipboard"
                    >
                      <ClipboardPaste className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      placeholder="Paste file URL here"
                      value={inputUrl}
                      onChange={handleUrlChange}
                      className={`w-full border-1 rounded-lg pl-12 pr-12 py-3 focus:outline-none text-gray-900 ${
                        errorMessage 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:border-[#ff911d]'
                      }`}
                    />
                    {inputUrl && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 z-10 cursor-pointer p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Clear input"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {errorMessage && (
                    <p className="text-xs text-red-500 mt-2 px-1">
                      {errorMessage}
                    </p>
                  )}
                </div>
              </div>
             
              {!inputUrl && !errorMessage && (
                <span>
                  <p className="text-sm font-medium text-[#00ac47] text-center">
                  Please enter a valid and publicly accessible URL.
                  </p>
          
                </span>
              )}

              {inputUrl && (
                <Button
                  onClick={convertUrlToPdf}
                  className="w-full bg-[#ff911d] hover:bg-[#e67e0a] text-white text-lg py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold cursor-pointer"
                >
                  Convert to PDF
                </Button>
              )}
            </div>
          )}

          {/* Converting Process */}
          {state === 'converting' && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-sm text-gray-600">
                This may take a few seconds
              </p>
            </div>
          )}

          {/* Ready State - Download Converted File */}
          {state === 'ready' && convertedFileUrls.length > 0 && (
            <div className="space-y-5">
              <div className="p-5 bg-transparent border-2 border-transparent rounded-xl">
                <p className="text-[#8f969c] text-center">Successfully converted URL to PDF!</p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => downloadFile(convertedFileUrls[0], `converted-url.pdf`)}
                  disabled={downloadingFile}
                  className="flex-1 bg-[#ff911d] hover:bg-[#e67e0a] shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6 h-auto text-white rounded-xl font-semibold cursor-pointer"
                >
                  {downloadingFile ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(convertedFileUrls[0], '_blank')}
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
                    disabled={sendingEmail || !convertedFileUrls[0] || !toEmail}
                    className="bg-[#f16625] text-white cursor-pointer"
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-2 w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-6 cursor-pointer">
                Convert Another URL
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UrlToPdf;
