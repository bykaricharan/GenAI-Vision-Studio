import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Code2,
  Copy,
  Check,
  BarChart3,
  Scale,
  Clock,
  Coins,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import {
  executePrompt,
  type PromptExecutionResult,
} from '../services/api';
import { liveExecutionStore } from '../services/liveExecutionStore';

// ---------------------------------------------------------------------------
// Technique Definition Interface & Dataset
// ---------------------------------------------------------------------------
export interface Technique {
  id: string;
  name: string;
  shortDesc: string;
  defaultInput: string;
  constructedTemplate: string;
  placeholderResponse: string;
  whatItIs: string;
  whenToUse: string;
  advantages: string[];
  limitations: string[];
  realWorldExample: string;
  tag: string;
}

const TECHNIQUES: Technique[] = [
  {
    id: 'zero-shot',
    name: 'Zero-shot',
    shortDesc: 'Direct instruction without prior examples.',
    defaultInput: 'Translate the following English sentence to French: "Generative AI transforms visual learning experiences."',
    constructedTemplate: `System: You are a professional AI translator.\n\nUser Input:\nTranslate the following English sentence to French: "Generative AI transforms visual learning experiences."`,
    placeholderResponse: `"L'IA générative transforme les expériences d'apprentissage visuel."\n\n[Translation Metadata: ISO fr-FR | Model Confidence: 99.4%]`,
    whatItIs: 'Zero-shot prompting feeds instructions directly to the LLM without providing any input-output demonstration pairs in the context window.',
    whenToUse: 'Ideal for standard tasks like language translation, sentiment classification, text summarization, or basic Q&A where LLMs possess high prior training knowledge.',
    advantages: [
      'Fastest execution speed',
      'Minimal context token consumption',
      'Simple, clean prompt syntax',
    ],
    limitations: [
      'Struggles with domain-specific terminology',
      'Lower adherence to custom structured JSON formats',
      'May produce inconsistent edge-case outputs',
    ],
    realWorldExample: 'Automated translation of customer support tickets or real-time email sentiment categorization.',
    tag: 'Baseline Technique',
  },
  {
    id: 'few-shot',
    name: 'Few-shot',
    shortDesc: 'Context enriched with demonstration input-output pairs.',
    defaultInput: 'Classify the sentiment of this review: "The interface is sleek and responsive, though I wish there were more color themes."',
    constructedTemplate: `System: Classify product reviews as POSITIVE, NEGATIVE, or NEUTRAL.\n\nExample 1:\nInput: "This tool saved us hours of debugging!"\nOutput: POSITIVE\n\nExample 2:\nInput: "Constant crashes and terrible performance."\nOutput: NEGATIVE\n\nUser Input:\nInput: "The interface is sleek and responsive, though I wish there were more color themes."\nOutput:`,
    placeholderResponse: `Classification: POSITIVE\nConfidence: 92%\nReasoning: Highlights sleekness and responsiveness (positive sentiment), accompanied by mild constructive feature feedback.`,
    whatItIs: 'Few-shot prompting provides 2-5 concrete demonstration pairs inside the prompt to steer the LLM’s output style, format, and classification boundary.',
    whenToUse: 'Use when you require strict JSON schemas, specialized domain terminology, or consistent structured formatting across runs.',
    advantages: [
      'Significantly improves output format compliance',
      'Increases accuracy on nuanced classification tasks',
      'Reduces model ambiguity without fine-tuning',
    ],
    limitations: [
      'Consumes additional context window tokens',
      'Requires careful selection of representative example pairs',
    ],
    realWorldExample: 'Converting raw doctor consultation notes into standardized ICD-10 medical billing codes.',
    tag: 'Pattern Alignment',
  },
  {
    id: 'cot',
    name: 'Chain of Thought',
    shortDesc: 'Step-by-step intermediate reasoning breakdown.',
    defaultInput: 'Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?',
    constructedTemplate: `User Prompt:\nRoger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?\n\nInstruction:\nThink step by step before arriving at your final answer.`,
    placeholderResponse: `Step 1: Roger starts with 5 tennis balls.\nStep 2: He buys 2 cans of tennis balls.\nStep 3: Each can contains 3 tennis balls, so 2 cans x 3 balls = 6 tennis balls.\nStep 4: Total tennis balls = 5 initial + 6 new = 11 tennis balls.\n\nFinal Answer: 11 tennis balls.`,
    whatItIs: 'Chain of Thought (CoT) prompting explicitly guides the LLM to generate intermediate reasoning steps ("Let’s think step by step") before delivering the answer.',
    whenToUse: 'Essential for math word problems, logical puzzles, multi-step symbolic reasoning, and complex code logic evaluations.',
    advantages: [
      'Drastically reduces mathematical and logic hallucinations',
      'Provides transparent, interpretable reasoning logs',
      'Boosts problem-solving accuracy on multi-step tasks',
    ],
    limitations: [
      'Higher latency due to verbose step token generation',
      'Increases output token generation costs',
    ],
    realWorldExample: 'Financial risk calculation models and multi-clause legal compliance verification.',
    tag: 'Logical Decomposition',
  },
  {
    id: 'react',
    name: 'ReAct',
    shortDesc: 'Interleaved Thought, Action, and Observation reasoning loop.',
    defaultInput: 'What is the current stock price of Apple (AAPL) multiplied by its P/E ratio?',
    constructedTemplate: `System: You operate in a Thought-Action-Observation loop. Available tools: [SearchEngine, StockCalculator].\n\nTask: What is the current stock price of Apple (AAPL) multiplied by its P/E ratio?\n\nThought 1: I need to query real-time market metrics for AAPL.\nAction 1: SearchEngine("AAPL stock price and PE ratio")\nObservation 1: AAPL Price = $224.50 | P/E = 34.2\nThought 2: Calculate 224.50 * 34.2.\nAction 2: StockCalculator("224.50 * 34.2")\nObservation 2: 7677.90\nThought 3: I have computed the final product value.`,
    placeholderResponse: `Thought 1: Retrieve real-time financial indicators for AAPL.\nAction 1: SearchEngine("AAPL stock price and PE ratio")\nObservation 1: Price = $224.50 | P/E Ratio = 34.20\n\nThought 2: Perform arithmetic multiplication.\nAction 2: Calculator("224.50 * 34.20")\nObservation 2: 7,677.90\n\nFinal Answer: The product of AAPL's current stock price ($224.50) and P/E ratio (34.20) is 7,677.90.`,
    whatItIs: 'ReAct (Reasoning + Acting) synergizes LLM step-by-step reasoning with external tool executions (web search, APIs, databases) to solve dynamic real-world tasks.',
    whenToUse: 'Building autonomous AI agents, web search assistants, live database query engines, and operational API workflow integrations.',
    advantages: [
      'Accesses real-time data beyond LLM training cutoffs',
      'Combines internal reasoning with external tool capability',
      'Auditable step-by-step execution trail',
    ],
    limitations: [
      'Requires robust tool execution error handling',
      'Risk of loop divergence if tool outputs are unexpected',
    ],
    realWorldExample: 'Autonomous customer support agents querying live SQL databases and executing refund API calls.',
    tag: 'Agentic Tool Use',
  },
  {
    id: 'reflection',
    name: 'Self Reflection',
    shortDesc: 'Multi-turn self-critique and output refinement.',
    defaultInput: 'Write a Python function to check if a string is a valid palindrome.',
    constructedTemplate: `Task: Write a Python function to check if a string is a valid palindrome.\n\n[Initial Generation Pass]:\ndef is_palindrome(s):\n    return s == s[::-1]\n\n[Self-Critique Phase]:\nEvaluate the function above. Does it handle case sensitivity, punctuation, spaces, and type hints?\n\n[Refinement Pass]:`,
    placeholderResponse: `[Draft Version 1]:\ndef is_palindrome(s):\n    return s == s[::-1]\n\n[Self-Critique]:\n- Flaw: Fails for "A man, a plan, a canal: Panama" due to spaces, punctuation, and capital letters.\n- Fix: Normalize string by lowercasing and stripping non-alphanumeric characters.\n\n[Refined Final Code]:\ndef is_palindrome(s: str) -> bool:\n    cleaned = ''.join(char.lower() for char in s if char.isalnum())\n    return cleaned == cleaned[::-1]`,
    whatItIs: 'Self Reflection prompts the LLM to evaluate its initial response against quality/security criteria, critique vulnerabilities, and issue a refined final draft.',
    whenToUse: 'Code generation, security audits, technical document writing, and edge-case validation tasks.',
    advantages: [
      'Dramatically elevates code quality and edge-case handling',
      'Catches syntax or logical flaws autonomously',
      'Reduces human code review overhead',
    ],
    limitations: [
      'Doubles or triples generation latency and token usage',
      'Requires clear evaluation metrics for self-critique',
    ],
    realWorldExample: 'Automated PR code review bots checking for memory leaks, SQL injection vulnerabilities, and edge cases.',
    tag: 'Iterative Refinement',
  },
];

