"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { X, Download, FileText, MoveUpRight, Loader2, MonitorUp, Plus } from "lucide-react";
import Spinner from "../../ui/loader/loader";
import { toast } from "sonner";

type AppState = "select" | "uploading" | "configuring" | "replacing" | "ready";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

interface ReplaceTextResult {
  url: string;
  name: string;
}

interface SearchReplacePair {
  searchString: string;
  replaceString: string;
}

const SearchTextReplaceInPdf = () => {
  const [state, setState] = useState<AppState>("select");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [replaceTextResults, setReplaceTextResults] = useState<ReplaceTextResult[]>([]);
  const [downloading, setDownloading] = useState<{ [key: number]: boolean }>({});
  const [searchReplacePairs, setSearchReplacePairs] = useState<SearchReplacePair[]>([
    { searchString: "", replaceString: "" }
  ]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [replacementLimit, setReplacementLimit] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [pairErrors, setPairErrors] = useState<{ [key: number]: string }>({});
  const [toEmail, setToEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = ["application/pdf"];
    const validExtensions = ["pdf"];
    const fileExtension = file.name.toLowerCase().split(".").pop();

    return validTypes.includes(file.type) || validExtensions.includes(fileExtension || "");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFileType(file)) {
        uploadFile(file);
      } else {
        alert("Please select a PDF file (.pdf)");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async (file: File) => {
    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setState("uploading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      if (data.error === false) {
        const newFile: UploadedFile = {
          id: fileId,
          name: file.name,
          url: data.url,
          size: formatFileSize(file.size),
          type: file.type,
        };

        setUploadedFiles([newFile]);
        setState("configuring");
      } else {
        setState("select");
        alert("contact choosepdf support team");
      }
    } catch (error) {
      console.error("Upload error: contact choosepdf support team", error);
      setState("select");
      alert("contact choosepdf support team");
    }
  };

  const addSearchReplacePair = () => {
    setSearchReplacePairs([...searchReplacePairs, { searchString: "", replaceString: "" }]);
  };

  const removeSearchReplacePair = (index: number) => {
    if (searchReplacePairs.length > 1) {
      const newPairs = searchReplacePairs.filter((_, i) => i !== index);
      setSearchReplacePairs(newPairs);
    }
  };

  const updateSearchReplacePair = (index: number, field: 'searchString' | 'replaceString', value: string) => {
    const newPairs = [...searchReplacePairs];
    newPairs[index][field] = value;
    setSearchReplacePairs(newPairs);
    setErrorMessage("");
    // Clear pair-specific error when user types
    if (pairErrors[index]) {
      const newPairErrors = { ...pairErrors };
      delete newPairErrors[index];
      setPairErrors(newPairErrors);
    }
  };

  const replaceText = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload a PDF file first");
      return;
    }

    // Validate that all search strings are filled
    const validPairs = searchReplacePairs.filter(pair => pair.searchString.trim() !== '');
    
    if (validPairs.length === 0) {
      setErrorMessage("Please enter at least one search string");
      return;
    }

    // Validate that if search string is entered, replacement string must also be entered
    const newPairErrors: { [key: number]: string } = {};
    let hasValidationError = false;

    searchReplacePairs.forEach((pair, index) => {
      if (pair.searchString.trim() !== '' && pair.replaceString.trim() === '') {
        newPairErrors[index] = "Please enter a replacement text for this search string";
        hasValidationError = true;
      }
    });

    if (hasValidationError) {
      setPairErrors(newPairErrors);
      setErrorMessage("Please enter replacement text for all search strings");
      return;
    }

    setErrorMessage("");
    setPairErrors({});
    setState("replacing");

    try {
      const response = await fetch("/api/searchtextreplaceinpdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: uploadedFiles[0].url,
          searchStrings: validPairs.map(pair => pair.searchString.trim()),
          replaceStrings: validPairs.map(pair => pair.replaceString || ""),
          caseSensitive: caseSensitive,
          replacementLimit: replacementLimit,
          pages: "",
          password: "",
          name: `text-replaced-${uploadedFiles[0].name}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error === true) {
        const errorMsg = data.message || "Replace text failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("configuring");
        return;
      }

      if (data.error === false && data.urls && data.urls.length > 0) {
        const results = data.urls.map((url: string, index: number) => ({
          url: url,
          name: `text-replaced-${uploadedFiles[0].name || `document-${index + 1}.pdf`}`,
        }));

        setReplaceTextResults(results);
        setErrorMessage("");
        setState("ready");
      } else {
        const errorMsg = data.message || "Replace text failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("configuring");
      }
    } catch (error) {
      console.error("Replace text error:", error);
      const errorMsg = error instanceof Error ? error.message : "Replace text failed. Please try again.";
      setErrorMessage(errorMsg);
      setState("configuring");
    }
  };

  const removeFile = () => {
    setUploadedFiles([]);
    setState("select");
    setReplaceTextResults([]);
    setSearchReplacePairs([{ searchString: "", replaceString: "" }]);
    setCaseSensitive(false);
    setReplacementLimit(0);
    setErrorMessage("");
    setPairErrors({});
    setToEmail("");
  };

  const resetConverter = () => {
    setState("select");
    setUploadedFiles([]);
    setReplaceTextResults([]);
    setSearchReplacePairs([{ searchString: "", replaceString: "" }]);
    setCaseSensitive(false);
    setReplacementLimit(0);
    setErrorMessage("");
    setPairErrors({});
    setDownloading({});
    setToEmail("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadFile = async (url: string, filename: string, index: number) => {
    setDownloading((prev) => ({ ...prev, [index]: true }));
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to download file");
    } finally {
      setDownloading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleSendEmail = async () => {
    if (!toEmail || replaceTextResults.length === 0) {
      alert("Recipient email and file URL are required");
      return;
    }

    setSendingEmail(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toEmail,
          fileUrl: replaceTextResults[0].url,
        }),
      });

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      let data;
      if (isJson) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || "Server returned non-JSON response");
      }

      if (!response.ok) {
        const errorMessage = data.message || "Email send failed";
        throw new Error(errorMessage);
      }

      if (!data.error) {
        toast.success("Email sent successfully", {
          description: "Your email has been delivered.",
          duration: 5000,
          position: "bottom-right",
        });
        setToEmail("");
      } else {
        const errorMessage = data.message || "contact choosepdf support team";
        toast.error("Failed to send email", {
          description: errorMessage,
          duration: 3000,
          position: "bottom-right",
        });
      }
    } catch (err) {
      console.error("Email send error:", err);
      const errorMessage = err instanceof Error ? err.message : "contact choosepdf support team";
      toast.error("Failed to send email", {
        description: errorMessage,
        duration: 3000,
        position: "bottom-right",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f4f4f5] flex flex-col items-center justify-start py-8">
      <div className="pb-8 flex flex-col justify-center items-center space-y-3">
        <h1 className="text-gray-600 text-xl font-medium">Search Text Replace in PDF</h1>
        <p className="text-sm text-gray-600 text-center max-w-2xl">
          Search and replace text in your PDF documents. Replace multiple text strings at once.
        </p>
      </div>

      <Card className="w-full max-w-6xl p-6 sm:p-8 shadow-none border-none bg-transparent">
        <div className="space-y-6">
          {/* Upload Section */}
          {state === "select" && uploadedFiles.length === 0 && (
            <div className="space-y-4 bg-transparent rounded-xl p-4 flex flex-col items-center justify-between">
              <div className="w-full mx-auto min-h-16 bg-[#f4f4f5] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="relative w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ fontSize: 0 }}
                  />
                  <div className="w-full min-h-16 flex justify-center items-center cursor-pointer bg-[#ff911d] border-2 border-solid border-[#ff911d] rounded-lg hover:border-[#ff911d] transition-colors">
                    <MonitorUp className="w-6 h-6 text-[#f4f4f5]" />
                  </div>
                </div>
              </div>

              <span>
                <p className="text-sm text-gray-600 text-center">
                  Search and replace text in your PDF document.
                </p>
                <p className="text-sm text-gray-600 text-center">Supported: PDF</p>
              </span>
            </div>
          )}

          {/* Upload Progress */}
          {state === "uploading" && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}

          {/* Configuration Section - After Upload */}
          {uploadedFiles.length > 0 && !replaceTextResults.length && state !== "replacing" && (
            <div className="space-y-4">
              {/* Uploaded File Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-red-500" />
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{uploadedFiles[0]?.name}</p>
                    <p className="text-xs text-gray-600">{uploadedFiles[0]?.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(uploadedFiles[0]?.url, "_blank")}
                    title="Open in new tab"
                    className="border-gray-300 hover:bg-gray-100 cursor-pointer"
                  >
                    <MoveUpRight className="w-4 h-4 text-gray-700" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    title="Remove file"
                    className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Search and Replace Pairs */}
              <div className="bg-gray-50 p-4 rounded-lg text-left space-y-3">
                <h4 className="font-medium text-sm text-gray-700">Configure Text Replacement</h4>
                <p className="text-sm text-gray-600">Enter search strings and their replacements. You can add multiple pairs.</p>
                
                <div className="space-y-3">
                  {searchReplacePairs.map((pair, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-white">
                      <div className="flex-1 space-y-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Search for (e.g., [CLIENT-NAME])"
                            value={pair.searchString}
                            onChange={(e) => updateSearchReplacePair(index, 'searchString', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900 ${
                              pairErrors[index] ? 'border-red-300' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Replace with (e.g., John Doe)"
                            value={pair.replaceString}
                            onChange={(e) => updateSearchReplacePair(index, 'replaceString', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900 ${
                              pairErrors[index] ? 'border-red-300' : ''
                            }`}
                          />
                          {pairErrors[index] && (
                            <p className="text-xs text-red-600 mt-1">{pairErrors[index]}</p>
                          )}
                        </div>
                      </div>
                      {searchReplacePairs.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            removeSearchReplacePair(index);
                            // Clear error for removed pair
                            if (pairErrors[index]) {
                              const newPairErrors = { ...pairErrors };
                              delete newPairErrors[index];
                              setPairErrors(newPairErrors);
                            }
                          }}
                          className="mt-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={addSearchReplacePair}
                  className="w-full border-gray-300 hover:bg-gray-50 text-[#ff911d]"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Search/Replace Pair
                </Button>

                {/* Options */}
                <div className="mt-4 space-y-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="caseSensitive"
                      checked={caseSensitive}
                      onChange={(e) => {
                        setCaseSensitive(e.target.checked);
                        setErrorMessage("");
                        setPairErrors({});
                      }}
                      className="w-4 h-4 text-[#ff911d] border-gray-300 rounded focus:ring-[#ff911d]"
                    />
                    <label htmlFor="caseSensitive" className="text-sm text-gray-700 cursor-pointer">
                      Case sensitive
                    </label>
                  </div>

                  <div>
                    <label htmlFor="replacementLimit" className="text-sm text-gray-700 block mb-1">
                    Note: Setting value to 0 will replace all matching text in the document.
                    Setting value to 1 will replace only the first match.
                    </label>
                    <input
                      type="number"
                      id="replacementLimit"
                      min="0"
                      value={replacementLimit}
                      onChange={(e) => {
                        setReplacementLimit(parseInt(e.target.value) || 0);
                        setErrorMessage("");
                        setPairErrors({});
                      }}
                      className="w-32 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">
                      <strong>Error:</strong> {errorMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Replace Text Button */}
              <Button
                onClick={replaceText}
                className="w-full bg-[#ff911d] hover:bg-[#e67e0a] cursor-pointer text-white text-lg py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <FileText className="w-5 h-5 mr-2" />
                Start Text Replacement
              </Button>

              {/* Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <p className="text-blue-700 text-sm">
                  <strong>Note:</strong> All occurrences of the search strings will be replaced with their corresponding replacement strings. Leave replacement empty to delete the text.
                </p>
              </div>
            </div>
          )}

          {/* Replacing Process */}
          {state === "replacing" && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Replacing text in PDF...</p>
              <p className="text-sm text-gray-600">This may take a few moments for PDF processing...</p>
            </div>
          )}

          {/* Ready State - Download Result */}
          {state === "ready" && replaceTextResults.length > 0 && (
            <div className="space-y-5">
              <div className="p-5 bg-transparent border-2 border-transparent rounded-xl">
                <p className="text-[#8f969c] text-center">
                  Successfully replaced text in PDF!
                </p>
              </div>

              <div className="space-y-3">
                {replaceTextResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-red-500" />
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{result.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(result.url, "_blank")}
                        title="Open in new tab"
                        className="border-gray-300 hover:bg-gray-100 cursor-pointer"
                      >
                        <MoveUpRight className="w-4 h-4 text-gray-700" />
                      </Button>
                      <Button
                        onClick={() => downloadFile(result.url, result.name, index)}
                        disabled={downloading[index]}
                        className="bg-[#ff911d] hover:bg-[#e67e0a] text-white cursor-pointer"
                        size="sm"
                      >
                        {downloading[index] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
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
                    disabled={sendingEmail || !replaceTextResults[0] || !toEmail}
                    className="bg-[#f16625] text-white cursor-pointer"
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-2 w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-6 cursor-pointer">
                Replace Text in Another PDF
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SearchTextReplaceInPdf;
