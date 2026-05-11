import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { repositories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { askRepoQuestion } from "../../../lib/llm/ollama";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { repoId, question } = body;

    if (!repoId || !question) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const repo = await db.query.repositories.findFirst({
      where: eq(repositories.id, repoId),
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    const result = await askRepoQuestion(repo.fullName, repo.summary || "", question);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
