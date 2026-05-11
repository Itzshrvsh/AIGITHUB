import { Octokit } from "octokit";

export const getOctokit = (token?: string) => {
  return new Octokit({
    auth: token || process.env.GITHUB_TOKEN,
  });
};
