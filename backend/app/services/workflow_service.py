import time
import logging
from typing import Dict, Any, List, Optional, TypedDict
from app.core.config import settings, require_openai_api_key
from app.services.supabase_service import supabase_service
from app.services.langsmith_service import langsmith_service

logger = logging.getLogger("genai_vision.workflow")


class WorkflowState(TypedDict):
    user_input: str
    workflow_type: str
    validation: Dict[str, Any]
    task_analysis: Dict[str, Any]
    constructed_prompt: str
    llm_response: str
    reviewed_response: str
    node_outputs: List[Dict[str, Any]]
    node_timings: Dict[str, Any]
    error: Optional[str]


def validate_input_node(state: WorkflowState) -> WorkflowState:
    logger.info("Node entered: Input Validation")
    start = time.time()
    user_input = state.get("user_input", "").strip()

    if not user_input:
        error_msg = "User input cannot be empty."
        logger.error(f"Input Validation Node failed: {error_msg}")
        state["error"] = error_msg
        state["validation"] = {"valid": False, "reason": error_msg}
        return state

    state["validation"] = {
        "valid": True,
        "char_count": len(user_input),
        "word_count": len(user_input.split()),
        "sanitized_input": user_input
    }

    duration_ms = int((time.time() - start) * 1000)
    logger.info(f"Node completed: Input Validation ({duration_ms} ms)")

    state["node_outputs"].append({
        "node": "Input Validation",
        "start_time": time.strftime("%H:%M:%S", time.localtime(start)),
        "duration_ms": duration_ms,
        "status": "completed",
        "input": user_input,
        "output": f"Valid input ({len(user_input)} chars, {len(user_input.split())} words)"
    })
    state["node_timings"]["Input Validation"] = duration_ms
    return state


def task_analysis_node(state: WorkflowState) -> WorkflowState:
    if state.get("error"):
        return state

    logger.info("Node entered: Task Analysis")
    start = time.time()
    api_key = require_openai_api_key()

    user_input = state["validation"]["sanitized_input"]
    workflow_type = state.get("workflow_type", "General AI Workflow")

    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import PromptTemplate

    llm = ChatOpenAI(model="gpt-4o", temperature=0.1, openai_api_key=api_key)
    logger.info("LLM invoked: Analyzing task type & domain for input.")

    prompt_tmpl = PromptTemplate.from_template(
        "Analyze the following user input and categorize its task characteristics:\n"
        "Input: {user_input}\n"
        "Workflow Context: {workflow_type}\n\n"
        "Provide a concise 2-sentence breakdown: (1) Primary Task Category & Domain, (2) Execution Strategy & Complexity."
    )

    chain = prompt_tmpl | llm
    res = chain.invoke({"user_input": user_input, "workflow_type": workflow_type})
    analysis_text = res.content.strip()

    duration_ms = int((time.time() - start) * 1000)
    logger.info(f"Node completed: Task Analysis ({duration_ms} ms)")

    state["task_analysis"] = {"analysis": analysis_text}
    state["node_outputs"].append({
        "node": "Task Analysis",
        "start_time": time.strftime("%H:%M:%S", time.localtime(start)),
        "duration_ms": duration_ms,
        "status": "completed",
        "input": user_input,
        "output": analysis_text
    })
    state["node_timings"]["Task Analysis"] = duration_ms
    return state


def prompt_generation_node(state: WorkflowState) -> WorkflowState:
    if state.get("error"):
        return state

    logger.info("Node entered: Prompt Generation")
    start = time.time()

    user_input = state["validation"]["sanitized_input"]
    analysis = state["task_analysis"]["analysis"]

    constructed = (
        f"System: You are an expert AI assistant configured for high-precision workflow execution.\n"
        f"Task Strategy Analysis:\n{analysis}\n\n"
        f"User Input / Directive:\n{user_input}\n\n"
        f"Detailed Response:"
    )

    duration_ms = int((time.time() - start) * 1000)
    logger.info(f"Node completed: Prompt Generation ({duration_ms} ms)")

    state["constructed_prompt"] = constructed
    state["node_outputs"].append({
        "node": "Prompt Generation",
        "start_time": time.strftime("%H:%M:%S", time.localtime(start)),
        "duration_ms": duration_ms,
        "status": "completed",
        "input": analysis[:100] + "...",
        "output": f"Generated System+User Prompt Template ({len(constructed)} chars)"
    })
    state["node_timings"]["Prompt Generation"] = duration_ms
    return state


