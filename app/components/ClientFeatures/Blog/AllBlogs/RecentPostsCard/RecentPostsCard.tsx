"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "../../../../ui/card";
import { FileText } from "lucide-react";

interface Article {
  id: number;
  title: string;
  slug: string;
  created_at: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

export default function RecentPostsCard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("id, title, slug, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching articles:", error);
        } else {
          setArticles(data || []);
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  if (loading) {
    return (
      <Card className="p-6 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#ff911d]" />
          Recent Posts
        </h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#ff911d]" />
        Recent Posts
      </h2>
      <div className="space-y-4">
        {articles.length === 0 ? (
          <p className="text-sm text-gray-500">No recent posts available.</p>
        ) : (
          articles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="block group"
            >
              <div className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-[#ff911d] transition-colors">
                  {article.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(article.created_at)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}

