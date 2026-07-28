import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Search,
  FileEdit,
  ShieldCheck,
  Play,
  CheckCircle2,
  Activity,
  MessageSquare,
  FileText,
  Cpu,
  Loader2,
  Terminal,
  Eye,
  Layers,
  Zap,
  Copy,
  Check,
  Maximize2,
  X,
  Clock,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import {
  runMultiAgentSimulation,
  type MultiAgentExecutionResponse,
  type AgentStepOutput,
} from '../services/api';
import { liveExecutionStore } from '../services/liveExecutionStore';

// ---------------------------------------------------------------------------
// 5-Agent LangGraph System Configuration
// ---------------------------------------------------------------------------
interface AgentConfig {
  id: string;
  name: string;
  role: string;
  icon: React.ReactNode;
  description: string;
  technology: string;
  color: string;
  badgeBg: string;
}

const AGENTS: AgentConfig[] = [
  {
    id: 'coordinator',
    name: 'Coordinator Agent',
    role: 'Task Decomposition & Planning',
    icon: <Bot className="h-5 w-5 text-indigo-400" />,
    description: 'Analyzes user objective, formulates a structured execution plan, and assigns tasks to sub-agents.',
    technology: 'LangGraph StateGraph + ChatOpenAI gpt-4o',
    color: 'border-indigo-500/40',
    badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'research',
    name: 'Research Agent',
    role: 'Knowledge Retrieval & Fact Extraction',
    icon: <Search className="h-5 w-5 text-sky-400" />,
    description: 'Searches vector knowledge stores (ChromaDB), retrieves evidence, and structures factual research notes.',
    technology: 'LangGraph StateGraph + ChromaDB HNSW',
    color: 'border-sky-500/40',
    badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  },
  {
    id: 'writer',
    name: 'Writer Agent',
    role: 'Content Synthesis & Technical Drafting',
    icon: <FileEdit className="h-5 w-5 text-emerald-400" />,
    description: 'Synthesizes raw research notes into a clean, structured, and comprehensive document draft.',
    technology: 'LangGraph StateGraph + ChatOpenAI gpt-4o',
    color: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'reviewer',
    name: 'Reviewer Agent',
    role: 'Quality Audit & Fact Verification',
    icon: <ShieldCheck className="h-5 w-5 text-amber-400" />,
    description: 'Audits draft report for accuracy, technical precision, safety guidelines, and completeness.',
    technology: 'LangGraph Reflection Loop + ChatOpenAI',
    color: 'border-amber-500/40',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  },
  {
    id: 'final_response',
    name: 'Final Response Agent',
    role: 'Polished Output Synthesis',
    icon: <Cpu className="h-5 w-5 text-purple-400" />,
    description: 'Merges approved draft and reviewer feedback into a single, publication-ready technical document.',
    technology: 'LangGraph Output State + ChatOpenAI',
    color: 'border-purple-500/40',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  },
];

