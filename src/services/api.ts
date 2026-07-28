// ---------------------------------------------------------------------------
// API Types & Interfaces for GenAI Vision Studio Backend
// ---------------------------------------------------------------------------

export interface CollectionInfo {
  collection_name: string;
  total_vectors: number;
  embedding_model: string;
  embedding_dimension: number;
}

export interface ChunkItemSchema {
  chunk_id: number;
  length: number;
  word_count?: number;
  page_number?: number;
  preview: string;
  full_text?: string;
}

export interface DocumentUploadResponse {
  filename: string;
  pages: number;
  total_characters?: number;
  file_size?: number;
  chunks_created: number;
  average_chunk_size?: number;
  embeddings_created: number;
  embedding_model: string;
  embedding_dimension: number;
  collection_name: string;
  vectors_stored: number;
  status: string;
  chunks?: ChunkItemSchema[];
}

export interface QueryResultItem {
  chunk_id: number;
  rank?: number;
  page_number?: number;
  score: number;
  text: string;
  filename?: string;
  preview?: string;
  char_count?: number;
  word_count?: number;
}

export interface PromptBuilderInspection {
  system_prompt: string;
  retrieved_context: string;
  user_question: string;
  final_prompt: string;
}

export interface LLMTelemetry {
  model: string;
  latency_ms: number;
  tokens_used: number;
  cost_estimate: number;
  groundedness_score: number;
  confidence: number;
}

export interface LangSmithTraceInfo {
  trace_id: string;
  run_id: string;
  duration_ms: number;
  status: string;
  is_configured: boolean;
}

export interface QueryResponse {
  query: string;
  generated_answer?: string;
  total_results: number;
  results: QueryResultItem[];
  prompt_builder?: PromptBuilderInspection;
  llm_telemetry?: LLMTelemetry;
  langsmith_trace?: LangSmithTraceInfo;
}

export interface ApplicationStats {
  total_documents: number;
  total_prompt_history: number;
  workflow_runs: number;
  agent_sessions: number;
  learning_progress: number;
}

export interface LangSmithTraceItem {
  trace_id: string;
  workflow: string;
  status: 'success' | 'failed';
  duration_ms: number;
  tokens: number;
  cost: number;
  timestamp: string;
}

export interface LangSmithStats {
  project: string;
  total_traces: number;
  successful_runs: number;
  failed_runs: number;
  average_latency_ms: number;
  average_tokens: number;
  estimated_cost: number;
  is_configured: boolean;
  traces: LangSmithTraceItem[];
}

export interface EvaluationMetrics {
  relevance: number;
  groundedness: number;
  faithfulness: number;
  context_utilization: number;
  similarity: number;
  hallucination_risk: number;
  overall_score: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
}

export interface EvaluationHistoryItem {
  id: string;
  question: string;
  overall_score: number;
  relevance: number;
  groundedness: number;
  faithfulness: number;
  similarity: number;
  hallucination_risk: number;
  status: string;
  created_at: string;
}

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '') + '/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// ---------------------------------------------------------------------------
// RAG, Application Stats, LangSmith, & Evaluation API Service Functions
// ---------------------------------------------------------------------------

export async function fetchCollectionInfo(): Promise<CollectionInfo> {
  const response = await fetch(`${API_BASE_URL}/rag/collections`);
  if (!response.ok) {
    throw new Error(`Failed to fetch collection info: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchApplicationStats(): Promise<ApplicationStats> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch application statistics: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchLangSmithStats(): Promise<LangSmithStats> {
  const response = await fetch(`${API_BASE_URL}/langsmith/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch LangSmith statistics: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchEvaluationHistory(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/evaluation/history`);
  if (!response.ok) {
    throw new Error(`Failed to fetch evaluation history: ${response.statusText}`);
  }
  return response.json();
}

export async function uploadPdfDocument(
  file: File,
  chunkSize: number = 500,
  chunkOverlap: number = 50
): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}/rag/upload?chunk_size=${chunkSize}&chunk_overlap=${chunkOverlap}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = 'Upload failed.';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // Use fallback error message
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export async function queryKnowledgeBase(
  query: string,
  topK: number = 5
): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE_URL}/rag/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, top_k: topK }),
  });

  if (!response.ok) {
    let errorDetail = 'Search query failed.';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // Use fallback error message
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export interface PromptMetrics {
  prompt_clarity: number;
  completeness: number;
  specificity: number;
  groundedness: number;
  reasoning_quality: number;
  overall_score: number;
}

export interface PromptExecutionResult {
  status: string;
  technique: string;
  prompt: string;
  constructed_prompt: string;
  response: string;
  model: string;
  execution_time_ms: number;
  tokens_used: number;
  cost_estimate: number;
  metrics: PromptMetrics;
  compare?: boolean;
  comparisons?: Record<string, PromptExecutionResult>;
}

export async function executePrompt(
  prompt: string,
  technique: string = 'Zero-shot',
  compare: boolean = false
): Promise<PromptExecutionResult> {
  const response = await fetch(`${API_BASE_URL}/prompt/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, technique, compare }),
  });

  if (!response.ok) {
    let errorDetail = 'Prompt execution failed.';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // Use fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export interface WorkflowNodeOutput {
  node: string;
  start_time: string;
  duration_ms: number;
  status: string;
  input: string;
  output: string;
}

