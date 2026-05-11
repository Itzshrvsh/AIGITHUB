import { ChromaClient, IEmbeddingFunction } from "chromadb";

class OllamaEmbeddingFunction implements IEmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      try {
        const response = await fetch("http://localhost:11434/api/embeddings", {
          method: "POST",
          body: JSON.stringify({
            model: "nomic-embed-text", // Standard fast embedding model
            prompt: text,
          }),
        });
        const data = await response.json();
        embeddings.push(data.embedding);
      } catch (error) {
        console.error("Embedding generation failed:", error);
        embeddings.push(new Array(768).fill(0)); // Fallback
      }
    }
    return embeddings;
  }
}

const client = new ChromaClient({ 
  path: "http://localhost:8000"
});

export async function addToVectorStore(id: string, text: string, metadata: any) {
  try {
    const collection = await client.getOrCreateCollection({
      name: "repository_intelligence",
      embeddingFunction: embedder
    });

    await collection.add({
      ids: [id],
      documents: [text.substring(0, 8000)], // Clip long texts
      metadatas: [metadata],
    });
  } catch (error) {
    console.error("Vector Store (ChromaDB) unreachable. Skipping semantic storage.");
  }
}

export async function searchRepositories(query: string, limit: number = 5) {
  try {
    const collection = await client.getOrCreateCollection({
      name: "repository_intelligence",
      embeddingFunction: embedder
    });

    return await collection.query({
      queryTexts: [query],
      nResults: limit,
    });
  } catch (error) {
    console.error("ChromaDB search failed:", error);
    return null;
  }
}