def openai_execution_node(state: WorkflowState) -> WorkflowState:
    if state.get("error"):
        return state

    logger.info("Node entered: OpenAI Execution")
    start = time.time()
    api_key = require_openai_api_key()

    constructed = state["constructed_prompt"]

    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import PromptTemplate

    llm = ChatOpenAI(model="gpt-4o", temperature=0.2, openai_api_key=api_key)
    logger.info("LLM invoked: Dispatched ChatOpenAI gpt-4o request.")

    prompt_tmpl = PromptTemplate.from_template("{prompt}")
    chain = prompt_tmpl | llm
    res = chain.invoke({"prompt": constructed})
    raw_response = res.content.strip()

    duration_ms = int((time.time() - start) * 1000)
    logger.info(f"Node completed: OpenAI Execution ({duration_ms} ms)")

    state["llm_response"] = raw_response
    state["node_outputs"].append({
        "node": "OpenAI Execution",
        "start_time": time.strftime("%H:%M:%S", time.localtime(start)),
        "duration_ms": duration_ms,
        "status": "completed",
        "input": "Constructed Prompt Template",
        "output": raw_response
    })
    state["node_timings"]["OpenAI Execution"] = duration_ms
    return state


def response_review_node(state: WorkflowState) -> WorkflowState:
    if state.get("error"):
        return state

    logger.info("Node entered: Response Review")
    start = time.time()
    api_key = require_openai_api_key()

    raw_response = state["llm_response"]
    user_input = state["user_input"]

    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import PromptTemplate

    llm = ChatOpenAI(model="gpt-4o", temperature=0.1, openai_api_key=api_key)
    logger.info("LLM invoked: Reviewing and auditing response quality.")

    prompt_tmpl = PromptTemplate.from_template(
        "Review the generated AI answer against the user's original request.\n"
        "Original Request: {user_input}\n\n"
        "Generated Answer:\n{raw_response}\n\n"
        "Audit the answer for accuracy and clarity. Output the final verified response."
    )

    chain = prompt_tmpl | llm
    res = chain.invoke({"user_input": user_input, "raw_response": raw_response})
    reviewed_text = res.content.strip()

    duration_ms = int((time.time() - start) * 1000)
    logger.info(f"Node completed: Response Review ({duration_ms} ms)")

    state["reviewed_response"] = reviewed_text
    state["node_outputs"].append({
        "node": "Response Review",
        "start_time": time.strftime("%H:%M:%S", time.localtime(start)),
        "duration_ms": duration_ms,
        "status": "completed",
        "input": raw_response[:100] + "...",
        "output": reviewed_text
    })
    state["node_timings"]["Response Review"] = duration_ms
    return state


