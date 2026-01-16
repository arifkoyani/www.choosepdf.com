// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const { slug } = await req.json();
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  return Response.json({ revalidated: true });
}
