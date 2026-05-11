import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["tree-sitter", "tree-sitter-javascript", "tree-sitter-python", "tree-sitter-typescript", "tree-sitter-rust", "tree-sitter-go", "tree-sitter-c", "tree-sitter-cpp"],
  experimental: {
    turbopack: {
      root: "."
    }
  }
};

export default nextConfig;
