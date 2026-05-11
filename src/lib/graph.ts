import { db } from "./db";
import { repositories, relationships } from "./db/schema";
import { eq, and } from "drizzle-orm";

export async function generateRelationships(repoId: number) {
  const targetRepo = await db.query.repositories.findFirst({
    where: eq(repositories.id, repoId),
  });

  if (!targetRepo) return;

  const allRepos = await db.select().from(repositories);
  const targetStack = JSON.parse(targetRepo.stack || "[]") as string[];

  for (const repo of allRepos) {
    if (repo.id === repoId) continue;

    const otherStack = JSON.parse(repo.stack || "[]") as string[];
    
    // 1. Shared Tech
    const sharedTech = targetStack.filter(tech => otherStack.includes(tech));
    if (sharedTech.length > 1) {
      await db.insert(relationships).values({
        sourceRepoId: repoId,
        targetRepoId: repo.id,
        type: "shared_tech",
        strength: sharedTech.length / 5,
        metadata: JSON.stringify({ shared: sharedTech }),
      });
    }

    // 2. Language Match
    if (repo.language === targetRepo.language) {
      await db.insert(relationships).values({
        sourceRepoId: repoId,
        targetRepoId: repo.id,
        type: "language_match",
        strength: 0.5,
      });
    }
  }
}