export interface WorkflowMetrics {
  total_runtime_ms: number;
  per_node_runtime: Record<string, number>;
  tokens_used: number;
  cost_estimate: number;
  workflow_success: boolean;
}

export interface WorkflowStateTransition {
  stage: string;
  data: Record<string, any>;
}

export interface WorkflowExecutionResponse {
  status: string;
  workflow_type: string;
  execution_state: string;
  result: string;
  node_outputs: WorkflowNodeOutput[];
  state_transitions?: WorkflowStateTransition[];
  execution_logs?: string[];
  metrics?: WorkflowMetrics;
  langsmith_trace?: LangSmithTraceInfo;
  error?: string;
}

export async function runWorkflowSimulation(
  workflowType: string,
  input: string
): Promise<WorkflowExecutionResponse> {
  const response = await fetch(`${API_BASE_URL}/workflow/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ workflow_type: workflowType, input }),
  });

  if (!response.ok) {
    let errorDetail = 'Workflow execution failed.';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // Use fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export interface AgentStepOutput {
  agent: string;
  role: string;
  start_time: string;
  duration_ms: number;
  tokens_used: number;
  cost_estimate: number;
  model: string;
  status: string;
  input: string;
  output: string;
  what_it_does: string;
  why_required: string;
  technology: string;
}

export interface MultiAgentMetrics {
  total_runtime_ms: number;
  total_tokens: number;
  total_cost: number;
  completed_agents: number;
}

export interface AgentCommunicationItem {
  from_agent: string;
  to_agent: string;
  timestamp: string;
  message: string;
  type: string;
}

export interface AgentTimelineItem {
  time: string;
  agent: string;
  event: string;
  status: string;
}

export interface AgentSharedState {
  topic: string;
  task_plan: string;
  research_notes: string;
  writer_output: string;
  review_feedback: string;
  final_response: string;
}

export interface MultiAgentExecutionResponse {
  status: string;
  topic: string;
  execution_state: string;
  final_report: string;
  agent_steps: AgentStepOutput[];
  shared_state?: AgentSharedState;
  communications?: AgentCommunicationItem[];
  timeline?: AgentTimelineItem[];
  metrics?: MultiAgentMetrics;
  langsmith_trace?: LangSmithTraceInfo;
  error?: string;
}

export async function runMultiAgentSimulation(
  topic: string
): Promise<MultiAgentExecutionResponse> {
  const response = await fetch(`${API_BASE_URL}/workflow/multi-agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    let errorDetail = 'Multi-Agent simulation failed.';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // Use fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export interface MetricBreakdownItem {
  score: number;
  explanation: string;
  reasoning: string;
  recommendation: string;
}

export interface EvaluationAnalysisResponse {
  status: string;
  module: string;
  question: string;
  source?: string;
  trace_id?: string;
  run_id?: string;
  confidence?: number;
  overall_score: number;
  evaluation_status: string;
  hallucination_risk: number;
  hallucination_level: string;
  hallucination_explanation: string;
  relevance: number;
  groundedness: number;
  faithfulness: number;
  completeness: number;
  coherence: number;
  context_utilization: number;
  similarity: number;
  latency_ms: number;
  tokens_used: number;
  cost_estimate: number;
  metrics_breakdown: Record<string, MetricBreakdownItem>;
}

export async function analyzeEvaluation(
  question: string,
  response: string,
  module: string = 'Knowledge Studio',
  retrievedContext: string = '',
  metadata: Record<string, any> = {}
): Promise<EvaluationAnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/evaluation/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      response,
      module,
      retrieved_context: retrievedContext,
      metadata,
    }),
  });

  if (!res.ok) {
    let errorDetail = 'Evaluation analysis failed.';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // Use fallback
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function getEvaluationHistory(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/evaluation/history`);
  if (!res.ok) {
    throw new Error('Failed to fetch evaluation history.');
  }
  return res.json();
}

export async function fetchLangSmithTraces(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/langsmith/traces`);
  if (!res.ok) {
    throw new Error('Failed to fetch LangSmith traces.');
  }
  return res.json();
}

export interface DashboardSummary {
  documents_indexed: number;
  prompt_executions: number;
  multi_agent_sessions: number;
  workflow_executions: number;
  average_eval_score: number;
  average_response_time_ms: number;
  total_ai_requests: number;
  last_activity: string;
}

export interface RecentActivityItem {
  id: string;
  module: string;
  description: string;
  timestamp: string;
  status: string;
  status_label: string;
}

export interface HealthItem {
  name: string;
  status: 'connected' | 'warning' | 'offline';
  message: string;
}

export interface SystemHealth {
  openai: HealthItem;
  supabase: HealthItem;
  chromadb: HealthItem;
  langsmith: HealthItem;
  fastapi: HealthItem;
}

export interface DashboardAnalytics {
  prompt_executions_7d: Array<{ day: string; prompts: number; workflows: number; multi_agent: number }>;
  evaluation_score_trend: Array<{ run: string; score: number }>;
  module_breakdown: Array<{ module: string; requests: number; color: string }>;
}

export interface DashboardOverviewResponse {
  summary: DashboardSummary;
  recent_activity: RecentActivityItem[];
  system_health: SystemHealth;
  analytics: DashboardAnalytics;
}

export async function fetchDashboardOverview(): Promise<DashboardOverviewResponse> {
  const res = await fetch(`${API_BASE_URL}/dashboard/overview`);
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard overview data.');
  }
  return res.json();
}
