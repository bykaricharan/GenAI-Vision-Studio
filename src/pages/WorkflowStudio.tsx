import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  Loader2,
  X,
  FileCode,
  GitBranch,
  Copy,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  BookOpen,
  HardDrive,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import {
  runWorkflowSimulation,
  type WorkflowExecutionResponse,
} from '../services/api';
import { liveExecutionStore } from '../services/liveExecutionStore';

// ---------------------------------------------------------------------------
// Core Concept Definition Interface
// ---------------------------------------------------------------------------
interface ConceptDetail {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ReactNode;
  explanation: string;
  diagram: string;
  bestPractices: string[];
  realWorldUsage: string;
  commonMistakes: string[];
  color: string;
}

const LANGGRAPH_CONCEPTS: ConceptDetail[] = [
  {
    id: 'node',
    title: 'Node',
    shortDesc: 'Python function receiving & mutating State',
    icon: <Cpu className="h-5 w-5 text-indigo-400" />,
    explanation: 'A Node is a standard Python function or runnable that accepts the current graph State object, executes domain logic (e.g. LLM call, DB query), and returns state mutations.',
    diagram: 'State (In) ──► [ Python Node Function ] ──► State Mutation (Out)',
    bestPractices: [
      'Keep nodes focused on a single responsibility',
      'Return partial dict updates rather than mutating state directly',
      'Handle API exceptions gracefully within node boundaries',
    ],
    realWorldUsage: 'Invoking ChatOpenAI, executing ChromaDB vector retrieval, or calling third-party REST APIs.',
    commonMistakes: [
      'Mutating state out-of-band without returning dict updates',
      'Coupling multiple unrelated processing tasks into a single giant node',
    ],
    color: 'border-indigo-500/40',
  },
  {
    id: 'state',
    title: 'State',
    shortDesc: 'Shared TypedDict memory schema',
    icon: <Layers className="h-5 w-5 text-sky-400" />,
    explanation: 'State is a centralized TypedDict object shared across all nodes in the graph. Every node receives the current state and returns updates merged into state.',
    diagram: '[ State Schema: TypedDict ] ──► Shared across Node_1, Node_2, Node_3',
    bestPractices: [
      'Use TypedDict or Pydantic for strict state schema type-checking',
      'Include explicit error fields to allow graceful graph failure handling',
      'Keep state payloads concise and focused',
    ],
    realWorldUsage: 'Tracking user questions, retrieved document chunks, message histories, and LLM responses.',
    commonMistakes: [
      'Storing un-serializable objects in graph state',
      'Overwriting state keys unintentionally across parallel branches',
    ],
    color: 'border-sky-500/40',
  },
  {
    id: 'edge',
    title: 'Edge',
    shortDesc: 'Direct connection from node to node',
    icon: <ArrowRight className="h-5 w-5 text-emerald-400" />,
    explanation: 'An Edge defines the deterministic execution flow connecting one node directly to the next node in sequence.',
    diagram: 'Node_A ────────────► Node_B',
    bestPractices: [
      'Use standard edges for sequential linear pipelines',
      'Connect START to the entrypoint node and final node to END',
    ],
    realWorldUsage: 'Routing from Input Validation directly into Task Analysis.',
    commonMistakes: [
      'Creating orphaned nodes unconnected by edges',
      'Creating accidental infinite loops without termination conditions',
    ],
    color: 'border-emerald-500/40',
  },
  {
    id: 'conditional-edge',
    title: 'Conditional Edge',
    shortDesc: 'Dynamic router based on state',
    icon: <GitBranch className="h-5 w-5 text-amber-400" />,
    explanation: 'A Conditional Edge uses a router function to evaluate graph state dynamically and return the string key of the next node to execute.',
    diagram: 'Node ──► [ Router Function ] ──┬──► (score > 80) ──► Finish\n                             └──► (score < 80) ──► Retry',
    bestPractices: [
      'Ensure all conditional router paths terminate or reach END',
      'Keep router logic simple and deterministic',
    ],
    realWorldUsage: 'Deciding whether a document retrieval is required or evaluating LLM score quality for reflection loops.',
    commonMistakes: [
      'Returning unregistered node keys from router function',
      'Failing to handle default fallback routing paths',
    ],
    color: 'border-amber-500/40',
  },
  {
    id: 'parallel-branch',
    title: 'Parallel Branch',
    shortDesc: 'Simultaneous node execution',
    icon: <Zap className="h-5 w-5 text-purple-400" />,
    explanation: 'LangGraph allows multiple independent nodes to execute concurrently in parallel from a single parent node before joining at a merge node.',
    diagram: '          ┌──► Research Node ────┐\nParent ───┼──► Summary Node ─────┼──► Merge Node\n          └──► Translation Node ──┘',
    bestPractices: [
      'Use parallel branches for independent async operations',
      'Ensure parallel nodes update distinct state keys or use reducer functions',
    ],
    realWorldUsage: 'Running web search, database lookup, and document extraction simultaneously.',
    commonMistakes: [
      'Writing to the same non-reducer state key from parallel nodes concurrently',
    ],
    color: 'border-purple-500/40',
  },
  {
    id: 'checkpoint',
    title: 'Checkpoint',
    shortDesc: 'State persistence & time-travel',
    icon: <HardDrive className="h-5 w-5 text-rose-400" />,
    explanation: 'Checkpoints save state snapshots after every node execution into a persistent database (e.g. SQLite, PostgreSQL/Supabase), enabling time-travel debugging.',
    diagram: 'Node_1 ──► (Checkpoint #1) ──► Node_2 ──► (Checkpoint #2)',
    bestPractices: [
      'Enable checkpointers for multi-turn human-in-the-loop workflows',
      'Use thread IDs to partition session states cleanly',
    ],
    realWorldUsage: 'Pausing a workflow for human approval before sending an email, then resuming from checkpoint.',
    commonMistakes: [
      'Omitting thread IDs when saving checkpoints',
    ],
    color: 'border-rose-500/40',
  },
  {
    id: 'memory',
    title: 'Memory',
    shortDesc: 'Short-term & long-term persistence',
    icon: <BookOpen className="h-5 w-5 text-teal-400" />,
    explanation: 'LangGraph Memory maintains conversational thread state across user interactions and long-term user profile memories.',
    diagram: 'User Message ──► [ Memory Saver ] ──► Injected Chat History',
    bestPractices: [
      'Truncate or summarize old chat histories to fit LLM context windows',
    ],
    realWorldUsage: 'Stateful multi-turn conversational AI agents.',
    commonMistakes: [
      'Unbounded message array growth leading to context window overflow',
    ],
    color: 'border-teal-500/40',
  },
  {
    id: 'execution-graph',
    title: 'Execution Graph',
    shortDesc: 'Compiled StateGraph runner',
    icon: <Workflow className="h-5 w-5 text-sky-400" />,
    explanation: 'The compiled graph object (`builder.compile()`) that validates nodes, edges, and state schemas, producing an executable graph runner.',
    diagram: 'StateGraph Builder ──► .compile() ──► Executable Graph Runner',
    bestPractices: [
      'Compile graph once at startup and reuse instance across requests',
    ],
    realWorldUsage: 'FastAPI service endpoints running LangGraph StateGraph workloads.',
    commonMistakes: [
      'Re-compiling StateGraph on every HTTP request',
    ],
    color: 'border-sky-500/40',
  },
];

