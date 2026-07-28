import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle2,
  Layers,
  Sparkles,
  Search,
  Zap,
  HardDrive,
  FileSearch,
  BookOpen,
  AlertCircle,
  Loader2,
  RefreshCw,
  Cpu,
  ChevronDown,
  ChevronUp,
  Eye,
  FileCode,
  Terminal,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import {
  fetchCollectionInfo,
  uploadPdfDocument,
  queryKnowledgeBase,
} from '../services/api';
import { liveExecutionStore } from '../services/liveExecutionStore';
import type {
  CollectionInfo,
  DocumentUploadResponse,
  QueryResponse,
  ChunkItemSchema,
} from '../services/api';

// ---------------------------------------------------------------------------
// 9-Stage RAG Execution Pipeline Definition
// ---------------------------------------------------------------------------
interface RAGStage {
  id: number;
  name: string;
  shortDesc: string;
  explanation: string;
  icon: React.ReactNode;
}

const RAG_PIPELINE_STAGES: RAGStage[] = [
  {
    id: 1,
    name: 'PDF Upload',
    shortDesc: 'Ingest raw PDF document',
    explanation: 'User uploads a PDF file to the backend server via FastAPI multi-part endpoint.',
    icon: <Upload className="h-4 w-4" />,
  },
  {
    id: 2,
    name: 'Text Extraction',
    shortDesc: 'Extract raw text & pages',
    explanation: 'PyPDF extracts raw plain text and page metadata from all pages in the PDF document.',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 3,
    name: 'Chunk Creation',
    shortDesc: 'Recursive character chunking',
    explanation: 'Splits large documents into smaller overlapping text segments for optimal retrieval accuracy.',
    icon: <Layers className="h-4 w-4" />,
  },
  {
    id: 4,
    name: 'Embedding Generation',
    shortDesc: 'text-embedding-3-small',
    explanation: 'Converts text chunks into 1536-dimensional numerical vector representations using OpenAI.',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: 5,
    name: 'ChromaDB Storage',
    shortDesc: 'HNSW vector persistence',
    explanation: 'Persists vector embeddings into ChromaDB collection with HNSW spatial indexing graphs.',
    icon: <HardDrive className="h-4 w-4" />,
  },
  {
    id: 6,
    name: 'Similarity Search',
    shortDesc: 'Vector cosine distance search',
    explanation: 'Generates query embedding and searches ChromaDB for nearest neighbor document chunks.',
    icon: <Search className="h-4 w-4" />,
  },
  {
    id: 7,
    name: 'Retrieved Context',
    shortDesc: 'Filter top-k score chunks',
    explanation: 'Filters out low-similarity chunks and ranks top matches for prompt injection.',
    icon: <FileSearch className="h-4 w-4" />,
  },
  {
    id: 8,
    name: 'Prompt Construction',
    shortDesc: 'Assemble LangChain prompt',
    explanation: 'Injects top retrieved context passages into ChatOpenAI system prompt as ground truth.',
    icon: <Terminal className="h-4 w-4" />,
  },
  {
    id: 9,
    name: 'OpenAI Response',
    shortDesc: 'Grounded GPT-4o answer',
    explanation: 'ChatOpenAI generates factually grounded response strictly constrained by retrieved context.',
    icon: <Cpu className="h-4 w-4" />,
  },
];

