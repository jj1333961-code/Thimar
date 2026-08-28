/**
 * Fetch files from the teacher GitHub repository.
 * This is used to pull the teacher repo's content into the current project.
 */

const GITHUB_API = "https://api.github.com";
const REPO_OWNER = "jj1333961-code";
const REPO_NAME = "teacher";

export interface RepoFile {
  name: string;
  path: string;
  type: "file" | "dir";
  content?: string;
  children?: RepoFile[];
}

/**
 * Fetch the file tree of the teacher repository.
 */
export async function fetchTeacherRepoTree(): Promise<RepoFile[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/main?recursive=1`,
    { headers: { Accept: "application/vnd.github.v3+json" } },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch repo tree: ${res.status}`);
  }

  const data = await res.json();
  const entries = data.tree.filter(
    (e: { type: string }) => e.type === "blob" || e.type === "tree",
  );

  return buildTree(entries);
}

/**
 * Fetch a single file's content from the teacher repository.
 */
export async function fetchTeacherFileContent(
  filePath: string,
): Promise<string | null> {
  const res = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=main`,
    { headers: { Accept: "application/vnd.github.v3+json" } },
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (data.encoding === "base64" && data.content) {
    return atob(data.content.replace(/\n/g, ""));
  }
  return null;
}

function buildTree(
  entries: Array<{ path: string; type: string }>,
): RepoFile[] {
  const root: RepoFile[] = [];
  const map = new Map<string, RepoFile>();

  entries.sort((a, b) => {
    const aDir = a.type === "tree" ? 0 : 1;
    const bDir = b.type === "tree" ? 0 : 1;
    if (aDir !== bDir) return aDir - bDir;
    return a.path.localeCompare(b.path);
  });

  for (const entry of entries) {
    const parts = entry.path.split("/");
    const name = parts[parts.length - 1];
    const node: RepoFile = {
      name,
      path: entry.path,
      type: entry.type === "tree" ? "dir" : "file",
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
