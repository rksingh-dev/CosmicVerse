import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Share2,
  Copy,
  Plus,
  Settings,
  BookOpen,
  Edit3,
  Columns,
  Sparkles,
  FileDown,
  Check,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

// UTF-8 safe base64 encoding
const encodeContent = (str: string): string => {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch (e) {
    console.error("Failed to encode note", e);
    return "";
  }
};

// UTF-8 safe base64 decoding
const decodeContent = (str: string): string => {
  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch (e) {
    console.error("Failed to decode note", e);
    return "";
  }
};

const RKSNotes = () => {
  const [note, setNote] = useState<string>("");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">("mono");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize from URL hash or localStorage
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      // Decode content
      let content = "";
      if (hash.startsWith("note=")) {
        content = decodeContent(hash.substring(5));
      } else {
        content = decodeContent(hash);
      }

      if (content) {
        setNote(content);
        toast.success("Shared note loaded successfully!");
      } else {
        toast.error("Failed to decode note from URL.");
      }
    } else {
      // Fallback to local storage draft if no hash is provided
      const draft = localStorage.getItem("rksnotes_draft");
      if (draft) {
        setNote(draft);
      } else {
        // Welcome default note
        setNote(`# Welcome to RKSNotes 📝

A minimalist, highly secure, distraction-free markdown notepad.

## Key Features

- **No Sign-up / Login:** Open and start writing instantly.
- **Privacy First:** Your notes are stored entirely in the URL hash, never on any server.
- **Instant Sharing:** Just copy the URL and share it with others.
- **Offline Storage:** Automatically backs up your current draft locally in your browser.
- **Markdown Support:** Format your notes using simple markdown syntax.
- **Download Option:** Download your notes as markdown (.md) or text (.txt) files.

### Try Markdown Examples:
- Use asterisks for **bold** or *italics*.
- Add a hyphen for unordered list items:
  - Markdown lists
  - Clean layouts
  - Font choices
- Use backticks for \`inline code\` or block code:
\`\`\`javascript
const greeting = "Hello, RKSNotes!";
console.log(greeting);
\`\`\`
`);
      }
    }
  }, []);

  // Update hash and local storage on changes (with history replace)
  useEffect(() => {
    if (!note) {
      // Clear hash if note is completely empty
      window.history.replaceState(null, "", window.location.pathname);
      localStorage.removeItem("rksnotes_draft");
      return;
    }

    // Save to local storage draft
    localStorage.setItem("rksnotes_draft", note);

    // Sync to URL Hash
    const encoded = encodeContent(note);
    if (encoded) {
      window.history.replaceState(null, "", `#${encoded}`);
    }
  }, [note]);

  // Handle auto-resizing textarea to match contents
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [note, viewMode]);

  // Word count and Reading Time
  const charCount = note.length;
  const wordCount = note.trim() === "" ? 0 : note.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Copy shareable link to clipboard
  const handleCopyLink = async () => {
    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("Share link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link. Please manually copy the URL.");
    }
  };

  // Download note as markdown file
  const handleDownload = () => {
    if (!note.trim()) {
      toast.error("Note is empty. Write something before downloading!");
      return;
    }

    try {
      const firstLine = note.trim().split("\n")[0];
      let fileName = "note.md";
      if (firstLine) {
        const slug = firstLine
          .replace(/^#+\s*/, "") // Remove markdown header hashes
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
          .substring(0, 30);
        if (slug) fileName = `${slug}.md`;
      }

      const element = document.createElement("a");
      const file = new Blob([note], { type: "text/markdown;charset=utf-8" });
      element.href = URL.createObjectURL(file);
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`Downloaded note as "${fileName}"`);
    } catch (err) {
      toast.error("Failed to download note.");
    }
  };

  // Reset note
  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear your current note? This will delete the draft.")) {
      setNote("");
      localStorage.removeItem("rksnotes_draft");
      window.history.replaceState(null, "", window.location.pathname);
      toast.success("Draft cleared.");
    }
  };

  // Simple, robust Markdown parser
  const renderMarkdown = (md: string) => {
    if (!md) return '<p class="text-muted-foreground italic">Nothing written yet. Start typing to preview...</p>';

    // Escape raw HTML tags to prevent XSS
    let html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-5 mb-2 text-foreground">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3 text-foreground border-b border-border pb-1">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold mt-8 mb-4 text-foreground">$1</h1>');

    // Code blocks: match ```lang ... ``` or just ``` ... ```
    html = html.replace(/```(?:[a-zA-Z0-9]+)?([\s\S]*?)```/g, '<pre class="bg-zinc-950 p-4 rounded-lg my-4 font-mono text-sm overflow-x-auto text-zinc-300 border border-zinc-800"><code>$1</code></pre>');

    // Inline code: `code`
    html = html.replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded font-mono text-sm text-emerald-400 border border-border">$1</code>');

    // Bold & Italic combinations
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Blockquotes
    html = html.replace(/^\>\s?(.*$)/gim, '<blockquote class="border-l-4 border-emerald-500 pl-4 italic my-4 text-muted-foreground bg-emerald-500/5 py-2 pr-2 rounded-r">$1</blockquote>');

    // Unordered lists (- item or * item)
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-muted-foreground py-0.5">$1</li>');

    // Ordered lists (1. item)
    html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-muted-foreground py-0.5">$1</li>');

    // Links: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline transition-colors">$1</a>');

    // Paragraph line breaks
    html = html.replace(/\n/g, "<br />");

    return html;
  };

  // Font class determinations
  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "serif":
        return "font-serif tracking-normal leading-relaxed";
      case "mono":
        return "font-mono tracking-tight leading-normal";
      default:
        return "font-sans tracking-normal leading-relaxed";
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg md:text-xl";
      case "xl":
        return "text-xl md:text-2xl";
      default:
        return "text-base md:text-lg";
    }
  };

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Glow ambient background shadows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Editor Header Navigation */}
      <header className="relative z-10 border-b border-slate-800 bg-[#070A13]/85 backdrop-blur-md px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent flex items-center gap-1.5">
              rksnotes
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </span>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
              Secure URL Hash
            </Badge>
          </div>
        </div>

        {/* Action and Format Toolbar */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* View Toggles */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <Button
              variant={viewMode === "edit" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("edit")}
              className={`h-8 px-2.5 text-xs ${viewMode === "edit" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
              title="Edit Mode"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
            <Button
              variant={viewMode === "split" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("split")}
              className={`h-8 px-2.5 text-xs hidden md:flex ${viewMode === "split" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5 mr-1" />
              Split
            </Button>
            <Button
              variant={viewMode === "preview" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("preview")}
              className={`h-8 px-2.5 text-xs ${viewMode === "preview" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
              title="Preview Mode"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              Preview
            </Button>
          </div>

          {/* Typography Controls */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {/* Font Picker */}
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as any)}
              className="bg-transparent border-none text-slate-300 focus:outline-none cursor-pointer px-1 py-0.5"
            >
              <option value="sans" className="bg-slate-900 text-white">Sans</option>
              <option value="serif" className="bg-slate-900 text-white">Serif</option>
              <option value="mono" className="bg-slate-900 text-white">Mono</option>
            </select>

            <span className="w-[1px] h-4 bg-slate-800" />

            {/* Font Size Picker */}
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as any)}
              className="bg-transparent border-none text-slate-300 focus:outline-none cursor-pointer px-1 py-0.5"
            >
              <option value="sm" className="bg-slate-900 text-white">Small</option>
              <option value="base" className="bg-slate-900 text-white">Medium</option>
              <option value="lg" className="bg-slate-900 text-white">Large</option>
              <option value="xl" className="bg-slate-900 text-white">Extra</option>
            </select>
          </div>

          {/* Shared Action Triggers */}
          <div className="flex items-center gap-1.5">
            <Button
              onClick={handleCopyLink}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Share Link
                </>
              )}
            </Button>

            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
              title="Download Note (.md)"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="border-red-950/40 bg-red-950/10 hover:bg-red-900/20 text-red-400 hover:text-red-300 h-9 w-9 p-0"
              title="Clear Note"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Editor & Preview Pane Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col relative z-10">
        <div className="flex-1 min-h-[70vh] bg-slate-950/40 border border-slate-800/80 rounded-2xl backdrop-blur-sm overflow-hidden flex flex-col md:flex-row">
          {/* TEXTAREA WRITING WORKSPACE */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div className={`flex-1 p-4 md:p-8 flex flex-col border-slate-800 ${viewMode === "split" ? "border-r" : ""}`}>
              <textarea
                ref={textareaRef}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="# Start writing your note..."
                className={`w-full flex-1 bg-transparent resize-none border-none outline-none focus:ring-0 text-slate-200 placeholder-slate-600 focus:outline-none min-h-[60vh] h-full ${getFontFamilyClass()} ${getFontSizeClass()}`}
                style={{
                  caretColor: "#10b981", // emerald-500
                }}
              />
            </div>
          )}

          {/* RENDERED PREVIEW CONTAINER */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className="flex-1 p-4 md:p-8 overflow-y-auto max-h-[75vh] min-h-[60vh]">
              {viewMode === "split" && (
                <div className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800/60 pb-2 mb-4 font-semibold">
                  Live Preview
                </div>
              )}
              <div
                className={`prose prose-invert max-w-none text-slate-300 ${getFontFamilyClass()} ${getFontSizeClass()}`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(note) }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Editor Footer / Info Metrics Bar */}
      <footer className="border-t border-slate-900 bg-slate-950/20 py-3 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span>Words: <strong className="text-slate-400">{wordCount}</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span>Characters: <strong className="text-slate-400">{charCount}</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span>Reading Time: <strong className="text-slate-400">{readingTime} min</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800/60 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Auto‑saved to local draft &amp; URL hash
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RKSNotes;
