import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,

  FolderOpen,
  Folder,
  FileText,
  Image,
  Loader2,
  AlertCircle,
  ArrowRight,
  Star,
  GitFork,
  ExternalLink,
  Search,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  fetchRepoTree,
  fetchFileContent,
  fetchRepoMeta,
  type GitHubFile,
  type RepoMeta,
  formatFileSize,
  getFileLanguage,
  isBinaryFile,
} from "@/lib/github";
import { cn } from "@/lib/utils";

// ─── File Tree Sidebar ───────────────────────────────────────────────

function FileTreeItem({
  file,
  depth,
  selectedPath,
  onSelect,
  expandedDirs,
  toggleDir,
  searchQuery,
}: {
  file: GitHubFile;
  depth: number;
  selectedPath: string | null;
  onSelect: (file: GitHubFile) => void;
  expandedDirs: Set<string>;
  toggleDir: (path: string) => void;
  searchQuery: string;
}) {
  const isDir = file.type === "dir";
  const isExpanded = expandedDirs.has(file.path);
  const isSelected = selectedPath === file.path;
  const isBinary = !isDir && isBinaryFile(file.name);

  // Filter by search
  if (searchQuery && !isDir) {
    const matches = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matches) return null;
  }

  const DirIcon = isExpanded ? ChevronDown : ChevronRight;
  const FolderIcon = isExpanded ? FolderOpen : Folder;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (isDir) {
            toggleDir(file.path);
          } else {
            onSelect(file);
          }
        }}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors text-right cursor-pointer",
          isSelected
            ? "bg-primary/10 text-primary font-medium"
            : "text-foreground/80 hover:bg-accent",
          isDir && "font-medium",
        )}
        style={{ paddingInlineStart: `${depth * 16 + 8}px` }}
      >
        {isDir ? (
          <DirIcon className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <span className="w-3.5" />
        )}
        {isDir ? (
          <FolderIcon className="size-4 shrink-0 text-primary/70" />
        ) : isBinary ? (
          <Image className="size-4 shrink-0 text-muted-foreground/60" />
        ) : (
          <FileText className="size-4 shrink-0 text-muted-foreground/70" />
        )}
        <span className="truncate text-right" dir="ltr">
          {file.name}
        </span>
        {!isDir && file.size !== undefined && (
          <span className="mr-auto text-[10px] text-muted-foreground/60 whitespace-nowrap">
            {formatFileSize(file.size)}
          </span>
        )}
      </button>
      <AnimatePresence>
        {isDir && isExpanded && file.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {file.children.map((child) => (
              <FileTreeItem
                key={child.path}
                file={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
                expandedDirs={expandedDirs}
                toggleDir={toggleDir}
                searchQuery={searchQuery}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Breadcrumbs ─────────────────────────────────────────────────────

function Breadcrumbs({
  path,
  onNavigate,
}: {
  path: string;
  onNavigate: (path: string) => void;
}) {
  const parts = path.split("/");

  return (
    <div className="flex items-center gap-1 text-sm overflow-x-auto" dir="ltr">
      {parts.map((part, i) => {
        const fullPath = parts.slice(0, i + 1).join("/");
        const isLast = i === parts.length - 1;
        return (
          <span key={fullPath} className="flex items-center gap-1 shrink-0">
            {i > 0 && (
              <ChevronLeft className="size-3 text-muted-foreground/50" />
            )}
            <button
              type="button"
              onClick={() => onNavigate(fullPath)}
              className={cn(
                "hover:text-primary transition-colors cursor-pointer truncate max-w-[150px]",
                isLast
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {part}
            </button>
          </span>
        );
      })}
    </div>
  );
}

// ─── File Viewer ─────────────────────────────────────────────────────

function FileViewer({
  content,
  fileName,
  loading,
}: {
  content: string | null;
  fileName: string;
  loading: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const language = getFileLanguage(fileName);
  const binary = isBinaryFile(fileName);

  const handleCopy = useCallback(() => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">جاري تحميل الملف...</p>
        </div>
      </div>
    );
  }

  if (binary) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            هذا ملف ثنائي لا يمكن عرضه
          </p>
          <p className="text-xs text-muted-foreground/60">{fileName}</p>
        </div>
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            لا يمكن تحميل محتوى هذا الملف
          </p>
        </div>
      </div>
    );
  }

  const lineCount = content.split("\n").length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* File info bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/40 shrink-0">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-xs font-mono">
            {language}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {lineCount} سطر
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs gap-1"
        >
          {copied ? (
            <>
              <Check className="size-3" />
              تم النسخ
            </>
          ) : (
            <>
              <Copy className="size-3" />
              نسخ
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto min-h-0">
        <pre className="p-4 text-sm font-mono leading-6 text-foreground/90 whitespace-pre-wrap break-words" dir="ltr">
          {content.split("\n").map((line, i) => (
            <div key={`${i}-${line}`} className="flex">
              <span className="inline-block w-12 shrink-0 text-right pr-3 text-muted-foreground/40 select-none text-xs leading-6">
                {i + 1}
              </span>
              <span className="flex-1">{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────

function EmptyState({ repoFullName }: { repoFullName: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-12">        <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15">
          <FolderOpen className="size-8 text-primary/50" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            اختر ملفاً لعرضه
          </h3>
          <p className="text-sm text-muted-foreground">
            اضغط على أي ملف في الشجرة لعرض محتواه
          </p>
        </div>
        <a
          href={`https://github.com/${repoFullName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          فتح على GitHub
          <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────

export default function Dashboard() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const branch = searchParams.get("branch") || "main";

  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [meta, setMeta] = useState<RepoMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<GitHubFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fileSearch, setFileSearch] = useState("");

  const repoFullName = `${owner}/${repo}`;

  // Fetch repo tree
  useEffect(() => {
    if (!owner || !repo) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetchRepoTree(owner, repo, branch),
      fetchRepoMeta(owner, repo),
    ])
      .then(([tree, repoMeta]) => {
        if (tree.length === 0) {
          setError("لم يتم العثور على ملفات في هذا المستودع");
        } else {
          setFiles(tree);
          // Auto-expand root directories
          const rootDirs = new Set(
            tree.filter((f) => f.type === "dir").map((f) => f.path),
          );
          setExpandedDirs(rootDirs);
        }
        if (repoMeta) setMeta(repoMeta);
        setLoading(false);
      })
      .catch(() => {
        setError("حدث خطأ أثناء تحميل المستودع. تأكد من صحة الرابط.");
        setLoading(false);
      });
  }, [owner, repo, branch]);

  // Fetch file content when selected
  useEffect(() => {
    if (!selectedFile || !owner || !repo) return;
    if (isBinaryFile(selectedFile.name)) {
      setFileContent(null);
      return;
    }

    setLoadingContent(true);
    fetchFileContent(owner, repo, selectedFile.path, branch)
      .then((content) => {
        setFileContent(content);
        setLoadingContent(false);
      })
      .catch(() => {
        setFileContent(null);
        setLoadingContent(false);
      });
  }, [selectedFile, owner, repo, branch]);

  const toggleDir = useCallback((path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleFileSelect = useCallback(
    (file: GitHubFile) => {
      setSelectedFile(file);
      // Expand parent directories
      const parts = file.path.split("/");
      setExpandedDirs((prev) => {
        const next = new Set(prev);
        for (let i = 1; i < parts.length; i++) {
          next.add(parts.slice(0, i).join("/"));
        }
        return next;
      });
    },
    [],
  );

  const handleBreadcrumbNavigate = useCallback(
    (path: string) => {
      const dirFile: GitHubFile = {
        name: path.split("/").pop() || "",
        path,
        type: "dir",
        sha: "",
        children: [],
      };
      setSelectedFile(dirFile);
      // Find and expand the directory
      setExpandedDirs((prev) => {
        const next = new Set(prev);
        next.add(path);
        return next;
      });
    },
    [],
  );

  // Count files
  const fileCount = useMemo(() => {
    let count = 0;
    const countFiles = (items: GitHubFile[]) => {
      for (const item of items) {
        if (item.type === "file") count++;
        if (item.children) countFiles(item.children);
      }
    };
    countFiles(files);
    return count;
  }, [files]);

  if (!owner || !repo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">رابط المستودع غير صحيح</p>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mt-4"
          >
            <ArrowRight className="size-4 ml-2" />
            العودة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background thimmar-pattern" dir="rtl">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md shrink-0">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="shrink-0 h-8 px-2 hover:bg-primary/10"
            >
              <ArrowRight className="size-4 text-primary" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground truncate" dir="ltr">
                  {repoFullName}
                </h1>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {branch}
                </Badge>
              </div>
              {meta?.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {meta.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {meta && (
              <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                {meta.language && (
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-primary/60" />
                    {meta.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="size-3" />
                  {meta.stars.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="size-3" />
                  {meta.forks.toLocaleString()}
                </span>
              </div>
            )}
            <a
              href={`https://github.com/${repoFullName}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ExternalLink className="size-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside
          className={cn(
            "border-l border-border/50 bg-card/40 flex flex-col shrink-0 transition-all duration-200",
            sidebarOpen ? "w-72" : "w-0 overflow-hidden",
          )}
        >
          {/* Sidebar header */}
          <div className="p-3 border-b border-border/40">
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                placeholder="بحث في الملفات..."
                className="h-8 text-xs pr-7 pl-3 bg-background/50"
                dir="ltr"
              />
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-[10px] text-muted-foreground">
                {fileCount} ملف
              </span>
              <button
                type="button"
                onClick={() => setExpandedDirs(new Set())}
                className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                طي الكل
              </button>
            </div>
          </div>

          {/* File tree */}
          <div className="flex-1 overflow-y-auto p-2 thimmar-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
                <AlertCircle className="size-8 text-destructive/60" />
                <p className="text-xs text-destructive">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="text-xs"
                >
                  العودة
                </Button>
              </div>
            ) : (
              files.map((file) => (
                <FileTreeItem
                  key={file.path}
                  file={file}
                  depth={0}
                  selectedPath={selectedFile?.path || null}
                  onSelect={handleFileSelect}
                  expandedDirs={expandedDirs}
                  toggleDir={toggleDir}
                  searchQuery={fileSearch}
                />
              ))
            )}
          </div>
        </aside>

        {/* Toggle sidebar button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="self-center -mr-px z-10 flex items-center justify-center size-6 rounded-l-lg bg-card border border-r-0 border-border/50 hover:bg-primary/10 transition-colors cursor-pointer shadow-sm"
        >
          {sidebarOpen ? (
            <ChevronRight className="size-3 text-muted-foreground" />
          ) : (
            <ChevronLeft className="size-3 text-muted-foreground" />
          )}
        </button>

        {/* File content area */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0">
          {selectedFile && selectedFile.type === "file" ? (
            <>
              <div className="px-4 py-2 border-b border-border/40 shrink-0">
                <Breadcrumbs
                  path={selectedFile.path}
                  onNavigate={handleBreadcrumbNavigate}
                />
              </div>
              <FileViewer
                content={fileContent}
                fileName={selectedFile.name}
                loading={loadingContent}
              />
            </>
          ) : (
            <EmptyState repoFullName={repoFullName} />
          )}
        </main>
      </div>
    </div>
  );
}
