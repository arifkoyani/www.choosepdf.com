"use client";
import { useState } from "react";
import { Upload, Image as ImageIcon, FileText, Loader2, CheckCircle2, XCircle, Save } from "lucide-react";

export default function CreateArticle() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [graphicUrl, setGraphicUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGraphic, setUploadingGraphic] = useState(false);

  const handleFileUpload = async (file: File, type: "thumbnail" | "graphic") => {
    if (!file) return;

    const setUploading = type === "thumbnail" ? setUploadingThumbnail : setUploadingGraphic;
    const setUrl = type === "thumbnail" ? setThumbnailUrl : setGraphicUrl;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setUrl(data.url);
        setMessage(`${type === "thumbnail" ? "Thumbnail" : "Graphic"} uploaded successfully!`);
      } else {
        setMessage(`Error uploading ${type}: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error uploading ${type}: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "thumbnail");
    }
  };

  const handleGraphicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "graphic");
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !content || !slug) {
      setMessage("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/blog/createblog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, content, thumbnailUrl, graphicUrl })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage("Article added successfully!");
        // Reset form
        setTitle("");
        setSlug("");
        setDescription("");
        setContent("");
        setThumbnailUrl("");
        setGraphicUrl("");
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Something went wrong"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Add New Blog
        </h2>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Slug <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(URL-friendly identifier)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
            <input
              type="text"
              placeholder="Enter blog slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter a unique slug for this blog (e.g., "my-blog-title")
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter blog description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter blog content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-y"
          />
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thumbnail Image
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={uploadingThumbnail}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-700/50">
                  {uploadingThumbnail ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {thumbnailUrl ? "Change thumbnail" : "Upload thumbnail image"}
                      </span>
                    </>
                  )}
                </div>
              </label>
            </div>
            {thumbnailUrl && (
              <div className="relative group">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Uploaded
                </div>
              </div>
            )}
            {thumbnailUrl && (
              <input
                type="text"
                value={thumbnailUrl}
                readOnly
                className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                placeholder="Thumbnail URL (auto-filled)"
              />
            )}
          </div>
        </div>

        {/* Graphic Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Graphic Image
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGraphicChange}
                  disabled={uploadingGraphic}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-700/50">
                  {uploadingGraphic ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {graphicUrl ? "Change graphic" : "Upload graphic image"}
                      </span>
                    </>
                  )}
                </div>
              </label>
            </div>
            {graphicUrl && (
              <div className="relative group">
                <img
                  src={graphicUrl}
                  alt="Graphic preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Uploaded
                </div>
              </div>
            )}
            {graphicUrl && (
              <input
                type="text"
                value={graphicUrl}
                readOnly
                className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                placeholder="Graphic URL (auto-filled)"
              />
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg flex items-center gap-2 ${
              message.includes("Error") || message.includes("Error:")
                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
            }`}
          >
            {message.includes("Error") || message.includes("Error:") ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            <span>{message}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !title || !description || !content}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Add Blog</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
