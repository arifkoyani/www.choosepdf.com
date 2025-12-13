"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { X, Download, FileText, MoveUpRight, Loader2, MonitorUp, Mail } from "lucide-react"
import Spinner from "../../ui/loader/loader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { toast } from "sonner"

type AppState = "select" | "uploading" | "tabs" | "splitting" | "ready"

interface UploadedFile {
  id: string
  name: string
  url: string
  size: string
  type: string
}

interface SplitResult {
  url: string
  name: string
}

const splitOptions = [
  {
    id: "text-search",
    label: "Text Search",
    pattern: "search text here",
    description: "Split by finding specific text in PDF",
    example: "",
  },
  {
    id: "qr-code",
    label: "QR Code Split",
    pattern: "[[barcode:qrcode]]",
    description: "Split by QR codes found in PDF",
    example: "[[barcode:qrcode]]",
  },
  {
    id: "datamatrix",
    label: "DataMatrix Split",
    pattern: "[[barcode:datamatrix]]",
    description: "Split by DataMatrix barcodes found in PDF",
    example: "[[barcode:datamatrix]]",
  },
  {
    id: "qr-with-value",
    label: "QR Code with Value",
    pattern: "[[barcode:qrcode]]",
    description: "Split by QR codes containing specific text",
    example: "[[barcode:qrcode]]",
  },
  {
    id: "multiple-barcodes",
    label: "Multiple Barcode Types",
    pattern: "[[barcode:qrcode,datamatrix]]",
    description: "Split by QR codes or DataMatrix with specific text",
    example: "[[barcode:qrcode,datamatrix]]",
  },
  {
    id: "custom-barcode",
    label: "Custom Pattern",
    pattern: "[[barcode:code128]]",
    description: "Custom barcode pattern for splitting",
    example: "[[barcode:code128]]",
  },
]

