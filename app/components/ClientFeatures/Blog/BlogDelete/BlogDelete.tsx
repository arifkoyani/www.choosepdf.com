"use client";
import React, { useEffect, useState } from "react";
import { Trash2, RefreshCw, Loader2, CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";

export default function BlogDelete() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; title: string } | null>(null);

  // Fetch articles
  const fetchArticles = async () => {
    setLoading(true);
    setMessage("");
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

  // Delete article
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setMessage("");

    try {
      const res = await fetch("/api/blog/deleteblog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Article deleted successfully!");
        setConfirmDelete(null);
        // Refresh articles list
        await fetchArticles();
      } else {
        setMessage(`Error: ${data.error}`);
        setConfirmDelete(null);
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Something went wrong"}`);
      setConfirmDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  const openConfirmDialog = (article: any) => {
    setConfirmDelete({ id: article.id, title: article.title });
    setMessage("");
  };

  const closeConfirmDialog = () => {
    setConfirmDelete(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delete Articles</h2>
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

      {/* Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Are you sure you want to delete this article?
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              "{confirmDelete.title}"
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deletingId === confirmDelete.id}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {deletingId === confirmDelete.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
              <button
                onClick={closeConfirmDialog}
                disabled={deletingId === confirmDelete.id}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
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
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{article.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2 mb-4">
                    {article.content}
                  </p>

                  {/* Image Previews */}
                  {(article.thumbnail || article.graphic) && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
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
                </div>

                <button
                  onClick={() => openConfirmDialog(article)}
                  disabled={deletingId === article.id}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  {deletingId === article.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

