/**
 * GitHub API utility for browsing repository files.
 * Works without authentication for public repos (60 req/hour).
 * With a token, supports private repos (5000 req/hour).
 */

export interface GitHubFile {
  name: string;
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
  size?: number;
  sha: string;
  children?: GitHubFile[];
}

export interface RepoInfo {
  owner: string;
  repo: string;
  branch: string;
  fullName: string;
}

export interface RepoMeta {
  description: string;
  language: string | null;
  stars: number;
  forks: number;
  defaultBranch: string;
}

const GITHUB_API = "https://api.github.com";

function getHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Parse a GitHub URL into owner/repo/branch/path components.
 * Supports formats:
 *   owner/repo
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo/tree/branch/path/to/dir
 *   https://github.com/owner/repo/blob/branch/path/to/file
 */
export function parseGitHubUrl(input: string): RepoInfo | null {
  let cleaned = input.trim();

  // Strip trailing slashes and .git
  cleaned = cleaned.replace(/\/+$/, "").replace(/\.git$/, "");

  // Try to extract from full URL
  let match = cleaned.match(
    /github\.com\/([^/]+)\/([^/]+)(?:\/(?:tree|blob)\/([^/]+)(?:\/(.+))?)?$/,
  );
  if (match) {
    return {
      owner: match[1],
      repo: match[2],
      branch: match[3] || "main",
      fullName: `${match[1]}/${match[2]}`,
    };
  }

  // Try short format: owner/repo
  match = cleaned.match(/^([^/]+)\/([^/]+)$/);
  if (match) {
    return {
      owner: match[1],
      repo: match[2],
      branch: "main",
      fullName: `${match[1]}/${match[2]}`,
    };
  }

  return null;
}

/**
 * Fetch the file tree for a repository using the Git Trees API (recursive).
 * This gives us the entire file tree in one request.
 */