// ---------------------------------------------------------------------------
// Builder Node Types Definition
// ---------------------------------------------------------------------------
interface BuilderNode {
  id: string;
  type: string;
  label: string;
  description: string;
}

const INITIAL_BUILDER_NODES: BuilderNode[] = [
  { id: 'n-1', type: 'START', label: 'START', description: 'Workflow Entrypoint' },
  { id: 'n-2', type: 'Retriever', label: 'Retriever Node', description: 'ChromaDB Vector Retrieval' },
  { id: 'n-3', type: 'LLM Node', label: 'LLM Node (GPT-4o)', description: 'ChatOpenAI Model Inference' },
  { id: 'n-4', type: 'Evaluation', label: 'Evaluation Node', description: 'LangSmith Quality Check' },
  { id: 'n-5', type: 'END', label: 'END', description: 'Workflow Termination' },
];

export const WorkflowStudio: React.FC = () => {
  // Concept Drawer State
  const [selectedConcept, setSelectedConcept] = useState<ConceptDetail | null>(null);

  // Workflow Builder State
  const [builderNodes, setBuilderNodes] = useState<BuilderNode[]>(INITIAL_BUILDER_NODES);
  const [selectedNodeTypeToAdd, setSelectedNodeTypeToAdd] = useState<string>('Tool');

  // Conditional Routing Demonstration State
  const [needRetrievalCondition, setNeedRetrievalCondition] = useState<boolean>(true);

  // Live Execution State
  const [workflowInput, setWorkflowInput] = useState<string>('Explain LangGraph stateful graph execution and checkpointing.');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
  const [result, setResult] = useState<WorkflowExecutionResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Replay Mode Player State
  const [isReplaying, setIsReplaying] = useState<boolean>(false);

  // Python Code Copy State
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Handlers for Builder Node Operations
  const handleAddNode = () => {
    const newNode: BuilderNode = {
      id: `n-${Date.now()}`,
      type: selectedNodeTypeToAdd,
      label: `${selectedNodeTypeToAdd} Node`,
      description: `Custom ${selectedNodeTypeToAdd} Processing Step`,
    };
    // Insert before END
    const endIdx = builderNodes.findIndex((n) => n.type === 'END');
    if (endIdx !== -1) {
      const updated = [...builderNodes];
      updated.splice(endIdx, 0, newNode);
      setBuilderNodes(updated);
    } else {
      setBuilderNodes([...builderNodes, newNode]);
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    if (builderNodes.length <= 2) return;
    setBuilderNodes(builderNodes.filter((n) => n.id !== nodeId));
  };

  // Execution Handler
  const handleExecuteWorkflow = async () => {
    if (!workflowInput.trim()) return;

    setIsExecuting(true);
    setErrorMsg(null);
    setActiveNodeIndex(0);

    try {
      const timer = setInterval(() => {
        setActiveNodeIndex((prev) => (prev < 4 ? prev + 1 : prev));
      }, 500);

      const res = await runWorkflowSimulation('LangGraph Studio Workflow', workflowInput);
      clearInterval(timer);
      setActiveNodeIndex(4);

      setResult(res);

      liveExecutionStore.setLatestExecution(
        'Workflow Studio',
        workflowInput,
        res.result,
        `Nodes: ${res.node_outputs.length} | Runtime: ${res.metrics?.total_runtime_ms} ms`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Workflow execution failed.');
    } finally {
      setIsExecuting(false);
    }
  };

  // Replay Handler
  const handleStartReplay = () => {
    if (!result) return;
    setIsReplaying(true);
    setActiveNodeIndex(0);

    let current = 0;
    const replayTimer = setInterval(() => {
      current += 1;
      if (current < 5) {
        setActiveNodeIndex(current);
      } else {
        clearInterval(replayTimer);
        setIsReplaying(false);
      }
    }, 750);
  };

  // Generate Python LangGraph Code matching Builder Nodes
  const generatePythonCode = () => {
    const nonTerminalNodes = builderNodes.filter((n) => n.type !== 'START' && n.type !== 'END');
    const nodeDefs = nonTerminalNodes
      .map((n) => `builder.add_node("${n.label.toLowerCase().replace(/ /g, '_')}", ${n.type.toLowerCase()}_node)`)
      .join('\n');

    let edgeDefs = `builder.add_edge(START, "${nonTerminalNodes[0]?.label.toLowerCase().replace(/ /g, '_') || 'node_1'}")\n`;
    for (let i = 0; i < nonTerminalNodes.length - 1; i++) {
      edgeDefs += `builder.add_edge("${nonTerminalNodes[i].label.toLowerCase().replace(/ /g, '_')}", "${nonTerminalNodes[i + 1].label.toLowerCase().replace(/ /g, '_')}")\n`;
    }
    if (nonTerminalNodes.length > 0) {
      edgeDefs += `builder.add_edge("${nonTerminalNodes[nonTerminalNodes.length - 1].label.toLowerCase().replace(/ /g, '_')}", END)`;
    }

    return `from langgraph.graph import StateGraph, START, END
from typing import TypedDict, List, Dict, Any

class State(TypedDict):
    user_input: str
    chunks: List[str]
    llm_response: str
    evaluation_score: float

# Initialize StateGraph Builder
builder = StateGraph(State)

# Add Nodes
${nodeDefs}

# Add Edges
${edgeDefs}

# Compile Executable Graph
graph = builder.compile()`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatePythonCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-12 py-2">
      {/* ----------------------------------------------------------------- */}
      {/* SECTION 1: HERO & WHAT IS LANGGRAPH?                             */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <Workflow className="h-4 w-4" />
              <span>Interactive Educational Playground</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              LangGraph Studio – Workflow Builder & Visualizer
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl">
              Master stateful graph workflows, nodes, state mutations, conditional edges, parallel execution, checkpoints, and time-travel replay debugging.
            </p>
          </div>
        </div>

        {/* Hero Concept Card & Animated Loop Diagram */}
        <Card className="border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-slate-900/90 p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-12 items-center">
            <div className="md:col-span-7 space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                What is LangGraph & Why Stateful Workflows Matter?
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Traditional chains execution pipelines are linear and stateless. <strong>LangGraph</strong> models AI applications as directed graphs where execution state is explicitly passed, mutated by node functions, and persisted across checkpoints. This unlocks loops, multi-agent reflection, conditional routing, and time-travel debugging.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  ✓ Cyclic Graphs & Loops
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                  ✓ Centralized State Memory
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                  ✓ Parallel Execution Branches
                </span>
              </div>
            </div>

            {/* Animated Loop Diagram */}
            <div className="md:col-span-5 p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3 text-center font-mono">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                LangGraph Stateful Loop Architecture
              </span>
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">State</span>
                <span className="text-slate-500">➔</span>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">Node</span>
                <span className="text-slate-500">➔</span>
                <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">State</span>
                <span className="text-slate-500">➔</span>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">Node</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 2: CORE LANGGRAPH CONCEPTS (8 CARDS)                      */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sky-400" />
            Core LangGraph Primitive Concepts (Click to Learn)
          </h2>
          <span className="text-xs font-mono text-slate-400">Interactive Concept Guide</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LANGGRAPH_CONCEPTS.map((concept) => (
            <Card
              key={concept.id}
              onClick={() => setSelectedConcept(concept)}
              className={`p-5 border-slate-800 bg-[#1E293B]/80 hover:${concept.color} transition-all cursor-pointer space-y-3 group hover:scale-[1.02] shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#0F172A] border border-slate-800">
                  {concept.icon}
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {concept.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {concept.shortDesc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 3: LANGGRAPH INTERACTIVE WORKFLOW BUILDER                 */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Workflow className="h-5 w-5 text-emerald-400" />
            Interactive LangGraph Workflow Builder
          </h2>
          <span className="text-xs font-mono text-slate-400">No Code Node Designer</span>
        </div>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-5 space-y-5">
          {/* Node Controls Palette */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Add Node Type:</span>
              <select
                value={selectedNodeTypeToAdd}
                onChange={(e) => setSelectedNodeTypeToAdd(e.target.value)}
                className="rounded-xl border border-slate-700 bg-[#0F172A] py-1.5 px-3 text-xs text-white focus:outline-none"
              >
                {['LLM Node', 'Retriever', 'Tool', 'Memory', 'Condition', 'Evaluation', 'Output'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <button
                onClick={handleAddNode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Node</span>
              </button>
            </div>

            <span className="text-xs font-mono text-slate-400">Total Graph Nodes: {builderNodes.length}</span>
          </div>

          {/* Builder Canvas Node Sequence */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 scrollbar-thin">
            {builderNodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                <div className="w-52 shrink-0 p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2 relative group hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      {node.type}
                    </span>
                    {node.type !== 'START' && node.type !== 'END' && (
                      <button
                        onClick={() => handleDeleteNode(node.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Node"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white">{node.label}</div>
                  <div className="text-[10px] text-slate-400 font-sans">{node.description}</div>
                </div>

                {idx < builderNodes.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-emerald-400 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 4 & 5: LIVE EXECUTION & STATE INSPECTOR                   */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Play className="h-5 w-5 text-sky-400" />
            Live Execution & State Mutation Inspector
          </h2>
          <span className="text-xs font-mono text-slate-400 font-bold text-emerald-400">Live Telemetry</span>
        </div>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-5 space-y-5">
          <div className="flex gap-3">
            <input
              type="text"
              value={workflowInput}
              onChange={(e) => setWorkflowInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteWorkflow()}
              placeholder="Enter workflow query or directive..."
              className="w-full rounded-xl border border-slate-700 bg-[#0F172A] py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />

            <button
              onClick={handleExecuteWorkflow}
              disabled={isExecuting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-xs font-bold text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
              <span>Execute Workflow</span>
            </button>

            {result && (
              <button
                onClick={handleStartReplay}
                disabled={isReplaying || isExecuting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
              >
                <RotateCcw className={`h-4 w-4 ${isReplaying ? 'animate-spin' : ''}`} />
                <span>Replay</span>
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Stepper Display */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {['Input Validation', 'Task Analysis', 'Prompt Generation', 'OpenAI Execution', 'Response Review'].map((nodeName, idx) => {
              const isActive = (isExecuting || isReplaying) && activeNodeIndex === idx;
              const isCompleted = result ? idx < result.node_outputs.length : activeNodeIndex > idx;
              const stepData = result?.node_outputs.find((n) => n.node === nodeName);

              return (
                <div
                  key={nodeName}
                  className={`p-3.5 rounded-xl border font-mono text-xs transition-all ${
                    isActive
                      ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/10 scale-105'
                      : isCompleted
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-slate-200'
                      : 'border-slate-800 bg-[#0F172A] text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[11px] text-white truncate">{nodeName}</span>
                    {isActive ? (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-[9px]">Waiting</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {stepData ? `${stepData.duration_ms} ms` : '0 ms'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* State Mutation Inspector */}
          {result?.state_transitions && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-300 block">
                Live State Object Evolution ({result.state_transitions.length} Snapshots):
              </span>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 font-mono text-xs">
                {result.state_transitions.map((st, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                    <span className="text-[10px] text-emerald-300 font-bold block">{st.stage}</span>
                    <pre className="text-[10px] text-slate-300 max-h-28 overflow-y-auto leading-relaxed">
                      {JSON.stringify(st.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 6: CONDITIONAL ROUTING DEMONSTRATION                      */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-amber-400" />
            Conditional Routing Demonstration
          </h2>
          <span className="text-xs font-mono text-slate-400">Dynamic Edge Router</span>
        </div>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs text-slate-300 font-bold">Toggle Routing Condition:</span>
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setNeedRetrievalCondition(true)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  needRetrievalCondition
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                YES (Need Retrieval)
              </button>
              <button
                onClick={() => setNeedRetrievalCondition(false)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  !needRetrievalCondition
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                NO (Direct LLM)
              </button>
            </div>
          </div>

          {/* Router Flow Diagram */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-center gap-3 font-mono text-xs">
            <span className="px-3 py-1.5 rounded bg-slate-800 text-slate-200">Question</span>
            <ArrowRight className="h-4 w-4 text-slate-500" />
            <span className="px-3 py-1.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              Router: {needRetrievalCondition ? 'YES' : 'NO'}
            </span>
            <ArrowRight className="h-4 w-4 text-amber-400" />
            {needRetrievalCondition ? (
              <>
                <span className="px-3 py-1.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold animate-pulse">
                  ChromaDB Retriever
                </span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <span className="px-3 py-1.5 rounded bg-purple-500/20 text-purple-300">LLM Node</span>
              </>
            ) : (
              <span className="px-3 py-1.5 rounded bg-purple-500/20 text-purple-300 font-bold animate-pulse">
                Direct LLM Node
              </span>
            )}
            <ArrowRight className="h-4 w-4 text-slate-500" />
            <span className="px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">END</span>
          </div>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 7: PARALLEL EXECUTION DEMONSTRATION                       */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            Parallel Execution Multi-Branch Demonstration
          </h2>
          <span className="text-xs font-mono text-slate-400">Concurrent Nodes</span>
        </div>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-5 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            LangGraph supports simultaneous execution of independent node branches. This reduces workflow runtime latency significantly compared to serial execution.
          </p>

          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-center gap-3">
              <span className="px-3 py-1.5 rounded bg-slate-800 text-slate-200">START</span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
              <div className="grid grid-cols-3 gap-3 text-center">
                <span className="px-3 py-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold animate-pulse">
                  Research Branch
                </span>
                <span className="px-3 py-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold animate-pulse">
                  Summary Branch
                </span>
                <span className="px-3 py-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold animate-pulse">
                  Translation Branch
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
              <span className="px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Merge Node</span>
            </div>
          </div>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 10: PYTHON CODE GENERATION                                */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCode className="h-5 w-5 text-emerald-400" />
            Generated LangGraph Python Code
          </h2>
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <Card className="border-slate-800 bg-[#0F172A] p-5 font-mono text-xs text-emerald-300 space-y-2">
          <pre className="overflow-x-auto leading-relaxed max-h-72">{generatePythonCode()}</pre>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* CONCEPT LEARNING DRAWER MODAL                                     */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedConcept && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="max-w-md w-full h-full bg-[#1E293B] border-l border-slate-700 p-6 space-y-5 overflow-y-auto shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#0F172A] border border-slate-800">
                      {selectedConcept.icon}
                    </div>
                    <h3 className="text-base font-bold text-white">{selectedConcept.title} Concept</h3>
                  </div>
                  <button
                    onClick={() => setSelectedConcept(null)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-slate-400">Definition:</span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{selectedConcept.explanation}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-slate-400">Architectural Diagram:</span>
                  <pre className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 text-[11px] font-mono text-emerald-300 whitespace-pre-wrap">
                    {selectedConcept.diagram}
                  </pre>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-400">Best Practices:</span>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                    {selectedConcept.bestPractices.map((bp, i) => (
                      <li key={i}>{bp}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-slate-400">Real-World Enterprise Usage:</span>
                  <p className="text-xs text-slate-300 font-sans">{selectedConcept.realWorldUsage}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedConcept(null)}
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Close Explanation
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
