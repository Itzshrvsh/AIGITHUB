import { NextRequest, NextResponse } from "next/server";
import { ingestRepository } from "@/lib/ingest";

export async function POST(req: NextRequest) {
  try {
    const { url, token } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const repoId = await ingestRepository(url, token);
    return NextResponse.json({ success: true, repoId });
  } catch (error: any) {
    console.error("Ingestion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
