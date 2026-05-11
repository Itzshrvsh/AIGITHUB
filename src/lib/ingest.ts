import { db } from "./db";
import { repositories } from "./db/schema";
import { fetchRepoMetadata, fetchReadme, fetchFileContent } from "./github/service";
import { analyzeRepository } from "./llm/ollama";
import { addToVectorStore } from "./vector";
import { analyzeCode } from "./ast/analyzer";
import { calculateInnovationScore, calculateMaintainabilityScore } from "./scoring";
import { generateRelationships } from "./graph";
import { statusTracker } from "./status-tracker";
import { eq } from "drizzle-orm";

export async function ingestRepository(url: string, token?: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error("Invalid GitHub URL");
  
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");
  const fullName = `${owner}/${repo}`;

  try {
    statusTracker.updateJob(fullName, "fetching", "Fetching GitHub metadata...");

    const metadata = await fetchRepoMetadata(owner, repo, token);
    
    const existing = await db.query.repositories.findFirst({
      where: eq(repositories.githubId, metadata.githubId),
    });

    let repoId: number;

    if (existing) {
      await db.update(repositories)
        .set({
          ...metadata,
          updatedAt: new Date(),
        })
        .where(eq(repositories.githubId, metadata.githubId));
      repoId = existing.id;
    } else {
      const [result] = await db.insert(repositories)
        .values({
          ...metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: repositories.id });
      repoId = result.id;
    }

    // AST Analysis on primary file
    statusTracker.updateJob(fullName, "ast_analyzing", "Running AST deep dive...");
    let astResults = { classes: 0, functions: 0, imports: 0, complexity: 0 };
    const primaryFiles = ["index.ts", "index.js", "main.py", "lib.rs", "main.go"];
    for (const file of primaryFiles) {
      const content = await fetchFileContent(owner, repo, file, token);
      if (content) {
        const lang = file.split(".").pop() === "py" ? "python" : 
                     file.split(".").pop() === "rs" ? "rust" : "typescript";
        const analysis = analyzeCode(content, lang);
        if (analysis) {
          astResults = analysis;
        }
        break;
      }
    }

    // AI Analysis & Vector Storage
    const readme = await fetchReadme(owner, repo, token);
    if (readme) {
      statusTracker.updateJob(fullName, "llm_analyzing", "Ollama is dreaming about architecture...");
      const analysis = await analyzeRepository(metadata.fullName, readme);
      
      const innovationScore = calculateInnovationScore(metadata.stars || 0, JSON.parse(metadata.topics || "[]"), analysis.architectureStyle);
      const maintainabilityScore = calculateMaintainabilityScore(astResults.complexity, astResults.classes + astResults.functions, metadata.stars || 0);

      await db.update(repositories)
        .set({
          summary: analysis.summary,
          architectureStyle: analysis.architectureStyle,
          stack: JSON.stringify(analysis.stack),
          innovationScore,
          maintainabilityScore,
          productionReadinessScore: analysis.productionReadinessScore,
          overallScore: (innovationScore + maintainabilityScore + analysis.productionReadinessScore) / 3,
          lastAnalyzedAt: new Date(),
          detailedReport: null,
        })
        .where(eq(repositories.id, repoId));

      statusTracker.updateJob(fullName, "embedding", "Generating semantic embeddings...");
      await addToVectorStore(repoId.toString(), readme, {
        fullName: metadata.fullName,
        topics: metadata.topics,
      });

      // Build Graph Relationships
      await generateRelationships(repoId);
    } else {
      statusTracker.addLog(`Warning: No README found for ${fullName}. Skipping LLM analysis.`);
    }

    statusTracker.updateJob(fullName, "completed", "Intelligence ingestion finished.");
    return repoId;
  } catch (error: any) {
    statusTracker.updateJob(fullName, "error", `Analysis failed: ${error.message}`);
    throw error;
  }
}