export const KnowledgeStudio: React.FC = () => {
  // Collection Info State (Live Backend Data)
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo>({
    collection_name: 'knowledge_studio',
    total_vectors: 0,
    embedding_model: 'text-embedding-3-small',
    embedding_dimension: 1536,
  });
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [collectionLoading, setCollectionLoading] = useState<boolean>(true);

  // Upload State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedDoc, setUploadedDoc] = useState<DocumentUploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [chunkSize, setChunkSize] = useState<number>(500);
  const [chunkOverlap, setChunkOverlap] = useState<number>(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Pipeline Stage (1 to 9)
  const [activeStage, setActiveStage] = useState<number>(1);

  // Query & Vector Search State
  const [searchQuery, setSearchQuery] = useState<string>('What is Retrieval Augmented Generation?');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [queryResponse, setQueryResponse] = useState<QueryResponse | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Expandable Prompt Inspector & Chunk Inspection State
  const [showPromptInspector, setShowPromptInspector] = useState<boolean>(false);
  const [selectedChunk, setSelectedChunk] = useState<ChunkItemSchema | null>(null);

  // Load Collection Metadata on Mount
  useEffect(() => {
    loadCollectionInfo();
  }, []);

  const loadCollectionInfo = async () => {
    setCollectionLoading(true);
    try {
      const data = await fetchCollectionInfo();
      setCollectionInfo(data);
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
    } finally {
      setCollectionLoading(false);
    }
  };

  // Upload Handler
  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().includes('.pdf')) {
      setUploadError('Invalid file format. Please upload a PDF (.pdf) document.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setActiveStage(1);

    try {
      // Simulate stepper sequence
      const stageTimer = setInterval(() => {
        setActiveStage((prev) => (prev < 5 ? prev + 1 : prev));
      }, 400);

      const res = await uploadPdfDocument(file, chunkSize, chunkOverlap);
      clearInterval(stageTimer);
      setActiveStage(5);

      setUploadedDoc(res);
      await loadCollectionInfo();
    } catch (err: any) {
      setUploadError(err.message || 'PDF processing failed.');
    } finally {
      setIsUploading(false);
    }
  };

  // Query Search Handler
  const handleSearch = async (queryText?: string) => {
    const queryToUse = queryText || searchQuery;
    if (!queryToUse.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setActiveStage(6);

    try {
      const stageTimer = setInterval(() => {
        setActiveStage((prev) => (prev < 9 ? prev + 1 : prev));
      }, 350);

      const res = await queryKnowledgeBase(queryToUse, 5);
      clearInterval(stageTimer);
      setActiveStage(9);

      setQueryResponse(res);
      setHasSearched(true);

      // Record in Live Execution Store
      const contextStr = res.results.map((r) => r.text).join('\n\n');
      liveExecutionStore.setLatestExecution(
        'Knowledge Studio',
        res.query,
        res.generated_answer || '',
        contextStr
      );
    } catch (err: any) {
      setSearchError(err.message || 'Vector search execution failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-10 py-2">
      {/* ----------------------------------------------------------------- */}
      {/* HEADER BANNER                                                     */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <BookOpen className="h-4 w-4" />
            <span>Interactive RAG Visualization Studio</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Knowledge Studio & RAG Visualizer
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Visualize the full Retrieval-Augmented Generation pipeline step-by-step: document extraction, chunking, 1536-dim vector embeddings, ChromaDB search, and ChatOpenAI prompt injection.
          </p>
        </div>

        {/* Live Vector Collection Status Badge */}
        <div className="flex items-center gap-3">
          <Card className="px-4 py-2.5 border-sky-500/30 bg-sky-500/10 flex items-center gap-3">
            <HardDrive className="h-5 w-5 text-sky-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300 font-bold">ChromaDB Vectors</span>
                {backendConnected && (
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Backend Connected" />
                )}
              </div>
              <div className="text-lg font-mono font-extrabold text-white">
                {collectionLoading ? '...' : collectionInfo.total_vectors}
              </div>
            </div>
          </Card>

          <button
            onClick={loadCollectionInfo}
            disabled={collectionLoading}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            title="Refresh Vector Store Metadata"
          >
            <RefreshCw className={`h-4 w-4 ${collectionLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 9-STAGE RAG EXECUTION PIPELINE STEPPER                            */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap className="h-4 w-4 text-sky-400" />
            9-Stage RAG Execution Pipeline
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Active Stage: #{activeStage} - {RAG_PIPELINE_STAGES[activeStage - 1].name}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {RAG_PIPELINE_STAGES.map((stage) => {
            const isActive = activeStage === stage.id;
            const isCompleted = activeStage > stage.id;

            return (
              <motion.div
                key={stage.id}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'border-sky-400 bg-sky-500/20 shadow-lg shadow-sky-500/10 scale-105'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-slate-200'
                    : 'border-slate-800 bg-[#1E293B]/60 text-slate-400'
                }`}
                whileHover={{ scale: 1.03 }}
                onClick={() => setActiveStage(stage.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold font-mono ${isActive ? 'text-sky-300' : isCompleted ? 'text-emerald-300' : 'text-slate-500'}`}>
                    0{stage.id}
                  </span>
                  {isActive ? (
                    <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    stage.icon
                  )}
                </div>
                <div className="text-[11px] font-bold truncate text-white">{stage.name}</div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">{stage.shortDesc}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Stage Active Explanation Banner */}
        <Card className="p-3.5 border-slate-800 bg-[#0F172A]/90 text-xs font-mono text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
              Stage #{activeStage} Explanation
            </span>
            <span>{RAG_PIPELINE_STAGES[activeStage - 1].explanation}</span>
          </div>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* PDF UPLOAD & DOCUMENT INSIGHTS                                     */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Upload Dropzone & Controls (Col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-sky-400" />
              1. Document Ingestion & Chunking
            </h2>
            <span className="text-xs font-mono text-slate-400">PDF Ingestion</span>
          </div>

          <Card className="border-slate-800 bg-[#1E293B]/80 p-5 space-y-4">
            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragActive ? 'border-sky-400 bg-sky-500/10' : 'border-slate-700 bg-[#0F172A]/60 hover:border-slate-600'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />

              {isUploading ? (
                <div className="space-y-2 py-4">
                  <Loader2 className="h-8 w-8 text-sky-400 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-sky-300 font-mono">
                    Processing RAG Stage #{activeStage}: Extracting & Generating Vectors...
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-sky-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-200">
                    Click to browse or drop your PDF document here
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Supports PyPDF text extraction & sliding-window character chunking
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Chunk Size & Overlap Parameters */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Chunk Size:</span>
                  <span className="text-sky-300 font-bold">{chunkSize} chars</span>
                </label>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="50"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Chunk Overlap:</span>
                  <span className="text-sky-300 font-bold">{chunkOverlap} chars</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="25"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Real Document Insights Card (Col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCode className="h-5 w-5 text-emerald-400" />
              Document Telemetry Insights
            </h2>
            <span className="text-xs font-mono text-slate-400">Live Statistics</span>
          </div>

          <Card className="border-slate-800 bg-[#1E293B]/80 p-5 space-y-3">
            {uploadedDoc ? (
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Filename</span>
                  <span className="text-slate-200 font-bold truncate block">{uploadedDoc.filename}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">File Size</span>
                  <span className="text-emerald-300 font-bold block">{formatFileSize(uploadedDoc.file_size)}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Total Pages</span>
                  <span className="text-white font-bold block">{uploadedDoc.pages} Pages</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Extracted Characters</span>
                  <span className="text-sky-300 font-bold block">
                    {uploadedDoc.total_characters ? uploadedDoc.total_characters.toLocaleString() : 'N/A'} chars
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Chunks Created</span>
                  <span className="text-purple-300 font-bold block">{uploadedDoc.chunks_created} Chunks</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Avg Chunk Size</span>
                  <span className="text-amber-300 font-bold block">
                    {uploadedDoc.average_chunk_size ? `${uploadedDoc.average_chunk_size} chars` : '~500 chars'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1 col-span-2">
                  <span className="text-slate-400 text-[10px] block">Vector Store & Model</span>
                  <span className="text-slate-300 font-bold block truncate">
                    ChromaDB ({uploadedDoc.embedding_model}, {uploadedDoc.embedding_dimension}-dim)
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                <FileText className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-mono">
                  No document uploaded yet. Upload a PDF above to extract real telemetry insights.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* CHUNK VISUALIZATION GALLERY                                      */}
      {/* ----------------------------------------------------------------- */}
      {uploadedDoc?.chunks && uploadedDoc.chunks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-400" />
              Generated Document Text Chunks Gallery ({uploadedDoc.chunks.length})
            </h2>
            <span className="text-xs font-mono text-slate-400">Scrollable Visualizer</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin">
            {uploadedDoc.chunks.map((chunk) => (
              <Card
                key={chunk.chunk_id}
                onClick={() => setSelectedChunk(chunk)}
                className="w-72 shrink-0 p-4 border-slate-800 bg-[#1E293B]/90 hover:border-purple-500/50 transition-all cursor-pointer space-y-2.5 shadow-lg group"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                    Chunk #{chunk.chunk_id}
                  </span>
                  <span className="text-slate-400 text-[10px]">Page {chunk.page_number}</span>
                </div>

                <div className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                  {chunk.preview}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                  <span>{chunk.length} chars</span>
                  <span>{chunk.word_count} words</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* RAG VECTOR QUERY SEARCH & SIMILARITY INSPECTOR                   */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-sky-400" />
            2. Vector Similarity Search & Grounded Answer Generation
          </h2>
          <span className="text-xs font-mono text-slate-400">Stages 6-9</span>
        </div>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-5 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ask a question about the uploaded document..."
                className="w-full rounded-xl border border-slate-700 bg-[#0F172A] py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              <span>Execute RAG Query</span>
            </button>
          </div>

          {searchError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </Card>

        {/* --------------------------------------------------------------- */}
        {/* SIMILARITY SEARCH RESULTS & PROMPT INSPECTION                   */}
        {/* --------------------------------------------------------------- */}
        {hasSearched && queryResponse && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Top Retrieved Chunks Ranking (Col-span-6) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-amber-400" />
                  Top Retrieved Vector Chunks ({queryResponse.results.length})
                </h3>
                <span className="text-xs font-mono text-slate-400">Cosine Distance</span>
              </div>

              <div className="space-y-3">
                {queryResponse.results.map((item, idx) => {
                  const isTopMatch = idx === 0;
                  const scorePct = Math.round(item.score * 100);

                  return (
                    <Card
                      key={item.chunk_id}
                      className={`p-4 border transition-all space-y-2 ${
                        isTopMatch
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-slate-800 bg-[#1E293B]/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-bold">
                            Rank #{item.rank || idx + 1}
                          </span>
                          <span className="text-slate-400">Chunk #{item.chunk_id}</span>
                        </div>

                        {isTopMatch && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            ★ Highest Match
                          </span>
                        )}
                      </div>

                      {/* Score Progress Bar */}
                      <div className="space-y-1 font-mono">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Similarity Score</span>
                          <span className="text-emerald-300 font-bold">{scorePct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full"
                            style={{ width: `${scorePct}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed font-sans bg-[#0F172A]/70 p-3 rounded-xl border border-slate-800/80">
                        {item.text}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Generated Answer & Telemetry (Col-span-6) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-sky-400" />
                  ChatOpenAI Grounded Answer
                </h3>
                <span className="text-xs font-mono text-slate-400">GPT-4o Execution</span>
              </div>

              <Card className="border-sky-500/30 bg-gradient-to-b from-sky-500/10 to-slate-900/80 p-5 space-y-4">
                <div className="text-sm text-slate-100 leading-relaxed font-sans">
                  {queryResponse.generated_answer}
                </div>

                {/* Telemetry Metrics */}
                {queryResponse.llm_telemetry && (
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-3 border-t border-slate-800">
                    <div className="p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                      <span className="text-slate-400 text-[10px] block">Model</span>
                      <span className="text-sky-300 font-bold">{queryResponse.llm_telemetry.model}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                      <span className="text-slate-400 text-[10px] block">Latency</span>
                      <span className="text-emerald-300 font-bold">{queryResponse.llm_telemetry.latency_ms} ms</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                      <span className="text-slate-400 text-[10px] block">Tokens Used</span>
                      <span className="text-purple-300 font-bold">{queryResponse.llm_telemetry.tokens_used}</span>
                    </div>
                  </div>
                )}

                {/* LangSmith Observability Trace Info */}
                {queryResponse.langsmith_trace && (
                  <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-rose-400" />
                      <span className="text-slate-300 font-bold">LangSmith Trace ID:</span>
                      <span className="text-rose-300">{queryResponse.langsmith_trace.trace_id.slice(0, 18)}...</span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Telemetry Active
                    </span>
                  </div>
                )}
              </Card>

              {/* Expandable Prompt Builder Inspector */}
              <Card className="border-slate-800 bg-[#1E293B]/80 p-4 space-y-3">
                <button
                  onClick={() => setShowPromptInspector(!showPromptInspector)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-indigo-400" />
                    Prompt Builder Inspection (Assembled LLM Prompt)
                  </span>
                  {showPromptInspector ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showPromptInspector && queryResponse.prompt_builder && (
                  <div className="space-y-3 pt-2 font-mono text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px]">1. System Prompt Template:</span>
                      <pre className="p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-indigo-300 overflow-x-auto">
                        {queryResponse.prompt_builder.system_prompt}
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px]">2. Injected Context Passages:</span>
                      <pre className="p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-emerald-300 max-h-40 overflow-y-auto">
                        {queryResponse.prompt_builder.retrieved_context}
                      </pre>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* CHUNK DETAIL MODAL                                                */}
      {/* ----------------------------------------------------------------- */}
      {selectedChunk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="max-w-xl w-full border-slate-700 bg-[#1E293B] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono">
                Chunk #{selectedChunk.chunk_id} Metadata & Content
              </h3>
              <button
                onClick={() => setSelectedChunk(null)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                <span className="text-slate-400 text-[10px] block">Character Count</span>
                <span className="text-sky-300 font-bold">{selectedChunk.length}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                <span className="text-slate-400 text-[10px] block">Word Count</span>
                <span className="text-purple-300 font-bold">{selectedChunk.word_count}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                <span className="text-slate-400 text-[10px] block">Page Number</span>
                <span className="text-emerald-300 font-bold">Page {selectedChunk.page_number}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-slate-400">Full Text Chunk Content:</span>
              <pre className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed max-h-60 overflow-y-auto">
                {selectedChunk.full_text || selectedChunk.preview}
              </pre>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