class WorkflowService:
    def __init__(self):
        # Build LangGraph StateGraph
        from langgraph.graph import StateGraph, START, END

        builder = StateGraph(WorkflowState)
        builder.add_node("Input Validation", validate_input_node)
        builder.add_node("Task Analysis", task_analysis_node)
        builder.add_node("Prompt Generation", prompt_generation_node)
        builder.add_node("OpenAI Execution", openai_execution_node)
        builder.add_node("Response Review", response_review_node)

        builder.add_edge(START, "Input Validation")
        builder.add_edge("Input Validation", "Task Analysis")
        builder.add_edge("Task Analysis", "Prompt Generation")
        builder.add_edge("Prompt Generation", "OpenAI Execution")
        builder.add_edge("OpenAI Execution", "Response Review")
        builder.add_edge("Response Review", END)

        self.graph = builder.compile()

    def run_workflow(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a production LangGraph StateGraph pipeline with OpenAI gpt-4o models.
        """
        logger.info("Workflow started: initializing LangGraph StateGraph execution.")
        start_total = time.time()

        workflow_type = payload.get("workflow_type", "RAG Workflow")
        user_input = payload.get("input", payload.get("user_input", "Explain agentic workflow orchestration with LangGraph.")).strip()

        initial_state: WorkflowState = {
            "user_input": user_input,
            "workflow_type": workflow_type,
            "validation": {},
            "task_analysis": {},
            "constructed_prompt": "",
            "llm_response": "",
            "reviewed_response": "",
            "node_outputs": [],
            "node_timings": {},
            "error": None
        }

        try:
            final_state = self.graph.invoke(initial_state)
            total_duration_ms = int((time.time() - start_total) * 1000)

            if final_state.get("error"):
                logger.error(f"Workflow execution halted due to node error: {final_state['error']}")
                return {
                    "status": "failed",
                    "workflow_type": workflow_type,
                    "execution_state": "FAILED",
                    "error": final_state["error"],
                    "node_outputs": final_state.get("node_outputs", []),
                    "result": f"Workflow failed: {final_state['error']}"
                }

            logger.info("Workflow completed: LangGraph graph execution finished successfully.")

            total_words = sum(len(str(no.get("output", "")).split()) for no in final_state["node_outputs"])
            est_tokens = total_words * 2
            est_cost = round(est_tokens * 0.000005, 6)

            metrics = {
                "total_runtime_ms": total_duration_ms,
                "per_node_runtime": final_state["node_timings"],
                "tokens_used": est_tokens,
                "cost_estimate": est_cost,
                "workflow_success": True
            }

            # State Transitions Snapshots for State Evolution Inspection
            state_transitions = [
                {
                    "stage": "Initial Input State",
                    "data": {"user_input": user_input, "workflow_type": workflow_type}
                },
                {
                    "stage": "Validated Input",
                    "data": final_state.get("validation", {})
                },
                {
                    "stage": "Task Analysis",
                    "data": final_state.get("task_analysis", {})
                },
                {
                    "stage": "Generated Prompt Template",
                    "data": {"constructed_prompt": final_state.get("constructed_prompt", "")}
                },
                {
                    "stage": "OpenAI LLM Response",
                    "data": {"llm_response": final_state.get("llm_response", "")}
                },
                {
                    "stage": "Final Reviewed Response",
                    "data": {"reviewed_response": final_state.get("reviewed_response", "")}
                }
            ]

            # Live Execution Event Logs
            start_formatted = time.strftime("%H:%M:%S", time.localtime(start_total))
            execution_logs = [
                f"[{start_formatted}] Workflow execution started: {workflow_type}"
            ]
            for no in final_state["node_outputs"]:
                execution_logs.append(
                    f"[{no.get('start_time', start_formatted)}] Node '{no.get('node')}' completed in {no.get('duration_ms')} ms."
                )
            execution_logs.append(
                f"[{time.strftime('%H:%M:%S')}] Workflow execution completed in {total_duration_ms} ms."
            )

            # Persist execution run in Supabase workflow_runs table
            supabase_service.save_workflow_run(
                workflow_type=workflow_type,
                execution_time_ms=total_duration_ms,
                status="success"
            )

            # Log trace in LangSmith
            trace_rec = langsmith_service.log_trace(
                workflow=f"LangGraph Studio ({workflow_type})",
                duration_ms=total_duration_ms,
                tokens=est_tokens,
                cost=est_cost
            )

            langsmith_trace = {
                "trace_id": trace_rec["trace_id"],
                "run_id": trace_rec["run_id"],
                "duration_ms": total_duration_ms,
                "status": "success",
                "is_configured": langsmith_service.is_configured
            }

            return {
                "status": "success",
                "workflow_type": workflow_type,
                "execution_state": "COMPLETED",
                "result": final_state["reviewed_response"],
                "node_outputs": final_state["node_outputs"],
                "state_transitions": state_transitions,
                "execution_logs": execution_logs,
                "metrics": metrics,
                "langsmith_trace": langsmith_trace
            }

        except Exception as err:
            logger.exception(f"Unhandled exception during LangGraph workflow execution: {err}")
            return {
                "status": "failed",
                "workflow_type": workflow_type,
                "execution_state": "FAILED",
                "error": str(err),
                "node_outputs": [],
                "result": f"Workflow exception: {err}"
            }


workflow_service = WorkflowService()
