import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Terminal,
  Database,
  Workflow,
  Bot,
  ShieldCheck,
  Eye,
  ArrowRight,
  Cpu,
  Layers,
  CheckCircle2,
  BookOpen,
  Play,
  Activity,
  HardDrive,
  Server,
  Globe,
  X,
} from 'lucide-react';
import { Card } from '../components/ui/Card';

// ---------------------------------------------------------------------------
// Roadmap Module Definition Interface
// ---------------------------------------------------------------------------
interface LearningModule {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  estimatedTime: string;
  route: string;
  icon: React.ReactNode;
  learningOutcomes: string[];
  color: string;
  badgeBg: string;
}

const LEARNING_ROADMAP: LearningModule[] = [
  {
    id: 'prompt-engineering',
    stepNumber: 1,
    title: 'Prompt Engineering Studio',
    subtitle: 'System Prompting & Technique Optimization',
    description: 'Learn zero-shot, few-shot, and chain-of-thought prompt techniques with side-by-side model comparison.',
    level: 'Foundational',
    estimatedTime: '15 mins',
    route: '/prompt-engineering',
    icon: <Terminal className="h-5 w-5 text-indigo-400" />,
    learningOutcomes: [
      'Master role assignment & formatting constraints',
      'Compare Zero-shot vs CoT execution outputs',
      'Optimize temperature & top_p hyperparameters',
    ],
    color: 'border-indigo-500/40',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  },
  {
    id: 'knowledge-studio',
    stepNumber: 2,
    title: 'Knowledge Studio (RAG)',
    subtitle: 'Vector Embeddings & PDF Retrieval Pipeline',
    description: 'Ingest PDFs, extract sliding-window text chunks, generate OpenAI embeddings, and query ChromaDB HNSW vector index.',
    level: 'Intermediate',
    estimatedTime: '25 mins',
    route: '/knowledge-studio',
    icon: <Database className="h-5 w-5 text-sky-400" />,
    learningOutcomes: [
      'Understand document chunking & overlap math',
      'Query ChromaDB vector database with similarity scoring',
      'Inspect ground-truth context injection into LLM prompts',
    ],
    color: 'border-sky-500/40',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
  {
    id: 'langgraph-studio',
    stepNumber: 3,
    title: 'LangGraph Studio',
    subtitle: 'Stateful Graph Workflows & Replay Debugger',
    description: 'Build no-code state graphs, inspect state object mutations, test conditional edge routers, and replay node execution.',
    level: 'Advanced',
    estimatedTime: '35 mins',
    route: '/langgraph-studio',
    icon: <Workflow className="h-5 w-5 text-emerald-400" />,
    learningOutcomes: [
      'Define TypedDict State memory schemas',
      'Design dynamic conditional routing edges',
      'Replay execution steps & export compiled Python code',
    ],
    color: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'multi-agent-studio',
    stepNumber: 4,
    title: 'Multi-Agent Studio',
    subtitle: 'Autonomous Multi-Agent Collaboration',
    description: 'Watch Coordinator, Research, Writer, Reviewer, and Final Response agents collaborate in an automated LangGraph graph.',
    level: 'Expert',
    estimatedTime: '45 mins',
    route: '/multi-agent',
    icon: <Bot className="h-5 w-5 text-purple-400" />,
    learningOutcomes: [
      'Observe inter-agent communication & message queues',
      'Inspect reflection review loops auditing AI accuracy',
      'Track agent token usage & execution duration',
    ],
    color: 'border-purple-500/40',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  {
    id: 'evaluation-center',
    stepNumber: 5,
    title: 'Evaluation & Observability Center',
    subtitle: 'LangSmith LLM-as-a-Judge Evaluation',
    description: 'Evaluate live AI outputs using LangSmith LLM-as-a-Judge across Groundedness, Faithfulness, Relevance, and Hallucination Risk.',
    level: 'Production',
    estimatedTime: '20 mins',
    route: '/evaluation',
    icon: <ShieldCheck className="h-5 w-5 text-amber-400" />,
    learningOutcomes: [
      'Score live AI outputs on 0-100 quality scales',
      'Inspect LangSmith Trace IDs & Run IDs',
      'Store execution analytics in Supabase database',
    ],
    color: 'border-amber-500/40',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
];

// ---------------------------------------------------------------------------
// Architecture Component Interface
// ---------------------------------------------------------------------------
interface TechNode {
  name: string;
  role: string;
  version: string;
  detail: string;
  icon: React.ReactNode;
}

const ARCHITECTURE_NODES: TechNode[] = [
  { name: 'React 18', role: 'Frontend UI Framework', version: '18.3', detail: 'Vite 8 SPA client with Tailwind CSS & Framer Motion animations.', icon: <Globe className="h-4 w-4 text-sky-400" /> },
  { name: 'FastAPI Server', role: 'Async REST API Backend', version: '0.110', detail: 'High-throughput async Python backend serving API v1 endpoints.', icon: <Server className="h-4 w-4 text-teal-400" /> },
  { name: 'LangGraph', role: 'Stateful Graph Orchestration', version: '0.2', detail: 'StateGraph runner controlling cyclic agent loops & node state evolution.', icon: <Workflow className="h-4 w-4 text-emerald-400" /> },
  { name: 'LangChain', role: 'LLM Abstraction Layer', version: '1.3', detail: 'PromptTemplates, ChatOpenAI model wrappers, and OutputParsers.', icon: <Layers className="h-4 w-4 text-indigo-400" /> },
  { name: 'OpenAI GPT-4o', role: 'Generative Intelligence Engine', version: 'GPT-4o', detail: 'Multimodal generative foundation model for high-precision inference.', icon: <Cpu className="h-4 w-4 text-purple-400" /> },
  { name: 'ChromaDB', role: 'Vector Database', version: '0.4.x', detail: 'Persistent HNSW vector index storing 1536-dimensional embeddings.', icon: <HardDrive className="h-4 w-4 text-sky-400" /> },
  { name: 'Supabase', role: 'PostgreSQL Database', version: 'v2 Secret', detail: 'Persistent cloud database storing document metadata & workflow runs.', icon: <Database className="h-4 w-4 text-amber-400" /> },
  { name: 'LangSmith', role: 'LLM-as-a-Judge Observability', version: 'V2 Telemetry', detail: 'Trace ID logging & automated Groundedness/Faithfulness scoring.', icon: <Eye className="h-4 w-4 text-rose-400" /> },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTechNode, setSelectedTechNode] = useState<TechNode | null>(null);

  // One-Click Animated Pipeline Demo State
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  const DEMO_STEPS = [
    { title: '1. User Prompt Ingestion', desc: 'Query received: "Explain agentic workflow orchestration with LangGraph."' },
    { title: '2. ChromaDB Vector Retrieval', desc: 'Retrieved 3 document chunks (Cosine Similarity > 0.82).' },
    { title: '3. LangGraph StateGraph Execution', desc: 'State updated: Input Validation ➔ Task Analysis ➔ OpenAI Execution.' },
    { title: '4. Multi-Agent Review Loop', desc: 'Reviewer Agent audited draft for factual accuracy & completeness.' },
    { title: '5. LangSmith Telemetry Logged', desc: 'Trace ID generated. Groundedness Score: 96/100 | Latency: 1,420 ms.' },
  ];

  const handleStartDemo = () => {
    setIsDemoRunning(true);
    setDemoStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < DEMO_STEPS.length) {
        setDemoStep(step);
      } else {
        clearInterval(interval);
        setIsDemoRunning(false);
      }
    }, 1200);
  };

  return (
    <div className="space-y-16 py-4">
      {/* ----------------------------------------------------------------- */}
      {/* SECTION 1: HERO & ANIMATED WORKFLOW BACKGROUND                     */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 via-[#0F172A] to-[#1E293B]/80 p-8 sm:p-12 overflow-hidden shadow-2xl space-y-6">
        {/* Ambient Glow & Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-semibold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Interactive AI Architecture & Learning Portal</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
            Master Production <br />
            <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Generative AI Engineering
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-2xl">
            GenAI Vision Studio is an enterprise educational playground. Explore interactive visual pipelines for RAG retrieval, LangGraph state graphs, multi-agent reflection loops, and LangSmith LLM-as-a-Judge observability.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                const element = document.getElementById('learning-roadmap');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-xs font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore Learning Roadmap</span>
            </button>

            <button
              onClick={handleStartDemo}
              disabled={isDemoRunning}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-6 py-3 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isDemoRunning ? <Activity className="h-4 w-4 animate-spin text-sky-400" /> : <Play className="h-4 w-4 fill-sky-300" />}
              <span>{isDemoRunning ? 'Simulating Pipeline...' : 'One-Click Pipeline Demo'}</span>
            </button>
          </div>
        </div>

        {/* Live Demo Simulation Container */}
        {isDemoRunning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 p-4 rounded-2xl bg-[#0F172A] border border-sky-500/40 font-mono text-xs text-sky-300 space-y-2"
          >
            <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-800 pb-1.5">
              <span>LIVE AI PIPELINE DEMONSTRATION</span>
              <span>Step {demoStep + 1} of {DEMO_STEPS.length}</span>
            </div>
            <div className="text-xs text-white font-bold">{DEMO_STEPS[demoStep].title}</div>
            <div className="text-[11px] text-slate-300">{DEMO_STEPS[demoStep].desc}</div>
          </motion.div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 8: PLATFORM STATISTICS SUMMARY                             */}
      {/* ----------------------------------------------------------------- */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Studio Modules', val: '5 Integrated', icon: <Layers className="h-4 w-4 text-emerald-400" /> },
          { label: 'AI Inference Data', val: '100% Live GPT-4o', icon: <Cpu className="h-4 w-4 text-sky-400" /> },
          { label: 'Evaluation Metrics', val: '0-100 Score', icon: <ShieldCheck className="h-4 w-4 text-amber-400" /> },
          { label: 'LangSmith Observability', val: 'V2 Tracing Active', icon: <Eye className="h-4 w-4 text-rose-400" /> },
        ].map((stat, idx) => (
          <Card key={idx} className="p-4 border-slate-800 bg-[#1E293B]/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0F172A] border border-slate-800">{stat.icon}</div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{stat.label}</div>
              <div className="text-sm font-bold text-white font-mono">{stat.val}</div>
            </div>
          </Card>
        ))}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 2: VISUAL LEARNING ROADMAP (STUDIO SEQUENCE)              */}
      {/* ----------------------------------------------------------------- */}
      <section id="learning-roadmap" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              <span>Step-by-Step Curriculum</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Visual AI Engineering Learning Roadmap
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Sequential Learning Order (Level 1 ➔ 5)</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_ROADMAP.map((mod) => (
            <Card
              key={mod.id}
              className={`p-6 border-slate-800 bg-[#1E293B]/80 space-y-4 hover:${mod.color} transition-all shadow-xl group flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#0F172A] text-slate-300 border border-slate-800">
                    Step #{mod.stepNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${mod.badgeBg}`}>
                    {mod.level} • {mod.estimatedTime}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#0F172A] border border-slate-800">
                    {mod.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">{mod.subtitle}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {mod.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Key Learning Outcomes:</span>
                  {mod.learningOutcomes.map((out, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{out}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate(mod.route)}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 py-2.5 text-xs font-bold text-slate-200 border border-slate-700 transition-all cursor-pointer group-hover:border-emerald-500/40"
              >
                <span>Launch {mod.title}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Card>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 3: INTERACTIVE ARCHITECTURE DIAGRAM                       */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-sky-400" />
            Interactive End-to-End System Architecture (Click Node to Inspect)
          </h2>
          <span className="text-xs font-mono text-slate-400">Component Inspector</span>
        </div>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {ARCHITECTURE_NODES.map((node) => (
              <button
                key={node.name}
                onClick={() => setSelectedTechNode(node)}
                className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-sky-400/50 hover:bg-sky-500/10 transition-all cursor-pointer text-left space-y-2 group"
              >
                <div className="p-1.5 rounded-lg bg-slate-800 w-fit">{node.icon}</div>
                <div className="text-xs font-bold text-white group-hover:text-sky-300 truncate">{node.name}</div>
                <div className="text-[9px] font-mono text-slate-400 truncate">{node.role}</div>
              </button>
            ))}
          </div>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 6: INTERACTIVE LEARNING VS STATIC TUTORIALS COMPARISON    */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          Why Interactive Architecture Learning Outperforms Static Tutorials
        </h2>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-800 font-mono text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Feature Dimension</th>
                  <th className="pb-3 text-rose-400">Static Code Tutorials</th>
                  <th className="pb-3 text-emerald-400">GenAI Vision Studio Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-3 font-bold text-white">Execution Grounding</td>
                  <td className="py-3 text-slate-400">Static code snippets without runtime context</td>
                  <td className="py-3 text-emerald-300 font-bold">100% Live OpenAI GPT-4o & LangGraph execution</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-white">State Visibility</td>
                  <td className="py-3 text-slate-400">Hidden internal variables and state mutations</td>
                  <td className="py-3 text-emerald-300 font-bold">Live State Inspector with snapshot evolution</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-white">Quality Evaluation</td>
                  <td className="py-3 text-slate-400">Manual inspection without empirical metrics</td>
                  <td className="py-3 text-emerald-300 font-bold">LangSmith LLM-as-a-Judge Groundedness scoring</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-white">Debugging & Replay</td>
                  <td className="py-3 text-slate-400">Non-interactive reading</td>
                  <td className="py-3 text-emerald-300 font-bold">Interactive step-by-step Replay Player</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 9: CLEAN ENTERPRISE FOOTER                                */}
      {/* ----------------------------------------------------------------- */}
      <footer className="border-t border-slate-800 pt-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>GenAI Vision Studio v0.1.0 • Google DeepMind Pair-Programming AI</span>
        </div>

        <div className="flex items-center gap-4">
          <span>React 18</span>
          <span>FastAPI</span>
          <span>LangChain 1.3</span>
          <span>LangGraph 0.2</span>
          <span>ChromaDB</span>
          <span>Supabase</span>
          <span>LangSmith</span>
        </div>
      </footer>

      {/* ----------------------------------------------------------------- */}
      {/* TECH NODE INSPECTOR DRAWER MODAL                                 */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedTechNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full bg-[#1E293B] border border-slate-700 p-6 rounded-2xl space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#0F172A] border border-slate-800">
                    {selectedTechNode.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedTechNode.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{selectedTechNode.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTechNode(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1 font-mono text-xs">
                <span className="text-slate-400">Framework Version / Variant:</span>
                <div className="text-sky-300 font-bold">{selectedTechNode.version}</div>
              </div>

              <div className="space-y-1 text-xs text-slate-300 font-sans leading-relaxed">
                <span className="font-mono text-slate-400 text-[11px] block">Integration Detail:</span>
                <p>{selectedTechNode.detail}</p>
              </div>

              <button
                onClick={() => setSelectedTechNode(null)}
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
