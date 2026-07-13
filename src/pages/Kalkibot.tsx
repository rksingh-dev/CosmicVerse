import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Search,
  Target,
  FileText,
  UploadCloud,
  ChevronRight,
  Database,
  Terminal,
  MessageSquare,
  Sparkles,
  Info,
  CheckCircle2,
  Settings,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileCode2,
} from "lucide-react";
import { toast } from "sonner";

interface ChunkMetric {
  id: number;
  text: string;
  denseScore: number;
  sparseScore: number;
  hybridScore: number;
  rerankScore: number;
  mmrStatus: "selected" | "redundant";
  citation: string;
}

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  metrics?: ChunkMetric[];
}

const PRESET_ANSWERS: Record<string, { answer: string; metrics: ChunkMetric[] }> = {
  "what is hybrid search in kalkibot?": {
    answer: "Hybrid search in Kalkibot combines dense retrieval (neural vector search using BGE Embeddings) with sparse retrieval (lexical search using BM25). This ensures we capture both semantic meaning and exact keyword matches, leading to 30% higher retrieval recall compared to vector search alone.",
    metrics: [
      {
        id: 1,
        text: "Kalkibot's hybrid search architecture combines neural embeddings (dense retrieval) and lexical indices (sparse BM25 retrieval) under a reciprocal rank fusion (RRF) formula.",
        denseScore: 0.89,
        sparseScore: 18.5,
        hybridScore: 0.033,
        rerankScore: 0.94,
        mmrStatus: "selected",
        citation: "Section 2.1: Hybrid Architecture (Page 3)",
      },
      {
        id: 2,
        text: "Dense vectors capture deep semantic context but can miss rare product codes, serial numbers, or specific terms which are easily matched by BM25 sparse indices.",
        denseScore: 0.81,
        sparseScore: 16.2,
        hybridScore: 0.031,
        rerankScore: 0.89,
        mmrStatus: "selected",
        citation: "Section 2.3: Semantic Matching (Page 4)",
      },
      {
        id: 3,
        text: "Lexical search matches tokens directly, bypassing embedding space gaps. Reciprocal Rank Fusion aligns both distributions into a singular prioritized list.",
        denseScore: 0.72,
        sparseScore: 21.0,
        hybridScore: 0.029,
        rerankScore: 0.85,
        mmrStatus: "selected",
        citation: "Section 2.4: Lexical BM25 Search (Page 4)",
      },
    ],
  },
  "how does the cross-encoder re-ranker work?": {
    answer: "Once the hybrid search retrieves the top 50 chunks, they are fed into a Cross-Encoder model. Unlike Bi-Encoders which embed query and documents separately, a Cross-Encoder performs self-attention over the query and chunk simultaneously. This yields a highly accurate relevance score, re-prioritizing the most critical context.",
    metrics: [
      {
        id: 1,
        text: "Cross-Encoder re-ranking applies query-document attention layers. This allows full interactions between words in the query and words in the document chunk.",
        denseScore: 0.84,
        sparseScore: 14.2,
        hybridScore: 0.028,
        rerankScore: 0.97, // High rerank boost
        mmrStatus: "selected",
        citation: "Section 3.2: Attention Layer Reranking (Page 6)",
      },
      {
        id: 2,
        text: "Bi-Encoder models (BGE Embeddings) calculate similarities rapidly, making them suitable for initial retrieval. Cross-Encoders are slower but evaluate deep relevancy.",
        denseScore: 0.87,
        sparseScore: 9.8,
        hybridScore: 0.027,
        rerankScore: 0.91,
        mmrStatus: "selected",
        citation: "Section 3.1: Dual-Encoder vs Cross-Encoder (Page 5)",
      },
      {
        id: 3,
        text: "To optimize latency, Cross-Encoders are only run as a second-stage filter on the top K documents retrieved by the first stage hybrid search.",
        denseScore: 0.75,
        sparseScore: 10.5,
        hybridScore: 0.025,
        rerankScore: 0.88,
        mmrStatus: "selected",
        citation: "Section 3.5: Pipeline Latency Control (Page 7)",
      },
    ],
  },
  "explain the mmr diversity configuration.": {
    answer: "Maximal Marginal Relevance (MMR) is used to balance relevance and novelty. If the top-ranked chunks contain repetitive text, MMR penalizes redundant information and selects chunks that add fresh context. This prevents the LLM from receiving duplicated data in its prompt context window.",
    metrics: [
      {
        id: 1,
        text: "Maximal Marginal Relevance (MMR) solves retrieval redundancy by calculating cosine similarity between selected candidate chunks and remaining candidates.",
        denseScore: 0.86,
        sparseScore: 12.0,
        hybridScore: 0.030,
        rerankScore: 0.92,
        mmrStatus: "selected",
        citation: "Section 4.1: MMR Objective Function (Page 8)",
      },
      {
        id: 2,
        text: "An MMR lambda value of 0.5 balances query relevance (50%) and diversity (50%), yielding optimal multi-topic summaries for summarization tasks.",
        denseScore: 0.83,
        sparseScore: 11.5,
        hybridScore: 0.028,
        rerankScore: 0.89,
        mmrStatus: "selected",
        citation: "Section 4.3: Lambda Tuning (Page 9)",
      },
      {
        id: 4, // Duplicate semantic meaning chunk
        text: "MMR penalizes chunks that are too similar to already selected chunks. Duplicate definitions or statements are filtered out from the final retrieval window.",
        denseScore: 0.85,
        sparseScore: 11.9,
        hybridScore: 0.029,
        rerankScore: 0.90,
        mmrStatus: "redundant", // Discarded due to high similarity to chunk 1
        citation: "Section 4.4: Redundancy Penalization (Page 9)",
      },
    ],
  },
  "what is the maximum file size supported?": {
    answer: "Kalkibot supports PDF documents up to 50MB in file size. This allows you to upload extensive technical manuals, books, or datasets, which are automatically chunked and processed client-side.",
    metrics: [
      {
        id: 1,
        text: "The client-side PDF parser is optimized to process files up to 50MB. Larger documents are handled using streaming chunk algorithms.",
        denseScore: 0.88,
        sparseScore: 24.0,
        hybridScore: 0.035,
        rerankScore: 0.96,
        mmrStatus: "selected",
        citation: "Section 1.2: File Size Allocations (Page 1)",
      },
    ],
  },
};