export const PromptEngineeringStudio: React.FC = () => {
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string>('zero-shot');
  const [userInput, setUserInput] = useState<string>(TECHNIQUES[0].defaultInput);
  const [executionResult, setExecutionResult] = useState<PromptExecutionResult | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedTechnique =
    TECHNIQUES.find((t) => t.id === selectedTechniqueId) || TECHNIQUES[0];

  const handleTechniqueChange = (technique: Technique) => {
    setSelectedTechniqueId(technique.id);
    setUserInput(technique.defaultInput);
    setExecutionResult(null);
    setExecutionError(null);
    setActiveStep(0);
  };

  const handleRunPrompt = async () => {
    if (!userInput.trim()) return;

    setIsRunning(true);
    setExecutionError(null);
    setActiveStep(1);

    const timer1 = setTimeout(() => setActiveStep(2), 300);
    const timer2 = setTimeout(() => setActiveStep(3), 700);

    try {
      const res = await executePrompt(userInput, selectedTechnique.name, compareMode);
      setExecutionResult(res);
      setActiveStep(4);
      liveExecutionStore.setLatestExecution(
        'Prompt Engineering',
        userInput,
        res.response || '',
        res.constructed_prompt || selectedTechnique.constructedTemplate
      );
    } catch (err: any) {
      setExecutionError(err.message || 'Prompt execution failed. Ensure OPENAI_API_KEY is configured in backend/.env.');
      setActiveStep(0);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setUserInput(selectedTechnique.defaultInput);
    setExecutionResult(null);
    setExecutionError(null);
    setActiveStep(0);
    setIsRunning(false);
  };

  const handleCopyTemplate = () => {
    const textToCopy = executionResult?.constructed_prompt || selectedTechnique.constructedTemplate;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const flowSteps = [
    { label: 'User Prompt', icon: <Terminal className="h-4 w-4 text-indigo-400" /> },
    { label: 'Selected Technique', icon: <Zap className="h-4 w-4 text-sky-400" /> },
    { label: 'Prompt Construction', icon: <Code2 className="h-4 w-4 text-emerald-400" /> },
    { label: 'LLM', icon: <Cpu className="h-4 w-4 text-purple-400" /> },
    { label: 'Response', icon: <Sparkles className="h-4 w-4 text-[#38BDF8]" /> },
  ];

  return (
    <div className="space-y-10 py-2">
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
          <Terminal className="h-4 w-4" />
          <span>Interactive Visual Studio</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Prompt Engineering Studio
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          Experiment with 5 core prompting paradigms. Observe how prompt structures alter model
          reasoning and output quality.
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* EXECUTION FLOW ANIMATION (TOP PIPELINE BANNER)                     */}
      {/* ----------------------------------------------------------------- */}
      <Card className="relative overflow-hidden border-slate-800 bg-[#1E293B]/70 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#38BDF8]" />
            Prompt Execution Pipeline
          </span>
          {isRunning && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30 animate-pulse">
              <Sparkles className="h-3 w-3" /> Processing Flow...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5 relative z-10">
          {flowSteps.map((step, idx) => {
            const isActive = activeStep === idx;
            const isPassed = activeStep > idx;
            return (
              <div key={step.label} className="relative flex items-center">
                <motion.div
                  animate={{
                    scale: isActive ? 1.03 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-xs transition-all duration-300 ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/10'
                      : isPassed
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-[#0F172A]/70 text-slate-400'
                  }`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900/80 border border-slate-700/60">
                    {step.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold truncate">{step.label}</span>
                    <span className="text-[10px] text-slate-400">Step 0{idx + 1}</span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* MAIN TWO COLUMN LAYOUT                                           */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* LEFT PANEL (COL-SPAN-6): PROMPT INPUT & TECHNIQUE SELECTOR */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-slate-800 bg-[#1E293B]/80 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="h-5 w-5 text-indigo-400" />
                Prompt Construction
              </h2>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                Left Workspace
              </span>
            </div>

            {/* Technique Selector Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Prompt Technique
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TECHNIQUES.map((tech) => {
                  const isSelected = tech.id === selectedTechniqueId;
                  return (
                    <button
                      key={tech.id}
                      onClick={() => handleTechniqueChange(tech)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/20 text-white ring-1 ring-indigo-500/40'
                          : 'border-slate-800 bg-[#0F172A]/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold">{tech.name}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {tech.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Prompt Input
                </label>
                <span className="text-[11px] text-slate-400">Interactive Editor</span>
              </div>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask a question or enter a prompt..."
                rows={6}
                className="w-full rounded-xl border border-slate-700/80 bg-[#0F172A] p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors font-mono leading-relaxed resize-y"
              />
            </div>

            {/* Compare Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-[#0F172A]/60">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                <Scale className="h-4 w-4 text-indigo-400" />
                <span>Compare All 5 Techniques</span>
              </div>
              <button
                type="button"
                onClick={() => setCompareMode(!compareMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  compareMode ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    compareMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Action Buttons: Run & Reset */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleRunPrompt}
                disabled={isRunning}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#38BDF8] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{isRunning ? 'Executing Flow...' : compareMode ? 'Run Comparison Suite' : 'Run Prompt'}</span>
              </button>

              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>

            {executionError && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono">
                {executionError}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT PANEL (COL-SPAN-6): PREVIEW & REAL GPT-4O RESPONSE */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-slate-800 bg-[#1E293B]/80 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-[#38BDF8]" />
                <h2 className="text-lg font-bold text-white">
                  {compareMode ? 'Multi-Technique Comparison Suite' : selectedTechnique.name}
                </h2>
              </div>
              <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-3 py-0.5 rounded-full">
                {executionResult?.model ? `Model: ${executionResult.model}` : selectedTechnique.tag}
              </span>
            </div>

            {executionResult && (
              <div className="flex items-center gap-4 flex-wrap text-xs text-slate-300 bg-[#0F172A]/80 p-3 rounded-xl border border-slate-800 font-mono">
                <div className="flex items-center gap-1 text-sky-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{executionResult.execution_time_ms || 0} ms</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>{executionResult.tokens_used || 0} tokens</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Coins className="h-3.5 w-3.5" />
                  <span>${executionResult.cost_estimate || '0.0001'}</span>
                </div>
                {executionResult.metrics && (
                  <div className="flex items-center gap-1 text-indigo-400 ml-auto font-bold">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>Score: {executionResult.metrics.overall_score}/100</span>
                  </div>
                )}
              </div>
            )}

            {!compareMode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                    Constructed Prompt Template
                  </label>
                  <button
                    onClick={handleCopyTemplate}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto">
                  {executionResult?.constructed_prompt || selectedTechnique.constructedTemplate}
                </div>
              </div>
            )}

            {/* Response Output Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                {executionResult ? 'Real GPT-4o LLM Response' : 'Simulated AI Response (Run Prompt to execute live GPT-4o)'}
              </label>

              {compareMode && executionResult?.comparisons ? (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {Object.entries(executionResult.comparisons).map(([techName, res]) => (
                    <div key={techName} className="p-4 rounded-xl border border-slate-800 bg-[#0F172A]/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400">{techName}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          Score: {res.metrics?.overall_score || 85}/100
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                        {res.response}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTechniqueId + (executionResult ? 'real' : 'sim')}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-xl border border-indigo-500/30 bg-gradient-to-b from-[#0F172A] to-[#1E293B]/60 p-4 text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed shadow-inner max-h-[320px] overflow-y-auto"
                  >
                    {executionResult?.response || selectedTechnique.placeholderResponse}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Quality Metrics Score Breakdown Card */}
            {executionResult?.metrics && (
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-indigo-300">
                    <BarChart3 className="h-4 w-4" />
                    Prompt Quality Metrics (Evaluated out of 100)
                  </span>
                  <span className="text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Overall: {executionResult.metrics.overall_score}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-[#0F172A] border border-slate-800 text-center">
                    <span className="block text-slate-400 text-[10px]">Clarity</span>
                    <span className="text-sky-400 font-bold">{executionResult.metrics.prompt_clarity}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0F172A] border border-slate-800 text-center">
                    <span className="block text-slate-400 text-[10px]">Completeness</span>
                    <span className="text-emerald-400 font-bold">{executionResult.metrics.completeness}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0F172A] border border-slate-800 text-center">
                    <span className="block text-slate-400 text-[10px]">Specificity</span>
                    <span className="text-purple-400 font-bold">{executionResult.metrics.specificity}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0F172A] border border-slate-800 text-center">
                    <span className="block text-slate-400 text-[10px]">Groundedness</span>
                    <span className="text-amber-400 font-bold">{executionResult.metrics.groundedness}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0F172A] border border-slate-800 text-center">
                    <span className="block text-slate-400 text-[10px]">Reasoning</span>
                    <span className="text-indigo-400 font-bold">{executionResult.metrics.reasoning_quality}%</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* LEARNING PANEL (DEEP DIVE SECTION FOR SELECTED TECHNIQUE)        */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-6">
        <div className="flex flex-col space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Lightbulb className="h-4 w-4" />
            <span>Technique Deep Dive</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Learning Panel: {selectedTechnique.name}
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Understand when to deploy {selectedTechnique.name} in production workflows.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* WHAT IT IS */}
          <Card className="border-slate-800 bg-[#1E293B]/70 p-5 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <HelpCircle className="h-4 w-4" />
              <span>What It Is</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedTechnique.whatItIs}
            </p>
          </Card>

          {/* WHEN TO USE */}
          <Card className="border-slate-800 bg-[#1E293B]/70 p-5 space-y-3">
            <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
              <Zap className="h-4 w-4" />
              <span>When To Use</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedTechnique.whenToUse}
            </p>
          </Card>

          {/* ADVANTAGES */}
          <Card className="border-slate-800 bg-[#1E293B]/70 p-5 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" />
              <span>Advantages</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {selectedTechnique.advantages.map((adv, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <ArrowRight className="h-3 w-3 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* LIMITATIONS */}
          <Card className="border-slate-800 bg-[#1E293B]/70 p-5 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              <span>Limitations</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {selectedTechnique.limitations.map((lim, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <ArrowRight className="h-3 w-3 shrink-0 text-rose-400 mt-0.5" />
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* REAL WORLD EXAMPLE BANNER */}
        <Card className="border-indigo-500/30 bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Production Real-World Scenario</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {selectedTechnique.realWorldExample}
                </p>
              </div>
            </div>

            <span className="self-end sm:self-center text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shrink-0">
              Industry Pattern
            </span>
          </div>
        </Card>
      </section>
    </div>
  );
};
