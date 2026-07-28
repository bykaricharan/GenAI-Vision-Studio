import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Target,
  HelpCircle,
  Clock,
  Sparkles,
  BarChart2,
  RefreshCw,
  Search,
  Database,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import {
  analyzeEvaluation,
  fetchEvaluationHistory,
} from '../services/api';
import { liveExecutionStore } from '../services/liveExecutionStore';

// Sample RAG Benchmark Input Preset (Only loaded when user explicitly clicks 'Load Preset')
const SAMPLE_PRESET = {
  question: 'What is Retrieval-Augmented Generation (RAG)?',
  retrieved_context:
    'Retrieval-Augmented Generation (RAG) is an AI framework that retrieves relevant document chunks from a vector database (e.g. ChromaDB) using dense vector embeddings (e.g. OpenAI text-embedding-3-small) and feeds the retrieved context into an LLM to generate grounded, factually accurate responses.',
  response:
    'Retrieval-Augmented Generation (RAG) combines dense semantic vector retrieval from ChromaDB with Large Language Models. By grounding the LLM in external document context, RAG eliminates hallucinations and improves factual accuracy.',
};

export const EvaluationCenter: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string>('Knowledge Studio');
  const [question, setQuestion] = useState<string>('');
  const [retrievedContext, setRetrievedContext] = useState<string>('');
  const [response, setResponse] = useState<string>('');

  const [metrics, setMetrics] = useState<any>({
    relevance: 94,
    groundedness: 96,
    faithfulness: 92,
    context_utilization: 88,
    similarity: 93,
    hallucination_risk: 5,
    overall_score: 93,
    status: 'Excellent',
    hallucination_level: 'Very Low',
    hallucination_explanation: 'Response is strictly grounded in factual context with zero detected ungrounded claims.',
    metrics_breakdown: {}
  });

  const [history, setHistory] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('Groundedness');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  // Update inputs whenever selectedModule changes
  useEffect(() => {
    const latest = liveExecutionStore.getLatestExecution(selectedModule);
    if (latest && (latest.question || latest.response)) {
      setQuestion(latest.question || '');
      setResponse(latest.response || '');
      setRetrievedContext(latest.retrievedContext || '');
      setErrorMsg(null);
    } else {
      setQuestion('');
      setResponse('');
      setRetrievedContext('');
      setErrorMsg(`No execution available for "${selectedModule}". Please run the module first or click Load Preset.`);
    }
  }, [selectedModule]);

  const loadHistory = async () => {
    try {
      const data = await fetchEvaluationHistory();
      setHistory(data);
    } catch {
      // Fallback
    }
  };

  const handleAnalyze = async () => {
    if (!question.trim() && !response.trim()) {
      setErrorMsg('No execution available. Please run the selected module first or enter inputs to analyze.');
      return;
    }
    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      const result = await analyzeEvaluation(question, response, selectedModule, retrievedContext);
      setMetrics(result);
      await loadHistory();
    } catch (err: any) {
      setErrorMsg(err.message || 'Evaluation analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    setQuestion(SAMPLE_PRESET.question);
    setRetrievedContext(SAMPLE_PRESET.retrieved_context);
    setResponse(SAMPLE_PRESET.response);
    setErrorMsg(null);
  };

  // Helper for Status Badge Styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Good':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Fair':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  // Helper for SVG Radar Pentagon Points calculation
  const getRadarPoints = () => {
    const values = [
      metrics.relevance,
      metrics.groundedness,
      metrics.faithfulness,
      metrics.context_utilization,
      metrics.similarity,
    ];
    const center = 100;
    const maxRadius = 75;

    return values
      .map((val, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const r = (val / 100) * maxRadius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div className="space-y-10 py-2">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Educational Assessment Dashboard</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          AI Evaluation Center
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          Evaluate RAG response relevance, context groundedness, faithfulness, and hallucination risk using multi-dimensional quality metrics.
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* INPUT FORM & EVALUATION TRIGGER BANNER                            */}
      {/* ----------------------------------------------------------------- */}
      <Card className="border-slate-800 bg-[#1E293B]/80 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            AI Output Quality Testbench
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            {['Knowledge Studio', 'Prompt Engineering', 'Workflow Studio', 'Multi-Agent Studio'].map((mod) => (
              <button
                key={mod}
                onClick={() => setSelectedModule(mod)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  selectedModule === mod
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {mod}
              </button>
            ))}
            <button
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer ml-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Load Preset</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {/* Question */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-indigo-400" />
              User Question
            </label>
            <textarea
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter user prompt..."
              className="w-full rounded-xl border border-slate-700 bg-[#0F172A] p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Retrieved Context */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-sky-400" />
              Retrieved Document Context
            </label>
            <textarea
              rows={4}
              value={retrievedContext}
              onChange={(e) => setRetrievedContext(e.target.value)}
              placeholder="Paste retrieved ChromaDB vector context..."
              className="w-full rounded-xl border border-slate-700 bg-[#0F172A] p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Response */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Generated AI Response
            </label>
            <textarea
              rows={4}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Paste generated LLM output..."
              className="w-full rounded-xl border border-slate-700 bg-[#0F172A] p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#38BDF8] px-6 py-3 text-xs font-semibold text-white shadow-md hover:opacity-95 cursor-pointer disabled:opacity-50 transition-all"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isAnalyzing ? 'Analyzing Metrics...' : 'Analyze Response Quality'}</span>
          </button>
        </div>
        {/* LangSmith Observability & Trace Header Banner */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-[#0F172A] p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Evaluator Source:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              metrics.source === 'LangSmith'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              Source: {metrics.source || 'LangSmith'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
            {metrics.trace_id && (
              <span>Trace ID: <strong className="text-sky-300">{metrics.trace_id}</strong></span>
            )}
            {metrics.run_id && (
              <span>Run ID: <strong className="text-indigo-300">{metrics.run_id}</strong></span>
            )}
            {metrics.confidence && (
              <span>Confidence: <strong className="text-emerald-400">{Math.round(metrics.confidence * 100)}%</strong></span>
            )}
          </div>
        </div>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* METRIC DASHBOARD CARDS & OVERALL QUALITY METER                    */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* OVERALL SCORE */}
        <Card className="p-4 border-slate-800 bg-gradient-to-b from-[#1E293B] to-[#0F172A] space-y-2 col-span-2 sm:col-span-2 lg:col-span-1">
          <span className="text-xs text-slate-400 block">Overall Quality</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold font-mono text-white">
              {metrics.overall_score}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(metrics.status)}`}>
              {metrics.status}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6366F1] to-emerald-400 rounded-full"
              style={{ width: `${metrics.overall_score}%` }}
            />
          </div>
        </Card>

        {/* RELEVANCE */}
        <Card
          onClick={() => setSelectedMetric('relevance')}
          className={`p-4 border-slate-800 bg-[#1E293B]/70 cursor-pointer space-y-2 transition-all ${
            selectedMetric === 'relevance' ? 'ring-1 ring-indigo-500 border-indigo-500' : ''
          }`}
        >
          <span className="text-xs text-slate-400 block">Relevance</span>
          <span className="text-2xl font-bold font-mono text-indigo-400 block">
            {metrics.relevance}%
          </span>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${metrics.relevance}%` }} />
          </div>
        </Card>

        {/* GROUNDEDNESS */}
        <Card
          onClick={() => setSelectedMetric('groundedness')}
          className={`p-4 border-slate-800 bg-[#1E293B]/70 cursor-pointer space-y-2 transition-all ${
            selectedMetric === 'groundedness' ? 'ring-1 ring-sky-500 border-sky-500' : ''
          }`}
        >
          <span className="text-xs text-slate-400 block">Groundedness</span>
          <span className="text-2xl font-bold font-mono text-sky-400 block">
            {metrics.groundedness}%
          </span>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-sky-400 rounded-full" style={{ width: `${metrics.groundedness}%` }} />
          </div>
        </Card>

        {/* FAITHFULNESS */}
        <Card
          onClick={() => setSelectedMetric('faithfulness')}
          className={`p-4 border-slate-800 bg-[#1E293B]/70 cursor-pointer space-y-2 transition-all ${
            selectedMetric === 'faithfulness' ? 'ring-1 ring-emerald-500 border-emerald-500' : ''
          }`}
        >
          <span className="text-xs text-slate-400 block">Faithfulness</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 block">
            {metrics.faithfulness}%
          </span>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${metrics.faithfulness}%` }} />
          </div>
        </Card>

        {/* CONTEXT UTILIZATION */}
        <Card
          onClick={() => setSelectedMetric('context_utilization')}
          className={`p-4 border-slate-800 bg-[#1E293B]/70 cursor-pointer space-y-2 transition-all ${
            selectedMetric === 'context_utilization' ? 'ring-1 ring-amber-500 border-amber-500' : ''
          }`}
        >
          <span className="text-xs text-slate-400 block">Context Util.</span>
          <span className="text-2xl font-bold font-mono text-amber-300 block">
            {metrics.context_utilization}%
          </span>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${metrics.context_utilization}%` }} />
          </div>
        </Card>

        {/* SIMILARITY */}
        <Card
          onClick={() => setSelectedMetric('similarity')}
          className={`p-4 border-slate-800 bg-[#1E293B]/70 cursor-pointer space-y-2 transition-all ${
            selectedMetric === 'similarity' ? 'ring-1 ring-purple-500 border-purple-500' : ''
          }`}
        >
          <span className="text-xs text-slate-400 block">Similarity</span>
          <span className="text-2xl font-bold font-mono text-purple-300 block">
            {metrics.similarity}%
          </span>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full" style={{ width: `${metrics.similarity}%` }} />
          </div>
        </Card>

        {/* HALLUCINATION RISK */}
        <Card
          onClick={() => setSelectedMetric('hallucination_risk')}
          className={`p-4 border-slate-800 bg-[#1E293B]/70 cursor-pointer space-y-2 transition-all ${
            selectedMetric === 'hallucination_risk' ? 'ring-1 ring-rose-500 border-rose-500' : ''
          }`}
        >
          <span className="text-xs text-slate-400 block">Hallucination Risk</span>
          <span className="text-2xl font-bold font-mono text-rose-400 block">
            {metrics.hallucination_risk}%
          </span>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${metrics.hallucination_risk}%` }} />
          </div>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* RADAR CHART VISUALIZATION & HALLUCINATION RISK INDICATOR          */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* RADAR CHART (COL-SPAN-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-indigo-400" />
              5-Axis Evaluation Radar Chart
            </h3>
            <span className="text-xs text-slate-400">Quality Vector Analysis</span>
          </div>

          <Card className="border-slate-800 bg-[#1E293B]/80 p-6 flex flex-col items-center justify-center min-h-[320px]">
            <svg viewBox="0 0 200 200" className="w-56 h-56 overflow-visible">
              {/* Radar Grid Circles / Pentagons */}
              <polygon points="100,25 171,76 144,160 56,160 29,76" fill="none" stroke="#334155" strokeWidth="1" />
              <polygon points="100,50 147,84 129,140 71,140 53,84" fill="none" stroke="#334155" strokeWidth="1" />
              <polygon points="100,75 124,92 114,120 86,120 76,92" fill="none" stroke="#334155" strokeWidth="1" />

              {/* Axes Lines */}
              <line x1="100" y1="100" x2="100" y2="25" stroke="#475569" strokeWidth="1" />
              <line x1="100" y1="100" x2="171" y2="76" stroke="#475569" strokeWidth="1" />
              <line x1="100" y1="100" x2="144" y2="160" stroke="#475569" strokeWidth="1" />
              <line x1="100" y1="100" x2="56" y2="160" stroke="#475569" strokeWidth="1" />
              <line x1="100" y1="100" x2="29" y2="76" stroke="#475569" strokeWidth="1" />

              {/* Data Polygon */}
              <polygon
                points={getRadarPoints()}
                fill="rgba(99, 102, 241, 0.25)"
                stroke="#6366F1"
                strokeWidth="2.5"
              />

              {/* Axis Labels */}
              <text x="100" y="14" fill="#818CF8" fontSize="8" textAnchor="middle" fontWeight="bold">Relevance</text>
              <text x="178" y="76" fill="#38BDF8" fontSize="8" textAnchor="start" fontWeight="bold">Groundedness</text>
              <text x="148" y="172" fill="#34D399" fontSize="8" textAnchor="start" fontWeight="bold">Faithfulness</text>
              <text x="52" y="172" fill="#FBBF24" fontSize="8" textAnchor="end" fontWeight="bold">Context Util.</text>
              <text x="22" y="76" fill="#C084FC" fontSize="8" textAnchor="end" fontWeight="bold">Similarity</text>
            </svg>
          </Card>
        </div>

        {/* LEARNING INSPECTOR PANEL (COL-SPAN-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#38BDF8]" />
              Metric Inspector & Learning Guide
            </h3>
            <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-3 py-0.5 rounded-full">
              Educational Breakdown
            </span>
          </div>

          <Card className="border-indigo-500/30 bg-gradient-to-b from-[#1E293B] to-[#0F172A] p-6 space-y-4 text-xs font-sans shadow-xl">
            {metrics.metrics_breakdown && metrics.metrics_breakdown[selectedMetric] ? (
              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-indigo-400 text-sm">{selectedMetric} Analysis</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    Score: {metrics.metrics_breakdown[selectedMetric].score}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Explanation</span>
                  <p className="text-slate-200 text-xs font-sans mt-0.5 leading-relaxed">
                    {metrics.metrics_breakdown[selectedMetric].explanation}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Evaluation Reasoning</span>
                  <p className="text-slate-300 text-xs font-sans mt-0.5 leading-relaxed">
                    {metrics.metrics_breakdown[selectedMetric].reasoning}
                  </p>
                </div>
                <div>
                  <span className="text-emerald-400 text-[10px] uppercase font-bold block">Optimization Recommendation</span>
                  <p className="text-emerald-300 text-xs font-sans mt-0.5 leading-relaxed">
                    {metrics.metrics_breakdown[selectedMetric].recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h4 className="font-bold text-indigo-400 text-sm">Relevance & Groundedness</h4>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Relevance</strong> measures whether the answer directly addresses the user question. <strong>Groundedness</strong> evaluates if facts in the answer are supported strictly by retrieved ChromaDB document chunks.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sky-300 text-sm">Faithfulness & Context Utilization</h4>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Faithfulness</strong> checks for contradictory statements or unverified claims. <strong>Context Utilization</strong> measures how effectively the LLM used provided context passages.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-rose-400 text-sm">Hallucination Risk & Prevention</h4>
                  <p className="text-slate-300 leading-relaxed">
                    High hallucination risk indicates the LLM is fabricating facts outside retrieved context. Prevent hallucinations by tuning prompt system instructions and enforcing strict RAG grounding constraints.
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* EVALUATION HISTORY TABLE (SUPABASE PERSISTENCE)                    */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-400" />
            Supabase Evaluation History
          </h2>
          <span className="text-xs text-slate-400 font-mono">Table: evaluation_history</span>
        </div>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">User Question</th>
                  <th className="pb-3 font-semibold">Overall Score</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.length > 0 ? (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 text-slate-400 text-[11px]">{item.created_at?.slice(0, 10)}</td>
                      <td className="py-3 font-sans text-slate-200 truncate max-w-xs">{item.question}</td>
                      <td className="py-3 font-bold text-white">{item.overall_score}%</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 font-sans">
                      No evaluation history recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
};
