export function calculateInnovationScore(stars: number, topics: string[], architectureStyle: string) {
  let score = 50; // Base score
  
  // High stars can indicate community-validated innovation
  score += Math.min(20, stars / 1000);
  
  // Specific innovative topics
  const innovativeTopics = ["ai", "machine-learning", "rust", "wasm", "distributed-systems", "blockchain"];
  topics.forEach(topic => {
    if (innovativeTopics.includes(topic.toLowerCase())) score += 5;
  });

  // Architecture complexity
  const style = (architectureStyle || "").toLowerCase();
  if (style.includes("microservices") || style.includes("event-driven")) {
    score += 10;
  }

  return Math.min(100, score);
}

export function calculateMaintainabilityScore(complexity: number, modularity: number, stars: number) {
  let score = 80;
  
  // High complexity penalizes maintainability
  if (complexity > 1000) score -= 30;
  else if (complexity > 500) score -= 15;

  // High modularity helps maintainability
  score += Math.min(20, modularity * 2);

  return Math.max(0, Math.min(100, score));
}
