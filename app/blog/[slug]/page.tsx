import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";

type Article = {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnail: string;
  graphic: string;
  created_at: string;
};

type Props = {
  params: Promise<{ slug: string }>;
};

// Fetch single article by slug
async function getArticle(slug: string): Promise<Article | null> {
  try {
    // Decode and trim the slug
    const decodedSlug = decodeURIComponent(slug).trim();
    
    console.log("Searching for slug:", decodedSlug);
    
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", decodedSlug)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      // If single() fails, try without single() to see all matches
      const { data: allData } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", decodedSlug);
      console.log("All matching articles:", allData);
      return null;
    }
    
    if (!data) {
      console.log("No data returned for slug:", decodedSlug);
      return null;
    }
    
    console.log("Article found:", data.title);
    return data as Article;
  } catch (err) {
    console.error("Error fetching article:", err);
    return null;
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    // Debug: Log the slug that was searched
    console.log("Article not found for slug:", slug);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {article.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {article.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Slug: {article.slug}</span>
            <span>•</span>
            <span>
              Created: {new Date(article.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Thumbnail Image */}
        {article.thumbnail && (
          <div className="mb-8">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-auto rounded-lg shadow-lg object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {article.content}
          </div>
        </div>

        {/* Graphic Image */}
        {article.graphic && (
          <div className="mt-8">
            <img
              src={article.graphic}
              alt="Article graphic"
              className="w-full h-auto rounded-lg shadow-lg object-cover"
            />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Article ID: {article.id}</p>
            <p>Last updated: {new Date(article.created_at).toLocaleString()}</p>
          </div>
        </footer>
      </article>
    </div>
  );
}