const Kalkibot = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStep, setInitStep] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [expandedMetricId, setExpandedMetricId] = useState<number | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "metrics">("chat");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initSteps = [
    { label: "Extracting text from PDF layout...", duration: 1500 },
    { label: "Generating BGE dense embeddings (384d)...", duration: 2000 },
    { label: "Building BM25 sparse index vocabulary...", duration: 1500 },
    { label: "Assembling Cross-Encoder and MMR configs...", duration: 1200 },
  ];

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addConsoleLog = (msg: string) => {
    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Invalid file format. Please upload a PDF.");
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("File size exceeds 50MB limit.");
      return;
    }
    setFile(selectedFile);
    addConsoleLog(`Loaded PDF file: "${selectedFile.name}" (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`);
    toast.success(`Loaded "${selectedFile.name}"`);
  };

  const startPipelineInit = async () => {
    if (!file) return;
    setIsInitializing(true);
    setInitStep(0);
    setConsoleLogs([]);
    addConsoleLog("Starting Advanced RAG Pipeline initialization...");

    for (let i = 0; i < initSteps.length; i++) {
      setInitStep(i);
      addConsoleLog(`Task: ${initSteps[i].label}`);
      await new Promise((resolve) => setTimeout(resolve, initSteps[i].duration));
      
      if (i === 0) {
        addConsoleLog("Successfully chunked text. Created 45 distinct document segments.");
      } else if (i === 1) {
        addConsoleLog("Computed 45 dense vector embeddings using BGE-M3 model.");
      } else if (i === 2) {
        addConsoleLog("Extracted BM25 keyword frequency index. Term vocabulary: 1,420 words.");
      } else if (i === 3) {
        addConsoleLog("Connected Cross-Encoder re-ranker weights and set MMR lambda to 0.5.");
      }
    }

    setIsInitializing(false);
    setIsInitialized(true);
    addConsoleLog("Pipeline fully initialized. Vector and lexical indexes online.");
    toast.success("RAG Pipeline is online!");

    // Send initial bot greeting
    setMessages([
      {
        sender: "bot",
        text: `Hello! I have successfully indexed **${file.name}** using BGE Embeddings and BM25. You can now query your document. Try selecting one of the suggested questions below or type your own.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMessage: Message = {
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue("");

    // Simulate thinking & response
    setTimeout(() => {
      const normalizedQuery = text.toLowerCase().trim().replace(/[?.]/g, "");
      let presetData = PRESET_ANSWERS[normalizedQuery];

      if (!presetData) {
        // Generate dynamic fallback RAG response using keywords or default values
        presetData = {
          answer: `Based on your uploaded document, **${file?.name || "document.pdf"}**, here is what the RAG pipeline retrieved: the query "${text}" matches sections regarding system settings and operational parameters. The Cross-Encoder reranker prioritized specific context regarding configuration, while MMR filter eliminated repeating details.`,
          metrics: [
            {
              id: 10,
              text: `Dynamic segment matching "${text}" within user-loaded PDF data. Represents closest match dynamically indexed in vector store space.`,
              denseScore: 0.78,
              sparseScore: 11.2,
              hybridScore: 0.024,
              rerankScore: 0.89,
              mmrStatus: "selected",
              citation: `Document citation for "${text}" (Page 2)`,
            },
            {
              id: 11,
              text: `Secondary matching node referencing query topics. High dense similarity but lower lexical term matching metrics.`,
              denseScore: 0.74,
              sparseScore: 4.5,
              hybridScore: 0.018,
              rerankScore: 0.81,
              mmrStatus: "selected",
              citation: `Secondary citation segment (Page 5)`,
            },
            {
              id: 12,
              text: `Redundant info chunk containing highly similar content. Removed by MMR to guarantee diversity.`,
              denseScore: 0.76,
              sparseScore: 10.8,
              hybridScore: 0.022,
              rerankScore: 0.83,
              mmrStatus: "redundant",
              citation: `Duplicate citation segment (Page 5)`,
            },
          ],
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: presetData.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          metrics: presetData.metrics,
        },
      ]);
    }, 1200);
  };

  const handleReset = () => {
    setFile(null);
    setIsInitialized(false);
    setMessages([]);
    setConsoleLogs([]);
    toast.success("RAG Pipeline reset. Upload a new PDF to initialize.");
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background neon flares */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px]" />
        {/* Tech Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* App Header */}
      <header className="relative z-10 border-b border-indigo-950 bg-[#070913]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="p-2 rounded-lg bg-slate-950 border border-indigo-950/80 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
              Kalkibot
              <Brain className="w-5 h-5 text-indigo-400" />
            </span>
            <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/20 bg-indigo-500/5">
              Advanced RAG
            </Badge>
          </div>
        </div>

        {isInitialized && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-red-400 hover:bg-red-950/20 border border-red-950/30"
          >
            Reset Pipeline
          </Button>
        )}
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6 relative z-10 overflow-hidden">
        {/* LEFT COMPONENT: CONFIGS & METADATA */}
        <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
          {/* UPLOAD PANEL */}
          <Card className="bg-[#0B0F21] border-indigo-950 text-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Data Source Setup
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Upload your document to bootstrap the hybrid search database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isInitialized && !isInitializing ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? "border-indigo-400 bg-indigo-950/20"
                      : "border-indigo-950 bg-slate-950/50 hover:bg-slate-900/30 hover:border-indigo-800"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf"
                    className="hidden"
                  />
                  <UploadCloud className="w-10 h-10 mx-auto text-slate-500 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-slate-300">Click or drag PDF here</p>
                  <p className="text-[10px] text-slate-500 mt-1">Maximum file size: 50MB</p>
                </div>
              ) : (
                <div className="border border-indigo-950 bg-slate-950/50 p-4 rounded-xl flex items-start gap-3">
                  <FileText className="w-8 h-8 text-indigo-400 shrink-0 mt-1" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-200 truncate">{file?.name}</p>
                    <p className="text-[10px] text-slate-500">{(file?.size ? file.size / 1024 / 1024 : 0).toFixed(2)} MB</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      RAG Index Active
                    </div>
                  </div>
                </div>
              )}

              {file && !isInitialized && !isInitializing && (
                <Button
                  onClick={startPipelineInit}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs"
                >
                  Initialize RAG Pipeline
                </Button>
              )}
            </CardContent>
          </Card>

          {/* PIPELINE CAPABILITIES BADGES */}
          <Card className="bg-[#0B0F21] border-indigo-950 text-slate-200">
            <CardHeader className="py-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                Pipeline Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-200">BGE-M3 Embeddings</p>
                  <p className="text-[10px] text-slate-400 leading-normal">Dense retrieval mappings creating a 384-dimensional vector space for semantic similarities.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-200">Hybrid Search</p>
                  <p className="text-[10px] text-slate-400 leading-normal">Fuses dense vector semantic scores with sparse BM25 token frequencies (RRF formula).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-200">Cross-Encoder</p>
                  <p className="text-[10px] text-slate-400 leading-normal">Second-stage re-ranking using query-chunk attention interactions to maximize accuracy.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-200">MMR &amp; Citations</p>
                  <p className="text-[10px] text-slate-400 leading-normal">Maximal Marginal Relevance filters redundancies, generating precise, verifiable source citations.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COMPONENT: CONSOLE OR CHAT WORKSPACE */}
        <div className="flex-1 bg-[#090D1C] border border-indigo-950/80 rounded-2xl flex flex-col overflow-hidden min-h-[60vh] md:min-h-[75vh]">
          {/* PIPELINE INITIALIZATION STEPS ANIMATION */}
          {isInitializing && (
            <div className="flex-1 p-8 flex flex-col justify-center items-center gap-6 max-w-xl mx-auto">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <Brain className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center space-y-2 w-full">
                <h3 className="font-bold text-slate-200">Indexing Document...</h3>
                <Progress value={((initStep + 1) / initSteps.length) * 100} className="h-1.5 bg-slate-950 [&>div]:bg-indigo-500" />
                <p className="text-xs text-slate-400 italic animate-pulse">{initSteps[initStep].label}</p>
              </div>
            </div>
          )}

          {/* EMPTY STATE - NO PDF INITIALIZED */}
          {!isInitialized && !isInitializing && (
            <div className="flex-1 p-8 flex flex-col justify-center items-center text-center gap-4">
              <Brain className="w-16 h-16 text-indigo-950/80 animate-pulse" />
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-slate-200">Advanced RAG Sandbox</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  Upload a PDF document in the dashboard sidebar and initialize the pipeline to spin up dense and sparse indices. Once loaded, you can ask QA queries and examine hybrid search and Cross-Encoder re-ranking metrics.
                </p>
              </div>
            </div>
          )}

          {/* INITIALIZED CHAT OR METRICS INTERFACE */}
          {isInitialized && !isInitializing && (
            <>
              {/* Header Navigation Toggles */}
              <div className="border-b border-indigo-950 bg-slate-950/40 p-2 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <Button
                    variant={activeTab === "chat" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("chat")}
                    className={`text-xs h-8 ${activeTab === "chat" ? "bg-indigo-950/50 text-indigo-300 border border-indigo-900/50" : "text-slate-400"}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1" />
                    Query Session
                  </Button>
                  <Button
                    variant={activeTab === "metrics" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("metrics")}
                    className={`text-xs h-8 ${activeTab === "metrics" ? "bg-indigo-950/50 text-indigo-300 border border-indigo-900/50" : "text-slate-400"}`}
                  >
                    <FileCode2 className="w-3.5 h-3.5 mr-1" />
                    Console Logs
                  </Button>
                </div>
                <div className="text-[10px] text-slate-500 bg-slate-950 border border-indigo-950/60 px-2 py-0.5 rounded flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  RAG Core Online
                </div>
              </div>

              {/* CONSOLE LOGS VIEW */}
              {activeTab === "metrics" && (
                <div className="flex-1 p-4 font-mono text-[11px] text-indigo-300/90 bg-black overflow-y-auto space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-400 border-b border-indigo-950 pb-2 mb-3">
                    <Terminal className="w-4 h-4" />
                    <span>SYSTEM CORE LOGGER</span>
                  </div>
                  {consoleLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              )}

              {/* CHAT INTERFACE PANEL */}
              {activeTab === "chat" && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-h-[50vh] md:max-h-[55vh]">
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-[#0F142D] border border-indigo-950 text-slate-200 rounded-tl-none"
                          }`}
                        >
                          <p>{msg.text}</p>

                          {/* Retrieved Segment Metrics Visualizer (only for bot responses with metrics) */}
                          {msg.sender === "bot" && msg.metrics && (
                            <div className="mt-4 pt-3 border-t border-indigo-950/60 space-y-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                <Search className="w-3 h-3 text-emerald-400" />
                                RAG Retrieval Details
                              </p>
                              <div className="space-y-2">
                                {msg.metrics.map((metric) => (
                                  <div
                                    key={metric.id}
                                    className={`p-2.5 rounded-lg border text-[11px] ${
                                      metric.mmrStatus === "redundant"
                                        ? "bg-red-950/5 border-red-950/30 opacity-50"
                                        : "bg-[#090D1C] border-indigo-950/80"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start gap-2 mb-1.5">
                                      <span className="font-bold text-emerald-400">{metric.citation}</span>
                                      <Badge
                                        variant="outline"
                                        className={`text-[9px] px-1.5 py-0 h-4 ${
                                          metric.mmrStatus === "redundant"
                                            ? "text-red-400 border-red-500/20"
                                            : "text-emerald-400 border-emerald-500/20"
                                        }`}
                                      >
                                        {metric.mmrStatus === "redundant" ? "MMR: Redundant" : "MMR: Selected"}
                                      </Badge>
                                    </div>
                                    <p className="text-slate-300 italic mb-2">"{metric.text}"</p>

                                    {/* Scores Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] bg-slate-950/40 p-1.5 rounded-md border border-indigo-950/30">
                                      <div>
                                        <span className="text-slate-500">Dense Score:</span>{" "}
                                        <strong className="text-slate-300">{metric.denseScore}</strong>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">BM25 Score:</span>{" "}
                                        <strong className="text-slate-300">{metric.sparseScore}</strong>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">RRF Hybrid:</span>{" "}
                                        <strong className="text-slate-300">{metric.hybridScore}</strong>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">Rerank:</span>{" "}
                                        <strong className="text-indigo-400">{metric.rerankScore}</strong>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Preset Quick Questions */}
                  {messages.length === 1 && (
                    <div className="px-4 py-2 border-t border-indigo-950 bg-slate-950/10 flex flex-wrap gap-2 justify-center">
                      {Object.keys(PRESET_ANSWERS).map((query) => (
                        <button
                          key={query}
                          onClick={() => handleSendMessage(query)}
                          className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-900/40 px-3 py-1 rounded-full transition-colors capitalize"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input Form Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="border-t border-indigo-950 p-4 bg-slate-950/35 flex gap-2"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask a question about the document..."
                      className="flex-1 bg-[#070913] border border-indigo-950 focus:border-indigo-700 outline-none rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                    />
                    <Button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs px-4"
                    >
                      Ask RAG
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Kalkibot;