export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string,
  token?: string,
): Promise<GitHubFile[]> {
  const headers = getHeaders(token);

  // First, try to get the tree for the specified branch
  let treeSha = "";
  try {
    const refRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`,
      { headers },
    );
    if (refRes.ok) {
      const refData = await refRes.json();
      treeSha = refData.object.sha;
    } else if (refRes.status === 404) {
      // Branch might be "main" but the default branch could be different
      const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
        headers,
      });
      if (repoRes.ok) {
        const repoData = await repoRes.json();
        const defaultBranch = repoData.default_branch;
        if (defaultBranch !== branch) {
          const defaultRefRes = await fetch(
            `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`,
            { headers },
          );
          if (defaultRefRes.ok) {
            const defaultRefData = await defaultRefRes.json();
            treeSha = defaultRefData.object.sha;
          }
        }
      }
    }
  } catch {
    // Fall through to REST API
  }

  if (treeSha) {
    // Use the Trees API to get the full recursive tree
    try {
      const treeRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
        { headers },
      );
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        return buildTreeFromGitTree(treeData.tree);
      }
    } catch {
      // Fall through
    }
  }

  // Fallback: use the Contents API (non-recursive, directory by directory)
  return fetchContentsRecursive(owner, repo, "", headers);
}

/**
 * Fetch a single file's content.
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  filePath: string,
  branch: string,
  token?: string,
): Promise<string | null> {
  const headers = getHeaders(token);

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      { headers },
    );

    if (!res.ok) return null;

    const data = await res.json();

    if (data.encoding === "base64" && data.content) {
      return atob(data.content.replace(/\n/g, ""));
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch repo metadata.
 */
export async function fetchRepoMeta(
  owner: string,
  repo: string,
  token?: string,
): Promise<RepoMeta | null> {
  const headers = getHeaders(token);

  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers,
    });
    if (!res.ok) return null;

    const data = await res.json();
    return {
      description: data.description || "",
      language: data.language,
      stars: data.stargazers_count,
      forks: data.forks_count,
      defaultBranch: data.default_branch,
    };
  } catch {
    return null;
  }
}

// --- Internal helpers ---

interface GitTreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
  size?: number;
  sha: string;
}

function buildTreeFromGitTree(entries: GitTreeEntry[]): GitHubFile[] {
  const root: GitHubFile[] = [];
  const map = new Map<string, GitHubFile>();

  // Sort: directories first, then alphabetically
  const sorted = [...entries].sort((a, b) => {
    const aIsDir = a.type === "tree";
    const bIsDir = b.type === "tree";
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.path.localeCompare(b.path);
  });

  for (const entry of sorted) {
    if (entry.type === "commit") continue; // skip submodules

    const parts = entry.path.split("/");
    const name = parts[parts.length - 1];
    const node: GitHubFile = {
      name,
      path: entry.path,
      type: entry.type === "tree" ? "dir" : "file",
      size: entry.size,
      sha: entry.sha,
      children: entry.type === "tree" ? [] : undefined,
    };

    map.set(entry.path, node);

    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = map.get(parentPath);
      if (parent?.children) {
        parent.children.push(node);
      }
    }
  }

  return root;
}

async function fetchContentsRecursive(
  owner: string,
  repo: string,
  path: string,
  headers: HeadersInit,
): Promise<GitHubFile[]> {
  try {
    const url = path
      ? `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`
      : `${GITHUB_API}/repos/${owner}/${repo}/contents`;

    const res = await fetch(url, { headers });
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const files: GitHubFile[] = [];

    // Sort: directories first
    data.sort((a: GitHubFile, b: GitHubFile) => {
      if (a.type === "dir" && b.type !== "dir") return -1;
      if (a.type !== "dir" && b.type === "dir") return 1;
      return a.name.localeCompare(b.name);
    });

    for (const item of data) {
      const file: GitHubFile = {
        name: item.name,
        path: item.path,
        type: item.type === "dir" ? "dir" : "file",
        size: item.size,
        sha: item.sha,
        children: item.type === "dir" ? [] : undefined,
      };

      if (item.type === "dir") {
        file.children = await fetchContentsRecursive(
          owner,
          repo,
          item.path,
          headers,
        );
      }

      files.push(file);
    }

    return files;
  } catch {
    return [];
  }
}

/**
 * Format bytes to human-readable string.
 */
export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return "";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Get a file extension icon hint.
 */
export function getFileLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript",
    js: "JavaScript",
    jsx: "JavaScript",
    py: "Python",
    rb: "Ruby",
    go: "Go",
    rs: "Rust",
    java: "Java",
    kt: "Kotlin",
    swift: "Swift",
    c: "C",
    cpp: "C++",
    h: "C/C++ Header",
    cs: "C#",
    php: "PHP",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    less: "Less",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    toml: "TOML",
    xml: "XML",
    svg: "SVG",
    md: "Markdown",
    mdx: "MDX",
    txt: "Plain Text",
    sh: "Shell",
    bash: "Bash",
    zsh: "Zsh",
    fish: "Fish",
    sql: "SQL",
    graphql: "GraphQL",
    gql: "GraphQL",
    dockerfile: "Dockerfile",
    makefile: "Makefile",
    csv: "CSV",
    env: "Environment",
    lock: "Lock File",
    gitignore: "Git Ignore",
    dart: "Dart",
    lua: "Lua",
    r: "R",
    ex: "Elixir",
    exs: "Elixir",
    erl: "Erlang",
    hs: "Haskell",
    ml: "OCaml",
    clj: "Clojure",
    vue: "Vue",
    svelte: "Svelte",
    tf: "Terraform",
    hcl: "HCL",
    ini: "INI",
    cfg: "Config",
    log: "Log",
  };
  return map[ext] || ext.toUpperCase() || "File";
}

/**
 * Check if a file is likely binary based on extension.
 */
export function isBinaryFile(filename: string): boolean {
  const binaryExtensions = new Set([
    "png",
    "jpg",
    "jpeg",
    "gif",
    "bmp",
    "ico",
    "webp",
    "mp3",
    "mp4",
    "wav",
    "avi",
    "mov",
    "mkv",
    "pdf",
    "zip",
    "tar",
    "gz",
    "rar",
    "7z",
    "exe",
    "dll",
    "so",
    "dylib",
    "bin",
    "woff",
    "woff2",
    "ttf",
    "otf",
    "eot",
    "pyc",
    "pyo",
    "class",
    "o",
    "a",
    "keystore",
    "jks",
  ]);
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return binaryExtensions.has(ext);
}
