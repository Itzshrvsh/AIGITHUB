import { db } from "@/lib/db";
import { repositories } from "@/lib/db/schema";
import { ingestRepository } from "@/lib/ingest";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    
    const repo = await db.query.repositories.findFirst({
      where: eq(repositories.id, id),
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    // Re-ingest uses the same logic but will update the existing entry
    // We pass the URL again
    // In a real app, we might want a specific 'reanalyze' function, 
    // but ingestRepository already handles updates.
    
    // Fire and forget the ingestion to not block the response
    // Or we can await it if we want immediate feedback
    ingestRepository(repo.url).catch(console.error);

    return NextResponse.json({ success: true, message: "Re-analysis initiated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
