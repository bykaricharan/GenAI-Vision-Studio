import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Bot,
  Workflow,
  BarChart3,
  Zap,
  Brain,
  Calendar,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Terminal,
  ShieldCheck,
  Eye,
  ArrowRight,
  Cpu,
  Layers,
  Server,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import {
  fetchDashboardOverview,
  type DashboardOverviewResponse,
} from '../services/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend telemetry service.');
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = (status: 'connected' | 'warning' | 'offline') => {
    switch (status) {
      case 'connected':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      default:
        return {
          icon: <XCircle className="h-4 w-4 text-rose-400" />,
          badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-400',
        };
    }
  };

  const summaryCards = [
    {
      title: 'Documents Indexed',
      value: data?.summary.documents_indexed ?? '-',
      icon: <FileText className="h-5 w-5 text-sky-400" />,
      color: 'from-sky-500/20 to-sky-500/5',
      borderColor: 'border-sky-500/30',
    },
    {
      title: 'Prompt Executions',
      value: data?.summary.prompt_executions ?? '-',
      icon: <MessageSquare className="h-5 w-5 text-indigo-400" />,
      color: 'from-indigo-500/20 to-indigo-500/5',
      borderColor: 'border-indigo-500/30',
    },
    {
      title: 'Multi-Agent Sessions',
      value: data?.summary.multi_agent_sessions ?? '-',
      icon: <Bot className="h-5 w-5 text-purple-400" />,
      color: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Workflow Executions',
      value: data?.summary.workflow_executions ?? '-',
      icon: <Workflow className="h-5 w-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Average Eval Score',
      value: data?.summary.average_eval_score ? `${data.summary.average_eval_score}%` : '-',
      icon: <BarChart3 className="h-5 w-5 text-amber-400" />,
      color: 'from-amber-500/20 to-amber-500/5',
      borderColor: 'border-amber-500/30',
    },
    {
      title: 'Average Response Time',
      value: data?.summary.average_response_time_ms ? `${data.summary.average_response_time_ms} ms` : '-',
      icon: <Zap className="h-5 w-5 text-rose-400" />,
      color: 'from-rose-500/20 to-rose-500/5',
      borderColor: 'border-rose-500/30',
    },
    {
      title: 'Total AI Requests',
      value: data?.summary.total_ai_requests ?? '-',
      icon: <Brain className="h-5 w-5 text-teal-400" />,
      color: 'from-teal-500/20 to-teal-500/5',
      borderColor: 'border-teal-500/30',
    },
    {
      title: 'Last Activity',
      value: data?.summary.last_activity ? data.summary.last_activity.slice(11, 19) : '-',
      icon: <Calendar className="h-5 w-5 text-blue-400" />,
      color: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/30',
    },
  ];

  const techStack = [
    { name: 'OpenAI GPT-4o', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
    { name: 'LangChain 1.3', badge: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
    { name: 'LangGraph StateGraph', badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
    { name: 'ChromaDB HNSW', badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
    { name: 'Supabase PostgreSQL', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
    { name: 'LangSmith Observability', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
    { name: 'FastAPI Service', badge: 'bg-teal-500/10 text-teal-300 border-teal-500/30' },
    { name: 'React 18 & TypeScript', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  ];

  const quickAccessModules = [
    {
      id: 'knowledge-studio',
      title: 'Knowledge Studio',
      description: 'Document Chunking, Vector Embeddings & RAG Retrieval Pipeline',
      icon: <Database className="h-6 w-6 text-sky-400" />,
      path: '/knowledge',
      color: 'hover:border-sky-500/50',
    },
    {
      id: 'prompt-studio',
      title: 'Prompt Engineering',
      description: 'Zero-shot, Few-shot, Chain-of-Thought & Reflection Prompting',
      icon: <Terminal className="h-6 w-6 text-indigo-400" />,
      path: '/prompts',
      color: 'hover:border-indigo-500/50',
    },
    {
      id: 'workflow-studio',
      title: 'Workflow Studio',
      description: 'Production LangGraph StateGraph Node Execution Engine',
      icon: <Workflow className="h-6 w-6 text-emerald-400" />,
      path: '/workflows',
      color: 'hover:border-emerald-500/50',
    },
    {
      id: 'agent-studio',
      title: 'Multi-Agent Studio',
      description: 'Autonomous 5-Agent Collaboration Network (Coordinator, Writer, Reviewer)',
      icon: <Bot className="h-6 w-6 text-purple-400" />,
      path: '/agents',
      color: 'hover:border-purple-500/50',
    },
    {
      id: 'evaluation-center',
      title: 'AI Evaluation Center',
      description: 'LangSmith LLM-as-a-Judge Evaluation & Groundedness Metrics',
      icon: <ShieldCheck className="h-6 w-6 text-amber-400" />,
      path: '/evaluation',
      color: 'hover:border-amber-500/50',
    },
    {
      id: 'observability',
      title: 'Observability Observatory',
      description: 'Telemetry Traces, Latency Distributions, Tokens & Cost Tracking',
      icon: <Eye className="h-6 w-6 text-rose-400" />,
      path: '/observability',
      color: 'hover:border-rose-500/50',
    },
  ];

  return (
    <div className="space-y-10 py-2">
      {/* Executive Control Center Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <Activity className="h-4 w-4" />
            <span>Enterprise AI Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Executive AI Dashboard
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Real-time telemetry, model observability, vector database health, and live multi-agent execution analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Telemetry</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadDashboardData} className="underline hover:text-white cursor-pointer">Retry</button>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TOP 8 SUMMARY METRIC CARDS                                         */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {summaryCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card className={`p-4 border bg-gradient-to-b ${card.color} ${card.borderColor} space-y-2 hover:scale-[1.03] transition-all cursor-pointer shadow-lg`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400 truncate block">{card.title}</span>
                {card.icon}
              </div>

              {loading ? (
                <div className="h-7 w-16 bg-slate-800 rounded animate-pulse my-1" />
              ) : (
                <span className="text-2xl font-extrabold font-mono text-white block">
                  {card.value}
                </span>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SYSTEM HEALTH & TECHNOLOGY STACK                                  */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* System Health Panel (Col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-emerald-400" />
              System Infrastructure Health
            </h2>
            <span className="text-xs text-slate-400 font-mono">Automated Health Checks</span>
          </div>

          <Card className="border-slate-800 bg-[#1E293B]/80 p-5 space-y-3">
            {data?.system_health ? (
              Object.entries(data.system_health).map(([key, sys]) => {
                const info = getHealthBadge(sys.status as any);
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]/90 border border-slate-800/80 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${info.dot} animate-pulse`} />
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{sys.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono block">{sys.message}</span>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${info.badge}`}>
                      {info.icon}
                      <span>{sys.status}</span>
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 w-full bg-slate-800/60 rounded-xl animate-pulse" />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* AI Technology Stack Panel (Col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-400" />
              Enterprise AI Tech Stack
            </h2>
            <span className="text-xs text-slate-400 font-mono">Architecture</span>
          </div>

          <Card className="border-slate-800 bg-[#1E293B]/80 p-6 space-y-5">
            <p className="text-xs text-slate-400 leading-relaxed">
              GenAI Vision Studio orchestrates generative AI applications using LangChain, LangGraph stateful graph execution, ChromaDB vector stores, Supabase PostgreSQL, and LangSmith evaluation.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {techStack.map((tech) => (
                <span
                  key={tech.name}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${tech.badge} hover:scale-105 transition-all cursor-default`}
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* ANALYTICS & VISUALIZATION CHARTS                                  */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Execution Trends Chart (Col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sky-400" />
              Weekly Execution Analytics (Last 7 Days)
            </h2>
            <span className="text-xs text-slate-400 font-mono">Prompts & Workflows</span>
          </div>

          <Card className="border-slate-800 bg-[#1E293B]/80 p-6 space-y-5">
            <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
              {data?.analytics.prompt_executions_7d ? (
                data.analytics.prompt_executions_7d.map((item) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Prompts Bar */}
                      <motion.div
                        className="w-3 rounded-t bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:brightness-125 transition-all"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.min(100, item.prompts * 22)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                      {/* Workflows Bar */}
                      <motion.div
                        className="w-3 rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:brightness-125 transition-all"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.min(100, item.workflows * 24)}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      />
                      {/* Multi-Agent Bar */}
                      <motion.div
                        className="w-3 rounded-t bg-gradient-to-t from-purple-600 to-purple-400 group-hover:brightness-125 transition-all"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.min(100, item.multi_agent * 26)}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-white transition-colors">
                      {item.day}
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-full w-full bg-slate-800/40 rounded-xl animate-pulse" />
              )}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-indigo-400" />
                <span>Prompts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-emerald-400" />
                <span>Workflows</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-purple-400" />
                <span>Multi-Agent</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Evaluation Score Trend & Module Breakdown (Col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
              Module Request Distribution
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live Usage</span>
          </div>

          <Card className="border-slate-800 bg-[#1E293B]/80 p-6 space-y-4">
            <div className="space-y-3 font-mono">
              {data?.analytics.module_breakdown ? (
                data.analytics.module_breakdown.map((mod) => (
                  <div key={mod.module} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-sans">{mod.module}</span>
                      <span className="text-slate-400">{mod.requests} requests</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: mod.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, mod.requests * 8)}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-6 w-full bg-slate-800/40 rounded-full animate-pulse" />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* RECENT ACTIVITY FEED (SUPABASE PERSISTENCE)                      */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Supabase Live Activity Audit Log
          </h2>
          <span className="text-xs text-slate-400 font-mono">Latest 10 Events</span>
        </div>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Module</th>
                  <th className="pb-3 font-semibold">Activity Description</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.recent_activity && data.recent_activity.length > 0 ? (
                  data.recent_activity.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 text-slate-400 text-[11px]">
                        {act.timestamp ? act.timestamp.slice(0, 19).replace('T', ' ') : '-'}
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                          {act.module}
                        </span>
                      </td>
                      <td className="py-3 font-sans text-slate-200 truncate max-w-md">
                        {act.description}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          act.status === 'success'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {act.status_label}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 font-sans">
                      No recent application activity recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* QUICK ACCESS NAVIGATION CARDS                                    */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            Quick Access Navigation Modules
          </h2>
          <span className="text-xs text-slate-400">Control Center</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickAccessModules.map((mod) => (
            <div key={mod.id} onClick={() => navigate(mod.path)} className="cursor-pointer">
              <Card className={`p-5 border-slate-800 bg-[#1E293B]/70 ${mod.color} transition-all space-y-3 shadow-lg group hover:scale-[1.02]`}>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[#0F172A] border border-slate-800">
                    {mod.icon}
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
