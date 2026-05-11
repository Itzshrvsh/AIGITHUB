import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const repositories = sqliteTable("repositories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  githubId: integer("github_id").notNull().unique(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  stars: integer("stars").default(0),
  forks: integer("forks").default(0),
  openIssues: integer("open_issues").default(0),
  language: text("language"),
  topics: text("topics"), // Stored as JSON string
  license: text("license"),
  defaultBranch: text("default_branch").default("main"),
  
  // Intelligence Metrics
  summary: text("summary"),
  architectureStyle: text("architecture_style"),
  stack: text("stack"), // Stored as JSON string
  
  // Scores
  innovationScore: real("innovation_score").default(0),
  maintainabilityScore: real("maintainability_score").default(0),
  productionReadinessScore: real("production_readiness_score").default(0),
  activityScore: real("activity_score").default(0),
  overallScore: real("overall_score").default(0),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  lastAnalyzedAt: integer("last_analyzed_at", { mode: "timestamp" }),
  detailedReport: text("detailed_report"), // Stored as JSON string
});

export const relationships = sqliteTable("relationships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceRepoId: integer("source_repo_id").notNull().references(() => repositories.id),
  targetRepoId: integer("target_repo_id").notNull().references(() => repositories.id),
  type: text("type").notNull(), // 'shared_tech', 'semantic_similarity', 'dependency', 'contributor'
  strength: real("strength").default(0),
  metadata: text("metadata"), // JSON string
});