const SplitPdfByText = () => {
  const [state, setState] = useState<AppState>("select")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [splitResults, setSplitResults] = useState<SplitResult[]>([])
  const [downloading, setDownloading] = useState<{ [key: number]: boolean }>({})
  const [selectedTab, setSelectedTab] = useState("text-search")
  const [searchString, setSearchString] = useState("")
  const [toEmail, setToEmail] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [searchError, setSearchError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const parseJsonResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      const text = await response.text()
      throw new Error(text || "Server returned non-JSON response")
    }
    return response.json()
  }

  const isValidFileType = (file: File): boolean => {
    const validTypes = ["application/pdf"]
    const validExtensions = ["pdf"]
    const fileExtension = file.name.toLowerCase().split(".").pop()

    return validTypes.includes(file.type) || validExtensions.includes(fileExtension || "")
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (isValidFileType(file)) {
        uploadFile(file)
      } else {
        alert("Please select a PDF file (.pdf)")
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const uploadFile = async (file: File) => {
    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    setState("uploading")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()

      if (data.error === false) {
        const newFile: UploadedFile = {
          id: fileId,
          name: file.name,
          url: data.url,
          size: formatFileSize(file.size),
          type: file.type,
        }

        setUploadedFiles([newFile])
        setState("tabs")
      } else {
        setState("select")
        alert("contact choosepdf support team")
      }
    } catch (error) {
      console.error("Upload error: contact choosepdf support team", error)
      setState("select")
      alert("contact choosepdf support team")
    }
  }

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId)
    setSearchError("")
    const selectedOption = splitOptions.find((option) => option.id === tabId)
    if (selectedOption) {
      setSearchString(selectedOption.example)
    }
    
    // Focus input field when text-search tab is clicked
    if (tabId === "text-search") {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }

  const removeFile = () => {
    setUploadedFiles([])
    setState("select")
    setSplitResults([])
    setSearchString("")
    setSelectedTab("text-search")
    setToEmail("")
    setSearchError("")
  }

  const splitPdf = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload a PDF file first")
      return
    }

    if (!searchString.trim()) {
      alert("Please specify search pattern for splitting")
      return
    }

    setSearchError("")
    setState("splitting")

    try {
      const response = await fetch("/api/splitpdfbysearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: uploadedFiles[0].url,
          searchString: searchString.trim(),
          excludeKeyPages: true,
          regexSearch: false,
          caseSensitive: false,
        }),
      })

      const data = await parseJsonResponse(response)

      if (!response.ok) {
        const errorMessage = data.message || "PDF split failed"
        throw new Error(errorMessage)
      }

      if (data.error === false && data.urls && data.urls.length > 0) {
        const results = data.urls.map((url: string, index: number) => ({
          url: url,
          name: `split-document-${index + 1}.pdf`,
        }))

        setSplitResults(results)
        setState("ready")
        setSearchError("")
      } else {
        console.error("PDF split failed:", data)
        const errorMessage = data.message || "Please try again."
        
        // Check if the search string was not found
        const isNotFoundError = 
          data.notFound === true ||
          (data.error === false && (!data.urls || data.urls.length === 0)) ||
          errorMessage.toLowerCase().includes("not available")
        
        if (isNotFoundError) {
          setSearchError("The text you entered (searchString) is not present in the PDF")
          setState("tabs")
        } else {
          alert(`PDF split failed: ${errorMessage}`)
          setState("tabs")
        }
      }
    } catch (error) {
      console.error("Split error:", error)
      const errorMessage = error instanceof Error ? error.message : "PDF split failed. Please try again."
      
      // Check if the error indicates the search string was not found
      const isNotFoundError = errorMessage.toLowerCase().includes("not available")
      
      if (isNotFoundError) {
        setSearchError("The text you entered (searchString) is not present in the PDF")
        setState("tabs")
      } else {
        alert(errorMessage)
        setState("tabs")
      }
    }
  }

  const handleSendEmail = async () => {
    if (!toEmail || splitResults.length === 0) {
      alert("Recipient email and file URL are required")
      return
    }

    setSendingEmail(true)

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toEmail,
          fileUrl: splitResults[0].url,
        }),
      })

      const data = await parseJsonResponse(response)

      if (!response.ok) {
        const errorMessage = data.message || "Email send failed"
        throw new Error(errorMessage)
      }

      if (!data.error) {
        toast.success("Email sent successfully", {
          description: "Your email has been delivered.",
          duration: 5000,
          position: "bottom-right",
        })
        setToEmail("")
      } else {
        const errorMessage = data.message || "contact choosepdf support team"
        toast.error("Failed to send email", {
          description: errorMessage,
          duration: 3000,
          position: "bottom-right",
        })
      }
    } catch (err) {
      console.error("Email send error:", err)
      const errorMessage = err instanceof Error ? err.message : "contact choosepdf support team"
      toast.error("Failed to send email", {
        description: errorMessage,
        duration: 3000,
        position: "bottom-right",
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const resetConverter = () => {
    setState("select")
    setUploadedFiles([])
    setSplitResults([])
    setSearchString("")
    setSelectedTab("text-search")
    setDownloading({})
    setToEmail("")
    setSearchError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const downloadFile = async (url: string, filename: string, index: number) => {
    setDownloading((prev) => ({ ...prev, [index]: true }))
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error("Download failed")

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = filename
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.error(err)
      alert("Failed to download file")
    } finally {
      setDownloading((prev) => ({ ...prev, [index]: false }))
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f4f4f5] flex flex-col items-center justify-start py-8">
      <div className="pb-8 flex flex-col justify-center items-center space-y-3">
        <h1 className="text-gray-600 text-xl font-medium">Split PDF into Multiple Documents</h1>
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
                  Split PDF into separate documents by detecting barcodes or text patterns.
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

          {/* Tabs Section - After Upload */}
          {uploadedFiles.length > 0 && !splitResults.length && state !== "splitting" && (
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

              {/* Search Pattern Input Field */}
              <div className="space-y-4">
                <div className="text-left">
                  <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="flex flex-wrap w-full h-auto p-1 gap-1 bg-gray-100 rounded-md">
                      {splitOptions.map((option) => (
                        <TabsTrigger
                          key={option.id}
                          value={option.id}
                          className="text-xs px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 data-[state=active]:bg-[#ff911d] data-[state=active]:text-white data-[state=active]:border-[#ff911d] data-[state=active]:font-semibold whitespace-nowrap transition-all cursor-pointer"
                        >
                          {option.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {splitOptions.map((option) => (
                      <TabsContent key={option.id} value={option.id} className="mt-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-left space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-gray-700">{option.label}</h4>
                            <code className="bg-white px-3 py-1 rounded border text-[#ff911d] font-mono text-xs">
                              {option.pattern}
                            </code>
                          </div>
                          <p className="text-sm text-gray-600">{option.description}</p>
                          
                          <div className="space-y-2">
                            <label className="text-xs text-gray-500">Enter search pattern:</label>
                            <input
                              ref={option.id === "text-search" ? searchInputRef : undefined}
                              type="text"
                              value={searchString}
                              onChange={(e) => {
                                setSearchString(e.target.value)
                                setSearchError("")
                              }}
                              className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900 ${
                                searchError ? "border-red-500 focus:ring-red-500" : ""
                              }`}
                              placeholder={option.example}
                            />
                            <p className="text-xs text-gray-400">Example: {option.example}</p>
                            {searchError && (
                              <p className="text-xs text-red-500 mt-1">{searchError}</p>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>

              {/* Split Button */}
              <Button
                onClick={splitPdf}
                className="w-full bg-green-600 hover:bg-green-700 cursor-pointer text-white text-lg py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <FileText className="w-5 h-5 mr-2" />
                Split PDF
              </Button>

              {/* Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <p className="text-blue-700 text-sm">
                  <strong>Note:</strong> This splits a PDF by detecting specific barcodes or text inside it. The API scans the PDF, finds barcode/text patterns, and splits the PDF at those pages. Multiple smaller PDFs will be generated as output.
                </p>
              </div>
            </div>
          )}

          {/* Splitting Process */}
          {state === "splitting" && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Splitting PDF...</p>
              <p className="text-sm text-gray-600">This may take a few moments for PDF processing and splitting...</p>
            </div>
          )}

          {/* Ready State - Download Split Files */}
          {state === "ready" && splitResults.length > 0 && (
            <div className="space-y-5">
              <div className="p-5 bg-transparent border-2 border-transparent rounded-xl">
                <p className="text-[#8f969c] text-center">
                  Successfully split PDF into {splitResults.length} document{splitResults.length > 1 ? "s" : ""}!
                </p>
              </div>

              <div className="space-y-3">
                {splitResults.map((result, index) => (
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
                    disabled={sendingEmail || !splitResults[0] || !toEmail}
                    className="bg-[#f16625] text-white cursor-pointer"
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-2 w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-6 cursor-pointer">
                Split Another PDF
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SplitPdfByText
