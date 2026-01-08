import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

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

// 1. SEO: Generate dynamic titles and descriptions for Google
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: [article.thumbnail],
    },
  };
}

// 2. Performance/Crawlability: Pre-render all blog paths at build time
export async function generateStaticParams() {
  const { data: articles } = await supabase.from("articles").select("slug");

  if (!articles) return [];

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// Fetch single article logic
async function getArticle(slug: string): Promise<Article | null> {
  const decodedSlug = decodeURIComponent(slug).trim();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", decodedSlug)
    .single();

  return data as Article;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <p className="text-xl text-gray-600 mb-8">{article.description}</p>
      {article.thumbnail && (
        <img src={article.thumbnail} alt={article.title} className="rounded-lg mb-8" />
      )}
      <div className="prose prose-lg dark:prose-invert whitespace-pre-wrap">
        {article.content}

        {article.graphic && (
        <img src={article.graphic} alt={article.title} className="rounded-lg mb-8" />
      )}
      </div>
    </article>
  );
}