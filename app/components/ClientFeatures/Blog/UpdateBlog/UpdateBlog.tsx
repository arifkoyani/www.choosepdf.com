"use client";
import React, { useEffect, useState } from "react";
import { Edit, Save, X, Upload, Image as ImageIcon, Loader2, CheckCircle2, XCircle, RefreshCw, Trash2 } from "lucide-react";
export default function UpdateBlog() {
  const [articles, setArticles] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGraphic, setUploadingGraphic] = useState(false);

  // fetch articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog/allblogs");
      const data = await res.json();
      if (res.ok) {
        setArticles(data.data || []);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to fetch articles"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Handle file upload for thumbnail
  const handleThumbnailUpload = async (file: File) => {
    if (!file) return;

    setUploadingThumbnail(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/blog/uploadmedia", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setForm({ ...form, thumbnail: data.url });
        setMessage("Thumbnail uploaded successfully!");
      } else {
        setMessage(`Error uploading thumbnail: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error uploading thumbnail: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Handle file upload for graphic
  const handleGraphicUpload = async (file: File) => {
    if (!file) return;

    setUploadingGraphic(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/blog/uploadmedia", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setForm({ ...form, graphic: data.url });
        setMessage("Graphic uploaded successfully!");
      } else {
        setMessage(`Error uploading graphic: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error uploading graphic: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploadingGraphic(false);
    }
  };

  // update article
  const updateArticle = async () => {
    if (!form.title || !form.slug || !form.description || !form.content) {
      setMessage("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/blog/updateblog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          title: form.title,
          slug: form.slug,
          description: form.description,
          content: form.content,
          thumbnail: form.thumbnail || "",
          graphic: form.graphic || "",
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage("Article updated successfully!");
        setEditingId(null);
        setForm({});
        // Refresh articles list
        await fetchArticles();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (article: any) => {
    setEditingId(article.id);
    setForm({
      id: article.id,
      title: article.title || "",
      slug: article.slug || "",
      description: article.description || "",
      content: article.content || "",
      thumbnail: article.thumbnail || "",
      graphic: article.graphic || "",
    });
    setMessage("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm({});
    setMessage("");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Update Articles</h2>
        <button 
          onClick={fetchArticles}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

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

      {loading && articles.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No articles found
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map(article => (
            <div
              key={article.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              {editingId === article.id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Editing Article</h3>
                    <button
                      onClick={cancelEditing}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter article title"
                      value={form.title || ""}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                        placeholder="Enter article slug"
                        value={form.slug || ""}
                        onChange={e => setForm({ ...form, slug: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter a unique slug for this article (e.g., "my-article-title")
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Enter article description"
                      value={form.description || ""}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Enter article content"
                      value={form.content || ""}
                      onChange={e => setForm({ ...form, content: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
                    />
                  </div>

                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Thumbnail Image
                    </label>
                    <div className="space-y-3">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleThumbnailUpload(file);
                          }}
                          disabled={uploadingThumbnail}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700/50">
                          {uploadingThumbnail ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {form.thumbnail ? "Change thumbnail" : "Upload thumbnail image"}
                              </span>
                            </>
                          )}
                        </div>
                      </label>
                      {form.thumbnail && (
                        <div className="relative">
                          <img
                            src={form.thumbnail}
                            alt="Thumbnail preview"
                            className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Uploaded
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Graphic Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Graphic Image
                    </label>
                    <div className="space-y-3">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleGraphicUpload(file);
                          }}
                          disabled={uploadingGraphic}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700/50">
                          {uploadingGraphic ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {form.graphic ? "Change graphic" : "Upload graphic image"}
                              </span>
                            </>
                          )}
                        </div>
                      </label>
                      {form.graphic && (
                        <div className="relative">
                          <img
                            src={form.graphic}
                            alt="Graphic preview"
                            className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Uploaded
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={updateArticle}
                      disabled={loading || !form.title || !form.slug || !form.description || !form.content}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{article.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-3">
                        {article.content}
                      </p>
                    </div>
                  </div>

                  {/* Image Previews */}
                  {(article.thumbnail || article.graphic) && (
                    <div className="grid grid-cols-2 gap-4">
                      {article.thumbnail && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Thumbnail</p>
                          <img
                            src={article.thumbnail}
                            alt="Thumbnail"
                            className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      )}
                      {article.graphic && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Graphic</p>
                          <img
                            src={article.graphic}
                            alt="Graphic"
                            className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => startEditing(article)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Article
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
