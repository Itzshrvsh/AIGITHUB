import { getOctokit } from "./client";

export async function fetchRepoMetadata(owner: string, repo: string, token?: string) {
  const octokit = getOctokit(token);
  
  const { data } = await octokit.rest.repos.get({
    owner,
    repo,
  });

  return {
    githubId: data.id,
    name: data.name,
    fullName: data.full_name,
    description: data.description ?? null,
    url: data.html_url,
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
    language: data.language ?? null,
    topics: JSON.stringify(data.topics || []),
    license: (data.license?.spdx_id || data.license?.name) ?? null,
    defaultBranch: data.default_branch ?? "main",
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function fetchReadme(owner: string, repo: string, token?: string) {
  const octokit = getOctokit(token);
  try {
    const { data } = await octokit.rest.repos.getReadme({
      owner,
      repo,
      mediaType: { format: "raw" },
    });
    return data as unknown as string;
  } catch (error) {
    console.error("Error fetching README:", error);
    return null;
  }
}

export async function fetchFileContent(owner: string, repo: string, path: string, token?: string) {
  const octokit = getOctokit(token);
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      mediaType: { format: "raw" },
    });
    return data as unknown as string;
  } catch (error) {
    return null;
  }
}