export const MultiAgentStudio: React.FC = () => {
  const [topic, setTopic] = useState<string>('Enterprise Generative AI Agent Architecture');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(0);
  const [result, setResult] = useState<MultiAgentExecutionResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedStateTab, setSelectedStateTab] = useState<'task_plan' | 'research_notes' | 'writer_output' | 'review_feedback' | 'final_response'>('final_response');

  // Copy Feedback State per Agent Step
  const [copiedStepAgent, setCopiedStepAgent] = useState<string | null>(null);

  // Full Screen Output Modal State
  const [expandedStep, setExpandedStep] = useState<AgentStepOutput | null>(null);

  const handleStartCollaboration = async () => {
    if (!topic.trim()) return;

    setIsRunning(true);
    setErrorMsg(null);
    setActiveAgentIndex(0);

    try {
      // Simulate live agent stepper animation during execution
      const stageTimer = setInterval(() => {
        setActiveAgentIndex((prev) => (prev < 4 ? prev + 1 : prev));
      }, 700);

      const data = await runMultiAgentSimulation(topic);
      clearInterval(stageTimer);
      setActiveAgentIndex(4);

      setResult(data);

      // Record in Live Execution Store
      liveExecutionStore.setLatestExecution(
        'Multi-Agent Studio',
        data.topic,
        data.final_report,
        `Completed Agents: ${data.agent_steps.length} | Runtime: ${data.metrics?.total_runtime_ms} ms`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Multi-Agent collaboration failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyText = (text: string, agentKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStepAgent(agentKey);
    setTimeout(() => setCopiedStepAgent(null), 2000);
  };

  return (
    <div className="space-y-10 py-2">
      {/* ----------------------------------------------------------------- */}
      {/* HEADER BANNER                                                     */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
            <Bot className="h-4 w-4" />
            <span>Enterprise Multi-Agent Platform</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Multi-Agent Collaboration Studio
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Watch multiple AI agents (Coordinator, Research, Writer, Reviewer, Final Response) collaborate in real-time via LangGraph stateful graph execution and ChatOpenAI (GPT-4o).
          </p>
        </div>

        {/* Live Metrics Summary */}
        <div className="flex items-center gap-3">
          <Card className="px-4 py-2.5 border-purple-500/30 bg-purple-500/10 flex items-center gap-3">
            <Activity className="h-5 w-5 text-purple-400" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">Active Graph Nodes</div>
              <div className="text-lg font-mono font-extrabold text-white">
                {result?.metrics ? `${result.metrics.completed_agents}/5 Completed` : '5 Agents Ready'}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* INPUT CONTROLS & TRIGGER                                          */}
      {/* ----------------------------------------------------------------- */}
      <Card className="border-slate-800 bg-[#1E293B]/80 p-5 space-y-4">
        <label className="text-xs font-bold text-slate-200 block">
          Enter Multi-Agent Task Directive / Topic:
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartCollaboration()}
            placeholder="Specify a topic for the Multi-Agent System (e.g. Healthcare AI RAG Architecture)..."
            className="w-full rounded-xl border border-slate-700 bg-[#0F172A] py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />

          <button
            onClick={handleStartCollaboration}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
            <span>Start Collaboration</span>
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* LIVE LANGGRAPH EXECUTION GRAPH STEPPER                            */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" />
            LangGraph StateGraph Execution Pipeline (5 Agents)
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Active Node: #{activeAgentIndex + 1} - {AGENTS[activeAgentIndex].name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {AGENTS.map((agent, idx) => {
            const isActive = isRunning && activeAgentIndex === idx;
            const isCompleted = result ? idx < result.agent_steps.length : activeAgentIndex > idx;

            return (
              <motion.div
                key={agent.id}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/10 scale-105'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-slate-200'
                    : 'border-slate-800 bg-[#1E293B]/60 text-slate-400'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-[#0F172A] border border-slate-800">
                    {agent.icon}
                  </div>
                  {isActive ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-ping" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">Node #{idx + 1}</span>
                  )}
                </div>

                <div className="text-xs font-bold text-white truncate">{agent.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{agent.role}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* AGENT STEP EXECUTION TELEMETRY CARDS (FIXED HEIGHT 440px)        */}
      {/* ----------------------------------------------------------------- */}
      {result && result.agent_steps && result.agent_steps.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              Agent Step Execution Telemetry ({result.agent_steps.length} Steps)
            </h2>
            <span className="text-xs font-mono text-slate-400">Fixed Height Document Viewers</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.agent_steps.map((step, idx) => {
              const charCount = step.output ? step.output.length : 0;
              const isCopied = copiedStepAgent === step.agent;

              return (
                <Card
                  key={step.agent}
                  className="h-[440px] flex flex-col justify-between p-5 border-slate-800 bg-[#1E293B]/90 rounded-2xl shadow-xl hover:border-slate-700 transition-all group"
                >
                  {/* Step Header */}
                  <div className="space-y-1.5 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                        Step #{idx + 1}: {step.agent}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        Completed
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{step.role}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{step.what_it_does}</p>
                    </div>
                  </div>

                  {/* Output Summary Code/Document Viewer (Occupies most of card) */}
                  <div className="flex-1 flex flex-col min-h-0 bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden my-2.5">
                    {/* Sticky Control Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-1.5 bg-[#0B1120] border-b border-slate-800 text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-bold">Output Summary</span>
                        <span className="text-slate-500 text-[10px]">
                          ({charCount.toLocaleString()} chars | {step.tokens_used} tokens)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyText(step.output, step.agent)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title="Copy Output Text"
                        >
                          {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => setExpandedStep(step)}
                          className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center gap-1 border border-purple-500/40 transition-all cursor-pointer"
                          title="Expand Full Screen View"
                        >
                          <Maximize2 className="h-3 w-3" />
                          <span>Expand</span>
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Formatted Markdown Output Content */}
                    <div className="flex-1 overflow-y-auto p-3.5 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap scroll-smooth custom-scrollbar">
                      {step.output}
                    </div>
                  </div>

                  {/* Card Telemetry Footer */}
                  <div className="shrink-0 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1">
                      <Cpu className="h-3 w-3 text-sky-400" />
                      <span>{step.model}</span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Clock className="h-3 w-3" />
                      <span>{step.duration_ms} ms</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <span>{step.start_time}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* LANGGRAPH SHARED STATE MEMORY INSPECTION                          */}
      {/* ----------------------------------------------------------------- */}
      {result?.shared_state && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-emerald-400" />
              LangGraph Shared Memory State Inspection
            </h2>
            <span className="text-xs font-mono text-slate-400">State Memory</span>
          </div>

          <Card className="border-slate-800 bg-[#1E293B]/80 p-5 space-y-4">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
              {(['task_plan', 'research_notes', 'writer_output', 'review_feedback', 'final_response'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedStateTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedStateTab === tab
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            {/* Content Display */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400">
                Shared State Memory Variable: <strong className="text-purple-300">{selectedStateTab}</strong>
              </span>
              <pre className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed max-h-72 overflow-y-auto">
                {result.shared_state[selectedStateTab] || 'No memory state recorded for this variable.'}
              </pre>
            </div>
          </Card>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* INTER-AGENT COMMUNICATIONS CHAT BUBBLES                           */}
      {/* ----------------------------------------------------------------- */}
      {result?.communications && result.communications.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-sky-400" />
              Inter-Agent Message Exchange Audit
            </h2>
            <span className="text-xs font-mono text-slate-400">Communication Logs</span>
          </div>

          <Card className="border-slate-800 bg-[#1E293B]/80 p-5 space-y-3">
            {result.communications.map((msg, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-300">{msg.from_agent}</span>
                    <span className="text-slate-500">➔</span>
                    <span className="font-bold text-sky-300">{msg.to_agent}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">{msg.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))}
          </Card>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* LANGSMITH OBSERVABILITY & SUPABASE PERSISTENCE                    */}
      {/* ----------------------------------------------------------------- */}
      {result?.langsmith_trace && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-rose-400" />
              LangSmith & Supabase Telemetry
            </h2>
            <span className="text-xs font-mono text-slate-400">Trace Logs</span>
          </div>

          <Card className="border-rose-500/30 bg-gradient-to-b from-rose-500/10 to-slate-900/80 p-5 space-y-3 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Trace ID:</span>
                <span className="text-rose-300 font-bold">{result.langsmith_trace.trace_id}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Run ID:</span>
                <span className="text-slate-200">{result.langsmith_trace.run_id}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Telemetry Active
                </span>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* FINAL GENERATED REPORT                                            */}
      {/* ----------------------------------------------------------------- */}
      {result?.final_report && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              Final Multi-Agent Technical Report
            </h2>
            <span className="text-xs font-mono text-slate-400">Polished Output</span>
          </div>

          <Card className="border-emerald-500/30 bg-[#1E293B]/90 p-6 space-y-4">
            <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
              {result.final_report}
            </div>
          </Card>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* FULL-SCREEN EXPANDED OUTPUT MODAL                                 */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {expandedStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl w-full h-[85vh] bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#0F172A] border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                      {expandedStep.agent}
                    </span>
                    <h3 className="text-base font-bold text-white">{expandedStep.role}</h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {expandedStep.output.length.toLocaleString()} characters | {expandedStep.tokens_used} tokens | {expandedStep.duration_ms} ms
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCopyText(expandedStep.output, `modal-${expandedStep.agent}`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedStepAgent === `modal-${expandedStep.agent}` ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedStepAgent === `modal-${expandedStep.agent}` ? 'Copied' : 'Copy Output'}</span>
                  </button>

                  <button
                    onClick={() => setExpandedStep(null)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {expandedStep.output}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
